import jsPDF from "jspdf";
import type { ExportPackageBlock } from "./export.types";

/* ================= COLOR PALETTE ================= */
const COLORS = {
  primary:     [255, 213, 43]  as [number, number, number], // #FFD52B
  dark:        [0,   0,   0]   as [number, number, number], // #000
  headerBg:    [40,  40,  40]  as [number, number, number], // dark gray header
  medium:      [80,  80,  80]  as [number, number, number],
  light:       [210, 210, 210] as [number, number, number],
  lighter:     [243, 243, 243] as [number, number, number], // #F3F3F3
  white:       [255, 255, 255] as [number, number, number],
  totalBg:     [255, 213, 43]  as [number, number, number], // yellow total
  headerText:  [255, 213, 43]  as [number, number, number], // yellow on dark
  footerText:  [150, 150, 150] as [number, number, number],
};

/* ================= FONT LOADER ================= */
async function loadFont(doc: jsPDF, url: string, fontName: string, style: "normal" | "bold" = "normal") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const buffer = await res.arrayBuffer();
  const b64 = await new Promise<string>((resolve, reject) => {
    const blob = new Blob([buffer], { type: "font/truetype" });
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const fileName = url.split("/").pop()!;
  doc.addFileToVFS(fileName, b64);
  doc.addFont(fileName, fontName, style);
}

/* ================= IMAGE LOADER ================= */
const loadImage = (url: string): Promise<string> =>
  fetch(url)
    .then(r => r.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

/* ================= HELPER: TABLE ================= */
interface TableConfig {
  startY: number;
  headers: string[];
  rows: string[][];
  columnWidths: number[];
  textAlign?: ("left" | "center" | "right")[];
}

function drawTable(doc: jsPDF, config: TableConfig, fontName: string): number {
  const { startY, headers, rows, columnWidths, textAlign = ["left", "right"] } = config;
  const margin = 14;
  const rowH = 9;
  const headerH = 10;
  const tableW = columnWidths.reduce((s, w) => s + w, 0);
  const startX = margin;
  let y = startY;

  // Header bar — primary yellow
  doc.setFillColor(...COLORS.primary);
  doc.rect(startX, y, tableW, headerH, "F");

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont(fontName, "bold");

  let ox = startX;
  headers.forEach((h, i) => {
    const align = textAlign[i] || "left";
    const tx = align === "right" ? ox + columnWidths[i] - 4 : align === "center" ? ox + columnWidths[i] / 2 : ox + 4;
    doc.text(h, tx, y + headerH / 2 + 2, { align });
    ox += columnWidths[i];
  });
  y += headerH;

  // Rows
  doc.setFontSize(11);
  doc.setFont(fontName, "normal");

  rows.forEach((row, ri) => {
    doc.setFillColor(...(ri % 2 === 0 ? COLORS.white : COLORS.lighter));
    doc.rect(startX, y, tableW, rowH, "F");

    // Bottom border
    doc.setDrawColor(...COLORS.light);
    doc.setLineWidth(0.2);
    doc.line(startX, y + rowH, startX + tableW, y + rowH);

    // Left & right border
    doc.line(startX, y, startX, y + rowH);
    doc.line(startX + tableW, y, startX + tableW, y + rowH);

    doc.setTextColor(...COLORS.dark);
    ox = startX;
    row.forEach((cell, ci) => {
      const align = textAlign[ci] || "left";
      const tx = align === "right" ? ox + columnWidths[ci] - 4 : align === "center" ? ox + columnWidths[ci] / 2 : ox + 4;
      doc.text(cell, tx, y + rowH / 2 + 2, { align, maxWidth: columnWidths[ci] - 8 });

      // Column divider
      if (ci < row.length - 1) {
        doc.setDrawColor(...COLORS.light);
        doc.setLineWidth(0.15);
        doc.line(ox + columnWidths[ci], y + 1, ox + columnWidths[ci], y + rowH - 1);
      }
      ox += columnWidths[ci];
    });
    y += rowH;
  });

  // Bottom border of last row
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.line(startX, y, startX + tableW, y);

  return y;
}

/* ================= MAIN ================= */
export function exportPricingPDF(params: {
  hotelName: string;
  packages: ExportPackageBlock[];
  preparedBy: string;
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;
  const margin = 14;
  const contentW = pageW - margin * 2;
  const fontName = "Prompt";

  return Promise.all([
    loadFont(doc, "/fonts/Prompt-Regular.ttf", fontName, "normal"),
    loadFont(doc, "/fonts/Prompt-Bold.ttf",    fontName, "bold"),
    loadImage("/logo/logo.png"),
  ])
    .then(([, , logoDataUrl]) => {
      doc.setFont(fontName);

      /* ========== HEADER — dark bar ========== */
      const headerH = 22;
      doc.setFillColor(...COLORS.headerBg);
      doc.rect(0, 0, pageW, headerH, "F");

      // Logo ซ้าย
      doc.addImage(logoDataUrl, "JPEG", margin, 3, 16, 16);

      // Company name ถัดจาก logo
      doc.setFont(fontName, "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLORS.white);
      doc.text("Hotel Plus+", margin + 20, 11);

      doc.setFont(fontName, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.footerText);
      doc.text("ผู้ช่วยโรงแรมมืออาชีพ บริหารรายได้ให้พลัส", margin + 20, 17);

      // "ใบประเมินค่าบริการ" ฝั่งขวา — ใหญ่ bold เหลือง
      doc.setFont(fontName, "bold");
      doc.setFontSize(22);
      doc.setTextColor(...COLORS.primary);
      doc.text("ใบประเมินค่าบริการ", pageW - margin, 15, { align: "right" });

      // Tagline ใต้ header bar
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, headerH, pageW, 1.5, "F");

      /* ========== INFO SECTION ========== */
      const infoY = headerH + 10;

      // ฝั่งซ้าย — ข้อมูลบริษัท
      doc.setFont(fontName, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      doc.text("บริษัท พักดีพลัส จำกัด", margin, infoY + 4);
      doc.text("92/5 อาคารสาธรธานี ชั้น 2 กรุงเทพมหานคร 10500 ", margin, infoY + 8);
      doc.text("Tel: (+66)82 898 9369  |  info@hotelplus.asia", margin, infoY + 12);

      // ฝั่งขวา — กล่อง invoice info
      const infoBoxW = 80;
      const infoBoxX = pageW - margin - infoBoxW;

      // Header ของ info box
      doc.setFillColor(...COLORS.headerBg);
      doc.rect(infoBoxX, infoY, infoBoxW, 8, "F");
      doc.setFont(fontName, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.white);
      doc.text("ข้อมูลเอกสาร", infoBoxX + 4, infoY + 5.5);

      // Rows ของ info box
      const infoRows = [
        ["ชื่อโรงแรม", params.hotelName],
        ["วันที่ออกเอกสาร", new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })],
      ];

      infoRows.forEach((row, ri) => {
        const ry = infoY + 8 + ri * 8;
        doc.setFillColor(...(ri % 2 === 0 ? COLORS.lighter : COLORS.white));
        doc.rect(infoBoxX, ry, infoBoxW, 8, "F");
        doc.setDrawColor(...COLORS.light);
        doc.setLineWidth(0.2);
        doc.rect(infoBoxX, ry, infoBoxW, 8, "S");

        doc.setFont(fontName, "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.medium);
        doc.text(row[0], infoBoxX + 3, ry + 5);

        doc.setFont(fontName, "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.dark);
        doc.text(row[1], infoBoxX + infoBoxW - 3, ry + 5, { align: "right" });
      });

      // Divider
      const dividerY = infoY + 8 + infoRows.length * 8 + 5;
      doc.setDrawColor(...COLORS.light);
      doc.setLineWidth(0.3);
      doc.line(margin, dividerY, pageW - margin, dividerY);

      let cursorY = dividerY + 10;

      /* ========== PACKAGES ========== */
      params.packages.forEach((pkg, index) => {
        const estimated = 14 + 10 + pkg.rows.length * 9 + 14 + 20;
        if (cursorY + estimated > pageH - 25) {
          doc.addPage();
          doc.setFont(fontName);
          cursorY = 12;
        }

        // Package title row — dark bg + yellow text
        doc.setFillColor(...COLORS.headerBg);
        doc.rect(margin, cursorY, contentW, pkg.description ? 16 : 10, "F");

        // Yellow left accent
        doc.setFillColor(...COLORS.primary);
        doc.rect(margin, cursorY, 3, pkg.description ? 16 : 10, "F");

        doc.setFont(fontName, "bold");
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.primary);
        doc.text(`${index + 1}.  ${pkg.packageName}`, margin + 7, cursorY + (pkg.description ? 6 : 7));

        if (pkg.description) {
          doc.setFont(fontName, "normal");
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.lighter);
          doc.text(pkg.description, margin + 7, cursorY + 12);
          cursorY += 19;
        } else {
          cursorY += 13;
        }

        // Table
        cursorY = drawTable(doc, {
          startY: cursorY,
          headers: ["รายการ", "ราคา (บาท)"],
          rows: pkg.rows.map(r => [r.label, r.value]),
          columnWidths: [120, 62],
          textAlign: ["left", "right"],
        }, fontName);

        cursorY += 2;

        // Total row — yellow bg
        doc.setFillColor(...COLORS.totalBg);
        doc.rect(margin, cursorY, contentW, 11, "F");

        doc.setFont(fontName, "bold");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.dark);
        doc.text(pkg.totalLabel, margin + 120 - 4, cursorY + 7.5, { align: "right" });

        doc.setFontSize(15);
        doc.setTextColor(...COLORS.dark);
        doc.text(pkg.totalValue, margin + contentW - 4, cursorY + 7.5, { align: "right" });

        cursorY += 18;

        // Separator
        if (index < params.packages.length - 1) {
          doc.setDrawColor(...COLORS.light);
          doc.setLineWidth(0.3);
          doc.line(margin, cursorY, pageW - margin, cursorY);
          cursorY += 8;
        }

        cursorY += 8;
        // Conditions (ถ้ามี)
        if (pkg.conditions && pkg.conditions.length > 0) {
          doc.setFont(fontName, "normal");
          doc.setFontSize(10);
          pkg.conditions.forEach((line, i) => {
            if (i === 0) {
              doc.setFont(fontName, "bold");
              doc.setTextColor(...COLORS.dark);
            } else {
              doc.setFont(fontName, "normal");
              doc.setTextColor(...COLORS.medium);
            }
            const wrapped = doc.splitTextToSize(line, contentW);
            doc.text(wrapped, margin, cursorY);
            cursorY += wrapped.length * 5;
          });
          cursorY += 4;
        }
      });

      /* ========== FOOTER ========== */
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);

        // Bottom bar
        doc.setFillColor(...COLORS.headerBg);
        doc.rect(0, pageH - 16, pageW, 16, "F");

        // Yellow accent line บนสุดของ footer
        doc.setFillColor(...COLORS.primary);
        doc.rect(0, pageH - 16, pageW, 1, "F");

        // ฝั่งซ้าย — preparedBy
        doc.setFont(fontName, "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.footerText);
        doc.text("จัดทำโดย", margin, pageH - 9);

        doc.setFont(fontName, "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text(params.preparedBy, margin, pageH - 4);

        // กึ่งกลาง — หมายเหตุ
        doc.setFont(fontName, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.footerText);
        doc.text(
          "หมายเหตุ: ราคานี้เป็นการประเมินเบื้องต้น บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลง",
          pageW / 2, pageH - 6, { align: "center" }
        );

        // ฝั่งขวา — เลขหน้า
        doc.setFont(fontName, "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.footerText);
        doc.text(`${i} / ${total}`, pageW - margin, pageH - 4, { align: "right" });
      }

      /* ========== SAVE ========== */
      const fileName = `pricing_${params.hotelName.replace(/[^a-zA-Z0-9ก-๙]/g, "_")}_${Date.now()}.pdf`;
      doc.save(fileName);
    })
    .catch(err => {
      console.error("PDF Error:", err);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF");
    });
}