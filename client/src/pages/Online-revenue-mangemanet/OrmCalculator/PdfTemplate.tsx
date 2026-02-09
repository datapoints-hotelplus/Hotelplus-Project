import "./PdfTemplate.css";
import logo from "../../../assets/Logo/Hotelplus-logo.jpg";

type Props = {
  input: any;
  result: any;
};

export default function PdfTemplate({ input, result }: Props) {

  if (!result) return null;

  const incomeType =
    result.model === "FULL"
      ? "รายได้ปานกลาง"
      : "รายได้ต่ำ";

  return (
    <div className="pdf-sheet">

      {/* ===== HEADER ===== */}
      <div className="pdf-header">
        <img src={logo} />
        <div>
          <div className="pdf-title">
            Service Package Evaluation
          </div>
          <div className="pdf-sub">
            Hotel: {input.hotelName}
          </div>
        </div>
      </div>

      {/* ===== GRID ROW 1 ===== */}
      <div className="pdf-grid">

        {/* Hotel Profile */}
        <div className="pdf-card">
          <h3>Hotel Profile</h3>

          <div className="pdf-row">
            <span>จำนวนห้องพัก</span>
            <span>{input.roomKeys} ห้อง</span>
          </div>

          <div className="pdf-row">
            <span>อัตราการเข้าพัก</span>
            <span>{input.occupancy * 100}%</span>
          </div>

          <div className="pdf-row">
            <span>สัดส่วน OTA</span>
            <span>{input.otaShare * 100}%</span>
          </div>

          <div className="pdf-row">
            <span>ประเภทรายได้</span>
            <span>{incomeType}</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="pdf-card">
          <h3>Revenue Summary</h3>

          <div className="pdf-row">
            <span>รายได้เฉลี่ย/เดือน</span>
            <span>
              {result.revenue.average.toLocaleString()} บาท/เดือน
            </span>
          </div>

          <div className="pdf-row">
            <span>รายได้ OTA เฉลี่ย/เดือน</span>
            <span>
              {result.revenue.otaAverage.toLocaleString()} บาท/เดือน
            </span>
          </div>

          <div className="pdf-row">
            <span>Tier</span>
            <span>{result.tier}</span>
          </div>
        </div>

      </div>

      {/* ===== GRID ROW 2 ===== */}
      <div className="pdf-grid">

        {/* Seasonal Data */}
        <div className="pdf-card">
          <h3>Seasonal Data</h3>

          <div className="pdf-row">
            <span>High Season</span>
            <span>
              {input.high.months} เดือน | ADR {input.high.adr.toLocaleString()} บาท
            </span>
          </div>

          <div className="pdf-row">
            <span>Shoulder Season</span>
            <span>
              {input.shoulder.months} เดือน | ADR {input.shoulder.adr.toLocaleString()} บาท
            </span>
          </div>

          <div className="pdf-row">
            <span>Low Season</span>
            <span>
              {input.low.months} เดือน | ADR {input.low.adr.toLocaleString()} บาท
            </span>
          </div>
        </div>

        {/* Empty spacer */}
        <div></div>

      </div>

      {/* ===== PRICE ===== */}
      <div className="price-box">
        <div className="price-title">
          Recommended Smart Package (A + B)
        </div>

        <div className="price-amount">
          {result.smartPrice.toLocaleString()} บาท / เดือน
        </div>
      </div>

      {/* ===== OTHER PACKAGES ===== */}
        <div className="pdf-grid">

            {/* A ONLY */}
            <div className="pdf-card">
                <h3>แพคเกจเหมาจ่าย (A Only)</h3>
                <div className="price-amount" style={{ fontSize: 26 }}>
                26,262 บาท / เดือน
                </div>
            </div>

            {/* B ONLY */}
            <div className="pdf-card">
                <h3>แพคเกจคอมมิชชั่น (B Only)</h3>
                <div className="price-amount" style={{ fontSize: 26 }}>
                51,625 บาท / เดือน
                </div>
            </div>

        </div>


      {/* ===== FOOTER ===== */}
      <div className="pdf-footer">
        This document is for service evaluation purpose only.
        Final commercial terms are subject to agreement.
      </div>

    </div>
  );
}
