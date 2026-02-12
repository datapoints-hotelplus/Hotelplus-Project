// Lite Tier
export type LiteTier = "NONE" | "L1" | "L2" | "L3";

// Full Tier
export type FullTier =
  | "NONE"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8";

// Package Recommendation
export type PackageType = "LITE" | "FULL" | "NOT_RECOMMENDED";

export type AddOnCode =
  | "SHOP_RATE_MONITORING"
  | "COMPSET_SURVEY"
  | "VISIBILITY_MANAGEMENT"
  | "EXTRA_OTA"
  | "RESERVATION_MANAGEMENT";

export interface AddOnOption {
  id: string;
  label: string;
  price: number;
}

export interface AddOnItem extends AddOnOption {}

export interface AddOnService {
  code: AddOnCode;
  name: string;
  options: AddOnOption[];
}

export interface AddOnItem {
  code: AddOnCode;
  name: string;
  price: number;
}

export interface LitePricingResult {
  tier: "L1" | "L2" | "L3";

  baseMonthlyFee: number;

  commissionRate: number;
  commissionCost: number;

  addOns: AddOnItem[];
  addOnTotal: number;

  totalFee: number;

  triggerMax: number;
  isTriggerExceeded: boolean;

  isEligible: boolean;
}


export interface FullPricingResult {
  tier: FullTier;

  commissionRate: number;
  multiplier: number;

  estimatedPackageFee: number;

  minCharge: number;   // 8,000
  finalCharge: number;

  isEligible: boolean;
}

export interface PackageComparisonResult {
  lite: LitePricingResult | null;
  full: FullPricingResult | null;

  recommendedPackage: PackageType;
  gapPercent: number;
}

export interface PricingInput {
  averageRevenuePerMonth: number;
  otaRevenuePerMonth: number;
}
