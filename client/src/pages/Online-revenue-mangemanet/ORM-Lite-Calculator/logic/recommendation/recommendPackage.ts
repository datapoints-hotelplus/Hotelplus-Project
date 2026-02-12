import type { ORMLiteResult } from "../../model/ormLite.types";
import type { LitePricingResult } from "../../model/pricing.types";
import type { FullPricingResult } from "../../logic/fullPricing/calculateFullPricing";

type Params = {
  revenueResult: ORMLiteResult | null;
  litePricing: LitePricingResult | null;
  fullPricing: FullPricingResult | null;
};

export function recommendPackage({
  revenueResult,
  litePricing,
  fullPricing,
}: Params) {

  // no revenue → no recommendation
  if (!revenueResult) {
    return {
      recommendation: "NONE",
      reason: "No revenue data",
    };
  }

  // only lite
  if (litePricing && !fullPricing) {
    return {
      recommendation: "LITE",
      reason: "Lite package is eligible",
    };
  }

  // only full
  if (!litePricing && fullPricing) {
    return {
      recommendation: "FULL",
      reason: "Full service is eligible",
    };
  }

  // both available → compare total monthly fee
  if (litePricing && fullPricing) {
    if (litePricing.totalFee <= fullPricing.totalMonthlyFee) {
      return {
        recommendation: "LITE",
        reason: "Lite package has lower monthly cost",
      };
    }

    return {
      recommendation: "FULL",
      reason: "Full service provides better coverage",
    };
  }

  return {
    recommendation: "NONE",
    reason: "No suitable package",
  };
}
