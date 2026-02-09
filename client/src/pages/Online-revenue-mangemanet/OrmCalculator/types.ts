export type SeasonInput = {
  months: number;
  adr: number;
};

export type CalculatorInput = {
  hotelName: string;
  roomKeys: number;
  occupancy: number;
  otaShare: number;

  high: SeasonInput;
  shoulder: SeasonInput;
  low: SeasonInput;
};

export type RevenueResult = {
  high: number;
  shoulder: number;
  low: number;

  average: number;
  otaAverage: number;
  roomAvailable: number;
};

export type CalculationResult =
  | {
      model: "FULL";
      tier: string;
      smartPrice: number;
      revenue: RevenueResult;
    }
  | {
      model: "LITE";
      tier: string;
      revenue: RevenueResult;
    }
  | {
      model: "NONE";
      message: string;
      revenue: RevenueResult;
    };
