import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { fetchUserData } from "@/server/lib/dataforseo/appendix";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getSeoApiKeyStatus = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(() => {
    const configured = Boolean(env.DATAFORSEO_API_KEY?.trim());
    return { configured };
  });

/**
 * The DataForSEO account balance behind a self-hosted deployment's API key,
 * from the free user_data endpoint. Hosted deployments bill from Autumn
 * credits instead, so there is no provider balance to show.
 */
export const getDataforseoBalance = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async () => {
    if ((await isHostedServerAuthMode()) || !env.DATAFORSEO_API_KEY?.trim()) {
      return null;
    }
    const money = (await fetchUserData())?.money;
    if (typeof money?.balance !== "number") return null;
    return { balanceUsd: money.balance };
  });
