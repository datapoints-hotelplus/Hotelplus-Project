import {
  FullPricingResult,
  FullTier,
} from "../../model/pricing.types";

const FULL_CONFIG: Record<
  FullTier,
  { commissionRate: number; multiplier: number }
> = {
  NONE: { commissionRate: 0, multiplier: 0 },
  F2: { commissionRate: 0.1, multiplier: 1.6 },
  F3: { commissionRate: 0.09, multiplier: 1.6 },
  F4: { commissionRate: 0.08, multiplier: 1.6 },
  F5: { commissionRate: 0.07, multiplier: 1.5 },
  F6: { commissionRate: 0.06, multiplier: 1.5 },
  F7: { commissionRate: 0.05, multiplier: 1.4 },
  F8: { commissionRate: 0.04, multiplier: 1.2 },
};

export function calculateFullPricing(
  tier: FullTier,
  otaRevenue: number
): FullPricingResult {

  if (tier === "NONE") {
    return {
      tier,
      commissionRate: 0,
      multiplier: 0,
      estimatedPackageFee: 0,
      minCharge: 8000,
      finalCharge: 0,
      isEligible: false,
    };
  }

  const config = FULL_CONFIG[tier];

  const estimated =
    otaRevenue * config.commissionRate *
    config.multiplier;

  const finalCharge = Math.max(estimated, 8000);

  return {
    tier,
    commissionRate: config.commissionRate,
    multiplier: config.multiplier,

    estimatedPackageFee: estimated,
    minCharge: 8000,
    finalCharge,

    isEligible: true,
  };
}
