import type {
  LitePricingResult,
  AddOnOption,
} from "../model/pricing.types";

const BASE_MONTHLY_FEE = 3900;
const COMMISSION_RATE = 0.05;

function getLiteTier(
  avgRevenue: number
): "L1" | "L2" | "L3" | "NONE" {
  if (avgRevenue < 40000) return "NONE";
  if (avgRevenue <= 120000) return "L1";
  if (avgRevenue <= 200000) return "L2";
  if (avgRevenue <= 300000) return "L3";
  return "NONE";
}

const TRIGGER_MAX = {
  L1: 4000,
  L2: 5500,
  L3: 7000,
};

export function calculateLitePricing(
  roomAvailable: number,
  averageRevenue: number,
  otaRevenue: number,
  selectedAddOns: AddOnOption[]
): LitePricingResult {

  const tier = getLiteTier(averageRevenue);

  const addOnTotal = selectedAddOns.reduce(
    (sum, a) => sum + a.price,
    0
  );

  const commissionCost =
    otaRevenue * COMMISSION_RATE;

  const totalFee =
    BASE_MONTHLY_FEE +
    commissionCost +
    addOnTotal;

  // ❗️ If tier NONE → ไม่เข้า Lite
  if (tier === "NONE") {
    return {
      tier: "NONE",
      isEligible: false,

      baseMonthlyFee: 0,
      commissionRate: 0,
      commissionCost: 0,

      addOns: selectedAddOns,
      addOnTotal,

      totalFee: 0,

      triggerMax: 0,
      isTriggerExceeded: false,
    };
  }

  const triggerMax =
    TRIGGER_MAX[tier];

  const isTriggerExceeded =
    addOnTotal > triggerMax;

  const isEligible =
    roomAvailable <= 40 &&
    averageRevenue >= 40000 &&
    otaRevenue >= 20000;

  return {
    tier,

    baseMonthlyFee: BASE_MONTHLY_FEE,

    commissionRate: COMMISSION_RATE,
    commissionCost,

    addOns: selectedAddOns,
    addOnTotal,

    totalFee,

    triggerMax,
    isTriggerExceeded,

    isEligible,
  };
    
}
