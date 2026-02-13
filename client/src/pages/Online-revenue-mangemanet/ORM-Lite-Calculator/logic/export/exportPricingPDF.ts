import jsPDF from "jspdf";
import type { ExportPackageBlock } from "./export.types";

/* ================= COLOR PALETTE ================= */
const COLORS = {
  brand: [30, 30, 30] as [number, number, number],          // Near-black
  brandLight: [60, 60, 60] as [number, number, number],     // Dark gray
  accent: [230, 190, 0] as [number, number, number],        // Bold gold/yellow
  dark: [20, 20, 20] as [number, number, number],           // Black text
  medium: [100, 100, 100] as [number, number, number],      // Medium gray
  light: [220, 215, 200] as [number, number, number],       // Warm light border
  lighter: [255, 252, 240] as [number, number, number],     // Cream alternating row
  white: [255, 255, 255] as [number, number, number],
  totalBg: [255, 245, 200] as [number, number, number],     // Light yellow total row
  headerBg: [30, 30, 30] as [number, number, number],       // Black table header
  headerText: [255, 220, 50] as [number, number, number],   // Yellow header text
  footerText: [120, 120, 120] as [number, number, number],
  packageBadgeBg: [255, 248, 220] as [number, number, number], // Light yellow badge
  packageBadgeText: [30, 30, 30] as [number, number, number],  // Black badge text
};

/* ================= HELPER: DRAW DECORATIVE LINE ================= */
function drawAccentLine(doc: jsPDF, x1: number, y: number, x2: number, thickness = 0.8) {
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(thickness);
  doc.line(x1, y, x2, y);
  // Add a subtle secondary line below
  doc.setDrawColor(...COLORS.brandLight);
  doc.setLineWidth(0.3);
  doc.line(x1, y + 1.2, x2, y + 1.2);
}

/* ================= HELPER: DRAW TABLE ================= */
interface TableConfig {
  startY: number;
  headers: string[];
  rows: string[][];
  columnWidths: number[];
  textAlign?: ("left" | "center" | "right")[];
}

function drawTable(doc: jsPDF, config: TableConfig): number {
  const {
    startY,
    headers,
    rows,
    columnWidths,
    textAlign = ["left", "right"],
  } = config;

  const margin = 14;
  const rowHeight = 9;
  const headerHeight = 11;
  const fontSize = 12;
  const headerFontSize = 12;
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const startX = margin;
  const cornerRadius = 1.5;

  let currentY = startY;

  // ===== HEADER with rounded top corners =====
  doc.setFillColor(...COLORS.headerBg);
  doc.setDrawColor(...COLORS.headerBg);
  doc.roundedRect(startX, currentY, tableWidth, headerHeight, cornerRadius, cornerRadius, "FD");
  // Fill bottom corners to be square (only top rounded)
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(startX, currentY + headerHeight - cornerRadius, tableWidth, cornerRadius, "F");

  doc.setTextColor(...COLORS.headerText);
  doc.setFontSize(headerFontSize);
  doc.setFont("THSarabun", "bold");

  let offsetX = startX;
  headers.forEach((header, i) => {
    const align = textAlign[i] || "center";
    const textX =
      align === "center"
        ? offsetX + columnWidths[i] / 2
        : align === "right"
          ? offsetX + columnWidths[i] - 4
          : offsetX + 4;
    doc.text(header, textX, currentY + headerHeight / 2 + 2, { align });
    offsetX += columnWidths[i];
  });

  currentY += headerHeight;

  // ===== ROWS =====
  doc.setFontSize(fontSize);
  doc.setFont("THSarabun", "normal");

  rows.forEach((row, rowIndex) => {
    const isLast = rowIndex === rows.length - 1;

    // Alternating background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...COLORS.lighter);
    } else {
      doc.setFillColor(...COLORS.white);
    }

    // Bottom corners rounded for last row
    if (isLast) {
      doc.roundedRect(startX, currentY, tableWidth, rowHeight, cornerRadius, cornerRadius, "F");
      doc.setFillColor(rowIndex % 2 === 0 ? COLORS.lighter[0] : 255, rowIndex % 2 === 0 ? COLORS.lighter[1] : 255, rowIndex % 2 === 0 ? COLORS.lighter[2] : 255);
      doc.rect(startX, currentY, tableWidth, rowHeight - cornerRadius, "F");
    } else {
      doc.rect(startX, currentY, tableWidth, rowHeight, "F");
    }

    // Border
    doc.setDrawColor(...COLORS.light);
    doc.setLineWidth(0.2);
    doc.line(startX, currentY + rowHeight, startX + tableWidth, currentY + rowHeight);

    // Side borders
    doc.line(startX, currentY, startX, currentY + rowHeight);
    doc.line(startX + tableWidth, currentY, startX + tableWidth, currentY + rowHeight);

    // Text
    doc.setTextColor(...COLORS.dark);
    offsetX = startX;
    row.forEach((cell, cellIndex) => {
      const align = textAlign[cellIndex] || "left";
      const textX =
        align === "center"
          ? offsetX + columnWidths[cellIndex] / 2
          : align === "right"
            ? offsetX + columnWidths[cellIndex] - 4
            : offsetX + 4;
      doc.text(cell, textX, currentY + rowHeight / 2 + 2, {
        align,
        maxWidth: columnWidths[cellIndex] - 8,
      });

      // Column divider (subtle)
      if (cellIndex < row.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.15);
        doc.line(
          offsetX + columnWidths[cellIndex],
          currentY + 2,
          offsetX + columnWidths[cellIndex],
          currentY + rowHeight - 2
        );
      }

      offsetX += columnWidths[cellIndex];
    });

    currentY += rowHeight;
  });

  return currentY;
}

/* ================= HELPER: DRAW PACKAGE BADGE ================= */
function drawPackageBadge(doc: jsPDF, label: string, x: number, y: number, index: number) {
  const badgeWidth = doc.getTextWidth(label) + 14;
  const badgeHeight = 9;

  doc.setFillColor(...COLORS.packageBadgeBg);
  doc.roundedRect(x, y, badgeWidth, badgeHeight, 2, 2, "F");

  // Left accent bar
  doc.setFillColor(...COLORS.brand);
  doc.rect(x, y + 1, 2.5, badgeHeight - 2, "F");

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.packageBadgeText);
  doc.text(`${index + 1}. ${label}`, x + 6, y + badgeHeight / 2 + 2.5);

  return y + badgeHeight + 4;
}

/* ================= MAIN EXPORT FUNCTION ================= */

export function exportPricingPDF(params: {
  hotelName: string;
  packages: ExportPackageBlock[];
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const fontUrl = "/fonts/THSarabunNew.ttf";

  return fetch(fontUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      const uint8Array = new Uint8Array(buffer);
      let binaryString = "";
      const chunkSize = 32768;

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }

      const fontBase64 = btoa(binaryString);
      doc.addFileToVFS("THSarabun.ttf", fontBase64);
      doc.addFont("THSarabun.ttf", "THSarabun", "normal");
      doc.addFont("THSarabun.ttf", "THSarabun", "bold");
      doc.setFont("THSarabun");

      /* ========== HEADER BANNER ========== */

      // Top accent bar
      doc.setFillColor(...COLORS.brand);
      doc.rect(0, 0, pageWidth, 4, "F");

      // Title
      doc.setFontSize(24);
      doc.setFont("THSarabun", "bold");
      doc.setTextColor(...COLORS.brand);
      doc.text("ใบประเมินค่าบริการ", pageWidth / 2, 18, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("THSarabun", "normal");
      doc.setTextColor(...COLORS.medium);
      doc.text("Pricing Proposal", pageWidth / 2, 24, { align: "center" });

      // Decorative line under title
      drawAccentLine(doc, margin, 28, pageWidth - margin, 0.6);

      // Hotel name & date info box
      const infoBoxY = 33;
      doc.setFillColor(...COLORS.lighter);
      doc.roundedRect(margin, infoBoxY, contentWidth, 16, 2, 2, "F");

      // Left side - hotel
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.medium);
      doc.text("ชื่อโรงแรม", margin + 5, infoBoxY + 6);

      doc.setFont("THSarabun", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.dark);
      doc.text(params.hotelName, margin + 5, infoBoxY + 12);

      // Right side - date
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.medium);
      doc.text("วันที่ออกเอกสาร", pageWidth - margin - 5, infoBoxY + 6, { align: "right" });

      doc.setFont("THSarabun", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.dark);
      doc.text(
        new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        pageWidth - margin - 5,
        infoBoxY + 12,
        { align: "right" }
      );

      let cursorY = infoBoxY + 22;

      /* ========== LOOP PACKAGES ========== */

      params.packages.forEach((pkg, index) => {
        // Check for page break - need space for badge + header + at least 3 rows + total
        const estimatedHeight = 11 + 11 + pkg.rows.length * 9 + 14 + 20;
        if (cursorY + estimatedHeight > pageHeight - 30) {
          doc.addPage();
          doc.setFont("THSarabun");
          // Add top bar on new pages too
          doc.setFillColor(...COLORS.brand);
          doc.rect(0, 0, pageWidth, 2, "F");
          cursorY = 12;
        }

        /* ----- Package Badge ----- */
        cursorY = drawPackageBadge(doc, pkg.packageName, margin, cursorY, index);

        /* ----- Detail Table ----- */
        cursorY = drawTable(doc, {
          startY: cursorY,
          headers: ["รายการ", "ราคา (บาท)"],
          rows: pkg.rows.map((r) => [r.label, r.value]),
          columnWidths: [120, 62],
          textAlign: ["left", "right"],
        });

        cursorY += 2;

        /* ----- Total Section ----- */
        doc.setFillColor(...COLORS.totalBg);
        doc.setDrawColor(...COLORS.accent);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cursorY, contentWidth, 12, 2, 2, "FD");

        // Left accent stripe
        doc.setFillColor(...COLORS.accent);
        doc.rect(margin, cursorY + 1.5, 3, 9, "F");

        doc.setFont("THSarabun", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.dark);
        doc.text(pkg.totalLabel, margin + 124 - 4, cursorY + 8, { align: "right" });

        doc.setFontSize(18);
        doc.setTextColor(...COLORS.accent);
        doc.text(pkg.totalValue, margin + contentWidth - 4, cursorY + 8, { align: "right" });

        cursorY += 20;

        // Separator between packages
        if (index < params.packages.length - 1) {
          doc.setDrawColor(...COLORS.light);
          doc.setLineWidth(0.2);
          const dashLen = 2;
          const gapLen = 2;
          for (let dx = margin; dx < pageWidth - margin; dx += dashLen + gapLen) {
            doc.line(dx, cursorY, Math.min(dx + dashLen, pageWidth - margin), cursorY);
          }
          cursorY += 8;
        }
      });

      /* ========== FOOTER ========== */

      const totalPages = doc.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("THSarabun", "normal");

        // Bottom accent bar
        doc.setFillColor(...COLORS.brand);
        doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

        // Footer text
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.footerText);

        doc.text(
          "หมายเหตุ: ราคานี้เป็นการประเมินเบื้องต้น บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลง",
          pageWidth / 2,
          pageHeight - 14,
          { align: "center" }
        );

        // Company name
        doc.setFont("THSarabun", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.brand);
        doc.text("HotelPlus Co., Ltd.", pageWidth / 2, pageHeight - 8, {
          align: "center",
        });

        // Page number
        doc.setFont("THSarabun", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.footerText);
        doc.text(
          `${i} / ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      /* ========== SAVE ========== */
      const fileName = `pricing_${params.hotelName.replace(/[^a-zA-Z0-9ก-๙]/g, "_")}_${Date.now()}.pdf`;
      doc.save(fileName);
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF");
    });
}
