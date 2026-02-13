import { useMemo } from "react";

import type { ORMLiteResult } from "../model/ormLite.types";
import type { AddOnOption, LitePricingResult } from "../model/pricing.types";

import { calculateLitePricing } 
  from "../logic/calculateLitePricing";

interface UseLitePricingParams {
  revenueResult: ORMLiteResult | null;
  selectedAddOns: AddOnOption[];
}

export function useLitePricing({
  revenueResult,
  selectedAddOns,
}: UseLitePricingParams) {

  const litePricing = useMemo<LitePricingResult | null>(() => {

    if (!revenueResult) return null;

    return calculateLitePricing(
      revenueResult.roomAvailable,
      revenueResult.averageRevenuePerMonth,
      revenueResult.otaRevenuePerMonth,
      selectedAddOns
    );

  }, [revenueResult, selectedAddOns]);

  return { litePricing };
}
