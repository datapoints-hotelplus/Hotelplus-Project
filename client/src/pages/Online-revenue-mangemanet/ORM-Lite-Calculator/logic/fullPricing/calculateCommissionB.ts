import {
  CommissionResult,
} from "../../model/fullPricing.types";

export function calculateCommissionB(
  averageOTARevenue: number,
  commissionRate: number
): CommissionResult {

  return {
    averageOTARevenue,
    commissionRate,
    commissionValue:
      averageOTARevenue * commissionRate,
  };
}
