import type{ FullTier } from "../../model/pricing.types";

export function getFullTier(
  averageRevenue: number
): FullTier {

  if (averageRevenue < 120000) return "NONE";
  if (averageRevenue <= 200000) return "F2";
  if (averageRevenue <= 350000) return "F3";
  if (averageRevenue <= 600000) return "F4";
  if (averageRevenue <= 1000000) return "F5";
  if (averageRevenue <= 1500000) return "F6";
  if (averageRevenue <= 2500000) return "F7";
  return "F8";
}
