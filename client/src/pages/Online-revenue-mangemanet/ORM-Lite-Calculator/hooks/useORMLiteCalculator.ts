import { useMemo } from "react";

import type {
  ORMLiteCalculatorInput,
  ORMLiteResult,
  PackageComparisonResult,
} from "../model/ormLite.types";

import type {
  LitePricingResult,
  FullPricingResult,
} from "../model/pricing.types";

import { normalizeInput } from "../logic/normalizeInput";
import { calculateORMLite } from "../logic/calculateORMLite";

import { useLitePricing } from "./useLitePricing";
import { useFullPricing } from "./useFullPricing";

import { compareLiteVsFull } from "../logic/pricing/compareLiteVsFull";
import { recommendPackage } from "../logic/recommendation/recommendPackage";

/* ===================================================== */

export function useORMLiteCalculator(
  input: ORMLiteCalculatorInput
) {

  /* ---------- NORMALIZE ---------- */

  const normalizedInput = useMemo(
    () => normalizeInput(input),
    [input]
  );

  /* ---------- ORM LITE ---------- */

  const revenueResult: ORMLiteResult = useMemo(
    () => calculateORMLite(normalizedInput),
    [normalizedInput]
  );

  /* ---------- LITE ---------- */

  const { litePricing } = useLitePricing({
    revenueResult,
    selectedAddOns: [], // add-ons ถูกควบคุมที่ View
  });

  /* ---------- FULL ---------- */

  const { fullPricing } = useFullPricing({
    revenueResult,
    input,
  });

  /* ---------- COMPARE ---------- */

  const comparison: PackageComparisonResult | null =
    useMemo(() => {

      if (!litePricing || !fullPricing)
        return null;

      return compareLiteVsFull(
        litePricing,
        fullPricing
      );

    }, [litePricing, fullPricing]);

  /* ---------- RECOMMEND ---------- */

  const recommendation = useMemo(() => {

    return recommendPackage({
      revenueResult,
      litePricing,
      fullPricing,
    });

  }, [revenueResult, litePricing, fullPricing]);

  /* ---------- RETURN ---------- */

  return {
    revenueResult,

    litePricing,
    fullPricing,

    comparison,
    recommendation,
  };
}
