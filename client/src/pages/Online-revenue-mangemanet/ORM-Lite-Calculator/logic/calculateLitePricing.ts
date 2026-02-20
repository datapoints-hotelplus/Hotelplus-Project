import type {
  LitePricingResult,
  AddOnOption,
  AddOnQtyItem,
} from "../model/pricing.types";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const BASE_MONTHLY_FEE = 3900;
const COMMISSION_RATE = 0.05;

const TRIGGER_MAX: Record<"L1" | "L2" | "L3", number> = {
  L1: 4000,
  L2: 5500,
  L3: 7000,
};

/* ─────────────────────────────────────────
   STEPPER SERVICES (unitPrice อ้างอิงจาก ADD_ON_SERVICES ใน View)
   ต้องตรง code กับที่ใช้ใน selectedAddOnQty
───────────────────────────────────────── */

const STEPPER_UNIT_PRICE: Record<string, { name: string; unitPrice: number }> = {
  SHOP_RATE_MONITORING:   { name: "Shop Rate Monitoring",   unitPrice: 1500 },
  COMPSET_SURVEY:         { name: "Compset Survey",         unitPrice: 2000 },
  VISIBILITY_MANAGEMENT:  { name: "Visibility Management",  unitPrice: 2000 },
  EXTRA_OTA:              { name: "Extra OTA Channel",      unitPrice: 800  },
  RESERVATION_MANAGEMENT: { name: "Reservation Management", unitPrice: 4500 },
};

/* ─────────────────────────────────────────
   TIER HELPER
───────────────────────────────────────── */

function getLiteTier(avgRevenue: number): "L1" | "L2" | "L3" | "NONE" {
  if (avgRevenue < 40000)   return "NONE";
  if (avgRevenue <= 120000) return "L1";
  if (avgRevenue <= 200000) return "L2";
  if (avgRevenue <= 300000) return "L3";
  return "NONE";
}

/* ─────────────────────────────────────────
   MAIN FUNCTION
───────────────────────────────────────── */

export function calculateLitePricing(
  roomAvailable: number,
  averageRevenue: number,
  otaRevenue: number,
  selectedAddOns: AddOnOption[],                // one-time / forced checkboxes
  selectedAddOnQty: Record<string, number> = {} // stepper qty (code → ครั้ง)
): LitePricingResult {

  const tier = getLiteTier(averageRevenue);

  // ── One-time / forced checkboxes ──────────────────────────────
  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  // ── Stepper add-ons ───────────────────────────────────────────
  const stepperAddOns: AddOnQtyItem[] = Object.entries(selectedAddOnQty ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([code, qty]) => {
      const service = STEPPER_UNIT_PRICE[code];
      const unitPrice = service?.unitPrice ?? 0;
      return {
        code,
        name: service?.name ?? code,
        qty,
        unitPrice,
        total: qty * unitPrice,
      };
    });

  const stepperAddOnTotal = stepperAddOns.reduce((sum, s) => sum + s.total, 0);

  // ── Tier NONE → ไม่เข้า Lite ─────────────────────────────────
  if (tier === "NONE") {
    return {
      tier: "NONE",
      isEligible: false,
      baseMonthlyFee: 0,
      commissionRate: 0,
      commissionCost: 0,
      addOns: selectedAddOns,
      addOnTotal,
      stepperAddOns,
      stepperAddOnTotal,
      totalFee: 0,
      triggerMax: 0,
      isTriggerExceeded: false,
    };
  }

  // ── Commission ────────────────────────────────────────────────
  const commissionCost = otaRevenue * COMMISSION_RATE;

  // ── Trigger (เช็คเฉพาะ stepperAddOnTotal) ────────────────────
  const triggerMax = TRIGGER_MAX[tier];
  const isTriggerExceeded = stepperAddOnTotal > triggerMax;

  // ── Eligibility ───────────────────────────────────────────────
  const isEligible =
    roomAvailable <= 40 &&
    averageRevenue >= 40000 &&
    otaRevenue >= 20000;

  // ── Total (base + commission + checkbox add-ons + stepper add-ons) ──
  const totalFee =
    BASE_MONTHLY_FEE +
    commissionCost +
    addOnTotal +
    stepperAddOnTotal;

  return {
    tier,
    isEligible,
    baseMonthlyFee: BASE_MONTHLY_FEE,
    commissionRate: COMMISSION_RATE,
    commissionCost,
    addOns: selectedAddOns,
    addOnTotal,
    stepperAddOns,
    stepperAddOnTotal,
    totalFee,
    triggerMax,
    isTriggerExceeded,
  };
}