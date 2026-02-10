import { useState } from "react";

import {
  ORMLiteCalculatorInput,
  ORMLiteResult,
} from "../model/ormLite.types";

import { validateORMLiteInput } from "../logic/validators";
import { normalizeInput } from "../logic/normalizeInput";
import { calculateORMLite } from "../logic/calculateORMLite";

import {
  PackageComparisonResult,
  LitePricingResult,
  FullPricingResult,
} from "../model/pricing.types";

import { getLiteTier } from "../logic/pricing/getLiteTier";
import { calculateLitePricing } from "../logic/pricing/calculateLitePricing";
import { getFullTier } from "../logic/pricing/getFullTier";
import { calculateFullPricing } from "../logic/pricing/calculateFullPricing";
import { compareLiteVsFull } from "../logic/pricing/compareLiteVsFull";

/* ---------------- DEFAULT INPUT ---------------- */

const defaultInput: ORMLiteCalculatorInput = {
  roomKey: 0,
  occupancyPercent: 0,
  otaSharePercent: 0,

  highSeason: {
    months: 0,
    adr: 0,
  },
  shoulderSeason: {
    months: 0,
    adr: 0,
  },
  lowSeason: {
    months: 0,
    adr: 0,
  },
};

/* ------------------------------------------------ */

export function useORMLiteCalculator() {

  /* ----------- STATE ----------- */

  const [input, setInput] =
    useState<ORMLiteCalculatorInput>(defaultInput);

  const [result, setResult] =
    useState<ORMLiteResult | null>(null);

  const [pricingResult, setPricingResult] =
    useState<PackageComparisonResult | null>(null);

  const [errors, setErrors] = useState<string[]>([]);

  /* ----------- ACTIONS ----------- */

  const calculate = (selectedAddOns: any[] = []) => {

    // 1. Validate
    const validation = validateORMLiteInput(input);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      setPricingResult(null);
      return;
    }

    // 2. Revenue calculation
    const normalizedInput = normalizeInput(input);
    const revenueResult = calculateORMLite(normalizedInput);
    setResult(revenueResult);

    // 3. Pricing Input
    const pricingInput = {
      averageRevenuePerMonth:
        revenueResult.averageRevenuePerMonth,
      otaRevenuePerMonth:
        revenueResult.otaRevenuePerMonth,
    };

    /* -------- LITE PRICING -------- */

    const liteTier =
      getLiteTier(pricingInput.averageRevenuePerMonth);

    let litePricing: LitePricingResult | null = null;

    if (liteTier !== "NONE") {
      litePricing = calculateLitePricing(
        liteTier,
        pricingInput.otaRevenuePerMonth,
        selectedAddOns
      );
    }

    /* -------- FULL PRICING -------- */

    const fullTier =
      getFullTier(pricingInput.averageRevenuePerMonth);

    let fullPricing: FullPricingResult | null = null;

    if (fullTier !== "NONE") {
      fullPricing = calculateFullPricing(
        fullTier,
        pricingInput.otaRevenuePerMonth
      );
    }

    /* -------- COMPARE -------- */

    const comparison =
      compareLiteVsFull(litePricing, fullPricing);

    setErrors([]);
    setPricingResult(comparison);
  };

  const reset = () => {
    setInput(defaultInput);
    setResult(null);
    setPricingResult(null);
    setErrors([]);
  };

  /* ----------- EXPORT ----------- */

  return {
    input,
    setInput,
    result,
    pricingResult,
    errors,
    calculate,
    reset,
  };
}
