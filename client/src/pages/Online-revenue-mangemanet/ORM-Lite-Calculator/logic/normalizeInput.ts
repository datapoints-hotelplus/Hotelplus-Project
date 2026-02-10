import { ORMLiteCalculatorInput, NormalizedORMInput,} from "../model/ormLite.types";

const ROOM_MAINTENANCE_RATE = 0.2;

export function normalizeInput(
  input: ORMLiteCalculatorInput
): NormalizedORMInput {
  const {
    roomKey,
    occupancyPercent,
    otaSharePercent,
    highSeason,
    shoulderSeason,
    lowSeason,
  } = input;

  // 1. Room Available
  const roomAvailable = roomKey * (1 - ROOM_MAINTENANCE_RATE);

  // 2. Convert percentage to decimal
  const occupancy = occupancyPercent / 100;
  const otaShare = otaSharePercent / 100;

  // 3. ADR overwrite check
  const isSameADR =
    highSeason.adr === shoulderSeason.adr &&
    shoulderSeason.adr === lowSeason.adr;

  let highADR = highSeason.adr;
  let shoulderADR = shoulderSeason.adr;
  let lowADR = lowSeason.adr;

  if (isSameADR) {
    const baseADR = highSeason.adr;
    lowADR = baseADR;
    shoulderADR = baseADR * 1.05;
    highADR = baseADR * 1.1;
  }

  return {
    roomAvailable,
    occupancy,
    otaShare,

    high: {
      months: highSeason.months,
      adr: highADR,
      revenue: 0, // คำนวณใน step ถัดไป
    },

    shoulder: {
      months: shoulderSeason.months,
      adr: shoulderADR,
      revenue: 0,
    },

    low: {
      months: lowSeason.months,
      adr: lowADR,
      revenue: 0,
    },
  };
}
