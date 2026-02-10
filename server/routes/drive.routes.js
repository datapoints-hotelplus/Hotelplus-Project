const express = require("express");
const router = express.Router();
const { listFiles, createFolder, deleteFile ,canAccess} = require("../services/drive.service");

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

/* ===== CREATE FOLDER ===== */
router.post("/folders", async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const folder = await createFolder(
      name,
      parentId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
    );

    res.json(folder);
  } catch (err) {
    console.error("CREATE FOLDER ERROR 👉", err.errors || err.message);
    res.status(500).json({ error: err.message });
  }
});



router.delete("/files/:fileId", async (req, res) => {
  try {
    console.log("DELETE FILE ID 👉", req.params.fileId);
    await deleteFile(req.params.fileId);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR FULL 👉", err);
    res.status(500).json({ error: err.message });
  }
});





router.get("/debug/:fileId", async (req, res) => {
  try {
    const data = await canAccess(req.params.fileId);
    res.json(data);
  } catch (err) {
    console.error("DEBUG ERROR 👉", err.message);
    res.status(500).json({ error: err.message });
  }
});






module.exports = router;
