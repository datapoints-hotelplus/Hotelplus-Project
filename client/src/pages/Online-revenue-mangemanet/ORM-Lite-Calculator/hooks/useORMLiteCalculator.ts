import { useMemo } from "react";

import type {
  ORMLiteCalculatorInput,
  ORMLiteResult,
} from "../model/ormLite.types";

import { normalizeInput } from "../logic/normalizeInput";
import { calculateORMLite } from "../logic/calculateORMLite";

export function useORMLiteCalculator(
  input: ORMLiteCalculatorInput
) {

  const result = useMemo<ORMLiteResult>(() => {

    const normalized =
      normalizeInput(input);

    return calculateORMLite(normalized);

  }, [input]);

  return result;
}
