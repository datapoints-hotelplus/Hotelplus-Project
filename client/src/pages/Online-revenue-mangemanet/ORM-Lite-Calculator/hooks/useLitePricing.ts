import { useMemo } from "react";

import type { ORMLiteResult } from "../model/ormLite.types";
import type {
  LitePricingResult,
  AddOnOption,
} from "../model/pricing.types";

import { calculateLitePricing } from "../logic/pricing/calculateLitePricing";

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
      revenueResult.averageRevenuePerMonth,
      revenueResult.otaRevenuePerMonth,
      selectedAddOns
    );

  }, [revenueResult, selectedAddOns]);

  return { litePricing };
}
