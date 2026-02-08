const express = require("express");
const router = express.Router();

const { searchKols } = require("../services/serp.service");
const { uploadCsvToDrive } = require("../services/drive.service");
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
    const results = await searchKols({ keyword, sources });

    // ⭐ สร้าง CSV
    const csv = generateCsv(results);

    const sourceName = sources[0] || "all";
    const filename = `kols_${sourceName}_${keyword}.csv`;

    // ⭐ upload เข้า Drive
    const savedFile = await uploadCsvToDrive({
      folderId,
      filename,
      csv,
    });

    res.json({
      results,
      savedFile,
    });
  } catch (err) {
    console.error("SEARCH+UPLOAD ERROR:", err.message);
    res.status(500).json({ error: "Search or upload failed" });
  }
});

module.exports = router;
