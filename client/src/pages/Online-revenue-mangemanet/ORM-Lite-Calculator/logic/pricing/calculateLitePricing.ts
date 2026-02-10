import {
  LitePricingResult,
  AddOnItem,
} from "../../model/pricing.types";

const BASE_FEE = 3900;
const COMMISSION_RATE = 0.05;

const TRIGGER_MAX = {
  L1: 4000,
  L2: 5500,
  L3: 7000,
};

export function calculateLitePricing(
  tier: "L1" | "L2" | "L3",
  otaRevenue: number,
  selectedAddOns: AddOnItem[]
): LitePricingResult {

  const addOnTotal = selectedAddOns.reduce(
    (sum, a) => sum + a.price,
    0
  );

  const commissionFee = otaRevenue * COMMISSION_RATE;

  const triggerMax = TRIGGER_MAX[tier];
  const isTriggerExceeded = addOnTotal > triggerMax;

  const totalFee =
    BASE_FEE + commissionFee + addOnTotal;

  return {
    tier,
    baseFee: BASE_FEE,
    commissionRate: COMMISSION_RATE,

    addOns: selectedAddOns,
    addOnTotal,

    commissionFee,
    totalFee,

    triggerMax,
    isTriggerExceeded,

    isEligible: true,
  };
}
