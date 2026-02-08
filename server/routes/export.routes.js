const express = require("express");
const router = express.Router();
const { exportCsv } = require("../services/csv.service");

router.post("/export-csv", (req, res) => {
  const { results = [] } = req.body;

  if (results.length === 0) {
    return res.status(400).json({ error: "No data to export" });
  }

  const csv = exportCsv(results);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send("\uFEFF" + csv);
});

module.exports = router;
