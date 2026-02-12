import type{
  LitePricingResult,
  AddOnItem,
} from "../../model/pricing.types";

const BASE_MONTHLY_FEE = 3900;
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

  const commissionCost =
    otaRevenue * COMMISSION_RATE;

  const triggerMax = TRIGGER_MAX[tier];

  const isTriggerExceeded =
    addOnTotal > triggerMax;

  const totalFee =
    BASE_MONTHLY_FEE +
    commissionCost +
    addOnTotal;

  return {
    tier,

    // A
    baseMonthlyFee: BASE_MONTHLY_FEE,

    // B
    commissionRate: COMMISSION_RATE,
    commissionCost,

    // Add-ons
    addOns: selectedAddOns,
    addOnTotal,

    // Total
    totalFee,

    triggerMax,
    isTriggerExceeded,

    isEligible: true,
  };
}
