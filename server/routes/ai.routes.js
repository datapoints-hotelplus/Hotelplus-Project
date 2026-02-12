const express = require("express");
const router = express.Router();
const { callOpenRouter } = require("../services/openrouter.service");
const { downloadFile, uploadCsv } = require("../services/drive.service");


/* =========================
   Utils
========================= */

function csvToRows(csv = "") {
  return csv
    .split("\n")
    .map(r => r.trim())
    .filter(Boolean);
}

function chunkArray(arr, size = 30) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// key = ชื่อเพจ + ลิงก์
function getDedupeKey(csvLine = "") {
  const cols = csvLine.split(",");
  return `${cols[0]}|${cols[1]}`;
}

// ดึง content จาก OpenRouter response แบบปลอดภัย
function extractContent(aiResponse) {
  return aiResponse?.data?.choices?.[0]?.message?.content || "";
}

function isEmptyCsvRow(line = "") {
  // เอา quote, comma, tab, space ออก
  const cleaned = line.replace(/["',\t ]/g, "");
  return cleaned.length === 0;
}


/* =========================
   Route
========================= */

router.post("/analyze", async (req, res) => {
  const { files = [], masterPrompt = "", model, folderId } = req.body;
  console.log("AI MODEL USED:", model);


  try {
    // header ใส่ครั้งเดียว
    const finalRows = [
      "ชื่อเพจ / ช่อง,ลิงก์เพจ,หมวดหมู่,เหตุผลที่เลือก"
    ];


    const seen = new Set();

    for (const file of files) {
      if (!file?.name?.endsWith(".csv")) continue;

      const csvText = await downloadFile(file.id);
      const rows = csvToRows(csvText);

      // ไม่มี data
      if (rows.length <= 1) continue;

      // ตัด header ออกก่อนส่ง AI
      const dataRows = rows.slice(1);
      const chunks = chunkArray(dataRows, 30);

      for (const chunk of chunks) {
        const aiResponse = await callOpenRouter({
          model,
          messages: [
            {
              role: "system",
              content: masterPrompt
            },
            {
              role: "user",
              content: `
INPUT CSV (NO HEADER):
${chunk.join("\n")}

Rules:
- แสดงผลลัพธ์เป็น CSV เท่านั้น (Comma Separated Values)
- ห้ามใช้ Markdown Table
- ห้ามใส่ Header ซ้ำ
- ห้ามมีข้อความอื่นนอก CSV
รูปแบบผลลัพธ์ (ตัวอย่าง 1 แถว):
ชื่อเพจ / ช่อง,ลิงก์เพจ,หมวดหมู่,เหตุผลที่เลือก

`
            }
          ]
        });

        const rawContent = extractContent(aiResponse)
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```/g, "")
          .trim();


        // กัน AI ไม่ตอบอะไรมา
        if (!rawContent) continue;

        const lines = rawContent
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean);

        for (const line of lines) {
          // กัน AI หลุด header
          if (line.startsWith("ชื่อเพจ")) continue;
          if (line.startsWith("```")) continue;
          if (isEmptyCsvRow(line)) continue; // ⭐ ตัวนี้สำคัญ



          const key = getDedupeKey(line);
          if (seen.has(key)) continue;

          seen.add(key);
          finalRows.push(line);
        }
      }
    }

    if (folderId && finalRows.length > 1) {
      await uploadCsv({
        folderId,
        filename: "kols_final.csv",
        content: "\uFEFF" + finalRows.join("\n"),
      });
    }

    res.json({
      role: "assistant",
      content: finalRows.join("\n"),
      status: {
        analyzed: true,
        uploaded: Boolean(folderId)
      }
    });


  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({ error: "AI failed" });
  }
});



module.exports = router;
