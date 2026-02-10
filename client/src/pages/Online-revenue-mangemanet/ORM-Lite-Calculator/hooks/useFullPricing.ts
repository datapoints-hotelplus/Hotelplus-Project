import { useMemo } from "react";

import { ORMLiteResult } from "../model/ormLite.types";
import {
  FullPricingInput,
  FullPricingResult,
} from "../model/fullPricing.types";

import { calculateFullPricing } from "../logic/fullPricing/calculateFullPricing";

interface UseFullPricingParams {
  revenueResult: ORMLiteResult | null;
}

export function useFullPricing({
  revenueResult,
}: UseFullPricingParams) {

  const fullPricing: FullPricingResult | null =
    useMemo(() => {

      if (!revenueResult) return null;

      const otaShare =
        revenueResult.otaSharePercent / 100;

      const input: FullPricingInput = {
        roomAvailable:
          revenueResult.roomAvailable || 0,

        averageRevenuePerMonth:
          revenueResult.averageRevenuePerMonth || 0,

        otaRevenuePerMonth:
          revenueResult.otaRevenuePerMonth || 0,

        otaSharePercent:
          revenueResult.otaSharePercent || 0,

        // 🔒 ป้องกันหาร 0
        highADR: revenueResult.highADR || 0,
        lowADR: revenueResult.lowADR || 1,

        highOTARevenue:
          (revenueResult.highRevenuePerMonth || 0) *
          otaShare,

        shoulderOTARevenue:
          (revenueResult.shoulderRevenuePerMonth || 0) *
          otaShare,

        lowOTARevenue:
          (revenueResult.lowRevenuePerMonth || 0) *
          otaShare,
      };

      return calculateFullPricing(
        input,
        0.08, // base commission rate
        1.2,  // A multiplier
        revenueResult.averageRevenuePerMonth < 120000
      );

    }, [revenueResult]);

  return {
    fullPricing,
    isFullEligible:
      !!fullPricing && fullPricing.tier !== "NONE",
  };
}
