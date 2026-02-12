import { useMemo } from "react";

import type {
  ORMLiteResult,
  ORMLiteCalculatorInput,
} from "../model/ormLite.types";

import { getFullTier } from "../logic/fullPricing/getFullTier";
import { calculateFullPricing } from "../logic/fullPricing/calculateFullPricing";
import { calculateFixedPackage } from "../logic/fullPricing/calculateFixedPackage";

export function useFullPricing({
  revenueResult,
  input,
}: {
  revenueResult: ORMLiteResult | null;
  input: ORMLiteCalculatorInput;
}) {

  const fullPricing = useMemo(() => {

    if (!revenueResult) return null;

    /* ---------- TIER ---------- */
    const tier = getFullTier(
      revenueResult.averageRevenuePerMonth
    );

    /* ---------- BASE FULL PRICING ---------- */
    const baseFull = calculateFullPricing(
      tier,
      input.roomKey,                          // ✅ FIXED
      revenueResult.otaRevenuePerMonth,
      input.otaSharePercent,
      input.highSeason.adr,
      input.lowSeason.adr
    );

    if (!baseFull.isEligible) return baseFull;

    /* ---------- SMART (A + B) ---------- */
    const smartPackage =
      Math.min(baseFull.A + baseFull.B, 60000);

    /* ---------- FIXED (A Only) ---------- */
    const lowB =
      revenueResult.lowRevenuePerMonth *
      baseFull.adjustedCommissionRate;

    const fixedPackage =
      calculateFixedPackage(
        tier,
        baseFull.A,
        lowB
      );

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

  }, [revenueResult, input]);

  return { fullPricing };
}
