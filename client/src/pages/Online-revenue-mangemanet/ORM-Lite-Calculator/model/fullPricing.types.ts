import type { FullTier } from "./pricing.types";

export interface FixedPackageResult {
  baseValue: number;
  discountedValue: number;
  price: number;
  finalFee: number;
}

export interface FullPricingResult {
  tier: FullTier;
  isEligible: boolean;

  systemCost: number;
  aMultiplier: number;
  adjustedCommissionRate: number;

  A: number;
  B: number;

  totalMonthlyFee: number;

  /* ---------- EXTENDED ---------- */
  smartPackage: number;
  fixedPackage: FixedPackageResult;
  performancePackage: number;
  bOnlyRate: number;
}
