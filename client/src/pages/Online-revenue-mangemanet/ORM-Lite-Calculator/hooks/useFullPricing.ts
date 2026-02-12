import { useMemo } from "react";

import type {
  ORMLiteResult,
  ORMLiteCalculatorInput,
} from "../model/ormLite.types";

import { getFullTier } from "../logic/fullPricing/getFullTier";
import { calculateFullPricing } from "../logic/fullPricing/calculateFullPricing";
import { calculateFixedPackage } from "../logic/fullPricing/calculateFixedPackage";

import type { FullPricingResult } from "../model/fullPricing.types";

export function useFullPricing({
  revenueResult,
  input,
}: {
  revenueResult: ORMLiteResult | null;
  input: ORMLiteCalculatorInput;
}) {

  const fullPricing = useMemo<FullPricingResult>(() => {

    /* ---------- DEFAULT (NO DATA) ---------- */
    if (!revenueResult) {
      return {
        tier: "NONE",
        isEligible: false,

        systemCost: 0,
        aMultiplier: 0,
        adjustedCommissionRate: 0,

        A: 0,
        B: 0,
        totalMonthlyFee: 0,

        smartPackage: 0,
        fixedPackage: {
          baseValue: 0,
          discountedValue: 0,
          price: 0,
          finalFee: 0,
        },
        performancePackage: 0,
        bOnlyRate: 0,
      };
    }

    /* ---------- TIER ---------- */
    const tier = getFullTier(
      revenueResult.averageRevenuePerMonth
    );

    /* ---------- BASE FULL PRICING ---------- */
    const baseFull = calculateFullPricing(
      tier,
      input.roomKey,
      revenueResult.otaRevenuePerMonth,
      input.otaSharePercent,
      input.highSeason.adr,
      input.lowSeason.adr
    );

    /* ---------- IF NOT ELIGIBLE ---------- */
    if (!baseFull.isEligible) {
      return {
        ...baseFull,

        smartPackage: 0,
        fixedPackage: {
          baseValue: 0,
          discountedValue: 0,
          price: 0,
          finalFee: 0,
        },
        performancePackage: 0,
        bOnlyRate: 0,
      };
    }

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
