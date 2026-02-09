import { CalculatorInput, CalculationResult } from "./types";
import { calculateRevenue, getLiteTier } from "./liteCalculator";
import { getFullTier, adjustedRate, smartPackage } from "./fullCalculator";
import { isLiteEligible, isFullEligible } from "./eligibility";

export function runCalculation(
  input: CalculatorInput
): CalculationResult {

  const revenue = calculateRevenue(input);

  const fullEligible =
    isFullEligible(revenue);

  const liteEligible =
    isLiteEligible(
      revenue.roomAvailable,
      revenue
    );

  // FULL FIRST
  if (fullEligible) {

    const tier =
      getFullTier(revenue.average);

    const rate = adjustedRate(
      tier,
      input.otaShare,
      input.high.adr,
      input.low.adr
    );

    const smartPrice =
      smartPackage(8000, revenue, rate);

    return {
      model: "FULL",
      tier,
      smartPrice,
      revenue
    };
  }

  // LITE
  if (liteEligible) {
    return {
      model: "LITE",
      tier: getLiteTier(revenue.average),
      revenue
    };
  }

  return {
    model: "NONE",
    message: "Not eligible for any package",
    revenue
  };
}
