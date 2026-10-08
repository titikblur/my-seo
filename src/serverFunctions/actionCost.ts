import { createServerFn } from "@tanstack/react-start";
import { estimateActionRawUsd } from "@/server/lib/dataforseo/pricing";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { applyBillingMarkupUsd, roundUsdForBilling } from "@/shared/billing";
import { actionCostRequestSchema } from "@/types/schemas/action-cost";

/**
 * What an action is about to cost the signed-in user: the marked-up price on
 * the hosted service, DataForSEO's own price when self-hosted.
 */
export const estimateActionCost = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(actionCostRequestSchema)
  .handler(async ({ data }) => {
    const rawUsd = estimateActionRawUsd(data);
    const costUsd = (await isHostedServerAuthMode())
      ? applyBillingMarkupUsd(rawUsd)
      : roundUsdForBilling(rawUsd);
    return { costUsd };
  });
