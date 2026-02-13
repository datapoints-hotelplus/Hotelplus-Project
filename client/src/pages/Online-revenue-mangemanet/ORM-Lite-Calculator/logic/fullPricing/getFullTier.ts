import type { FullTier } from "../../model/pricing.types";

export function getFullTier(
  avgRevenuePerMonth: number
): FullTier {

  if (avgRevenuePerMonth < 120000) return "NONE";
  if (avgRevenuePerMonth <= 200000) return "F2";
  if (avgRevenuePerMonth <= 350000) return "F3";
  if (avgRevenuePerMonth <= 600000) return "F4";
  if (avgRevenuePerMonth <= 1000000) return "F5";
  if (avgRevenuePerMonth <= 1500000) return "F6";
  if (avgRevenuePerMonth <= 2500000) return "F7";
  return "F8";
}
