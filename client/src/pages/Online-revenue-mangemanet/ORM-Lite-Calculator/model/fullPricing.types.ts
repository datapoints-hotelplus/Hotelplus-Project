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
  price: number;
  finalFee: number;     // 🔥 เพิ่ม
}

export interface FullPricingResult {
  tier: FullTier;

  A: number;
  B: number;

  smartPackage: number;
  performancePackage: number;

  fixedPackage: FixedPackageResult;

  systemCost: number;   // 🔥 ต้องมี
  totalMonthlyFee: number;
}
