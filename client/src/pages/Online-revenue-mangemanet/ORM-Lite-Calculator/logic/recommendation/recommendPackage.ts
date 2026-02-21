import type {
  LitePricingResult,
  FullPricingResult,
} from "../../model/pricing.types";
import type { ORMLiteResult } from "../../model/ormLite.types";

interface RecommendParams {
  revenueResult: ORMLiteResult | null;
  litePricing: LitePricingResult | null;
  fullPricing: FullPricingResult | null;
}

export function recommendPackage({
  revenueResult,
  litePricing,
  fullPricing,
}: RecommendParams) {

  /* ---------------- NO DATA ---------------- */
  if (!revenueResult) {
    return {
      recommendation: "NONE",
      reason: "No revenue data",
    };
  }

  const liteEligible =
    litePricing?.isEligible === true;

  const fullEligible =
    fullPricing?.tier !== "NONE";

  /* ---------------- ONLY ONE SIDE ---------------- */

  if (liteEligible && !fullEligible) {
    return {
      recommendation: "LITE Package",
      reason: "Only Lite Package is eligible",
    };
  }

  if (!liteEligible && fullEligible) {
    return {
      recommendation: "Full Services",
      reason: "แพ็กเกจบริหารครบวงจร พร้อมกลยุทธ์เชิงลึกเฉพาะโรงแรมเติมคำเติมคำเติมคำ",
    };
  }

  if (!liteEligible && !fullEligible) {
    return {
      recommendation: "NONE",
      reason: "No eligible package",
    };
  }

  /* ---------------- BOTH ELIGIBLE ---------------- */

  const liteCost =
    litePricing!.totalFee;

  const fullCost =
    fullPricing!.totalMonthlyFee;

  // Lite cheaper than Full
  if (liteCost < fullCost) {

    const percentCheaper =
      ((fullCost - liteCost) / fullCost) * 100;

    // If cheaper <= 5% → go Full
    if (percentCheaper <= 5) {
      return {
        recommendation: "FULL",
        reason:
          "Lite is less than 5% cheaper than Full",
        gapPercent: percentCheaper,
      };
    }

    // Cheaper > 5% → Lite
    return {
      recommendation: "LITE",
      reason:
        "แพ็คเกจเริ่มต้นสำหรับโรงแรมที่ต้องการควบคุมค่าใช้จ่าย เน้นความคุ้มค่าและการใช้งานที่จำเป็น",
      gapPercent: percentCheaper,
    };
  }

  /* Lite more expensive or equal */

  return {
    recommendation: "FULL",
    reason: "Full has lower or equal monthly cost",
  };
}
