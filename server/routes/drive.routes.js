const express = require("express");
const router = express.Router();
const { listFiles } = require("../services/drive.service");

router.get("/files", async (req, res) => {
  try {
    const files = await listFiles(
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subfiles/:folderId", async (req, res) => {
  try {
    const files = await listFiles(req.params.folderId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
