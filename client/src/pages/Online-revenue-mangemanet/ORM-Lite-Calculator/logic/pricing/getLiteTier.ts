import type{ LiteTier } from "../../model/pricing.types";

export function getLiteTier(
  averageRevenue: number
): LiteTier {
  if (averageRevenue < 40000) return "NONE";
  if (averageRevenue <= 120000) return "L1";
  if (averageRevenue <= 200000) return "L2";
  if (averageRevenue <= 300000) return "L3";
  return "NONE";
}
