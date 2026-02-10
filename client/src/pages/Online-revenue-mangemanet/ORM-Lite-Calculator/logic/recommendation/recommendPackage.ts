import { ORMLiteResult } from "../../model/ormLite.types";
import { LitePricingResult } from "../../model/pricing.types";
import { FullPricingResult } from "../../model/fullPricing.types";

export type PackageRecommendation =
  | "LITE"
  | "FULL"
  | "NOT_RECOMMENDED";

export interface RecommendationResult {
  recommendation: PackageRecommendation;
  reason: string;
  gapPercent?: number;
}

export function recommendPackage(params: {
  revenueResult: ORMLiteResult | null;
  litePricing: LitePricingResult | null;
  fullPricing: FullPricingResult | null;
}): RecommendationResult {

  const { revenueResult, litePricing, fullPricing } = params;

  /* ---------- NO REVENUE ---------- */

  if (!revenueResult) {
    return {
      recommendation: "NOT_RECOMMENDED",
      reason: "Revenue data not available",
    };
  }

  /* ---------- ELIGIBILITY ---------- */

  const isLiteEligible = !!litePricing;

  const isFullEligible =
    !!fullPricing && fullPricing.tier !== "NONE";

  /* ---------- BOTH NOT ELIGIBLE ---------- */

  if (!isLiteEligible && !isFullEligible) {
    return {
      recommendation: "NOT_RECOMMENDED",
      reason:
        "Revenue is below minimum requirement for all packages",
    };
  }

  /* ---------- ONLY FULL ---------- */

  if (!isLiteEligible && isFullEligible) {
    return {
      recommendation: "FULL",
      reason: "Hotel does not qualify for Lite Package",
    };
  }

  /* ---------- ONLY LITE ---------- */

  if (isLiteEligible && !isFullEligible) {
    return {
      recommendation: "LITE",
      reason: "Hotel does not qualify for Full Services",
    };
  }

  /* ---------- OVERLAP ZONE ---------- */

  const avgRevenue =
    revenueResult.averageRevenuePerMonth;

  let defaultRecommendation: PackageRecommendation =
    avgRevenue <= 200000 ? "LITE" : "FULL";

  /* ---------- GAP RULE ---------- */

  const liteTotal =
    litePricing!.totalFee;

  // ใช้ Smart Package เป็น baseline ของ Full
  const fullTotal =
    fullPricing!.packages.smart.monthlyFee;

  const gapPercent =
    Math.abs(liteTotal - fullTotal) /
    fullTotal *
    100;

  if (gapPercent < 5) {
    return {
      recommendation: "FULL",
      reason:
        "Price gap between Lite and Full is less than 5%",
      gapPercent,
    };
  }

  /* ---------- DEFAULT ---------- */

  return {
    recommendation: defaultRecommendation,
    reason: "Based on revenue range recommendation",
    gapPercent,
  };
}
