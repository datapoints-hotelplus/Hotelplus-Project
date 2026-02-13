import type {
  ORMLiteCalculatorInput,
  NormalizedORMInput,
} from "../model/ormLite.types";

export function normalizeInput(
  input: ORMLiteCalculatorInput
): NormalizedORMInput {

  /* ---------- ROOM AVAILABLE ---------- */
  const roomAvailable = input.roomKey * 0.8;

  /* ---------- ADR OVERWRITE ---------- */
  const sameADR =
    input.highSeason.adr === input.shoulderSeason.adr &&
    input.highSeason.adr === input.lowSeason.adr;

  let highADR = input.highSeason.adr;
  let shoulderADR = input.shoulderSeason.adr;
  let lowADR = input.lowSeason.adr;

  if (sameADR) {
    lowADR = input.lowSeason.adr;
    shoulderADR = lowADR * 1.05;
    highADR = lowADR * 1.10;
  }

  return {
    roomAvailable,

    occupancy: input.occupancyPercent / 100,
    otaShare: input.otaSharePercent / 100,

    high: {
      months: input.highSeason.months,
      adr: highADR,
    },

    shoulder: {
      months: input.shoulderSeason.months,
      adr: shoulderADR,
    },

    low: {
      months: input.lowSeason.months,
      adr: lowADR,
    },
  };
}
