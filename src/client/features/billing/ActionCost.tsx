import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { estimateActionCost } from "@/serverFunctions/actionCost";
import { formatUsd } from "@/shared/format";
import type { ActionCostRequest } from "@/types/schemas/action-cost";

/** The server's estimate for an action, or undefined while it loads. */
export function useActionCost(request: ActionCostRequest | null) {
  const query = useQuery({
    queryKey: ["actionCost", request],
    queryFn: () => estimateActionCost({ data: request! }),
    enabled: request !== null,
    // Prices only change on deploy, so one answer per request shape is enough.
    staleTime: Infinity,
    retry: false,
    // Keep the old number up while a new shape loads, so it doesn't flicker.
    placeholderData: keepPreviousData,
  });
  return query.data?.costUsd;
}

/** "~$0.03" beside the button that starts a paid action. */
export function ActionCost({
  request,
  prefix = "Costs",
  className = "text-xs text-muted-foreground",
}: {
  request: ActionCostRequest;
  /** Leads the amount: "Costs ~$0.03". */
  prefix?: string;
  className?: string;
}) {
  const costUsd = useActionCost(request);
  if (costUsd === undefined) return null;
  return (
    <span className={className} data-testid="action-cost">
      {prefix} ~{formatUsd(costUsd)}
    </span>
  );
}
