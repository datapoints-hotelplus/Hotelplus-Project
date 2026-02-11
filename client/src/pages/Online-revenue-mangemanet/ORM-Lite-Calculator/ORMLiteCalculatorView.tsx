import { useState } from "react";
import { useRevenueEngine } from "./hooks/useRevenueEngine";
import { useLitePricing } from "./hooks/useLitePricing";
import { useFullPricing } from "./hooks/useFullPricing";
import {formatCurrency,formatNumber,round,} from "../../../utils/number";
import {AddOnService,AddOnOption,} from "./model/pricing.types";
import {recommendPackage,} from "./logic/recommendation/recommendPackage";
import "./orm-lite-calculator.css";

const ADD_ON_SERVICES: AddOnService[] = [
  {
    code: "SHOP_RATE_MONITORING",
    name: "Shop Rate Monitoring",
    options: [
      { id: "SR_1", label: "1 time", price: 1500 },
      { id: "SR_4", label: "4 times (weekly)", price: 4500 },
    ],
  },
  {
    code: "COMPSET_SURVEY",
    name: "Compset Survey",
    options: [
      { id: "CS_1", label: "1 time", price: 2000 },
      { id: "CS_4", label: "4 times (weekly)", price: 6000 },
    ],
  },
  {
    code: "VISIBILITY_MANAGEMENT",
    name: "Visibility Management",
    options: [
      { id: "VM_1", label: "1 time", price: 2000 },
      { id: "VM_4", label: "4 times (weekly)", price: 6000 },
    ],
  },
  {
    code: "EXTRA_OTA",
    name: "Extra OTA Channel",
    options: [
      { id: "OTA_1", label: "1 OTA / month", price: 800 },
    ],
  },
  {
    code: "RESERVATION_MANAGEMENT",
    name: "Reservation Management",
    options: [
      { id: "RM", label: "Monthly", price: 4500 },
    ],
  },
];


export default function ORMLiteCalculatorView() {

  /* ----------- REVENUE ----------- */

  const {
    input,
    setInput,
    revenueResult,
    revenueErrors,
    calculateRevenue,
    resetRevenue,
  } = useRevenueEngine();

  /* ----------- ADD-ON ----------- */

  const [selectedAddOns, setSelectedAddOns] =
    useState<AddOnOption[]>([]);

  /* ----------- LITE PRICING ----------- */

  const { litePricing } = useLitePricing({
    revenueResult,
    selectedAddOns,
  });

  /* ----------- FULL PRICING ----------- */

  const { fullPricing } = useFullPricing({
    revenueResult,
  });

  /* ----------- RECOMMENDATION ----------- */

  const recommendation = recommendPackage({
    revenueResult,
    litePricing,
    fullPricing,
  });

  /* ----------- ELIGIBILITY ----------- */

  const isLiteEligible = !!litePricing;

  const isFullEligible =
    !!fullPricing && fullPricing.tier !== "NONE";

  /* ------------ HELPERS ------------ */

  const updateField = (field: string, value: number) => {
    setInput(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSeason = (
    season: "highSeason" | "shoulderSeason" | "lowSeason",
    field: "months" | "adr",
    value: number
  ) => {
    setInput(prev => ({
      ...prev,
      [season]: {
        ...prev[season],
        [field]: value,
      },
    }));
  };

  const toggleAddOnOption = (option: AddOnOption) => {
    setSelectedAddOns(prev =>
      prev.some(o => o.id === option.id)
        ? prev.filter(o => o.id !== option.id)
        : [...prev, option]
    );
  };

  const [selectedFullPackage, setSelectedFullPackage] =
  useState<"SMART" | "FIXED" | "PERFORMANCE">("SMART");

  return (
    <div className="orm-lite-calculator">

      {/* BASIC INFO */}
      <section>
        <h2>Basic Information</h2>

        <label>
          Room Key
          <input
            type="number"
            value={input.roomKey}
            onChange={e =>
              updateField("roomKey", Number(e.target.value))
            }
          />
        </label>

        <label>
          Occupancy (%)
          <input
            type="number"
            value={input.occupancyPercent}
            onChange={e =>
              updateField(
                "occupancyPercent",
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          OTA Segment Sharing (%)
          <input
            type="number"
            value={input.otaSharePercent}
            onChange={e =>
              updateField(
                "otaSharePercent",
                Number(e.target.value)
              )
            }
          />
        </label>
      </section>

      {/* SEASONS */}
      <section>
        <h2>Season Setup</h2>

        {(["highSeason", "shoulderSeason", "lowSeason"] as const).map(
          season => (
            <div key={season}>
              <h3>{season}</h3>

              <label>
                Months
                <input
                  type="number"
                  value={input[season].months}
                  onChange={e =>
                    updateSeason(
                      season,
                      "months",
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label>
                ADR (THB / night)
                <input
                  type="number"
                  value={input[season].adr}
                  onChange={e =>
                    updateSeason(
                      season,
                      "adr",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
          )
        )}

          {/* ACTION */}
          <section>
            <button onClick={calculateRevenue}>
              Calculate
            </button>
            <button
              onClick={() => {
                resetRevenue();
                setSelectedAddOns([]);
              }}
            >
              Reset
            </button>
          </section>

      </section>

      {/* ERRORS */}
      {revenueErrors.length > 0 && (
        <section>
          <h3>Errors</h3>
          <ul>
            {revenueErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </section>
      )}

      {/* RESULT */}
      {revenueResult && (
        <section>
          <h2>Result (Estimated)</h2>
          <small>
            * Revenue is calculated based on 30 days per month
          </small>

          <p>
            Room Available:{" "}
            {formatNumber(round(revenueResult.roomAvailable, 0))} ห้อง
          </p>

          <p>
            High Revenue / Month:{" "}
            {formatCurrency(revenueResult.highRevenuePerMonth)}
          </p>

          <p>
            Shoulder Revenue / Month:{" "}
            {formatCurrency(revenueResult.shoulderRevenuePerMonth)}
          </p>

          <p>
            Low Revenue / Month:{" "}
            {formatCurrency(revenueResult.lowRevenuePerMonth)}
          </p>

          <p>
            Average Revenue / Month:{" "}
            {formatCurrency(revenueResult.averageRevenuePerMonth)}
          </p>

          <p>
            OTA Revenue / Month:{" "}
            {formatCurrency(revenueResult.otaRevenuePerMonth)}
          </p>
        </section>
      )}

      {/* ADD-ONS (ONLY WHEN LITE) */}
      {isLiteEligible && (
          <section>
            <h2>Add-On Services</h2>

            {ADD_ON_SERVICES.map(service => (
              <div key={service.code}>
                <h3>{service.name}</h3>

                {service.options.map(option => (
                  <label key={option.id} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={selectedAddOns.some(
                        o => o.id === option.id
                      )}
                      onChange={() =>
                        toggleAddOnOption(option)
                      }
                    />
                    {option.label} –{" "}
                    {formatCurrency(option.price)}
                  </label>
                ))}
              </div>
            ))}
          </section>
        )}

      {/* PACKAGE RECOMMENDATION */}
      {revenueResult && (
        <section>
          <h2>Package Recommendation</h2>

          <p>
            Recommended Package:{" "}
            <strong>
              {recommendation.recommendation}
            </strong>
          </p>

          <p>
            Reason: {recommendation.reason}
          </p>

          {recommendation.gapPercent !== undefined && (
            <p>
              Price Gap:{" "}
              {recommendation.gapPercent.toFixed(2)}%
            </p>
          )}

          {/* LITE */}
          {isLiteEligible && litePricing && (
            <div className="package-card">

              <h3>
                Lite Package
                {recommendation.recommendation === "LITE" &&
                  " ⭐ Recommended"}
              </h3>

              <p>Tier: {litePricing.tier}</p>

              <div className="breakdown">
                <p>
                Base Monthly Fee:
                {" "}
                {formatCurrency(litePricing.baseMonthlyFee)}
              </p>

              <p>
                Commission Rate:
                {" "}
                {(litePricing.commissionRate * 100).toFixed(2)}%
              </p>

              <p>
                Commission Fee:
                {" "}
                {formatCurrency(litePricing.commissionCost)}
              </p>

              <p>
                Add-ons:
                {" "}
                {formatCurrency(litePricing.addOnTotal)}
              </p>
              <p>
                Total Monthly Fee:
                {" "}
                {formatCurrency(litePricing.totalFee)}
              </p>
              
              <hr />

              </div>

              {litePricing.isTriggerExceeded && (
                <p style={{ color: "red" }}>
                  Add-on exceeds tier limit.
                  Recommend Full Services.
                </p>
              )}

            </div>
          )}

          {/* FULL */}
          {isFullEligible && fullPricing && (
            <section>

              <h2>Full Services Packages</h2>

              {/* ---------- TABS ---------- */}
              <div className="full-tabs">

                <button
                  className={
                    selectedFullPackage === "SMART"
                      ? "tab active"
                      : "tab"
                  }
                  onClick={() =>
                    setSelectedFullPackage("SMART")
                  }
                >
                  Smart Package (A + B) ⭐
                </button>

                <button
                  className={
                    selectedFullPackage === "FIXED"
                      ? "tab active"
                      : "tab"
                  }
                  onClick={() =>
                    setSelectedFullPackage("FIXED")
                  }
                >
                  Fixed Package (A Only)
                </button>

                <button
                  className={
                    selectedFullPackage === "PERFORMANCE"
                      ? "tab active"
                      : "tab"
                  }
                  disabled={
                    fullPricing.performancePackage < 15000
                  }
                  onClick={() =>
                    setSelectedFullPackage("PERFORMANCE")
                  }
                >
                  Performance Package (B Only)
                </button>

              </div>

              {/* ---------- SMART ---------- */}
              {selectedFullPackage === "SMART" && (
                <div className="package-box">

                  <h3>Smart Package (A + B)</h3>

                  <p>
                    A (Fixed Fee):
                    {" "}
                    {formatCurrency(fullPricing.A)}
                  </p>

                  <p>
                    B (Commission Fee):
                    {" "}
                    {formatCurrency(fullPricing.B)}
                  </p>

                  <hr />

                  <p style={{ fontWeight: "bold" }}>
                    Monthly Charge:
                    {" "}
                    {formatCurrency(fullPricing.smartPackage)}
                  </p>

                  {fullPricing.A + fullPricing.B > 60000 && (
                    <small style={{ color: "#888" }}>
                      * Price capped at 60,000 THB
                    </small>
                  )}

                </div>
              )}

              {/* ---------- FIXED ---------- */}
              {selectedFullPackage === "FIXED" && (
                <div className="package-box">

                  <h3>Fixed Package (A Only)</h3>

                  <p>
                    A (Fixed Fee):
                    {" "}
                    {formatCurrency(fullPricing.A)}
                  </p>

                  <p style={{ fontWeight: "bold" }}>
                    Monthly Charge:
                    {" "}
                    {formatCurrency(fullPricing.fixedPackage)}
                  </p>

                </div>
              )}

              {/* ---------- PERFORMANCE ---------- */}
              {selectedFullPackage === "PERFORMANCE" && (
                <div className="package-box">

                  <h3>Performance Package (B Only)</h3>

                  <p>
                    Base Commission Rate:
                    {" "}
                    {(fullPricing.adjustedCommissionRate * 100).toFixed(2)}%
                  </p>

                  <p>
                    B Only Rate:
                    {" "}
                    {(fullPricing.bOnlyRate * 100).toFixed(2)}%
                  </p>

                  <hr />

                  <p style={{ fontWeight: "bold" }}>
                    Monthly Charge:
                    {" "}
                    {formatCurrency(
                      fullPricing.performancePackage
                    )}
                  </p>

                </div>
              )}

            </section>
          )}


          {/* NOT RECOMMENDED */}
          {!isLiteEligible && !isFullEligible && (
            <p style={{ color: "red" }}>
              No suitable package can be recommended
            </p>
          )}
        </section>
      )}

    </div>
  );
}
