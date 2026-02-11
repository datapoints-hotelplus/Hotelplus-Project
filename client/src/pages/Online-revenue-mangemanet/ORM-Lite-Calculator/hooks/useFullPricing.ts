import { useMemo } from "react";
import { ORMLiteResult } from "../model/ormLite.types";
import { getFullTier } from "../logic/fullPricing/getFullTier";
import { calculateFullPricing } from "../logic/fullPricing/calculateFullPricing";
import { calculateFixedPackage } from "../logic/fullPricing/calculateFixedPackage";

export function useFullPricing({
  revenueResult,
}: {
  revenueResult: ORMLiteResult | null;
}) {

  const fullPricing = useMemo(() => {

    if (!revenueResult) return null;

    const tier = getFullTier(
      revenueResult.averageRevenuePerMonth
    );

    const baseFull = calculateFullPricing(
      tier,
      revenueResult.roomAvailable,
      revenueResult.otaRevenuePerMonth,
      revenueResult.otaSharePercent,
      revenueResult.highADR,
      revenueResult.lowADR || 1
    );

    if (!baseFull.isEligible) return baseFull;

    /* ---------- SMART (A + B) ---------- */

    const smartPackage =
      Math.min(baseFull.A + baseFull.B, 60000);

    /* ---------- FIXED (A Only) ---------- */

    const lowB =
      (revenueResult.lowRevenuePerMonth || 0) *
      baseFull.adjustedCommissionRate;

    const fixedPackage =
      calculateFixedPackage(
        tier,
        baseFull.A,
        lowB
      ) || 0;

    /* ---------- PERFORMANCE (B Only) ---------- */

    const bOnlyRate =
      baseFull.adjustedCommissionRate + 0.02;

    const performancePackage =
      revenueResult.otaRevenuePerMonth *
      bOnlyRate;

    return {
      ...baseFull,

      smartPackage,
      fixedPackage,

      performancePackage,
      bOnlyRate,
    };

  }, [revenueResult]);

  return { fullPricing };
}
