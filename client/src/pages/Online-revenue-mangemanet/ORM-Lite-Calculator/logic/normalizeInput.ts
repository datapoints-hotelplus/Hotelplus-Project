import type {
  ORMLiteCalculatorInput,
  NormalizedORMInput,
} from "../model/ormLite.types";

export function normalizeInput(
  input: ORMLiteCalculatorInput
): NormalizedORMInput {

  const { highSeason, shoulderSeason, lowSeason } = input;

  const isSameADR =
    highSeason.adr === shoulderSeason.adr &&
    shoulderSeason.adr === lowSeason.adr;

  let highADR = highSeason.adr;
  let shoulderADR = shoulderSeason.adr;
  let lowADR = lowSeason.adr;

  // หากทุกฤดูใช้ ADR เท่ากัน → กระจายราคาอัตโนมัติ
  if (isSameADR) {
    const baseADR = highSeason.adr;
    lowADR = baseADR;
    shoulderADR = baseADR * 1.05;
    highADR = baseADR * 1.1;
  }

  return {
    roomKey: input.roomKey,
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
