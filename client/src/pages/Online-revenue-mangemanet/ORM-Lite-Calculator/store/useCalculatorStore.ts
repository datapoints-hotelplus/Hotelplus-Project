import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddOnOption } from "../model/pricing.types";

export type ExportPackage = "LITE" | "SMART" | "FIXED" | "PERFORMANCE";

interface SeasonInput {
  months: number;
  adr: number;
}

export const OTA_LIST = [
  "Agoda",
  "Booking.com",
  "Trip.com",
  "Expedia",
  "Traveloka",
  "Tiket.com",
  "Gother",
] as const;

export type OTAName = typeof OTA_LIST[number];

interface CalculatorInput {
  hotelName: string;
  roomKey: number;
  occupancyPercent: number;
  otaSharePercent: number;
  highSeason: SeasonInput;
  shoulderSeason: SeasonInput;
  lowSeason: SeasonInput;
}

interface RevenueResult {
  roomAvailable: number;
  averageRevenuePerMonth: number;
  highRevenuePerMonth: number;
  shoulderRevenuePerMonth: number;
  lowRevenuePerMonth: number;
  otaRevenuePerMonth: number;
}

interface CalculatorState {
  // Form Input
  input: CalculatorInput;

  // Revenue Result (หลังกดคำนวณ)
  revenueResult: RevenueResult | null;
  revenueErrors: string[];

  // Add-on (one-time / forced checkboxes)
  selectedAddOns: AddOnOption[];

  // Add-on stepper (code → จำนวนครั้ง 0–4)
  selectedAddOnQty: Record<string, number>;

  // OTA Section
  hasExistingOTA: boolean | null;
  selectedOTAs: OTAName[];

  // UI State
  selectedFullPackage: "SMART" | "FIXED" | "PERFORMANCE";
  selectedExports: ExportPackage[];
  showServiceInfo: boolean;

  // Actions
  updateField: (field: string, value: string | number) => void;
  updateSeason: (
    season: "highSeason" | "shoulderSeason" | "lowSeason",
    field: "months" | "adr",
    value: number
  ) => void;
  setRevenueResult: (result: RevenueResult | null) => void;
  setRevenueErrors: (errors: string[]) => void;
  toggleAddOnOption: (option: AddOnOption) => void;
  setAddOnQty: (code: string, qty: number) => void;
  setHasExistingOTA: (value: boolean | null) => void;
  toggleOTA: (ota: OTAName) => void;
  setSelectedFullPackage: (pkg: "SMART" | "FIXED" | "PERFORMANCE") => void;
  toggleExport: (pkg: ExportPackage) => void;
  toggleSelectAll: (availablePackages: ExportPackage[]) => void;
  setShowServiceInfo: (show: boolean) => void;
  reset: () => void;
}

const defaultInput: CalculatorInput = {
  hotelName: "",
  roomKey: 0,
  occupancyPercent: 0,
  otaSharePercent: 0,
  highSeason: { months: 0, adr: 0 },
  shoulderSeason: { months: 0, adr: 0 },
  lowSeason: { months: 0, adr: 0 },
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      // Initial State
      input: defaultInput,
      revenueResult: null,
      revenueErrors: [],
      selectedAddOns: [],
      selectedAddOnQty: {},
      hasExistingOTA: null,
      selectedOTAs: [],
      selectedFullPackage: "SMART",
      selectedExports: [],
      showServiceInfo: false,

      // Actions
      updateField: (field, value) =>
        set((state) => ({
          input: { ...state.input, [field]: value },
        })),

      updateSeason: (season, field, value) =>
        set((state) => ({
          input: {
            ...state.input,
            [season]: { ...state.input[season], [field]: value },
          },
        })),

      setRevenueResult: (result) => set({ revenueResult: result }),
      setRevenueErrors: (errors) => set({ revenueErrors: errors }),

      toggleAddOnOption: (option) =>
        set((state) => ({
          selectedAddOns: state.selectedAddOns.some((o) => o.id === option.id)
            ? state.selectedAddOns.filter((o) => o.id !== option.id)
            : [...state.selectedAddOns, option],
        })),

      setAddOnQty: (code, qty) =>
        set((state) => ({
          selectedAddOnQty: {
            ...state.selectedAddOnQty,
            [code]: Math.min(4, Math.max(0, qty)),
          },
        })),

      setHasExistingOTA: (value) => set({ hasExistingOTA: value }),

      toggleOTA: (ota) =>
        set((state) => ({
          selectedOTAs: state.selectedOTAs.includes(ota)
            ? state.selectedOTAs.filter((o) => o !== ota)
            : [...state.selectedOTAs, ota],
        })),

      setSelectedFullPackage: (pkg) => set({ selectedFullPackage: pkg }),

      toggleExport: (pkg) =>
        set((state) => ({
          selectedExports: state.selectedExports.includes(pkg)
            ? state.selectedExports.filter((p) => p !== pkg)
            : [...state.selectedExports, pkg],
        })),

      toggleSelectAll: (availablePackages) =>
        set((state) => ({
          selectedExports:
            state.selectedExports.length === availablePackages.length
              ? []
              : availablePackages,
        })),

      setShowServiceInfo: (show) => set({ showServiceInfo: show }),

      reset: () =>
        set({
          input: defaultInput,
          revenueResult: null,
          revenueErrors: [],
          selectedAddOns: [],
          selectedAddOnQty: {},
        }),
    }),
    {
      name: "orm-calculator-storage",
      partialize: (state) => ({
        input: state.input,
        revenueResult: state.revenueResult,
        selectedAddOns: state.selectedAddOns,
        selectedAddOnQty: state.selectedAddOnQty,
        selectedFullPackage: state.selectedFullPackage,
        selectedExports: state.selectedExports,
      }),
    }
  )
);