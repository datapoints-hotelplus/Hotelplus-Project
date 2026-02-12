import type{
  AdjustedCommissionResult,
} from "../../model/fullPricing.types";

export function calculateAdjustedCommission(
  baseRate: number,
  otaSharePercent: number,
  highADR: number,
  lowADR: number
): AdjustedCommissionResult {

  let otaAdjustment = 0;

  if (otaSharePercent > 80) otaAdjustment = 0.01;
  if (otaSharePercent < 50) otaAdjustment = -0.005;

  const variance =
    (highADR - lowADR) / lowADR;

  const volatilityAdjustment =
    variance > 1 ? 0.005 : 0;

  let finalRate =
    baseRate + otaAdjustment + volatilityAdjustment;

  finalRate = Math.min(
    Math.max(finalRate, 0.03),
    0.15
  );

  return {
    baseRate,
    otaAdjustment,
    volatilityAdjustment,
    finalRate,
  };
}
