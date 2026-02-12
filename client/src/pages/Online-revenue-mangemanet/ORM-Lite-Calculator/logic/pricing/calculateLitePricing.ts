import type {
  LitePricingResult,
  AddOnOption,
} from "../../model/pricing.types";

/* ================= CONSTANTS ================= */

const BASE_MONTHLY_FEE = 3900;
const COMMISSION_RATE = 0.05;

const TRIGGER_MAX = {
  L1: 4000,
  L2: 5500,
  L3: 7000,
};

/* ================= TIER HELPER ================= */

function getLiteTier(
  averageRevenuePerMonth: number
): "L1" | "L2" | "L3" {

  if (averageRevenuePerMonth < 200000) return "L1";
  if (averageRevenuePerMonth < 500000) return "L2";
  return "L3";
}

/* ================= MAIN ================= */

export function calculateLitePricing(
  averageRevenuePerMonth: number,
  otaRevenue: number,
  selectedAddOns: AddOnOption[]
): LitePricingResult {

  const tier = getLiteTier(averageRevenuePerMonth);

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
