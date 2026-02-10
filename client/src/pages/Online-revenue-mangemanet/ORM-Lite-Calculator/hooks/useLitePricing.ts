import { useMemo } from "react";

import { ORMLiteResult } from "../model/ormLite.types";
import {
  LitePricingResult,
} from "../model/pricing.types";

import { AddOnOption } from "../model/pricing.types";

import { getLiteTier } from "../logic/pricing/getLiteTier";
import { calculateLitePricing } from "../logic/pricing/calculateLitePricing";

interface UseLitePricingParams {
  revenueResult: ORMLiteResult | null;
  selectedAddOns: AddOnOption[];
}

export function useLitePricing({
  revenueResult,
  selectedAddOns,
}: UseLitePricingParams) {

  const litePricing: LitePricingResult | null =
    useMemo(() => {
      if (!revenueResult) return null;

      const tier = getLiteTier(
        revenueResult.averageRevenuePerMonth
      );

      if (tier === "NONE") return null;

      return calculateLitePricing(
        tier,
        revenueResult.otaRevenuePerMonth,
        selectedAddOns
      );
    }, [revenueResult, selectedAddOns]);

  return {
    litePricing,
    isLiteEligible: !!litePricing,
  };
}
