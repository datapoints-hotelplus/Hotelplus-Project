import { CalculatorInput, RevenueResult } from "./types";
import { applyRoomMaintenance, overwriteADR } from "./utils";

export function calculateRevenue(
  input: CalculatorInput
): RevenueResult {

  const roomAvailable =
    applyRoomMaintenance(input.roomKeys);

  const adr = overwriteADR(
    input.high.adr,
    input.shoulder.adr,
    input.low.adr
  );

  const monthly = (adr: number) =>
    roomAvailable *
    adr *
    30 *
    input.occupancy;

  const high = monthly(adr.high);
  const shoulder = monthly(adr.shoulder);
  const low = monthly(adr.low);

  const average =
    (high * input.high.months +
      shoulder * input.shoulder.months +
      low * input.low.months) / 12;

  return {
    high,
    shoulder,
    low,
    average,
    otaAverage: average * input.otaShare,
    roomAvailable
  };
}

export function getLiteTier(avg: number) {
  if (avg < 40000) return "NOT_RECOMMENDED";
  if (avg <= 120000) return "L1";
  if (avg <= 200000) return "L2";
  if (avg <= 300000) return "L3";
  return "NOT_RECOMMENDED";
}
