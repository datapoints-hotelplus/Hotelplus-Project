import type{
  SystemCostResult,
} from "../../model/fullPricing.types";

export function calculateSystemCost(
  roomKey: number,
  aMultiplier: number
): SystemCostResult {
  let systemCost = 5800;

  if (roomKey <= 10) systemCost = 3500;
  else if (roomKey <= 20) systemCost = 4000;
  else if (roomKey <= 50) systemCost = 5200;
  else if (roomKey <= 100) systemCost = 5400;

  return {
    roomAvailable: roomKey, 
    systemCost,
    aMultiplier,
    monthlyFeeA: systemCost * aMultiplier,
  };
}
