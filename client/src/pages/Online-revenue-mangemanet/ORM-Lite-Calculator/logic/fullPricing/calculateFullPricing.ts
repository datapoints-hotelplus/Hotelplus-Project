import type { FullTier } from "../../model/pricing.types";

/* ================= RESULT TYPE ================= */

export type FullPricingResult = {
  tier: FullTier;
  isEligible: boolean;

  systemCost: number;
  aMultiplier: number;
  adjustedCommissionRate: number;

  A: number; // fixed fee
  B: number; // commission fee

  totalMonthlyFee: number;
};

/* ================= HELPERS ================= */

function getSystemCost(roomKey: number) {
  if (roomKey <= 10) return 3500;
  if (roomKey <= 20) return 4000;
  if (roomKey <= 50) return 5200;
  if (roomKey <= 100) return 5400;
  return 5800;
}

function adjustMultiplier(
  base: number,
  otaSharePercent: number
) {
  let m = base;
  if (otaSharePercent > 80) m += 1;
  if (otaSharePercent < 50) m -= 0.5;
  return m;
}

function adjustCommissionRate(
  baseRate: number,
  otaSharePercent: number,
  highADR: number,
  lowADR: number
) {
  let rate = baseRate;

  if (otaSharePercent > 80) rate += 0.01;
  if (otaSharePercent < 50) rate -= 0.005;

  const variance =
    (highADR - lowADR) / lowADR;

  if (variance >= 1) rate += 0.005;

  return Math.min(Math.max(rate, 0.03), 0.15);
}

/* ================= BASE CONFIG ================= */

const BASE_CONFIG: Record<
  FullTier,
  { baseCommission: number; baseMultiplier: number }
> = {
  NONE: { baseCommission: 0, baseMultiplier: 0 },
  F2: { baseCommission: 0.1, baseMultiplier: 1.6 },
  F3: { baseCommission: 0.09, baseMultiplier: 1.6 },
  F4: { baseCommission: 0.08, baseMultiplier: 1.6 },
  F5: { baseCommission: 0.07, baseMultiplier: 1.5 },
  F6: { baseCommission: 0.06, baseMultiplier: 1.5 },
  F7: { baseCommission: 0.05, baseMultiplier: 1.4 },
  F8: { baseCommission: 0.04, baseMultiplier: 1.2 },
};

/* ================= MAIN ================= */

export function calculateFullPricing(
  tier: FullTier,
  roomKey: number,               // ✅ changed
  otaRevenue: number,
  otaSharePercent: number,
  highADR: number,
  lowADR: number
): FullPricingResult {

  if (tier === "NONE") {
    return {
      tier,
      isEligible: false,
      systemCost: 0,
      aMultiplier: 0,
      adjustedCommissionRate: 0,
      A: 0,
      B: 0,
      totalMonthlyFee: 0,
    };
  }

  const base = BASE_CONFIG[tier];

  const aMultiplier =
    adjustMultiplier(
      base.baseMultiplier,
      otaSharePercent
    );

  const adjustedCommissionRate =
    adjustCommissionRate(
      base.baseCommission,
      otaSharePercent,
      highADR,
      lowADR
    );

  const systemCost =
    getSystemCost(roomKey);   // ✅ fixed

  const A = systemCost * aMultiplier;
  const B = otaRevenue * adjustedCommissionRate;

  return {
    tier,
    isEligible: true,

    systemCost,
    aMultiplier,
    adjustedCommissionRate,

    A,
    B,

    totalMonthlyFee: A + B,
  };
}
