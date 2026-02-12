import type{
  PerformancePackageResult,
} from "../../model/fullPricing.types";

export function calculatePerformancePackage(
  averageOTARevenue: number,
  adjustedCommissionRate: number,
  isLowRevenueHotel: boolean
): PerformancePackageResult {

  const bOnlyRate =
    adjustedCommissionRate + 0.02;

  const monthlyFee =
    averageOTARevenue * bOnlyRate;

  const isEligible =
    !isLowRevenueHotel && monthlyFee >= 15000;

  return {
    bOnlyRate,
    monthlyFee,
    isEligible,
  };
}
