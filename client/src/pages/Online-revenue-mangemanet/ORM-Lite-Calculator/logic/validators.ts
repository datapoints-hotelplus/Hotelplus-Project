import { ORMLiteCalculatorInput } from "../model/ormLite.types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateORMLiteInput(
  input: ORMLiteCalculatorInput
): ValidationResult {
  const errors: string[] = [];

  const {
    roomKey,
    occupancyPercent,
    otaSharePercent,
    highSeason,
    shoulderSeason,
    lowSeason,
  } = input;

  // 1. Room Key
  if (roomKey <= 0) {
    errors.push("Room Key ต้องมากกว่า 0");
  }

  // 2. Occupancy
  if (occupancyPercent < 0 || occupancyPercent > 100) {
    errors.push("Occupancy ต้องอยู่ระหว่าง 0 ถึง 100%");
  }

  // 3. OTA Share
  if (otaSharePercent < 0 || otaSharePercent > 100) {
    errors.push("OTA Segment Sharing ต้องอยู่ระหว่าง 0 ถึง 100%");
  }

  // 4. Months validation
  const totalMonths =
    highSeason.months +
    shoulderSeason.months +
    lowSeason.months;

  if (totalMonths !== 12) {
    errors.push("จำนวนเดือนรวมของทุกฤดูกาลต้องเท่ากับ 12 เดือน");
  }

  // 5. ADR validation
  const seasons = [
    { name: "High Season", adr: highSeason.adr },
    { name: "Shoulder Season", adr: shoulderSeason.adr },
    { name: "Low Season", adr: lowSeason.adr },
  ];

  seasons.forEach(season => {
    if (season.adr <= 0) {
      errors.push(`${season.name}: ADR ต้องมากกว่า 0`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
