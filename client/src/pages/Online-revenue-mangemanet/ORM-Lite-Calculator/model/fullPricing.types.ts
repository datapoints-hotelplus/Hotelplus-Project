export type FullTier =
  | "NONE"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8";

export type FullPackageType =
  | "SMART"
  | "FIXED"
  | "PERFORMANCE";

export interface FullPricingInput {
  roomAvailable: number;

  averageRevenuePerMonth: number;
  otaRevenuePerMonth: number;
  otaSharePercent: number;

  highADR: number;
  lowADR: number;

  highOTARevenue: number;
  shoulderOTARevenue: number;
  lowOTARevenue: number;
}
export interface AdjustedCommissionResult {
  baseRate: number;

  otaAdjustment: number;       // +1%, -0.5%, 0
  volatilityAdjustment: number; // +0.5% or 0

  finalRate: number; // clamped 3% - 15%
}

export interface SystemCostResult {
  roomAvailable: number;
  systemCost: number;
  aMultiplier: number;
  monthlyFeeA: number; // A
}
export interface CommissionResult {
  averageOTARevenue: number;
  commissionRate: number;
  commissionValue: number; // B
}
export interface SmartPackageResult {
  monthlyFee: number;        // A + B (cap 60,000)
  capped: boolean;

  seasonalBreakdown: {
    high: number;
    shoulder: number;
    low: number;
  };
}
export interface FixedPackageResult {
  baseValue: number;
  discountedValue: number;
  finalFee: number; // max(discountedValue, A + 5000)
}
export interface PerformancePackageResult {
  bOnlyRate: number;      // Adjusted + 2%
  monthlyFee: number;     // OTA Avg × bOnlyRate
  isEligible: boolean;    // >= 15,000 & not low revenue
}
export interface FullPackagePrices {
  smart: SmartPackageResult;
  fixed: FixedPackageResult;
  performance: PerformancePackageResult;
}
export interface FullPricingResult {
  tier: FullTier;

  adjustedCommission: AdjustedCommissionResult;
  systemCost: SystemCostResult;
  commission: CommissionResult;

  packages: FullPackagePrices;

  recommendedPackage: FullPackageType;
}
export interface OverlapRecommendation {
  isOverlapZone: boolean; // 120K - 300K
  defaultRecommendation: "LITE" | "FULL";
}
