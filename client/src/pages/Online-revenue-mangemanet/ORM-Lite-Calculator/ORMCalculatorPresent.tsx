import { useMemo } from "react";
import { useAuth } from "../../../AuthProvider";
import { useRevenueEngine } from "./hooks/useRevenueEngine";
import { useLitePricing } from "./hooks/useLitePricing";
import { useFullPricing } from "./hooks/useFullPricing";
import { formatCurrency } from "../../../utils/number";
import { recommendPackage } from "./logic/recommendation/recommendPackage";
import "./orm-Presentation.css";
import { exportPricingPDF } from "./logic/export/exportPricingPDF";
import type { ExportPackageBlock } from "./logic/export/export.types";
import { roundUpToHundred } from "./logic/pricingUtils";
import { useCalculatorStore, OTA_LIST } from "./store/useCalculatorStore";
import type { ExportPackage } from "./store/useCalculatorStore";
import { getForcedAddOns } from "./logic/forcedAddOns";

/* ----------- CONSTANTS ----------- */

const ADD_ON_SERVICES = [
  {
    code: "SHOP_RATE_MONITORING",
    name: "Shop Rate Monitoring",
    description: "การตรวจสอบและปรับเทียบราคาห้องพักให้สอดคล้องกับตลาด",
    unitPrice: 1500,
  },
  {
    code: "COMPSET_SURVEY",
    name: "Compset Survey",
    description: "การสำรวจ วิเคราะห์โรงแรมคู่แข่งในกลุ่ม เพื่อประเมินตำแหน่งทางการตลาด",
    unitPrice: 2000,
  },
  {
    code: "VISIBILITY_MANAGEMENT",
    name: "Visibility Management",
    description: "การบริหารการมองเห็นของโรงแรมบน OTAs เพื่อเพิ่มโอกาสการจอง",
    unitPrice: 2000,
  },
  {
    code: "EXTRA_OTA",
    name: "Extra OTA Channel",
    description: "การเพิ่มช่องทางการขายบน OTAs เพื่อเพิ่มการเข้าถึงและรายได้",
    unitPrice: 800,
  },
  {
    code: "RESERVATION_MANAGEMENT",
    name: "Reservation Management",
    description: "การบริหารจัดการการจองห้องพัก",
    unitPrice: 4500,
  },
];

/* ----------- COMPONENT ----------- */

export default function ORMLiteCalculatorView() {
  const { session } = useAuth();
  const username = session?.user?.email ?? "Unknown";

  /* ----------- STORE ----------- */
  const {
    selectedAddOns, toggleAddOnOption,
    selectedAddOnQty, setAddOnQty,
    selectedExports, toggleExport, toggleSelectAll,
    showServiceInfo, setShowServiceInfo,
    reset,
    hasExistingOTA, selectedOTAs,
    setHasExistingOTA, toggleOTA,
  } = useCalculatorStore();

  /* ----------- REVENUE ----------- */
  const {
    input,
    setInput,
    revenueResult,
    revenueErrors,
    calculateRevenue,
    resetRevenue,
  } = useRevenueEngine();

  /* ----------- PRICING ----------- */
  const { litePricing } = useLitePricing({ revenueResult, selectedAddOns, selectedAddOnQty });
  const { fullPricing } = useFullPricing({ revenueResult, input });

  /* ----------- ELIGIBILITY ----------- */
  const isLiteEligible = litePricing?.isEligible === true;
  const isFullEligible = !!fullPricing && fullPricing.tier !== "NONE";

  /* ----------- FORCED ADD-ONS ----------- */
  const { revplus, registerOTA } = getForcedAddOns({
    isLiteEligible,
    isFullEligible,
    hasExistingOTA,
    selectedOTAs,
  });

  const ADD_ON_ONE_TIME = [
    {
      id: "REVPLUS",
      label: "Revplus+",
      description: "บริการวิเคราะห์ผลการดำเนินงานของโรงแรม เพื่อปรับกลยุทธ์ด้านราคาให้มีประสิทธิภาพ",
      price: 3500,
      forced: revplus,
    },
    {
      id: "REGISTER_OTA",
      label: "Register OTAs",
      description: "บริการลงทะเบียนที่พักบนแพลตฟอร์มออนไลน์ (OTAs) ต่างๆ",
      price: 3500,
      forced: registerOTA,
    },
  ];

  /* ----------- STEPPER SUMMARY ----------- */
  const stepperSummary = ADD_ON_SERVICES
    .map(s => ({
      code: s.code,
      name: s.name,
      qty: selectedAddOnQty[s.code] ?? 0,
      unitPrice: s.unitPrice,
      total: (selectedAddOnQty[s.code] ?? 0) * s.unitPrice,
    }))
    .filter(s => s.qty > 0);

  /* ----------- ADD-ON TOTALS ----------- */
  const selectedForcedAddOns = ADD_ON_ONE_TIME
    .filter(item => item.forced)
    .map(item => ({ id: item.id, label: item.label, price: item.price }));

  const allSelectedAddOns = [
    ...selectedAddOns,
    ...selectedForcedAddOns.filter(
      forced => !selectedAddOns.some(s => s.id === forced.id)
    ),
  ];

  const stepperAddOnTotal = ADD_ON_SERVICES.reduce(
    (sum, s) => sum + (selectedAddOnQty[s.code] ?? 0) * s.unitPrice,
    0
  );

  const addOnTotal =
    stepperAddOnTotal +
    allSelectedAddOns.reduce((sum, addon) => sum + addon.price, 0);

  /* ----------- RECOMMENDATION ----------- */
  const recommendation = recommendPackage({ revenueResult, litePricing, fullPricing });
  const gapPercent = (recommendation as any).gapPercent as number | undefined;

  /* ----------- HELPERS ----------- */
  const updateField = (field: string, value: string | number) => {
    setInput((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateSeason = (
    season: "highSeason" | "shoulderSeason" | "lowSeason",
    field: "months" | "adr",
    value: number
  ) => {
    setInput((prev: any) => ({
      ...prev,
      [season]: { ...prev[season], [field]: value },
    }));
  };

  /* ----------- SYSTEM COST ----------- */
  const getSystemCost = (roomKey: number): number => {
    if (roomKey <= 10) return 3500;
    if (roomKey <= 20) return 4000;
    if (roomKey <= 50) return 5200;
    if (roomKey <= 100) return 5400;
    return 5800;
  };

  const systemCost = getSystemCost(input.roomKey);

  /* ----------- COMMISSION ----------- */
  const commissionData = useMemo(() => {
    if (!revenueResult) {
      return { baseRate: 0, otaAdjustment: 0, varianceAdjustment: 0, finalRate: 0, tier: "NONE" };
    }

    const avgRevenue = revenueResult.averageRevenuePerMonth;
    let baseRate = 0;
    let tier = "";

    if (avgRevenue < 120000)       { baseRate = 0;    tier = "0"; }
    else if (avgRevenue < 200000)  { baseRate = 0.10; tier = "F2"; }
    else if (avgRevenue < 350000)  { baseRate = 0.09; tier = "F3"; }
    else if (avgRevenue < 600000)  { baseRate = 0.08; tier = "F4"; }
    else if (avgRevenue < 1000000) { baseRate = 0.07; tier = "F5"; }
    else if (avgRevenue < 1500000) { baseRate = 0.06; tier = "F6"; }
    else if (avgRevenue < 2500000) { baseRate = 0.05; tier = "F7"; }
    else                           { baseRate = 0.04; tier = "F8"; }

    let otaAdjustment = 0;
    if (input.otaSharePercent >= 80)     otaAdjustment = 0.01;
    else if (input.otaSharePercent < 50) otaAdjustment = -0.005;

    let varianceAdjustment = 0;
    if (input.lowSeason.adr > 0) {
      const seasonalVariance = (input.highSeason.adr - input.lowSeason.adr) / input.lowSeason.adr;
      if (seasonalVariance >= 1.0) varianceAdjustment = 0.005;
    }

    let finalRate = baseRate + otaAdjustment + varianceAdjustment;
    finalRate = Math.max(0.03, Math.min(0.15, finalRate));

    return { baseRate, otaAdjustment, varianceAdjustment, finalRate, tier };
  }, [revenueResult, input.otaSharePercent, input.highSeason.adr, input.lowSeason.adr]);

  /* ----------- ADDON SECTION (shared UI) ----------- */
  const AddonSection = () => (
    <div className="addon-section">
      <div className="addon-title">บริการเสริม</div>
      <ul className="addon-list">
        {allSelectedAddOns.length > 0
          ? allSelectedAddOns.map(a => (
              <li key={a.id}>
                <span>• {a.label}</span>
                {(a.id === "REVPLUS" || a.id === "REGISTER_OTA") && (
                  <span className="addon-unit">One Time Service</span>
                )}
              </li>
            ))
          : <li>-</li>}
      </ul>
      {stepperSummary.length > 0 && (
        <ul className="addon-list">
          {stepperSummary.map(s => (
            <li key={s.code}>
              <span>• {s.name}</span>
              <span className="addon-unit--stepper">
                {s.code === "EXTRA_OTA"
                  ? `${s.qty} OTA / Month`
                  : s.code === "RESERVATION_MANAGEMENT"
                    ? "Monthly"
                    : `${s.qty} Item`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  /* ----------- EXPORT BUILDERS ----------- */
  const buildLiteExportBlock = (): ExportPackageBlock | null => {
    if (!litePricing || !litePricing.isEligible) return null;

    const addonRows = [
      ...stepperSummary.map(s => ({
        label: `  • ${s.name} × ${s.qty}`,
        value: s.code === "EXTRA_OTA"
          ? `${s.qty} OTA / Month`
          : s.code === "RESERVATION_MANAGEMENT"
            ? "Monthly"
            : "One Time Service",
      })),
      ...allSelectedAddOns.map(a => ({
        label: `  • ${a.label}`,
        value: "One Time Service",
      })),
    ];

    return {
      packageName: "Lite Package",
      rows: [
        { label: "ค่าบริการรายเดือนพื้นฐาน", value: formatCurrency(litePricing.baseMonthlyFee) },
        { label: "อัตราค่าคอมมิชชั่น",        value: `${(litePricing.commissionRate * 100).toFixed(2)}%` },
        ...(addonRows.length > 0 ? [
          { label: "บริการเสริม", value: "" },
          ...addonRows,
        ] : [
          { label: "บริการเสริม", value: "" },
        ]),
      ],
      totalLabel: "ค่าบริการรวม / เดือน",
      totalValue: formatCurrency(roundUpToHundred(litePricing.baseMonthlyFee + litePricing.commissionCost + addOnTotal)),
    };
  };
  
  const buildFixedExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult || !fullPricing) return null;
    const lowOtaRevenue = revenueResult.lowRevenuePerMonth * (input.otaSharePercent / 100);
    const lowB = lowOtaRevenue * commissionData.finalRate;
    let weight = 1, discount = 1;
    switch (commissionData.tier) {
      case "F2": weight = 0.85; discount = 0.70; break;
      case "F3": weight = 0.90; discount = 0.75; break;
      case "F4": weight = 0.95; discount = 0.80; break;
      case "F5": weight = 1;    discount = 0.83; break;
      case "F6": weight = 1;    discount = 0.85; break;
      case "F7": weight = 1;    discount = 0.87; break;
      case "F8": weight = 1;    discount = 0.90; break;
    }
    const base = fullPricing.A + (lowB * weight);
    const packageCore = roundUpToHundred(Math.max(base * discount, fullPricing.A + 5000) + addOnTotal + systemCost);

    return {
      packageName: "Fixed Package (A Only)",
      description: "แพ็คเกจค่าบริการคงที่ ไม่ขึ้นกับรายได้โรงแรม",
      rows: [
        { label: "ค่าบริการระบบ (A)",        value: formatCurrency(fullPricing.A) },
        { label: "ค่าคอมมิชชั่นที่เหมาะสมกับโรงแรมคุณ", value: `${(commissionData.finalRate * 100).toFixed(1)}%` },
        { label: "Setup Fee - จ่ายครั้งแรก", value: formatCurrency(systemCost) },
      ],
      totalLabel: "ค่าบริการเหมาจ่าย / เดือน",
      totalValue: formatCurrency(packageCore),
    };
  };

  const buildPerformanceExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult) return null;
    const bOnlyRate = commissionData.finalRate + 0.02;
    const addonRows = [
      ...stepperSummary.map(s => ({
        label: `  • ${s.name} × ${s.qty}`,
        value: s.code === "EXTRA_OTA"
          ? `${s.qty} OTA / Month`
          : s.code === "RESERVATION_MANAGEMENT"
            ? "Monthly"
            : "One Time Service",
      })),
      ...allSelectedAddOns.map(a => ({
        label: `  • ${a.label}`,
        value: "One Time Service",
      })),
    ];

    return {
      packageName: "Performance Package (B Only)",
      description: "แพ็กเกจคิดค่าบริการตามผลงาน",
      rows: [
        { label: "ค่าคอมมิชชั่นที่เหมาะสมกับโรงแรมคุณ", value: `${(bOnlyRate * 100).toFixed(2)}%` },
        ...(addonRows.length > 0 ? [
          { label: "บริการเสริม", value: "" },
          ...addonRows,
        ] : []),
      ],
      totalLabel: "ค่าคอมมิชชั่น / เดือน",
      totalValue: `${(bOnlyRate * 100).toFixed(2)}%`,
      conditions: [
        "เงื่อนไขการใช้งาน",
        "  • เหมาะสำหรับโรงแรมที่ต้องการควบคุมต้นทุนคงที่",
        "  • บริษัทฯ จะเรียกเก็บค่าบริการจากยอดการจองที่เกิดขึ้นจริงในแต่ละเดือน หรือค่าบริการขั้นต่ำ 8,000 บาท (แปดพันบาทถ้วน) ต่อเดือน ทั้งนี้ บริษัทฯ จะเรียกเก็บค่าบริการตามจำนวนที่มีมูลค่าสูงกว่า",
      ],
    };
  };

  const buildSmartExportBlock = (): ExportPackageBlock | null => {
    if (!revenueResult || !fullPricing) return null;

    const otaRevenue = revenueResult.otaRevenuePerMonth;
    const rawB = otaRevenue * commissionData.finalRate;
    const finalTotal = roundUpToHundred(Math.min(fullPricing.A + rawB + addOnTotal, 60000));

    const addonRows = [
      ...stepperSummary.map(s => ({
        label: `  • ${s.name} × ${s.qty}`,
        value: s.code === "EXTRA_OTA"
          ? `${s.qty} OTA / Month`
          : s.code === "RESERVATION_MANAGEMENT"
            ? "Monthly"
            : "One Time Service",
      })),
      ...allSelectedAddOns.map(a => ({
        label: `  • ${a.label}`,
        value: "One Time Service",
      })),
    ];

    return {
      packageName: "Smart Package (A + B)",
      description: "แพ็คเกจผสมผสาน เพื่อผลลัพธ์ที่ครอบคลุมยิ่งขึ้น",
      rows: [
        { label: "ค่าบริการระบบ (A)",                          value: formatCurrency(fullPricing.A) },
        { label: "ค่าคอมมิชชั่นที่เหมาะสมกับโรงแรมของคุณ",    value: `${(commissionData.finalRate * 100).toFixed(2)}%` },
        ...(addonRows.length > 0 ? [
          { label: "บริการเสริม", value: "" },
          ...addonRows,
        ] : []),
      ],
      totalLabel: "ค่าบริการรวม / เดือน",
      totalValue: formatCurrency(finalTotal),
    };
  };

  /* ----------- RENDER ----------- */
  return (
    <div className="orm-lite-calculator">
      {/* BASIC INFO */}
      <section>
        <div className="section-header">
          <h2>🏨 ข้อมูลพื้นฐาน</h2>
          <button type="button" className="info-btn" onClick={() => setShowServiceInfo(true)}>
            ตารางเปรียบเทียบบริการ
          </button>
        </div>
        <div className="basic-info-grid">
          <label>
            <span>ชื่อโรงแรม <span className="required">*</span></span>
            <input type="text" value={input.hotelName || ""} onChange={e => updateField("hotelName", e.target.value)} placeholder="กรอกชื่อโรงแรม" />
          </label>
          <label>
            <span>จำนวนห้องพัก <span className="required">*</span></span>
            <input type="number" value={input.roomKey || ""} onChange={e => updateField("roomKey", Number(e.target.value))} placeholder="กรอกจำนวนห้องพัก" />
          </label>
          <label>
            อัตราการเข้าพัก (%)
            <input type="number" value={input.occupancyPercent || ""} onChange={e => updateField("occupancyPercent", Number(e.target.value))} placeholder="กรอกอัตราการเข้าพัก (%)" />
          </label>
          <label>
            <span>สัดส่วนการขายผ่าน OTA (%) <span className="required">*</span></span>
            <input type="number" value={input.otaSharePercent || ""} onChange={e => updateField("otaSharePercent", Number(e.target.value))} placeholder="กรอกสัดส่วนการขายผ่าน OTA (%)" />
          </label>
        </div>
      </section>

      {/* SEASONS */}
      <section>
        <h2>ข้อมูลตามฤดูกาล</h2>
        <div className="seasons-grid">
          <div className="season-card high">
            <h3>High Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input type="number" value={input.highSeason.months} onChange={e => updateSeason("highSeason", "months", Number(e.target.value))} />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input type="number" value={input.highSeason.adr} onChange={e => updateSeason("highSeason", "adr", Number(e.target.value))} />
            </div>
          </div>
          <div className="season-card shoulder">
            <h3>Shoulder Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input type="number" value={input.shoulderSeason.months} onChange={e => updateSeason("shoulderSeason", "months", Number(e.target.value))} />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input type="number" value={input.shoulderSeason.adr} onChange={e => updateSeason("shoulderSeason", "adr", Number(e.target.value))} />
            </div>
          </div>
          <div className="season-card low">
            <h3>Low Season</h3>
            <div className="season-field">
              <label>จำนวนเดือน</label>
              <input type="number" value={input.lowSeason.months} onChange={e => updateSeason("lowSeason", "months", Number(e.target.value))} />
            </div>
            <div className="season-field">
              <label>ADR (บาท)</label>
              <input type="number" value={input.lowSeason.adr} onChange={e => updateSeason("lowSeason", "adr", Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* OTA SECTION */}
        <div className="ota-section">
          <h3>โรงแรมมี OTA อยู่แล้วหรือไม่?</h3>
          <div className="ota-yn-buttons">
            <button type="button" className={`yn-btn ${hasExistingOTA === true ? "yn-btn--active" : ""}`} onClick={() => setHasExistingOTA(true)}>Yes</button>
            <button type="button" className={`yn-btn ${hasExistingOTA === false ? "yn-btn--no" : ""}`} onClick={() => setHasExistingOTA(false)}>No</button>
          </div>
          {hasExistingOTA === true && (
            <div className="ota-checkbox-list">
              <p className="ota-subtitle">เลือก OTA ที่มีอยู่แล้ว (เลือกได้หลายช่องทาง)</p>
              <div className="ota-chip-grid">
                {OTA_LIST.map((ota) => {
                  const checked = selectedOTAs.includes(ota);
                  const otaEmoji: Record<string, string> = {
                    "Agoda": "", "Booking.com": "", "Trip.com": "",
                    "Expedia": "", "Traveloka": "", "Tiket.com": "", "Gother": "",
                  };
                  return (
                    <button key={ota} type="button" className={`ota-chip ${checked ? "ota-chip--active" : ""}`} onClick={() => toggleOTA(ota)}>
                      <span>{otaEmoji[ota] ?? "🌐"}</span>
                      <span>{ota}</span>
                      {checked && <span className="ota-chip-check">✓</span>}
                    </button>
                  );
                })}
              </div>
              {selectedOTAs.length > 0 && (
                <p className="ota-selected-count">เลือกแล้ว {selectedOTAs.length} ช่องทาง</p>
              )}
            </div>
          )}
          {hasExistingOTA === false && (
            <p className="ota-none-msg">📢 ระบบจะจัดการลงทะเบียน OTA ให้กับโรงแรม</p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <button className="btn-calculate" onClick={calculateRevenue}>คำนวณผลลัพธ์</button>
          <button className="btn-reset" onClick={() => { resetRevenue(); reset(); }}>⟳ รีเซ็ต</button>
        </div>
      </section>

      {/* ERRORS */}
      {revenueErrors.length > 0 && (
        <div className="errors-section">
          <h3>ข้อผิดพลาด</h3>
          <ul>{revenueErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>
        </div>
      )}

      {/* PACKAGE RECOMMENDATION */}
      {revenueResult && (
        <section>

          {/* RECOMMEND SUMMARY */}
          <div className="recommend-summary">
            <h2 className="recommend-label">📌แพ็กเกจที่ระบบแนะนำ</h2>
            <span className="recommend-badge">{recommendation.recommendation}</span>
            <p className="recommend-reason">{recommendation.reason}</p>
          </div>

          {/* ADD-ONS (LITE ONLY) */}
          {isLiteEligible && (
            <section className="addon-main">
              <h2>🤝 บริการเสริม (Add-On Services)</h2>

              {ADD_ON_SERVICES.map(service => {
                const isToggle = service.code === "RESERVATION_MANAGEMENT";
                const qty = selectedAddOnQty[service.code] ?? 0;
                const isOn = qty > 0;
                return (
                  <div key={service.code} className="addon-service">
                    <div className="addon-service-header">
                      <div className="addon-service-info">
                        <h3 className="addon-service-name">{service.name}</h3>
                        <p className="addon-service-desc">{service.description}</p>
                      </div>
                      {isToggle ? (
                        <button
                          type="button"
                          className={`toggle-switch ${isOn ? "toggle-switch--on" : ""}`}
                          onClick={() => setAddOnQty(service.code, isOn ? 0 : 1)}
                        >
                          <span className="toggle-knob" />
                        </button>
                      ) : (
                        <div className="addon-stepper">
                          <button type="button" className={`stepper-btn ${qty === 0 ? "stepper-btn--disabled" : ""}`} disabled={qty === 0} onClick={() => setAddOnQty(service.code, Math.max(0, qty - 1))}>−</button>
                          <span className={`stepper-value ${qty > 0 ? "stepper-value--active" : ""}`}>{qty}</span>
                          <button type="button" className={`stepper-btn ${qty === 4 ? "stepper-btn--disabled" : "stepper-btn--add"}`} disabled={qty === 4} onClick={() => setAddOnQty(service.code, Math.min(4, qty + 1))}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* One-time optional / forced add-ons */}
              <div>
                {ADD_ON_ONE_TIME.map((item) => (
                  <div key={item.id} className={`addon-option ${item.forced ? "forced" : ""}`}>
                    <label htmlFor={item.id}>
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={item.forced || selectedAddOns.some(o => o.id === item.id)}
                        disabled={item.forced}
                        onChange={() => {
                          if (!item.forced) toggleAddOnOption({ id: item.id, label: item.label, price: item.price });
                        }}
                      />
                    </label>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong>{item.label}</strong>
                        <span className="addon-unit">One Time Service</span>
                      </div>
                      <p className="addon-desc">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              {stepperAddOnTotal > 4000 && (
                <div className="info-box warning" style={{ background: "#fee2e2", borderLeftColor: "#dc2626", marginTop: "16px" }}>
                  <span className="info-icon">⚠️</span>
                  <div>
                    <p style={{ fontWeight: "bold", color: "#991b1b" }}>
                      ส่วนต่างราคา {gapPercent !== undefined ? `${gapPercent.toFixed(2)}%` : ""}
                    </p>
                    <p style={{ color: "#991b1b" }}>ปัจจุบันค่าบริการของคุณคือ {formatCurrency(stepperAddOnTotal)} บาท</p>
                    <p style={{ color: "#991b1b" }}>ตัวเลือกที่คุ้มค่ากว่า → Full Service Package</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* LITE PACKAGE */}
          {isLiteEligible && litePricing && (
            <div className="package-card">
              <h3>Lite Package{recommendation.recommendation === "LITE" && " ⭐"}</h3>
              <p className="package-desc">แพ็กเกจบริหารโครงสร้างเริ่มต้นอย่างมีทิศทาง ในงบประมาณที่คุ้มค่า</p>
              <p>ระดับ: {litePricing.tier}</p>
              <div className="breakdown">
                <p><span>ค่าบริการรายเดือนพื้นฐาน:</span><span>{formatCurrency(litePricing.baseMonthlyFee)}</span></p>
                <p><span>อัตราค่าคอมมิชชั่น:</span><span>{(litePricing.commissionRate * 100).toFixed(2)}%</span></p>
                {(stepperSummary.length > 0 || allSelectedAddOns.length > 0) && (
                  <div style={{ margin: "12px 0", padding: "12px 14px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#374151" }}>🛒 บริการเสริมที่เลือก</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {stepperSummary.map(s => (
                        <div key={s.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", color: "#4b5563" }}>• {s.name}</span>
                          <span style={{ fontSize: "12px", background: "#ee4d2d", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontWeight: 600 }}>
                            {s.code === "EXTRA_OTA"
                              ? `${s.qty} OTA / Month`
                              : s.code === "RESERVATION_MANAGEMENT"
                                ? "Monthly"
                                : `${s.qty} Item`}
                          </span>
                        </div>
                      ))}
                      {allSelectedAddOns.map(a => (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", color: "#4b5563" }}>• {a.label}</span>
                          <span style={{ fontSize: "12px", background: "#6366f1", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontWeight: 600 }}>
                            {a.id === "REVPLUS" || a.id === "REGISTER_OTA" ? "One Time Service" : "Included"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <hr />
                <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                  <span>รวมค่าบริการรายเดือน:</span>
                  <span>{formatCurrency(roundUpToHundred(litePricing.baseMonthlyFee + litePricing.commissionCost + addOnTotal))}</span>
                </p>
              </div>
              {litePricing.isTriggerExceeded && (
                <p style={{ color: "#e53e3e", marginTop: "12px" }}>บริการเสริมเกินจำนวนที่กำหนด แนะนำให้เลือก Full Services</p>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────FULL PACKAGES───────────────────────────────────────────── */}
          {isFullEligible && fullPricing && (
            <section className="full-services-section">
              <h2>แพ็กเกจ Full Services</h2>
              <div className="full-grid">
                {/* ── SMART (A + B) ── */}
                {revenueResult && (() => {
                  const rawB = revenueResult.otaRevenuePerMonth * commissionData.finalRate;
                  const packageCore = roundUpToHundred(Math.min(fullPricing.A + rawB + addOnTotal, 60000)); // cap ทุกกรณีที่ 60,000
                  return (
                    <div className="fs-card recommended">
                      <div className="fs-header">
                        <div className="fs-title">
                          <span className="fs-icon">📦</span>
                          <div>
                            <h3>Smart Package (A + B) </h3>
                            <p>แพ็กเกจบริหารครบวงจร พร้อมกลยุทธ์เชิงลึกเฉพาะโรงแรม</p>
                          </div>
                        </div>
                        <span className="fs-badge">แนะนำ</span>
                      </div>
                      <div className="fs-price">
                        {formatCurrency(packageCore)} บาท/เดือน
                        <p style={{ fontSize: "13px", color: "#000000"}}>ค่าบริการรายเดือน</p>
                      </div>
                      <div className="fs-breakdown">
                        <div><span>ค่าบริการระบบ (A)</span><span>{formatCurrency(fullPricing.A)}</span></div>
                        <div><span>ค่าคอมมิชชั่นที่เหมาะสมกับโรงแรมคุณ</span><span>{(commissionData.finalRate * 100).toFixed(2)}%</span></div>
                      </div>
                      <AddonSection />
                    </div>
                  );
                })()}

                {/* ── FIXED (A Only) ── */}
                {revenueResult && (() => {
                  const lowOtaRevenue = revenueResult.lowRevenuePerMonth * (input.otaSharePercent / 100);
                  const lowB          = lowOtaRevenue * commissionData.finalRate;
                  let weight = 1, discount = 1;
                  switch (commissionData.tier) {
                    case "F2": weight = 0.85; discount = 0.70; break;
                    case "F3": weight = 0.90; discount = 0.75; break;
                    case "F4": weight = 0.95; discount = 0.80; break;
                    case "F5": discount = 0.83; break;
                    case "F6": discount = 0.85; break;
                    case "F7": discount = 0.87; break;
                    case "F8": discount = 0.90; break;
                  }
                  const base = fullPricing.A + (lowB * weight);
                  const packageCore = roundUpToHundred(Math.max(base * discount, fullPricing.A + 5000) + addOnTotal + systemCost);

                  return (
                    <div className="fs-card">
                      <div className="fs-header">
                        <div className="fs-title">
                          <span className="fs-icon">📦</span>
                          <div>
                            <h3>Fixed Package (A Only)</h3>
                            <p>เหมาะสำหรับโรงแรมที่ต้องการควบคุมต้นทุนและค่าใช้จ่าย ค่าบริการคงไม่ขึ้นกับรายได้โรงแรม “ตลอดอายุสัญญา” </p>
                          </div>
                        </div>
                      </div>
                      <div className="fs-price">
                        {formatCurrency(packageCore)} บาท/เดือน
                        <p style={{ fontSize: "13px", color: "#000000"}}>ไม่มีค่าบริการรายเดือน</p>
                      </div>
                      <div className="fs-breakdown">
                        <div><span>ค่าใช้จ่ายเริ่มต้น</span> <span>{formatCurrency(systemCost)}</span></div>
                        <div><span>ค่าบริการระบบ (A)</span>  <span>{formatCurrency(fullPricing.A)}</span></div>
                      </div>
                      <AddonSection />
                    </div>
                  );
                })()}

                {/* ── PERFORMANCE (B Only) ── */}
                {revenueResult && (() => {
                  const bOnlyRate   = commissionData.finalRate + 0.02;
                  const bOnly       = revenueResult.otaRevenuePerMonth * bOnlyRate;
                  const packageCore = roundUpToHundred(Math.max(bOnly+ 5000, 8000) + addOnTotal);
                  if (packageCore < 15000) return null;
                  return (
                    <div className="fs-card">
                      <div className="fs-header">
                        <div className="fs-title">
                          <span className="fs-icon">📦</span>
                          <div>
                            <h3>Performance Package (B Only)</h3>
                            <p>แพ็กเกจบริหารครบวงจร พร้อมกลยุทธ์เชิงลึกเฉพาะโรงแรม เติมคำเติมคำเติมคำ</p>
                          </div>
                        </div>
                        {/* Info icon with tooltip */}
                        <div className="bonly-info">
                          <span className="bonly-info-icon">?</span>
                          <div className="bonly-tooltip-inner">
                            <p style={{ fontWeight: 700, marginBottom: 8 }}>เงื่อนไขการใช้งาน</p>
                            <p>✓ เหมาะสำหรับโรงแรมที่บริหารจัดการได้เองในยอดขาย OTA</p>
                            <p>✓ ใช้ได้เฉพาะโรงแรมที่ไม่ใช่ "รายได้ต่ำ"</p>
                            <p>✓ B Only ต้อง ≥ 15,000 บาท</p>
                            <p style={{ fontWeight: 700, margin: "10px 0 8px" }}>เงื่อนไขการเรียกเก็บค่าบริการ</p>
                            <p>บริษัทฯ จะเรียกเก็บค่าบริการจากยอดการจองที่เกิดขึ้นจริงในแต่ละเดือน หรือค่าบริการขั้นต่ำจำนวน 8,000 บาท (แปดพันบาทถ้วน) ต่อเดือน ทั้งนี้ บริษัทฯ จะเรียกเก็บค่าบริการตามจำนวนที่มีมูลค่าสูงกว่า</p>
                          </div>
                        </div>
                      </div>
                      <div className="fs-price">
                        {formatCurrency(packageCore)} บาท/เดือน
                        <p style={{ fontSize: "13px", color: "#000000"}}>ไม่มีค่าบริการรายเดือน</p>
                      </div>
                      <div className="fs-breakdown">
                        <div><span>B Only Rate</span><span>{(bOnlyRate * 100).toFixed(2)}%</span></div>
                      </div>
                      <AddonSection />
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* EXPORT */}
          <section className="export-main">
            <h3>💾 เลือกแพ็กเกจเพื่อดาวน์โหลด PDF</h3>

            {/* Select All */}
            <div className="export-main__select-all">
              <input
                type="checkbox"
                id="select-all"
                className="export-main__checkbox"
                checked={selectedExports.length === (litePricing?.isEligible ? 4 : 3)}
                onChange={() => {
                  const available: ExportPackage[] = [];
                  if (litePricing?.isEligible) available.push("LITE");
                  if (fullPricing) available.push("SMART", "FIXED", "PERFORMANCE");
                  toggleSelectAll(available);
                }}
              />
              <label htmlFor="select-all" className="export-main__label">
                เลือกทั้งหมด
              </label>
            </div>

            {/* Package options */}
            {[
              { id: "LITE",        label: "Lite Package",                 desc: "แพ็กเกจบริหารโครงสร้างเริ่มต้นอย่างมีทิศทาง ในงบประมาณที่คุ้มค่า",show: !!litePricing?.isEligible },
              { id: "SMART",       label: "Smart Package (A+B)",          desc: "แพ็คเกจผสมผสาน เพื่อผลลัพธ์ที่ครอบคลุมยิ่งขึ้น",show: true },
              { id: "FIXED",       label: "Fixed Package (A Only)",       desc: "แพ็คเกจค่าบริการคงที่ ไม่ขึ้นกับรายได้โรงแรม",show: true },
              { id: "PERFORMANCE", label: "Performance Package (B Only)", desc: "แพ็กเกจคิดค่าบริการตามผลงาน",show: true },
            ]
              .filter(item => item.show)
              .map(item => {
                const checked = selectedExports.includes(item.id as ExportPackage);
                return (
                  <div
                    key={item.id}
                    className={`export-main__row ${checked ? "export-main__row--checked" : ""}`}
                    onClick={() => toggleExport(item.id as ExportPackage)}
                  >
                    <input
                      type="checkbox"
                      id={item.id}
                      className="export-main__checkbox"
                      checked={checked}
                      onChange={() => toggleExport(item.id as ExportPackage)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="export-main__label-group">
                      <label
                        htmlFor={item.id}
                        className="export-main__label"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.label}
                      </label>
                      {item.desc && <span className="export-main__desc">{item.desc}</span>}
                    </div>
                  </div>
                );
              })}
              <button
              className="export-main__btn"
              disabled={selectedExports.length === 0}
              onClick={() => {
                const blocks: ExportPackageBlock[] = [];
                if (selectedExports.includes("LITE"))        { const b = buildLiteExportBlock();        if (b) blocks.push(b); }
                if (selectedExports.includes("SMART"))       { const b = buildSmartExportBlock();       if (b) blocks.push(b); }
                if (selectedExports.includes("FIXED"))       { const b = buildFixedExportBlock();       if (b) blocks.push(b); }
                if (selectedExports.includes("PERFORMANCE")) { const b = buildPerformanceExportBlock(); if (b) blocks.push(b); }
                if (blocks.length === 0) return;
                exportPricingPDF({ hotelName: input.hotelName, packages: blocks, preparedBy: username });
              }}
            >
              📤 Export PDF
            </button>
          </section>

          {!isLiteEligible && !isFullEligible && (
            <p style={{ color: "#e53e3e", textAlign: "center" }}>ไม่สามารถแนะนำแพ็กเกจที่เหมาะสมได้</p>
          )}
        </section>
      )}

      {/* SERVICE INFO MODAL */}
      {showServiceInfo && (
        <div className="modal-overlay" onClick={() => setShowServiceInfo(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>เปรียบเทียบบริการ Lite vs Full Services</h3>
              <button onClick={() => setShowServiceInfo(false)}>✖</button>
            </div>
            <table className="service-table">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>Lite <span className="badge-lite">Standard</span></th>
                  <th>Full Services <span className="badge-full">All Inclusive</span></th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Shop Rate Monitoring</td><td>One-time</td><td>Daily</td></tr>
                <tr><td>Compset Survey</td><td>One-time</td><td>Daily</td></tr>
                <tr><td>Visibility Management</td><td>One-time</td><td>Daily</td></tr>
                <tr><td>OTA Channel Management</td><td>OTA / Month</td><td>6–8 OTA + Expansion (รวมฟรี)</td></tr>
                <tr><td>Reservation Management</td><td>Monthly</td><td>Daily (รวมฟรี)</td></tr>
                <tr><td>H+ Specialist</td><td>Centralize</td><td>Personal Specialist</td></tr>
                <tr>
                  <td>Benefits อื่น ๆ</td>
                  <td>-</td>
                  <td>
                    {["กิจกรรมส่งเสริมการตลาดพิเศษ (Special Activities)", "ประชุมประจำเดือน (Monthly Meeting)", "รายงาน H+ Performance Dashboard", "OTA Market Insight"].map(item => (
                      <div key={item}>• {item}</div>
                    ))}
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