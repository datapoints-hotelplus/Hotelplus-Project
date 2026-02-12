/* =====================================================
   ADD-ON
===================================================== */

export type AddOnOption = {
  id: string;
  label: string;
  price: number;
};

export type AddOnService = {
  code: string;
  name: string;
  options: AddOnOption[];
};

/* ใช้ alias ให้ AddOnItem = AddOnOption */
export type AddOnItem = AddOnOption;

/* =====================================================
   LITE PRICING
===================================================== */

export type LiteTier = "L1" | "L2" | "L3";

export type LitePricingResult = {
  tier: LiteTier;

  baseMonthlyFee: number;

  commissionRate: number;
  commissionCost: number;

  addOns: AddOnItem[];
  addOnTotal: number;

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
