const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());



function buildSourceQuery(sources = []) {
  const map = {
    facebook: "site:facebook.com",
    facebook_reels: "facebook reel",
    tiktok: "site:tiktok.com",
  };

  const queries = sources.map(s => map[s]).filter(Boolean);

  if (queries.length === 0) return "";

  return `(${queries.join(" OR ")})`;
}


app.post("/search-kols", async (req, res) => {
  const { keyword, sources } = req.body;

  const sourceQuery = buildSourceQuery(sources);
  const finalQuery = `${keyword} ${sourceQuery}`.trim();

  console.log("SEARCH:", finalQuery);

  try {
    const MAX_PAGES = 20;   // 👈 20 หน้า
    const PAGE_SIZE = 10;  // 1 หน้า = 10 results
    const DELAY_MS = 700;  // หน่วงกัน SerpAPI

    const results = [];

    for (let i = 0; i < MAX_PAGES; i++) {
      const start = i * PAGE_SIZE;

      try {
        const response = await axios.get(
          "https://serpapi.com/search.json",
          {
            timeout: 10000,
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

        if (pageResults.length === 0) {
          break; // 🔥 ไม่มีผลแล้ว หยุดทันที
        }

        results.push(
          ...pageResults.map(r => ({
            title: r.title,
            url: r.link,
            snippet: r.snippet,
          }))
        );

        await new Promise(r => setTimeout(r, DELAY_MS));
      } catch (err) {
        console.log("STOP AT PAGE", i + 1);
        break;
      }
    }

    res.json(results);

  } catch (err) {
    if (err.response) {
      console.log("SERP STATUS:", err.response.status);
      console.log("SERP DATA:", err.response.data);
    } else {
      console.log("SERP ERROR:", err.message);
    }
    res.status(500).json({ error: "Google search failed" });
  }

});





app.listen(5000, () => console.log("🚀 Server running on port 5000"));
