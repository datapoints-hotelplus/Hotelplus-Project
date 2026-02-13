// model/ormLite.types.ts

export interface SeasonInput {
  months: number;
  adr: number;
}

/* ------------ INPUT ------------ */

export interface ORMLiteCalculatorInput {
  hotelName?: string;
  roomKey: number;
  occupancyPercent: number;
  otaSharePercent: number;

  highSeason: SeasonInput;
  shoulderSeason: SeasonInput;
  lowSeason: SeasonInput;
}

/* ------------ NORMALIZED ------------ */

export interface NormalizedORMInput {
  roomAvailable: number;

    occupancy: number;
    otaShare: number;

    high: SeasonInput;
    shoulder: SeasonInput;
    low: SeasonInput;
}

/* ------------ RESULT ------------ */

export interface ORMLiteResult {
  roomAvailable: number;

  averageRevenuePerMonth: number;
  highRevenuePerMonth: number;
  shoulderRevenuePerMonth: number;
  lowRevenuePerMonth: number;

  otaRevenuePerMonth: number;
}

/* ------------ PACKAGE COMPARE ------------ */

export interface PackageComparisonResult {
  recommendation: string;
  reason: string;
  gapPercent?: number;
}
