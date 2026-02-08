const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

async function callOpenRouter({ model, messages }) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message;
}
const drive = google.drive("v3");

async function downloadFile(fileId) {
  const res = await drive.files.get(
    {
      fileId,
      alt: "media",
      key: process.env.GOOGLE_API_KEY
    },
    { responseType: "text" }
  );

  return res.data;
}

// ⭐ MISSING FUNCTION (ตัวนี้สำคัญมาก)
async function buildFilesContext(files) {
  let context = "";

  for (const file of files) {
    // ตอนนี้รองรับ CSV อย่างเดียวก่อน
    if (file.name.endsWith(".csv")) {
      const text = await downloadFile(file.id);

      context += `
----- FILE: ${file.name} -----
${text}

`;
    }
  }

  return context || "No readable file content.";
}

app.get("/api/drive/files", async (req, res) => {
  const ROOT_FOLDER_ID =
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  try {
    const response = await drive.files.list({
      q: `'${ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,webViewLink)",
      key: process.env.GOOGLE_API_KEY
    });

    res.json(response.data.files);
  } catch (err) {
    console.error("DRIVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/drive/subfiles/:folderId", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${req.params.folderId}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,webViewLink)",
      key: process.env.GOOGLE_API_KEY
    });

    res.json(response.data.files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/analyze", async (req, res) => {
  const { files = [], prompt = "", model } = req.body;

  try {
    const filesContext = await buildFilesContext(files);

    const aiMessage = await callOpenRouter({
      model: model || "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a data analyst."
        },
        {
          role: "user",
          content: `
          FILES CONTENT:
          ${filesContext}

          USER QUESTION:
          ${prompt}
          `
        }
      ]
    });

    res.json(aiMessage);

  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});


app.listen(5000, () =>
  console.log("🚀 Server running on port 5000")
);
