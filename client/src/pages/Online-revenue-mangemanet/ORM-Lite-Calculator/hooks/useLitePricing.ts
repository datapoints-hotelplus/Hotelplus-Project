import { useMemo } from "react";

import type { ORMLiteResult } from "../model/ormLite.types";
import type {
  LitePricingResult,
  LiteTier,
  AddOnOption,
} from "../model/pricing.types";

import { calculateLitePricing } from "../logic/calculateLitePricing";

/* ----------------------------- */

interface UseLitePricingParams {
  revenueResult: ORMLiteResult | null;
  selectedAddOns: AddOnOption[];
}

/* ----------------------------- */

function getLiteTier(avgRevenue: number): LiteTier {
  if (avgRevenue < 120000) return "L1";
  if (avgRevenue < 250000) return "L2";
  return "L3";
}

/* ----------------------------- */

export function useLitePricing({
  revenueResult,
  selectedAddOns,
}: UseLitePricingParams) {

  const litePricing = useMemo<LitePricingResult | null>(() => {

    if (!revenueResult) return null;

    const tier = getLiteTier(
      revenueResult.averageRevenuePerMonth
    );

    return calculateLitePricing(
      tier,
      revenueResult.otaRevenuePerMonth,
      selectedAddOns
    );

  }, [revenueResult, selectedAddOns]);

  return { litePricing };
}
