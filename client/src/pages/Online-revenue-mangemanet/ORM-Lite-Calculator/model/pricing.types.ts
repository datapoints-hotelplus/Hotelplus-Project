/* =====================================================
   ADD-ON
===================================================== */

export type AddOnOption = {
  id: string;
  label: string;
  price: number;
};

/** บริการเสริมแบบ stepper (0–4 ครั้ง) */
export type AddOnService = {
  code: string;
  name: string;
  description: string;
  unitPrice: number; // ราคาต่อ 1 ครั้ง
};

/** ผลรวมบริการเสริม stepper แต่ละรายการ (ใช้ใน pricing hook / export) */
export type AddOnQtyItem = {
  code: string;
  name: string;
  qty: number;       // จำนวนครั้งที่เลือก
  unitPrice: number;
  total: number;     // qty × unitPrice
};

/* ใช้ alias ให้ AddOnItem = AddOnOption (one-time forced checkboxes) */
export type AddOnItem = AddOnOption;

/* =====================================================
   LITE PRICING
===================================================== */

export type LiteTier = "L1" | "L2" | "L3" | "NONE";

export type LitePricingResult = {
  tier: LiteTier;

  baseMonthlyFee: number;

  commissionRate: number;
  commissionCost: number;

  // one-time / forced checkboxes (Revplus+, Register OTA)
  addOns: AddOnItem[];
  addOnTotal: number;

  // stepper add-ons (Shop Rate, Compset, ฯลฯ)
  stepperAddOns: AddOnQtyItem[];
  stepperAddOnTotal: number;

  // รวมทุกอย่าง
  totalFee: number;

  triggerMax: number;
  isTriggerExceeded: boolean;

  isEligible: boolean;
};

/* =====================================================
   FULL PRICING
===================================================== */

export type FullTier =
  | "NONE"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8";

export type FixedPackageResult = {
  baseValue: number;
  discountedValue: number;
  price: number;
  finalFee: number;
};

export type FullPricingResult = {
  tier: FullTier;
  isEligible: boolean;

  systemCost: number;
  aMultiplier: number;
  adjustedCommissionRate: number;

  A: number;
  B: number;

  totalMonthlyFee: number;

  smartPackage?: number;
  fixedPackage?: FixedPackageResult;
  performancePackage?: number;
  bOnlyRate?: number;
};

/* =====================================================
   PACKAGE COMPARISON
===================================================== */

export type PackageComparisonResult = {
  recommendation: "LITE" | "FULL";
  reason: string;
  gapPercent?: number;
};