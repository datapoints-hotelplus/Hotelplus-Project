import { RevenueResult } from "./types";

export function isLiteEligible(
  roomAvailable: number,
  revenue: RevenueResult
) {
  return (
    roomAvailable <= 40 &&
    revenue.average >= 40000 &&
    revenue.otaAverage >= 20000
  );
}

export function isFullEligible(
  revenue: RevenueResult
) {
  return (
    revenue.average >= 120000 &&
    revenue.otaAverage >= 72000
  );
}
