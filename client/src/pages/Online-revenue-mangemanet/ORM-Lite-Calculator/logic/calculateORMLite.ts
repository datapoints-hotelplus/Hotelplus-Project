import type {
  NormalizedORMInput,
  ORMLiteResult,
} from "../model/ormLite.types";

const DAYS_PER_MONTH = 30;

export function calculateORMLite(
  input: NormalizedORMInput
): ORMLiteResult {

  const { roomKey, occupancy, otaShare } = input;

  // จำนวนห้องที่มีจำหน่าย
  const roomAvailable =
    roomKey * occupancy;

  /* ---------- Revenue per season per month ---------- */

  const highRevenuePerMonth =
    roomAvailable *
    input.high.adr *
    DAYS_PER_MONTH;

  const shoulderRevenuePerMonth =
    roomAvailable *
    input.shoulder.adr *
    DAYS_PER_MONTH;

  const lowRevenuePerMonth =
    roomAvailable *
    input.low.adr *
    DAYS_PER_MONTH;

  /* ---------- Weighted Average Revenue ---------- */

  const averageRevenuePerMonth =
    (highRevenuePerMonth * input.high.months +
      shoulderRevenuePerMonth * input.shoulder.months +
      lowRevenuePerMonth * input.low.months) /
    12;

  /* ---------- OTA Revenue ---------- */

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
