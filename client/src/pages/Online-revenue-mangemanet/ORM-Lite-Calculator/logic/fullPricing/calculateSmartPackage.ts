import {
  SmartPackageResult,
} from "../../model/fullPricing.types";

export function calculateSmartPackage(
  A: number,
  commissionRate: number,
  highOTA: number,
  shoulderOTA: number,
  lowOTA: number,
  averageB: number
): SmartPackageResult {

  let monthlyFee = A + averageB;
  let capped = false;

  if (monthlyFee > 60000) {
    monthlyFee = 60000;
    capped = true;
  }

  return {
    monthlyFee,
    capped,
    seasonalBreakdown: {
      high: A + highOTA * commissionRate,
      shoulder: A + shoulderOTA * commissionRate,
      low: A + lowOTA * commissionRate,
    },
  };
}
