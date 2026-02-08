const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

function buildSourceQuery(sources = []) {
  const map = {
    facebook: "site:facebook.com",
    facebook_reels: "facebook_reels",
    tiktok: "site:tiktok.com",
  };

  const queries = sources.map(s => map[s]).filter(Boolean);
  if (queries.length === 0) return "";
  return `(${queries.join(" OR ")})`;
}

function detectSource(url = "") {
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("tiktok.com")) return "tiktok";
  return "ทั่วไป";
}

app.post("/search-kols", async (req, res) => {
  const { keyword, sources = [] } = req.body;

  if (!keyword?.trim()) {
    return res.json([]);
  }

  const sourceQuery = buildSourceQuery(sources);
  const finalQuery = `${keyword} ${sourceQuery}`.trim();

  console.log("SEARCH:", finalQuery);

  try {
    const MAX_PAGES = 3;     // ดึงสูงสุด 100 รายการ
    const PAGE_SIZE = 10;
    const DELAY_MS = 600;

    const seen = new Set();   // กัน URL ซ้ำ
    const results = [];

    for (let i = 0; i < MAX_PAGES; i++) {
      const start = i * PAGE_SIZE;

      const response = await axios.get(
        "https://serpapi.com/search.json",
        {
          timeout: 45000,
          params: {
            engine: "google",
            q: finalQuery,
            api_key: process.env.SERP_API_KEY,
            hl: "th",
            gl: "th",
            google_domain: "google.co.th",
            num: PAGE_SIZE,
            start,
          },
        }
      );

      const pageResults = response.data.organic_results || [];
      if (pageResults.length === 0) break;

      for (const r of pageResults) {
        if (!r.link) continue;
        if (seen.has(r.link)) continue;

        seen.add(r.link);

        results.push({
          order: results.length + 1, // ⭐ ลำดับจริงจาก backend
          title: r.title,
          url: r.link,
          snippet: r.snippet,
          source: detectSource(r.link),
        });
      }
    }

    res.json(results);

  } catch (err) {
    console.error("SERP ERROR:", err.message);
    res.status(500).json({ error: "Google search failed" });
  }
});

const { Parser } = require("json2csv");

app.post("/export-csv", (req, res) => {
  const { results = [] } = req.body;

  if (results.length === 0) {
    return res.status(400).json({ error: "No data to export" });
  }

  const rows = results.map(r => ({
    source: r.source || "ทั่วไป",
    order: r.order,
    title: r.title,
    snippet: r.snippet,
    url: r.url,
  }));

  const parser = new Parser({
    fields: ["source", "order", "title", "snippet", "url"],
  });

  const csv = parser.parse(rows);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send("\uFEFF" + csv); // BOM กัน Excel ภาษาไทยพัง
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
