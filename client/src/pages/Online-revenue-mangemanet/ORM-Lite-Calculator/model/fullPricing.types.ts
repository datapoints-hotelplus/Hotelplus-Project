// model/fullPricing.types.ts

export type FullTier =
  | "NONE"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8";

export interface FixedPackageResult {
  baseValue: number;
  discountedValue: number;
  finalFee: number;     // 🔥 เพิ่ม
}

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
  performancePackage?: number;   // ✅
  bOnlyRate?: number;            // ✅
};

