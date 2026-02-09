import { BASE_COMMISSION_MAP } from "./types/fullCalculator";

type Props = {
  result: any;
};

export default function ResultCards({ result }: Props) {

  // ดึง base commission จาก tier
  const baseCommission =
    result.model === "FULL"
      ? BASE_COMMISSION_MAP[result.tier]
      : null;

  return (
    <div className="result-layout">

      {/* ===== SUMMARY ===== */}
      <div className="card summary-card">
        <h3>⭐ ข้อมูลสรุป</h3>

        <div className="row">
          <span>ประเภทรายได้</span>
          <span className="badge green">
            {result.model === "FULL"
              ? "รายได้ปานกลาง"
              : "รายได้ต่ำ"}
          </span>
        </div>

        {/* Tier */}
        {result.model === "FULL" && (
          <div className="row">
            <span>Tier</span>
            <span>{result.tier}</span>
          </div>
        )}

        <div className="row">
          <span>รายได้เฉลี่ย/เดือน</span>
          <span>
            {result.revenue.average.toLocaleString()} บาท
          </span>
        </div>

        <div className="row">
          <span>รายได้ OTA เฉลี่ย/เดือน</span>
          <span>
            {result.revenue.otaAverage.toLocaleString()} บาท
          </span>
        </div>

        {/* Commission */}
        {result.model === "FULL" && (
          <div className="row">
            <span>Commission Rate</span>
            <span>
              {(baseCommission * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* ===== SMART PACKAGE ===== */}
      <div className="card highlight">

        <div className="card-header">
          <h3>แพคเกจมาตรฐาน (A + B)</h3>
          <span className="badge orange">
            แนะนำ
          </span>
        </div>

        <div className="big-price">
          {result.model === "NONE"
            ? "ไม่เข้าเกณฑ์แพคเกจ"
            : result.smartPrice?.toLocaleString() + " บาท/เดือน"}
        </div>

        {result.model === "NONE" && (
          <p style={{ color: "#888", marginTop: 6 }}>
            โรงแรมยังมีรายได้ไม่ถึงเกณฑ์ขั้นต่ำของแพคเกจ
          </p>
        )}

        <div className="row">
          <span>ค่าบริการระบบ (A)</span>
          <span>7,800 บาท</span>
        </div>

        <div className="row">
          <span>ค่าคอมมิชชั่น (B)</span>
          <span>
            {result.model === "FULL"
              ? (result.revenue.otaAverage * baseCommission)
                  .toLocaleString()
              : "-"} บาท
          </span>
        </div>

      </div>

      {/* ===== FIXED ===== */}
      <div className="card">
        <h3>แพคเกจเหมาจ่าย (A Only)</h3>
        <div className="big-price blue">
          26,262 บาท/เดือน
        </div>
      </div>

      {/* ===== PERFORMANCE ===== */}
      <div className="card">
        <h3>แพคเกจคอมมิชชั่น (B Only)</h3>
        <div className="big-price pink">
          51,625 บาท/เดือน
        </div>
      </div>

    </div>
  );
}
