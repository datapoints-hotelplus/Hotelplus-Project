import {
  PackageComparisonResult,
  LitePricingResult,
  FullPricingResult,
} from "../../model/pricing.types";

export function compareLiteVsFull(
  lite: LitePricingResult | null,
  full: FullPricingResult | null
): PackageComparisonResult {

  if (!lite && !full) {
    return {
      lite: null,
      full: null,
      recommendedPackage: "NOT_RECOMMENDED",
      gapPercent: 0,
    };
  }

  if (lite && !full) {
    return {
      lite,
      full: null,
      recommendedPackage: "LITE",
      gapPercent: 0,
    };
  }

  if (!lite && full) {
    return {
      lite: null,
      full,
      recommendedPackage: "FULL",
      gapPercent: 0,
    };
  }

  const gap =
    Math.abs(lite!.totalFee - full!.finalCharge) /
    full!.finalCharge *
    100;

  return {
    lite,
    full,
    gapPercent: gap,
    recommendedPackage:
      gap < 5 ? "FULL" : "LITE",
  };
}
