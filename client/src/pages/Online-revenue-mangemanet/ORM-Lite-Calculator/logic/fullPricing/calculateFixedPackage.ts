import type {
  FixedPackageResult,
  FullTier,
} from "../../model/fullPricing.types";

const CONFIG: Record<
  FullTier,
  { weight: number; discount: number }
> = {
  NONE: { weight: 0, discount: 0 },
  F2: { weight: 0.85, discount: 0.7 },
  F3: { weight: 0.9, discount: 0.75 },
  F4: { weight: 0.95, discount: 0.8 },
  F5: { weight: 1, discount: 0.83 },
  F6: { weight: 1, discount: 0.85 },
  F7: { weight: 1, discount: 0.87 },
  F8: { weight: 1, discount: 0.9 },
};

export function calculateFixedPackage(
  tier: FullTier,
  A: number,
  lowB: number
): FixedPackageResult {

  const { weight, discount } =
    CONFIG[tier];

  const baseValue =
    A + lowB * weight;

  const discountedValue =
    baseValue * discount;

  const finalFee = Math.max(
    discountedValue,
    A + 5000
  );

  return {
    baseValue,
    discountedValue,
    price: finalFee,   // ✅ สำคัญ
    finalFee,
  };
}
