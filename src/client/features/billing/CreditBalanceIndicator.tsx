import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { cn } from "cn";
import { SidebarMenuItem } from "@/client/components/ui/sidebar";
import { useCreditBalance } from "@/client/features/billing/useCreditBalance";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getDataforseoBalance } from "@/serverFunctions/config";
import { BILLING_ROUTE, LOW_CREDITS_THRESHOLD_USD } from "@/shared/billing";
import { formatUsd } from "@/shared/format";

/**
 * What the user has left to spend: Autumn credits on the hosted service, the
 * DataForSEO account balance when self-hosted. Both read in USD, the unit the
 * action cost estimates use.
 */
export function CreditBalanceIndicator({ ready }: { ready: boolean }) {
  return isHostedClientAuthMode() ? (
    <HostedBalance />
  ) : (
    <SelfHostedBalance ready={ready} />
  );
}

function HostedBalance() {
  const { customerQuery, totalRemaining, isOutOfCredits, isLowCredits } =
    useCreditBalance();
  return (
    <BalanceRow
      label="Credits left"
      usd={customerQuery.data ? totalRemaining : undefined}
      isOut={isOutOfCredits}
      isLow={isLowCredits}
      to={BILLING_ROUTE}
    />
  );
}

function SelfHostedBalance({ ready }: { ready: boolean }) {
  const balanceQuery = useQuery({
    queryKey: ["dataforseoBalance"],
    queryFn: () => getDataforseoBalance(),
    enabled: ready,
    // user_data is free but rate limited; a spend shows up within two minutes
    // or on the next focus.
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: false,
  });
  // No API key (the setup banner covers it) or a failed read: show nothing
  // rather than a balance of zero.
  if (!balanceQuery.data) return null;
  const usd = balanceQuery.data.balanceUsd;
  return (
    <BalanceRow
      label="DataForSEO balance"
      usd={usd}
      isOut={usd <= 0}
      isLow={usd > 0 && usd < LOW_CREDITS_THRESHOLD_USD}
    />
  );
}

function BalanceRow({
  label,
  usd,
  isOut,
  isLow,
  to,
}: {
  label: string;
  usd: number | undefined;
  isOut: boolean;
  isLow: boolean;
  to?: typeof BILLING_ROUTE;
}) {
  const content = (
    <>
      <Coins className="size-4 shrink-0" />
      <span
        className={cn(
          "font-mono text-sm font-medium tabular-nums",
          isOut && "text-destructive",
          isLow && "text-warning",
        )}
        data-testid="credit-balance"
      >
        {usd === undefined ? "–" : formatUsd(usd)}
      </span>
    </>
  );
  const rowClass =
    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/70";
  return (
    <SidebarMenuItem>
      {to ? (
        <Link
          to={to}
          title={label}
          aria-label={label}
          className={cn(
            rowClass,
            "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={rowClass} title={label} aria-label={label}>
          {content}
        </div>
      )}
    </SidebarMenuItem>
  );
}
