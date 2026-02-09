import { useState } from "react";
import "./OrmCalMain.css";
import { CalculatorInput } from "./types";
import { runCalculation } from "./decisionEngine";
import ResultCards from "./ResultCards";
import PdfTemplate from "./PdfTemplate";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const initialState: CalculatorInput = {
  hotelName: "",
  roomKeys: 30,
  occupancy: 0.7,
  otaShare: 0.6,
  high: { months: 4, adr: 2000 },
  shoulder: { months: 4, adr: 2000 },
  low: { months: 4, adr: 2000 }
};

export default function OrmCalMain() {

  const [input, setInput] =
    useState<CalculatorInput>(initialState);

  const [result, setResult] =
    useState<any>(null);

  // ---------- handlers ----------
  const updateField = (
    key: keyof CalculatorInput,
    value: any
  ) => {
    setInput(p => ({ ...p, [key]: value }));
  };

  const updateSeason = (
    season: "high" | "shoulder" | "low",
    key: "months" | "adr",
    value: number
  ) => {
    setInput(p => ({
      ...p,
      [season]: { ...p[season], [key]: value }
    }));
  };

  // ---------- calculate ----------
  const handleCalculate = () => {

    const totalMonths =
      input.high.months +
      input.shoulder.months +
      input.low.months;

    if (totalMonths !== 12) {
      alert("จำนวนเดือนรวมกันต้องเท่ากับ 12");
      return;
    }

    setResult(runCalculation(input));
  };

  // ---------- export pdf ----------
  const handleExportPDF = async () => {

    const element =
      document.getElementById("pdf-area");

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight =
      (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;
    }

    const fileName =
      input.hotelName
        ? `${input.hotelName}.pdf`
        : "service-evaluation.pdf";

    pdf.save(fileName);
  };

  return (
    <div className="page">

      {/* ===== PDF TEMPLATE (hidden) ===== */}
      {result && (
        <div
          id="pdf-area"
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0
          }}
        >
          <PdfTemplate input={input} result={result} />
        </div>
      )}

      <div className="container">

        {/* ===== BASIC INFO ===== */}
        <div className="card">
          <div className="card-title">⭐ ข้อมูลพื้นฐาน</div>

          <div className="field">
            <label>ชื่อโรงแรม</label>
            <input
              type="text"
              value={input.hotelName}
              onChange={e =>
                updateField("hotelName", e.target.value)
              }
              placeholder="กรอกชื่อโรงแรม"
            />
          </div>

          <div className="grid-3">

            <div className="field">
              <label>จำนวนห้องพัก</label>
              <input
                type="number"
                min={0}
                value={input.roomKeys}
                onChange={e =>
                  updateField(
                    "roomKeys",
                    Math.max(0, +e.target.value)
                  )
                }
              />
            </div>

            <div className="field">
              <label>อัตราการเข้าพัก (%)</label>
              <input
                type="number"
                value={Number(
                  (input.occupancy * 100).toFixed(0)
                )}
                onChange={e =>
                  updateField(
                    "occupancy",
                    +e.target.value / 100
                  )
                }
              />
            </div>

            <div className="field">
              <label>สัดส่วน OTA (%)</label>
              <input
                type="number"
                value={Number(
                  (input.otaShare * 100).toFixed(0)
                )}
                onChange={e =>
                  updateField(
                    "otaShare",
                    +e.target.value / 100
                  )
                }
              />
            </div>

          </div>
        </div>

        {/* ===== SEASON ===== */}
        <div className="card">
          <div className="card-title">
            📅 ข้อมูลตามฤดูกาล
          </div>

          <div className="grid-season">
            {(["high","shoulder","low"] as const)
              .map(s => (
                <div key={s} className={`season ${s}`}>

                  <h4>
                    {s === "high" && "🔥 High Season"}
                    {s === "shoulder" && "🌤 Shoulder Season"}
                    {s === "low" && "❄ Low Season"}
                  </h4>

                  <div className="field">
                    <label>จำนวนเดือน</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={input[s].months}
                      onChange={e =>
                        updateSeason(
                          s,
                          "months",
                          Math.max(0, +e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label>ADR (บาท)</label>
                    <input
                      type="number"
                      min={0}
                      value={input[s].adr}
                      onChange={e =>
                        updateSeason(
                          s,
                          "adr",
                          Math.max(0, +e.target.value)
                        )
                      }
                    />
                  </div>

                </div>
            ))}
          </div>
        </div>

        {/* ===== BUTTON ===== */}
        <button
          className="calculate-btn"
          onClick={handleCalculate}
        >
          🧮 คำนวณแพคเกจ
        </button>

        {/* ===== EXPORT PDF ===== */}
        {result &&
          (result.model === "FULL" ||
           result.model === "LITE") && (
            <button
              className="calculate-btn"
              onClick={handleExportPDF}
              style={{ marginTop: 16 }}
            >
              📄 Export to PDF
            </button>
        )}

        {/* ===== RESULT ===== */}
        {result && (
          <div id="result-section">
            <ResultCards result={result} />
          </div>
        )}

      </div>
    </div>
  );
}
