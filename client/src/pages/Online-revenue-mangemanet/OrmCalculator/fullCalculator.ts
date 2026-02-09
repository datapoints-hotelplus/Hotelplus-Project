import { RevenueResult } from "./types";
import { clamp } from "./utils";

export function getFullTier(avg: number) {
  if (avg < 120000) return "NOT_RECOMMENDED";
  if (avg <= 200000) return "F2";
  if (avg <= 350000) return "F3";
  if (avg <= 600000) return "F4";
  if (avg <= 1000000) return "F5";
  if (avg <= 1500000) return "F6";
  if (avg <= 2500000) return "F7";
  return "F8";
}

const BASE = {
  F2: 0.1,
  F3: 0.09,
  F4: 0.08,
  F5: 0.07,
  F6: 0.06,
  F7: 0.05,
  F8: 0.04,
  NOT_RECOMMENDED: 0
};
export const BASE_COMMISSION_MAP = BASE;

export function adjustedRate(
  tier: string,
  otaShare: number,
  highADR: number,
  lowADR: number
) {
  let rate = BASE[tier as keyof typeof BASE];

  if (otaShare > 0.8) rate += 0.01;
  if (otaShare < 0.5) rate -= 0.005;

  const variance =
    (highADR - lowADR) / lowADR;

  if (variance > 1) rate += 0.005;

  return clamp(rate, 0.03, 0.15);
}

export function smartPackage(
  A: number,
  revenue: RevenueResult,
  rate: number
) {
  return Math.min(
    A + revenue.otaAverage * rate,
    60000
  );
}


