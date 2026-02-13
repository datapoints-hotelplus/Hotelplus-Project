import type {
  NormalizedORMInput,
  ORMLiteResult,
} from "../model/ormLite.types";

const DAYS_PER_MONTH = 30;

export function calculateORMLite(
  input: NormalizedORMInput
): ORMLiteResult {

  const {
    roomAvailable,
    occupancy,
    otaShare,
    high,
    shoulder,
    low,
  } = input;

  /* ---------- SEASON REVENUE ---------- */

  const highRevenuePerMonth =
    roomAvailable * high.adr * DAYS_PER_MONTH * occupancy;

  const shoulderRevenuePerMonth =
    roomAvailable * shoulder.adr * DAYS_PER_MONTH * occupancy;

  const lowRevenuePerMonth =
    roomAvailable * low.adr * DAYS_PER_MONTH * occupancy;

  /* ---------- WEIGHTED AVG ---------- */

  const averageRevenuePerMonth =
    (highRevenuePerMonth * high.months +
      shoulderRevenuePerMonth * shoulder.months +
      lowRevenuePerMonth * low.months) / 12;

  /* ---------- OTA ---------- */

  const otaRevenuePerMonth =
    averageRevenuePerMonth * otaShare;

  return {
    roomAvailable,

    highRevenuePerMonth,
    shoulderRevenuePerMonth,
    lowRevenuePerMonth,

    averageRevenuePerMonth,
    otaRevenuePerMonth,
  };
}
