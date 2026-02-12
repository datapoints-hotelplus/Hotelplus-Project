export interface ORMLiteCalculatorInput {
  roomKey: number;
  occupancyPercent: number;
  otaSharePercent: number;

  highSeason: {
    months: number;
    adr: number;
  };

  shoulderSeason: {
    months: number;
    adr: number;
  };

  lowSeason: {
    months: number;
    adr: number;
  };
}

export interface NormalizedORMInput {
  roomKey: number;
  occupancyRate: number;
  otaShareRate: number;

  highSeason: {
    months: number;
    adr: number;
  };

  shoulderSeason: {
    months: number;
    adr: number;
  };

  lowSeason: {
    months: number;
    adr: number;
  };
}

export interface ORMLiteResult {
  roomAvailable: number;

  averageRevenuePerMonth: number;

  highRevenuePerMonth: number;
  shoulderRevenuePerMonth: number;
  lowRevenuePerMonth: number;

  otaRevenuePerMonth: number;
}

export type LiteTier = "STARTER" | "GROWTH" | "PRO";

export interface PackageComparisonResult {
  recommendation: string;
  reason: string;
  gapPercent?: number;   // 🔥 สำคัญมาก
}
