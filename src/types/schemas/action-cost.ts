import { z } from "zod";
import { promptExplorerModelSchema } from "@/types/schemas/ai-search";

/**
 * What a user is about to start, in the terms the UI already has on hand. The
 * server prices it (see `estimateActionRawUsd`), so the numbers shown beside a
 * button come from the same price table the billing seam reserves against.
 */
export const actionCostRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("keywordResearch"),
    locationCode: z.number().int().positive(),
    mode: z.enum(["auto", "related", "suggestions", "ideas"]),
    resultLimit: z.number().int().min(1).max(500),
    clickstream: z.boolean(),
    /** A city, county, or region adds a Google Ads volume lookup. */
    local: z.boolean(),
  }),
  z.object({
    action: z.literal("serpAnalysis"),
    depth: z.number().int().min(10).max(100),
    keyword: z.string().max(200).optional(),
  }),
  z.object({
    action: z.literal("keywordMetricsRefresh"),
    locationCode: z.number().int().positive(),
    keywordCount: z.number().int().min(1).max(10_000),
    local: z.boolean(),
  }),
  z.object({
    action: z.literal("domainSearch"),
    pageSize: z.number().int().min(1).max(1000),
  }),
  z.object({
    action: z.literal("backlinksSearch"),
    pageSize: z.number().int().min(1).max(1000),
  }),
  z.object({ action: z.literal("siteAuditLighthouse") }),
  z.object({
    action: z.literal("promptExplorer"),
    models: z.array(promptExplorerModelSchema).min(1),
    webSearch: z.boolean(),
  }),
]);

export type ActionCostRequest = z.infer<typeof actionCostRequestSchema>;
