const express = require("express");
const router = express.Router();

const { searchKols } = require("../services/serp.service");
const { uploadCsv } = require("../services/drive.service");
const { generateCsv } = require("../utils/csv.util");

router.post("/search-kols", async (req, res) => {
  const { keyword, sources = [], folderId } = req.body;

  if (!keyword?.trim()) {
    return res.status(400).json({ error: "Missing keyword" });
  }

  if (!folderId) {
    return res.status(400).json({ error: "Missing folderId" });
  }

  try {
    // 1️⃣ SEARCH
    const results = await searchKols({ keyword, sources });

    // 2️⃣ GENERATE CSV
    const csvContent = generateCsv(results);

    const sourceName = sources[0] ?? "generic";
    const filename = `kols_${sourceName}_${keyword}.csv`;

    // 3️⃣ UPLOAD CSV → DRIVE
    const savedFile = await uploadCsv({
      folderId,
      filename,
      content: csvContent,
    });

    res.json({
      results,
      savedFile,
    });
  } catch (err) {
    console.error("SEARCH+UPLOAD ERROR:", err);
    res.status(500).json({ error: "Search or upload failed" });
  }
});

module.exports = router;
