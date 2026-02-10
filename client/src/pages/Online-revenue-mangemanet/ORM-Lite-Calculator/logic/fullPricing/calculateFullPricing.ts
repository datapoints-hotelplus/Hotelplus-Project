import {
  FullPricingInput,
  FullPricingResult,
} from "../../model/fullPricing.types";

import { getFullTier } from "./getFullTier";
import { calculateAdjustedCommission } from "./calculateAdjustedCommission";
import { calculateSystemCost } from "./calculateSystemCost";
import { calculateCommissionB } from "./calculateCommissionB";
import { calculateSmartPackage } from "./calculateSmartPackage";
import { calculateFixedPackage } from "./calculateFixedPackage";
import { calculatePerformancePackage } from "./calculatePerformancePackage";
import { recommendFullPackage } from "./recommendFullPackage";

export function calculateFullPricing(
  input: FullPricingInput,
  baseCommissionRate: number,
  aMultiplier: number,
  isLowRevenueHotel: boolean
): FullPricingResult {

  const tier =
    getFullTier(input.averageRevenuePerMonth);

  const adjustedCommission =
    calculateAdjustedCommission(
      baseCommissionRate,
      input.otaSharePercent,
      input.highADR,
      input.lowADR
    );

  const systemCost =
    calculateSystemCost(
      input.roomAvailable,
      aMultiplier
    );

  const commission =
    calculateCommissionB(
      input.otaRevenuePerMonth,
      adjustedCommission.finalRate
    );

  const smart =
    calculateSmartPackage(
      systemCost.monthlyFeeA,
      adjustedCommission.finalRate,
      input.highOTARevenue,
      input.shoulderOTARevenue,
      input.lowOTARevenue,
      commission.commissionValue
    );

  const fixed =
    calculateFixedPackage(
      tier,
      systemCost.monthlyFeeA,
      input.lowOTARevenue *
        adjustedCommission.finalRate
    );

  const performance =
    calculatePerformancePackage(
      input.otaRevenuePerMonth,
      adjustedCommission.finalRate,
      isLowRevenueHotel
    );

  const packages = {
    smart,
    fixed,
    performance,
  };

  return {
    tier,
    adjustedCommission,
    systemCost,
    commission,
    packages,
    recommendedPackage:
      recommendFullPackage(packages),
  };
}
