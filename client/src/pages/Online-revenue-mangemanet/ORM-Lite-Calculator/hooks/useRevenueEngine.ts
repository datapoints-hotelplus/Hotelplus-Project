import { useCalculatorStore } from "../store/useCalculatorStore";
import { validateORMLiteInput } from "../logic/validators";
import { normalizeInput } from "../logic/normalizeInput";
import { calculateORMLite } from "../logic/calculateORMLite";

export function useRevenueEngine() {

  const {
    input,
    updateField,
    updateSeason,
    setRevenueResult,
    setRevenueErrors,
    revenueResult,
    revenueErrors,
    reset,
  } = useCalculatorStore();

  /* ----------- ACTION ----------- */

  const calculateRevenue = () => {
    const validation = validateORMLiteInput(input);

    if (!validation.isValid) {
      setRevenueErrors(validation.errors);
      setRevenueResult(null);
      return;
    }

    const normalized = normalizeInput(input);
    const revenue = calculateORMLite(normalized);

    setRevenueErrors([]);
    setRevenueResult(revenue);
  };

  const resetRevenue = () => {
    reset();
  };

  // setInput ยังคง expose ไว้เพื่อ backward compatible กับ View
  const setInput = (updater: (prev: any) => any) => {
    const next = updater(input);
    Object.entries(next).forEach(([key, val]) => {
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        const season = key as "highSeason" | "shoulderSeason" | "lowSeason";
        Object.entries(val as any).forEach(([field, v]) => {
          updateSeason(season, field as "months" | "adr", v as number);
        });
      } else {
        updateField(key, val as string | number);
      }
    });
  };

  return {
    input,
    setInput,
    revenueResult,
    revenueErrors,
    calculateRevenue,
    resetRevenue,
  };
}