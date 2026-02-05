const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/search-kols", async (req, res) => {
  const { keyword } = req.body;

  try {
    const pages = [0, 10]; // หน้า 1 และ 2 (10 ผลต่อหน้า)
    const requests = pages.map(start =>
      axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google",
          q: keyword,
          api_key: process.env.SERP_API_KEY,
          hl: "th",        // ภาษา
          gl: "th",        // ประเทศ
          google_domain: "google.co.th",
          num: 10,
          start: start,
        },
      })
    );

    const responses = await Promise.all(requests);

    const allResults = responses.flatMap(r => r.data.organic_results || []);

    const results = allResults.map(r => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
    }));

    res.json(results);

  } catch (err) {
    console.log("SERP ERROR:", err.message);
    res.status(500).json({ error: "Google search failed" });
  }
});




app.listen(5000, () => console.log("🚀 Server running on port 5000"));
