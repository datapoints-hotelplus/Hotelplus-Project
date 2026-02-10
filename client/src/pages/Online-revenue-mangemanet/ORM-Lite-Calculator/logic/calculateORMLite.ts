import { NormalizedORMInput, ORMLiteResult,} from "../model/ormLite.types";

const DAYS_PER_MONTH = 30;

export function calculateORMLite(
  input: NormalizedORMInput
): ORMLiteResult {
  const { roomAvailable, occupancy, otaShare } = input;

  // 1. Revenue per season per month
  const highRevenuePerMonth =
    roomAvailable * input.high.adr * DAYS_PER_MONTH * occupancy;

  const shoulderRevenuePerMonth =
    roomAvailable * input.shoulder.adr * DAYS_PER_MONTH * occupancy;

  const lowRevenuePerMonth =
    roomAvailable * input.low.adr * DAYS_PER_MONTH * occupancy;

  // 2. Weighted Average Revenue
  const averageRevenuePerMonth =
    (highRevenuePerMonth * input.high.months +
      shoulderRevenuePerMonth * input.shoulder.months +
      lowRevenuePerMonth * input.low.months) /
    12;

  // 3. OTA Revenue
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
