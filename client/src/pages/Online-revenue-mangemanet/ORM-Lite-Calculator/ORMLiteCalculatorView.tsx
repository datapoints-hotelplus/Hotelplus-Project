import { useState, useMemo } from "react";
import { useRevenueEngine } from "./hooks/useRevenueEngine";
import { useLitePricing } from "./hooks/useLitePricing";
import { useFullPricing } from "./hooks/useFullPricing";
import {formatCurrency,formatNumber,round,} from "../../../utils/number";
import type {AddOnService,AddOnOption,} from "./model/pricing.types";
import {recommendPackage,} from "./logic/recommendation/recommendPackage";
import "./orm-lite-calculator.css";
import { exportPricingPDF } from "./logic/export/exportPricingPDF";
import type { ExportPackageBlock } from "./logic/export/export.types";
import { roundUpToHundred } from "./logic/pricingUtils";


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
    input,
  });


  /* ----------- RECOMMENDATION ----------- */

  const recommendation = recommendPackage({
    revenueResult,
    litePricing,
    fullPricing,
  });

  /* ----------- ELIGIBILITY ----------- */

  const isLiteEligible = litePricing?.isEligible === true;

  const isFullEligible =
    !!fullPricing && fullPricing.tier !== "NONE";

  /* ------------ HELPERS ------------ */

  const updateField = (field: string,value: string | number) => {
    setInput((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSeason = (
    season: "highSeason" | "shoulderSeason" | "lowSeason",
    field: "months" | "adr",
    value: number
  ) => {
    setInput((prev: any) => ({
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

  /* ------------ SYSTEM COST CALCULATION ------------ */
  const getSystemCost = (roomKey: number): number => {
    if (roomKey <= 10) return 3500;
    if (roomKey <= 20) return 4000;
    if (roomKey <= 50) return 5200;
    if (roomKey <= 100) return 5400;
    return 5800;
  };

  const [showServiceInfo, setShowServiceInfo] = useState(false);

  type ExportPackage =
  | "LITE"
  | "SMART"
  | "FIXED"
  | "PERFORMANCE";

  const [selectedExports, setSelectedExports] =
    useState<ExportPackage[]>([]);
  
  const toggleExport = (pkg: ExportPackage) => {
    setSelectedExports(prev => {
      if (prev.includes(pkg)) {
        return prev.filter(p => p !== pkg);
      }
      return [...prev, pkg];
    });
  };
  const toggleSelectAll = () => {
    const all: ExportPackage[] = [];

    if (litePricing?.isEligible) all.push("LITE");
    if (fullPricing) {
      all.push("SMART", "FIXED", "PERFORMANCE");
    }

    if (selectedExports.length === all.length) {
      setSelectedExports([]);
    } else {
      setSelectedExports(all);
    }
  };



  const systemCost = getSystemCost(input.roomKey);
  /* ------------ COMMISSION RATE CALCULATION ------------ */
  const commissionData = useMemo(() => {
    if (!revenueResult) {
      return {
        baseRate: 0,
        otaAdjustment: 0,
        varianceAdjustment: 0,
        finalRate: 0,
        tier: 'NONE'
      };
    }

    const avgRevenue = revenueResult.averageRevenuePerMonth;
    
    // 1. หา Base Commission Rate จาก Tier
    let baseRate = 0;
    let tier = '';
    
    if (avgRevenue < 120000) {
      baseRate = 0;
      tier = '0';
    } else if (avgRevenue >= 120000 && avgRevenue < 200000) {
      baseRate = 0.10;
      tier = 'F2';
    } else if (avgRevenue >= 200000 && avgRevenue < 350000) {
      baseRate = 0.09;
      tier = 'F3';
    } else if (avgRevenue >= 350000 && avgRevenue < 600000) {
      baseRate = 0.08;
      tier = 'F4';
    } else if (avgRevenue >= 600000 && avgRevenue < 1000000) {
      baseRate = 0.07;
      tier = 'F5';
    } else if (avgRevenue >= 1000000 && avgRevenue < 1500000) {
      baseRate = 0.06;
      tier = 'F6';
    } else if (avgRevenue >= 1500000 && avgRevenue < 2500000) {
      baseRate = 0.05;
      tier = 'F7';
    } else if (avgRevenue >= 2500000) {
      baseRate = 0.04;
      tier = 'F8';
    }

    // 2. ปรับตามสัดส่วน OTA
    let otaAdjustment = 0;
    if (input.otaSharePercent >= 80) { // เปลี่ยนจาก > เป็น >=
      otaAdjustment = 0.01; // +1%
    } else if (input.otaSharePercent < 50) {
      otaAdjustment = -0.005; // -0.5%
    }

    // 3. ปรับตามความผันผวนของราคา (Seasonal Variance)
    let varianceAdjustment = 0;
    if (input.lowSeason.adr > 0) {
      const seasonalVariance = (input.highSeason.adr - input.lowSeason.adr) / input.lowSeason.adr;
      if (seasonalVariance >= 1.0) { // เปลี่ยนจาก > เป็น >=
        varianceAdjustment = 0.005; // +0.5%
      }
    }

    // 4. คำนวณ Final Rate และจำกัดขอบเขต 3% - 15%
    let finalRate = baseRate + otaAdjustment + varianceAdjustment;
    finalRate = Math.max(0.03, Math.min(0.15, finalRate));

    return {
      baseRate,
      otaAdjustment,
      varianceAdjustment,
      finalRate,
      tier
    };
  }, [revenueResult, input.otaSharePercent, input.highSeason.adr, input.lowSeason.adr]);

  const buildLiteExportBlock = (): ExportPackageBlock | null => {
    if (!litePricing || !litePricing.isEligible) return null;

    return {
      packageName: "Lite Package",
      rows: [
        {
          label: "Base Monthly Fee",
          value: formatCurrency(litePricing.baseMonthlyFee),
        },
        {
          label: "Commission Rate",
          value: `${(litePricing.commissionRate * 100).toFixed(2)}%`,
        },
        {
          label: "Commission Cost",
          value: formatCurrency(litePricing.commissionCost),
        },
        {
          label: "Add-on Services",
          value: formatCurrency(litePricing.addOnTotal),
        },
      ],
      totalLabel: "ค่าบริการรวม / เดือน",
      totalValue: formatCurrency(
        roundUpToHundred(litePricing.totalFee)
      ),
    };
  };

  const buildFixedExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult || !fullPricing) return null;

    const lowOtaRevenue =
      revenueResult.lowRevenuePerMonth *
      (input.otaSharePercent / 100);

    const lowB =
      lowOtaRevenue * commissionData.finalRate;

    // ---- weight & discount ----
    let weight = 1;
    let discount = 1;

    switch (commissionData.tier) {
      case "F2": weight = 0.85; discount = 0.70; break;
      case "F3": weight = 0.90; discount = 0.75; break;
      case "F4": weight = 0.95; discount = 0.80; break;
      case "F5": weight = 1;    discount = 0.83; break;
      case "F6": weight = 1;    discount = 0.85; break;
      case "F7": weight = 1;    discount = 0.87; break;
      case "F8": weight = 1;    discount = 0.90; break;
    }

    const base =
      fullPricing.A + (lowB * weight);

    const baseDiscounted =
      base * discount;

    const minValue =
      fullPricing.A + 5000;

    const fixedPrice =
      roundUpToHundred(
        Math.max(baseDiscounted, minValue)
      );

    return {
      packageName: "Fixed Package (A Only)",
      rows: [
        {
          label: "Low Season OTA Revenue",
          value: formatCurrency(lowOtaRevenue),
        },
        {
          label: "Adjusted Commission Rate",
          value: `${(commissionData.finalRate * 100).toFixed(1)}%`,
        },
        {
          label: `Base = A + (Low B × ${(weight * 100).toFixed(0)}%)`,
          value: formatCurrency(base),
        },
        {
          label: "Fixed Rate",
          value: formatCurrency(fixedPrice),
        },
        {
          label: "Setup Fee (C) - จ่ายครั้งแรก",
          value: formatCurrency(systemCost),
        },
      ],
      totalLabel: "ค่าบริการเหมาจ่าย / เดือน",
      totalValue: formatCurrency(fixedPrice),
    };
  };

  const buildPerformanceExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult) return null;

    const bOnlyRate = commissionData.finalRate + 0.02;

    const otaRevenue =
      revenueResult.otaRevenuePerMonth;

    const baseBOnly =
      otaRevenue * bOnlyRate;

    const plusFee = 5000;
    const minCharge = 8000;

    // ราคาก่อนปัด
    const raw =
      baseBOnly + plusFee;

    // กันขั้นต่ำ
    const withMin =
      Math.max(raw, minCharge);

    // ✅ ปัดขึ้นหลักร้อย
    const bOnlyAmount =
      roundUpToHundred(withMin);

    return {
      packageName: "Performance Package (B Only)",
      rows: [
        {
          label: "OTA Revenue / Month",
          value: formatCurrency(otaRevenue),
        },
        {
          label: "B Only Rate",
          value: `${(bOnlyRate * 100).toFixed(2)}%`,
        },
        {
          label: "B Only = OTA Revenue × Rate",
          value: formatCurrency(baseBOnly),
        },
        {
          label: "+ Service Fee",
          value: formatCurrency(plusFee),
        },
        {
          label: "Minimum Charge",
          value: formatCurrency(minCharge),
        },
      ],
      totalLabel: "ค่าบริการ / เดือน",
      totalValue: formatCurrency(bOnlyAmount),
    };
  };

  const buildSmartExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult || !fullPricing) return null;

    /* ---------- A PART (USE FROM FULL PRICING) ---------- */

    const systemCost = fullPricing.systemCost;
    const multiplier = fullPricing.aMultiplier;
    const A = fullPricing.A;

    /* ---------- B PART ---------- */

    const otaRevenue = revenueResult.otaRevenuePerMonth;
    const tier = commissionData.tier;
    const baseRate = commissionData.baseRate;
    const otaShare = input.otaSharePercent;
    const adjustedRate = commissionData.finalRate;

    const rawB = otaRevenue * adjustedRate;

    /* ---------- TOTAL ---------- */

    const rawTotal = A + rawB;
    const cappedTotal = Math.min(rawTotal, 60000);
    const finalTotal = roundUpToHundred(cappedTotal);

    return {
      packageName: "Smart Package (A + B)",

      rows: [
        /* ===== A BREAKDOWN ===== */

        {
          label: `A = System Cost × ${multiplier.toFixed(2)}`,
          value: formatCurrency(A),
        },
        {
          label: `System Cost (${input.roomKey} ห้อง)`,
          value: formatCurrency(systemCost),
        },
        {
          label: "A Multiplier (ตัวคูณ)",
          value: `${multiplier.toFixed(2)}x`,
        },
        {
          label: "ค่าบริการระบบ (A)",
          value: formatCurrency(A),
        },

        /* ===== B BREAKDOWN ===== */

        {
          label: "Tier (จากรายได้เฉลี่ย)",
          value: tier,
        },
        {
          label: "Base Commission Rate",
          value: `${(baseRate * 100).toFixed(1)}%`,
        },
        {
          label: "OTA Share",
          value: `${otaShare}%`,
        },
        {
          label: "Adjusted Commission Rate",
          value: `${(adjustedRate * 100).toFixed(1)}%`,
        },
        {
          label: "B = รายได้ OTA × Rate",
          value: formatCurrency(rawB),
        },
      ],

      totalLabel: "ค่าบริการรวม / เดือน",
      totalValue: formatCurrency(finalTotal),
    };
  };
  return (
    <div className="orm-lite-calculator">
      {/* BASIC INFO */}
        <section>
          <div className="section-header">
            <h2>🏨ข้อมูลพื้นฐาน</h2>
            <button
              type="button"
              className="info-btn"
              onClick={() => setShowServiceInfo(true)}>ตารางเปรียบเทียบบริการ
            </button>
          </div>
          <div className="basic-info-grid">
            <label>
              <span>ชื่อโรงแรม <span className="required">*</span></span>
              <input
                type="text"
                value={input.hotelName || ""}
                onChange={e => updateField("hotelName", e.target.value)}
                placeholder="กรอกชื่อโรงแรม"
              />
            </label>
            <label>
              <span>จำนวนห้องพัก <span className="required">*</span></span>
              <input
                type="number"
                value={input.roomKey || ""}
                onChange={e => updateField("roomKey", Number(e.target.value))}
                placeholder="กรอกจำนวนห้องพัก"
              />
            </label>
            <label>
              อัตราการเข้าพัก (%)
              <input
                type="number"
                value={input.occupancyPercent || ""}
                onChange={e => updateField("occupancyPercent", Number(e.target.value))}
                placeholder="กรอกอัตราการเข้าพัก (%)"
              />
            </label>
            <label>
              <span>สัดส่วนการขายผ่าน OTA (%) <span className="required">*</span></span>
              <input
                type="number"
                value={input.otaSharePercent || ""}
                onChange={e => updateField("otaSharePercent", Number(e.target.value))}
                placeholder="กรอกสัดส่วนการขายผ่าน OTA (%)"
              />
            </label>
          </div>
        </section>

      {/* SEASONS */}
      <section>
        <h2>ข้อมูลตามฤดูกาล</h2>
        <div className="seasons-grid">
          {/* HIGH SEASON */}
          <div className="season-card high">
            <h3>High Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input
                type="number"
                value={input.highSeason.months}
                onChange={e =>
                  updateSeason(
                    "highSeason",
                    "months",
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input
                type="number"
                value={input.highSeason.adr}
                onChange={e =>
                  updateSeason(
                    "highSeason",
                    "adr",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
          {/* SHOULDER SEASON */}
          <div className="season-card shoulder">
            <h3>Shoulder Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input
                type="number"
                value={input.shoulderSeason.months}
                onChange={e =>
                  updateSeason(
                    "shoulderSeason",
                    "months",
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input
                type="number"
                value={input.shoulderSeason.adr}
                onChange={e =>
                  updateSeason(
                    "shoulderSeason",
                    "adr",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
          {/* LOW SEASON */}
          <div className="season-card low">
            <h3>Low Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input
                type="number"
                value={input.lowSeason.months}
                onChange={e =>
                  updateSeason(
                    "lowSeason",
                    "months",
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input
                type="number"
                value={input.lowSeason.adr}
                onChange={e =>
                  updateSeason(
                    "lowSeason",
                    "adr",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <button className="btn-calculate" onClick={calculateRevenue}>
            คำนวณผลลัพธ์
          </button>
          <button
            className="btn-reset"
            onClick={() => {
              resetRevenue();
              setSelectedAddOns([]);
            }}
          >
            รีเซ็ต
          </button>
        </div>
      </section>

      {/* ERRORS */}
      {revenueErrors.length > 0 && (
        <div className="errors-section">
          <h3>ข้อผิดพลาด</h3>
          <ul>
            {revenueErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* RESULT */}
      {revenueResult && (
        <section className="results-section">
          <h2>ผลลัพธ์ (ประมาณการ)</h2>
          <small>
            * รายได้คำนวณจากจำนวน 30 วันต่อเดือน
          </small>

          <div className="results-grid">
            <div className="result-item">
              <strong>จำนวนห้องพักที่มีจำหน่าย</strong>
              <div className="value">
                {formatNumber(round(revenueResult.roomAvailable ?? 0, 0))} ห้อง
              </div>
            </div>

            <div className="result-item">
              <strong>รายได้เฉลี่ย / เดือน</strong>
              <div className="value">
                {formatCurrency(revenueResult.averageRevenuePerMonth)}
              </div>
            </div>

            <div className="result-item">
              <strong>รายได้ High Season / เดือน</strong>
              <div className="value">
                {formatCurrency(revenueResult.highRevenuePerMonth)}
              </div>
            </div>

            <div className="result-item">
              <strong>รายได้ Shoulder Season / เดือน</strong>
              <div className="value">
                {formatCurrency(revenueResult.shoulderRevenuePerMonth)}
              </div>
            </div>

            <div className="result-item">
              <strong>รายได้ Low Season / เดือน</strong>
              <div className="value">
                {formatCurrency(revenueResult.lowRevenuePerMonth)}
              </div>
            </div>

            <div className="result-item">
              <strong>รายได้จาก OTA / เดือน</strong>
              <div className="value">
                {formatCurrency(revenueResult.otaRevenuePerMonth)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ADD-ONS (ONLY WHEN LITE) */}
      {isLiteEligible && (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2>บริการเสริม (Add-On Services)</h2>
            </div>

            {ADD_ON_SERVICES.map(service => (
              <div key={service.code} className="addon-service">
                <h3>{service.name}</h3>

                {service.options.map(option => (
                  <div key={option.id} className="addon-option">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={selectedAddOns.some(
                        o => o.id === option.id
                      )}
                      onChange={() =>
                        toggleAddOnOption(option)
                      }
                    />
                    <label htmlFor={option.id}>
                      {option.label} – {formatCurrency(option.price)}
                    </label>
                  </div>
                ))}
              </div>
            ))}

            {/* CHECK ADD-ON TOTAL */}
            {(() => {
              const addOnTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
              
              if (addOnTotal > 4000) {
                return (
                  <div className="info-box warning" style={{ background: '#fee2e2', borderLeftColor: '#dc2626', marginTop: '16px' }}>
                    <span className="info-icon">⚠️</span>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#991b1b' }}>บริการเสริมเกินจำนวนที่กำหนด</p>
                      <p style={{ color: '#991b1b' }}>ยอดรวมบริการเสริม: {formatCurrency(addOnTotal)} บาท (เกิน 4,000 บาท)</p>
                      <p style={{ color: '#991b1b' }}>แนะนำให้เลือก Full Services</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </section>
        )}

      {/* PACKAGE RECOMMENDATION */}
      {revenueResult && (
        <section>
          <div className="recommend-summary">
            <span className="recommend-label">
              ⭐ แพ็คเกจที่ระบบแนะนำ
            </span>

            <span className="recommend-badge">
              {recommendation.recommendation}
            </span>

            <p className="recommend-reason">
              {recommendation.reason}
            </p>

            {(recommendation as any).gapPercent !== undefined && (
              <p className="recommend-gap">
                ส่วนต่างราคา {(recommendation as any).gapPercent.toFixed(2)}%
              </p>
            )}
          </div>

          {/* LITE */}
          {isLiteEligible && litePricing && (
            <div className="package-card">

              <h3>
                Lite Package
                {recommendation.recommendation === "LITE" &&
                  " ⭐ แนะนำ"}
              </h3>

              <p>ระดับ: {litePricing.tier}</p>

              <div className="breakdown">
                <p>
                  <span>ค่าบริการรายเดือนพื้นฐาน:</span>
                  <span>{formatCurrency(litePricing.baseMonthlyFee)}</span>
                </p>

                <p>
                  <span>อัตราค่าคอมมิชชั่น:</span>
                  <span>{(litePricing.commissionRate * 100).toFixed(2)}%</span>
                </p>

                <p>
                  <span>ค่าคอมมิชชั่น:</span>
                  <span>{formatCurrency(litePricing.commissionCost)}</span>
                </p>

                <p>
                  <span>บริการเสริม:</span>
                  <span>{formatCurrency(litePricing.addOnTotal)}</span>
                </p>

                <hr />

                <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                  <span>รวมค่าบริการรายเดือน:</span>
                  <span>
                    {formatCurrency(
                      roundUpToHundred(litePricing.totalFee)
                    )}
                  </span>
                </p>
              </div>

              {litePricing.isTriggerExceeded && (
                <p style={{ color: "#e53e3e", marginTop: "12px" }}>
                  บริการเสริมเกินจำนวนที่กำหนด
                  แนะนำให้เลือก Full Services
                </p>
              )}

            </div>
          )}

          {/* FULL */}
          {isFullEligible && fullPricing && (
            <section>

              <h2>แพ็คเกจ Full Services</h2>

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

                  <div className="package-header">
                    <h3>🍊 แพคเกจมาตรฐาน (A + B)</h3>
                    <span className="recommended-badge">แนะนำ</span>
                  </div>
                  <div className="price-highlight">
                    {revenueResult &&
                      formatCurrency(
                        roundUpToHundred(
                          Math.min(
                            fullPricing.A +
                              (revenueResult.otaRevenuePerMonth *
                                commissionData.finalRate),
                            60000
                          )
                        )
                      )
                    } บาท/เดือน
                  </div>
                  <div className="package-breakdown">
                    <div className="breakdown-row">
                      <span>ค่าบริการระบบ (A)</span>
                      <span className="amount">{formatCurrency(fullPricing.A)} บาท</span>
                    </div>

                    <div className="breakdown-row">
                      <span>ค่าคอมมิชชั่นเฉลี่ย (B)</span>
                      <span className="amount">
                        {revenueResult && formatCurrency(revenueResult.otaRevenuePerMonth * commissionData.finalRate)} บาท
                      </span>
                    </div>
                  </div>

                  {/* SEASONAL PRICING BREAKDOWN */}
                  <div className="seasonal-breakdown">
                    <h4>🔥 ค่าบริการตามฤดูกาล</h4>
                    
                    {revenueResult && (
                      <>
                        {(() => {
                          // Calculate OTA Revenue for each season
                          const highOtaRevenue = revenueResult.highRevenuePerMonth * (input.otaSharePercent / 100);
                          const shoulderOtaRevenue = revenueResult.shoulderRevenuePerMonth * (input.otaSharePercent / 100);
                          const lowOtaRevenue = revenueResult.lowRevenuePerMonth * (input.otaSharePercent / 100);
                          
                          // Use the calculated commission rate
                          const commissionRate = commissionData.finalRate;
                          
                          // Calculate seasonal pricing
                          const highSeasonPrice = Math.min(
                            fullPricing.A + (highOtaRevenue * commissionRate),
                            60000
                          );
                          const shoulderSeasonPrice = Math.min(
                            fullPricing.A + (shoulderOtaRevenue * commissionRate),
                            60000
                          );
                          const lowSeasonPrice = Math.min(
                            fullPricing.A + (lowOtaRevenue * commissionRate),
                            60000
                          );
                          
                          return (
                            <>
                              <div className="season-revenue-item">
                                <span className="season-icon">🔥</span>
                                <span>High Season ({input.highSeason.months} เดือน)</span>
                                <span className="amount">
                                  {formatCurrency(highSeasonPrice)} บาท
                                </span>
                              </div>

                              <div className="season-revenue-item">
                                <span className="season-icon">🍂</span>
                                <span>Shoulder Season ({input.shoulderSeason.months} เดือน)</span>
                                <span className="amount">
                                  {formatCurrency(shoulderSeasonPrice)} บาท
                                </span>
                              </div>

                              <div className="season-revenue-item">
                                <span className="season-icon">❄️</span>
                                <span>Low Season ({input.lowSeason.months} เดือน)</span>
                                <span className="amount">
                                  {formatCurrency(lowSeasonPrice)} บาท
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  {/* CALCULATION DETAILS */}
                  <div className="calculation-details">
                    <h4>📊 รายละเอียดการคำนวณ</h4>
                    
                    <div className="detail-row">
                      <span>System Cost ({input.roomKey} ห้อง)</span>
                      <span className="amount">{formatCurrency(systemCost)} บาท</span>
                    </div>

                    <div className="detail-row">
                      <span className="amount">
                        {fullPricing.aMultiplier.toFixed(2)}x
                      </span>
                    </div>

                    <div className="detail-row" style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '4px' }}>
                      <span>
                        <strong>
                          A = System Cost × {fullPricing.aMultiplier.toFixed(2)}
                        </strong>
                      </span>
                      <span className="amount"><strong>{formatCurrency(fullPricing.A)} บาท</strong></span>
                    </div>

                    <div className="detail-row" style={{ marginTop: '12px' }}>
                      <span>รายได้ OTA เฉลี่ย/เดือน</span>
                      <span className="amount">{revenueResult && formatCurrency(revenueResult.otaRevenuePerMonth)} บาท</span>
                    </div>

                    {/* Commission Rate Calculation */}
                    <div className="detail-row" style={{ marginTop: '12px', background: '#fef3c7', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>การคำนวณ Commission Rate:</span>
                    </div>

                    <div className="detail-row">
                      <span>รายได้เฉลี่ย/เดือน</span>
                      <span className="amount">
                        {revenueResult && formatCurrency(revenueResult.averageRevenuePerMonth)} บาท
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>Tier (จากรายได้เฉลี่ย)</span>
                      <span className="amount">{commissionData.tier}</span>
                    </div>

                    <div className="detail-row">
                      <span>Base Commission Rate</span>
                      <span className="amount">{(commissionData.baseRate * 100).toFixed(1)}%</span>
                    </div>

                    <div className="detail-row">
                      <span>OTA Share</span>
                      <span className="amount">{input.otaSharePercent}%</span>
                    </div>

                    <div className="detail-row">
                      <span>ปรับตาม OTA Share ({input.otaSharePercent}%)
                        {input.otaSharePercent >= 80 && ' (≥80% ✓)'}
                        {input.otaSharePercent < 50 && ' (<50%)'}
                      </span>
                      <span className="amount" style={{ color: commissionData.otaAdjustment > 0 ? '#059669' : commissionData.otaAdjustment < 0 ? '#dc2626' : '#6b7280' }}>
                        {commissionData.otaAdjustment > 0 ? '+' : ''}{(commissionData.otaAdjustment * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>Seasonal Variance
                        {(() => {
                          if (input.lowSeason.adr > 0) {
                            const variance = (input.highSeason.adr - input.lowSeason.adr) / input.lowSeason.adr;
                            return ` (${variance.toFixed(2)}${variance >= 1.0 ? ' ≥1.0 ✓' : ''})`;
                          }
                          return '';
                        })()}
                      </span>
                      <span className="amount">{input.lowSeason.adr > 0 ? ((input.highSeason.adr - input.lowSeason.adr) / input.lowSeason.adr).toFixed(2) : 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                      <span>ปรับตาม Seasonal Variance
                        {(() => {
                          if (input.lowSeason.adr > 0) {
                            const variance = (input.highSeason.adr - input.lowSeason.adr) / input.lowSeason.adr;
                            return variance >= 1.0 ? ' (≥1.0 ✓)' : ' (<1.0)';
                          }
                          return '';
                        })()}
                      </span>
                      <span className="amount" style={{ color: commissionData.varianceAdjustment > 0 ? '#059669' : '#6b7280' }}>
                        {commissionData.varianceAdjustment > 0 ? '+' : ''}{(commissionData.varianceAdjustment * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="detail-row" style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '4px' }}>
                      <span><strong>Adjusted Commission Rate (จำกัด 3%-15%)</strong></span>
                      <span className="amount"><strong>{(commissionData.finalRate * 100).toFixed(1)}%</strong></span>
                    </div>

                    <div className="detail-row" style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '4px' }}>
                      <span><strong>B = รายได้ OTA × Rate</strong></span>
                      <span className="amount">
                        <strong>
                          {revenueResult && formatCurrency(revenueResult.otaRevenuePerMonth * commissionData.finalRate)} บาท
                        </strong>
                      </span>
                    </div>

                    <div className="detail-row" style={{ fontSize: '11px', color: '#6b7280', borderTop: '1px dashed #d1d5db', paddingTop: '8px', marginTop: '8px' }}>
                      <span style={{ fontStyle: 'italic' }}>
                        * System Cost: ≤10=3,500 | 11-20=4,000 | 21-50=5,200 | 51-100=5,400 | &gt;100=5,800
                      </span>
                    </div>
                  </div>

                  {fullPricing.A + fullPricing.B > 60000 && (
                    <div className="info-note">
                      * ราคาสูงสุดไม่เกิน 60,000 บาท
                    </div>
                  )}

                </div>
              )}

              {/* ---------- FIXED ---------- */}
              {selectedFullPackage === "FIXED" && (
                <div className="package-box">

                  <div className="package-header">
                    <h3>💎 แพคเกจเหมาจ่าย (A Only)</h3>
                    <span className="status-badge stable">ค่าบริการคงที่</span>
                  </div>

                  {(() => {
                    if (!revenueResult) return null;

                    const lowOtaRevenue = revenueResult.lowRevenuePerMonth * (input.otaSharePercent / 100);
                    const lowB = lowOtaRevenue * commissionData.finalRate;
                    let weight = 1;
                    let discount = 1;
                    
                    switch(commissionData.tier) {
                      case 'F2':
                        weight = 0.85;
                        discount = 0.70;
                        break;
                      case 'F3':
                        weight = 0.90;
                        discount = 0.75;
                        break;
                      case 'F4':
                        weight = 0.95;
                        discount = 0.80;
                        break;
                      case 'F5':
                        weight = 1;
                        discount = 0.83;
                        break;
                      case 'F6':
                        weight = 1;
                        discount = 0.85;
                        break;
                      case 'F7':
                        weight = 1;
                        discount = 0.87;
                        break;
                      case 'F8':
                        weight = 1;
                        discount = 0.90;
                        break;
                    }
                    
                    const base = fullPricing.A + (lowB * weight);
                    const baseDiscounted = base * discount;
                    const minValue = fullPricing.A + 5000;
                    const rawFixed = Math.max(baseDiscounted, minValue);
                    
                    // ปัดขึ้นหลักสิบ
                    const fixedPrice = roundUpToHundred(rawFixed);

                    return (
                      <>
                        <div className="price-highlight">
                          {formatCurrency(
                            roundUpToHundred(fixedPrice)
                          )} บาท/เดือน
                        </div>

                        <div className="info-box">
                          <span className="info-icon">💡</span>
                          <div>
                            <p>เหมาะสำหรับโรงแรมที่ต้องการความมั่นคงไม่เสี่ยงกับยอดขาย OTA</p>
                            <p>ค่าบริการคงที่ ไม่ขึ้นกับรายได้โรงแรม</p>
                          </div>
                        </div>

                        {/* CALCULATION FORMULA - SIMPLIFIED */}
                        <div className="calculation-details">
                          <h4>📊 สูตรการคำนวณ (Tier: {commissionData.tier})</h4>
                          
                          <div className="detail-row">
                            <span>Low Season OTA Revenue</span>
                            <span className="amount">{formatCurrency(lowOtaRevenue)} บาท</span>
                          </div>

                          <div className="detail-row">
                            <span>Adjusted Commission Rate</span>
                            <span className="amount">{(commissionData.finalRate * 100).toFixed(1)}%</span>
                          </div>
                          
                          <div className="detail-row" style={{ marginTop: '8px' }}>
                            <span><strong>Base = A + (Low B × {(weight * 100).toFixed(0)}%)</strong></span>
                            <span className="amount"><strong>{formatCurrency(base)} บาท</strong></span>
                          </div>
                          
                          <div className="detail-row" style={{ borderTop: '2px solid #059669', paddingTop: '10px', marginTop: '10px', background: '#f0fdf4', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Fixed Rate</span>
                            <span className="amount" style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>
                              {formatCurrency(fixedPrice)} บาท
                            </span>
                          </div>
                        </div>

                        {/* SETUP FEE */}
                        <div className="calculation-details" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
                          <h4>💰 ค่าใช้จ่ายเริ่มต้น</h4>
                          
                          <div className="detail-row">
                            <span>Setup Fee (C) - จ่ายครั้งแรก</span>
                            <span className="amount">{formatCurrency(systemCost)} บาท</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                </div>
              )}

              {/* ---------- PERFORMANCE ---------- */}
              {selectedFullPackage === "PERFORMANCE" && (
                <div className="package-box">

                  <div className="package-header">
                    <h3>🎯 แพคเกจคอมมิชชั่นเท่านั้น (B Only)</h3>
                    <span className="status-badge performance">ประสิทธิภาพสูง</span>
                  </div>

                  {(() => {
                    // คำนวณ B Only Rate และ B Only
                    const bOnlyRate = commissionData.finalRate + 0.02; // เพิ่ม 2%
                    const bOnlyBase = revenueResult ? revenueResult.otaRevenuePerMonth * bOnlyRate : 0;
                    const bOnlyAmount = bOnlyBase + 5000; // บวก 5,000
                    const minCharge = 8000; // ค่าบริการขั้นต่ำ 8,000 บาท
                    
                    return (
                      <>
                        <div className="price-highlight">
                          {formatCurrency(
                            roundUpToHundred(
                              Math.max(bOnlyAmount, minCharge)
                            )
                          )} บาท/เดือน
                        </div>

                        {/* CHECK ELIGIBILITY */}
                        {bOnlyAmount < 15000 && (
                          <div className="info-box warning" style={{ background: '#fee2e2', borderLeftColor: '#dc2626' }}>
                            <span className="info-icon">⚠️</span>
                            <div>
                              <p style={{ fontWeight: 'bold', color: '#991b1b' }}>แพคเกจนี้ไม่สามารถใช้งานได้</p>
                              <p style={{ color: '#991b1b' }}>เงื่อนไข: B Only ต้อง ≥ 15,000 บาท</p>
                              <p style={{ color: '#991b1b' }}>ปัจจุบัน: {formatCurrency(bOnlyAmount)} บาท</p>
                            </div>
                          </div>
                        )}

                        {/* CALCULATION DETAILS - SIMPLIFIED */}
                        <div className="calculation-details">
                          <h4>📊 รายละเอียดการคำนวณ</h4>

                          {revenueResult && (
                            <>
                              <div className="detail-row">
                                <span>รายได้ OTA เฉลี่ย/เดือน</span>
                                <span className="amount">{formatCurrency(revenueResult.otaRevenuePerMonth)} บาท</span>
                              </div>

                              <div className="detail-row" style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '8px' }}>
                                <span><strong>B Only Rate</strong></span>
                                <span className="amount"><strong>{(bOnlyRate * 100).toFixed(2)}%</strong></span>
                              </div>

                              <div className="detail-row" style={{ borderTop: '2px solid #8b5cf6', paddingTop: '10px', marginTop: '10px', background: '#faf5ff', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>B Only = รายได้ OTA × B Only Rate</span>
                                <span className="amount" style={{ fontWeight: 'bold', color: '#8b5cf6', fontSize: '16px' }}>
                                  {formatCurrency(bOnlyAmount)} บาท
                                </span>
                              </div>

                              {bOnlyAmount < minCharge && (
                                <div className="detail-row" style={{ marginTop: '8px', color: '#dc2626' }}>
                                  <span>ค่าบริการขั้นต่ำ</span>
                                  <span className="amount" style={{ color: '#dc2626' }}>{formatCurrency(minCharge)} บาท</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="info-box">
                          <span className="info-icon">⚡</span>
                          <div>
                            <p><strong>เงื่อนไขการใช้งาน:</strong></p>
                            <p>✓ เหมาะสำหรับโรงแรมที่บริหารจัดการได้เองในยอดขาย OTA</p>
                            <p>✓ ใช้ได้เฉพาะโรงแรมที่ไม่ใช่ "รายได้ต่ำ"</p>
                            <p>✓ B Only ต้อง ≥ 15,000 บาท</p>
                          </div>
                        </div>

                        {/* SEASONAL BREAKDOWN */}
                        {revenueResult && (
                          <div className="seasonal-breakdown">
                            <h4>🔥 ค่าบริการตามฤดูกาล</h4>
                            
                            <div className="season-revenue-item">
                              <span className="season-icon">🔥</span>
                              <span>High Season ({input.highSeason.months} เดือน)</span>
                              <span className="amount">
                                {formatCurrency(
                                  Math.max(
                                    ((revenueResult.highRevenuePerMonth * (input.otaSharePercent / 100)) * bOnlyRate) + 5000,
                                    minCharge
                                  )
                                )} บาท
                              </span>
                            </div>

                            <div className="season-revenue-item">
                              <span className="season-icon">🍂</span>
                              <span>Shoulder Season ({input.shoulderSeason.months} เดือน)</span>
                              <span className="amount">
                                {formatCurrency(
                                  Math.max(
                                    ((revenueResult.shoulderRevenuePerMonth * (input.otaSharePercent / 100)) * bOnlyRate) + 5000,
                                    minCharge
                                  )
                                )} บาท
                              </span>
                            </div>

                            <div className="season-revenue-item">
                              <span className="season-icon">❄️</span>
                              <span>Low Season ({input.lowSeason.months} เดือน)</span>
                              <span className="amount">
                                {formatCurrency(
                                  Math.max(
                                    ((revenueResult.lowRevenuePerMonth * (input.otaSharePercent / 100)) * bOnlyRate) + 5000,
                                    minCharge
                                  )
                                )} บาท
                              </span>
                            </div>
                          </div>
                        )}

                        {/* PAYMENT TERMS */}
                        <div className="calculation-details" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
                          <h4>💰 เงื่อนไขการเรียกเก็บค่าบริการ</h4>
                          
                          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0', color: '#78350f' }}>
                            บริษัทฯ จะเรียกเก็บค่าบริการจากยอดการจองที่เกิดขึ้นจริงในแต่ละเดือน หรือค่าบริการขั้นต่ำจำนวน <strong>8,000 บาท</strong> (แปดพันบาทถ้วน) ต่อเดือน 
                            ทั้งนี้ บริษัทฯ จะเรียกเก็บค่าบริการตามจำนวนที่มีมูลค่าสูงกว่า
                          </p>
                        </div>

                        {bOnlyAmount < 15000 && (
                          <div className="info-note" style={{ color: '#dc2626' }}>
                            ⚠️ แพคเกจนี้ต้องมีค่าบริการขั้นต่ำ 15,000 บาท
                          </div>
                        )}
                      </>
                    );
                  })()}

                </div>
              )}

            </section>
          )}

          <button
            disabled={selectedExports.length === 0}
            onClick={() => {
              const blocks: ExportPackageBlock[] = [];
                if (selectedExports.includes("LITE")) {
                  const lite = buildLiteExportBlock();
                  if (lite) blocks.push(lite);
                }

                if (selectedExports.includes("FIXED")) {
                  const fixed = buildFixedExportBlock();
                  if (fixed) blocks.push(fixed);
                }

                if (selectedExports.includes("PERFORMANCE")) {
                  const performance = buildPerformanceExportBlock();
                  if (performance) blocks.push(performance);
                }

                if (selectedExports.includes("SMART")) {
                  const smart = buildSmartExportBlock();
                  if (smart) blocks.push(smart);
                }


                if (blocks.length === 0) return;

                exportPricingPDF({
                  hotelName: input.hotelName,
                  packages: blocks,
                });

            }}
          >
            Export PDF
          </button>

          <section className="export-section">
            <h3>เลือกแพ็คเกจสำหรับ Export PDF</h3>

            <label>
              <input
                type="checkbox"
                checked={selectedExports.length === 4}
                onChange={toggleSelectAll}
              />
              Select All
            </label>

            {litePricing?.isEligible && (
              <label>
                <input
                  type="checkbox"
                  checked={selectedExports.includes("LITE")}
                  onChange={() => toggleExport("LITE")}
                />
                Lite Package
              </label>
            )}

            <label>
              <input
                type="checkbox"
                checked={selectedExports.includes("SMART")}
                onChange={() => toggleExport("SMART")}
              />
              Smart Package (A+B)
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedExports.includes("FIXED")}
                onChange={() => toggleExport("FIXED")}
              />
              Fixed Package (A Only)
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedExports.includes("PERFORMANCE")}
                onChange={() => toggleExport("PERFORMANCE")}
              />
              Performance Package (B Only)
            </label>
          </section>
          {/* NOT RECOMMENDED */}
          {!isLiteEligible && !isFullEligible && (
            <p style={{ color: "#e53e3e", textAlign: "center" }}>
              ไม่สามารถแนะนำแพ็คเกจที่เหมาะสมได้
            </p>
          )}
        </section>
      )}

      {showServiceInfo && (
        <div className="modal-overlay" onClick={() => setShowServiceInfo(false)}>

          <div className="modal-box"onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>เปรียบเทียบบริการ Lite vs Full Services</h3>
              <button onClick={() => setShowServiceInfo(false)}>
                ✖
              </button>
            </div>

            <table className="service-table">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>
                    Lite <span className="badge-lite">Basic</span>
                  </th>
                  <th>
                    Full Services <span className="badge-full">All Inclusive</span>
                  </th>
                </tr>
              </thead>
              
              <tbody>
                <tr>
                  <td>Shop Rate Monitoring</td>
                  <td>One-time / 1,500</td>
                  <td>Daily / 8,000</td>
                </tr>

                <tr>
                  <td>Compset Survey</td>
                  <td>One-time / 2,000</td>
                  <td>Daily / 10,000</td>
                </tr>

                <tr>
                  <td>Visibility Management</td>
                  <td>One-time / 2,000</td>
                  <td>Daily / 15,000</td>
                </tr>

                <tr>
                  <td>OTA Channel Management</td>
                  <td>800 / OTA / Month</td>
                  <td>6–8 OTA + Expansion (รวมฟรี)</td>
                </tr>

                <tr>
                  <td>Reservation Management</td>
                  <td>Monthly / 4,500</td>
                  <td>Daily (รวมฟรี)</td>
                </tr>

                <tr>
                  <td>H+ Specialist</td>
                  <td>Centralize</td>
                  <td>Personal Specialist</td>
                </tr>

                <tr>
                  <td>Benefits อื่น ๆ</td>
                  <td>-</td>
                  <td>
                    • Special Activities  
                    • Monthly Meeting  
                    • H+ Performance Dashboard  
                    • OTA Market Insight
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      )}

    </div>
  );
}