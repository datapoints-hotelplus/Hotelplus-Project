import {
  SystemCostResult,
} from "../../model/fullPricing.types";

export function calculateSystemCost(
  roomAvailable: number,
  aMultiplier: number
): SystemCostResult {

  let systemCost = 5800;

  if (roomAvailable <= 10) systemCost = 3500;
  else if (roomAvailable <= 20) systemCost = 4000;
  else if (roomAvailable <= 50) systemCost = 5200;
  else if (roomAvailable <= 100) systemCost = 5400;

  return {
    roomAvailable,
    systemCost,
    aMultiplier,
    monthlyFeeA: systemCost * aMultiplier,
  };
}
