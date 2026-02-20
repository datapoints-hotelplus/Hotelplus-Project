import type { OTAName } from "../store/useCalculatorStore";

const CORE_OTAS: OTAName[] = ["Agoda", "Booking.com", "Trip.com"];

export type ForcedAddOn = "REVPLUS" | "REGISTER_OTA";

interface ForcedAddOnResult {
  forced: ForcedAddOn[];
  revplus: boolean;
  registerOTA: boolean;
}

export function getForcedAddOns({
  isLiteEligible,
  isFullEligible,
  hasExistingOTA,
  selectedOTAs,
}: {
  isLiteEligible: boolean;
  isFullEligible: boolean;
  hasExistingOTA: boolean | null;
  selectedOTAs: OTAName[];
}): ForcedAddOnResult {

  const hasCoreOTAs = CORE_OTAS.every((ota) => selectedOTAs.includes(ota));

  let revplus = false;
  let registerOTA = false;

  if (isFullEligible) {
    // Full Service + Yes → บังคับทั้งคู่
    // Full Service + No / null → บังคับแค่ Register OTAs
    if (hasExistingOTA === true) {
      revplus = true;
      registerOTA = true;
    } else {
      registerOTA = true;
    }
  } else if (isLiteEligible) {
    if (hasExistingOTA === false || hasExistingOTA === null) {
      // No → บังคับ Register OTAs
      registerOTA = true;
    } else {
      // Yes → เช็ค core OTAs ครบไหม
      if (hasCoreOTAs) {
        revplus = true;
      } else {
        registerOTA = true;
      }
    }
  }

  const forced: ForcedAddOn[] = [];
  if (revplus) forced.push("REVPLUS");
  if (registerOTA) forced.push("REGISTER_OTA");

  return { forced, revplus, registerOTA };
}