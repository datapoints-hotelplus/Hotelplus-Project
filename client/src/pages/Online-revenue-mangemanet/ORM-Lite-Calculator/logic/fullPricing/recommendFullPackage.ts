import {
  FullPackageType,
  FullPackagePrices,
} from "../../model/fullPricing.types";

export function recommendFullPackage(
  prices: FullPackagePrices
): FullPackageType {

  const candidates = [
    { type: "SMART", value: prices.smart.monthlyFee },
    { type: "FIXED", value: prices.fixed.finalFee },
  ];

  if (prices.performance.isEligible) {
    candidates.push({
      type: "PERFORMANCE",
      value: prices.performance.monthlyFee,
    });
  }

  candidates.sort((a, b) => a.value - b.value);

  return candidates[0].type as FullPackageType;
}
