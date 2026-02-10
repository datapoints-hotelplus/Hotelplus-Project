import { useState } from "react";

import {
  ORMLiteCalculatorInput,
  ORMLiteResult,
} from "../model/ormLite.types";

import { validateORMLiteInput } from "../logic/validators";
import { normalizeInput } from "../logic/normalizeInput";
import { calculateORMLite } from "../logic/calculateORMLite";

/* ---------------- DEFAULT INPUT ---------------- */

const defaultInput: ORMLiteCalculatorInput = {
  roomKey: 0,
  occupancyPercent: 0,
  otaSharePercent: 0,

  highSeason: { months: 0, adr: 0 },
  shoulderSeason: { months: 0, adr: 0 },
  lowSeason: { months: 0, adr: 0 },
};

/* ------------------------------------------------ */

export function useRevenueEngine() {

  const [input, setInput] =
    useState<ORMLiteCalculatorInput>(defaultInput);

  const [result, setResult] =
    useState<ORMLiteResult | null>(null);

  const [errors, setErrors] =
    useState<string[]>([]);

  /* ----------- ACTION ----------- */

  const calculateRevenue = () => {

    const validation = validateORMLiteInput(input);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    const normalized = normalizeInput(input);
    const revenue = calculateORMLite(normalized);

    setErrors([]);
    setResult(revenue);
  };

  const resetRevenue = () => {
    setInput(defaultInput);
    setResult(null);
    setErrors([]);
  };

  return {
    input,
    setInput,
    revenueResult: result,
    revenueErrors: errors,
    calculateRevenue,
    resetRevenue,
  };
}
