const express = require("express");
const cors = require("cors");
const axios = require("axios");
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

/* ================= QUEUE ================= */

const jobQueue = [];
const jobResults = {};
let isProcessing = false;

async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;

  isProcessing = true;
  const job = jobQueue.shift();

  try {
    const result = await job.task();
    jobResults[job.id] = {
      status: "done",
      data: result,
    };
  } catch (err) {
    jobResults[job.id] = {
      status: "error",
      error: err.message,
    };
  } finally {
    isProcessing = false;
    processQueue();
  }
}

/* ================= API ================= */

app.post("/search-kols", (req, res) => {
  const { keyword, sources } = req.body;

  const sourceQuery = buildSourceQuery(sources);
  const finalQuery = `${keyword} ${sourceQuery}`.trim();

  const jobId = Date.now().toString();
  const position = jobQueue.length + (isProcessing ? 1 : 0);

  jobResults[jobId] = { status: "queued", position };

  jobQueue.push({
    id: jobId,
    task: async () => {
      console.log("PROCESS:", finalQuery);

      const MAX_PAGES = 20;
      const PAGE_SIZE = 10;
      const DELAY_MS = 700;
      const results = [];

      for (let i = 0; i < MAX_PAGES; i++) {
        const start = i * PAGE_SIZE;

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
        if (pageResults.length === 0) break;

        results.push(
          ...pageResults.map(r => ({
            title: r.title,
            url: r.link,
            snippet: r.snippet,
          }))
        );

        await new Promise(r => setTimeout(r, DELAY_MS));
      }

      return results;
    },
  });

  processQueue();

  res.json({
    status: "queued",
    jobId,
    position,
  });
});

app.get("/search-kols/result/:jobId", (req, res) => {
  const job = jobResults[req.params.jobId];
  if (!job) {
    return res.status(404).json({ status: "not_found" });
  }
  res.json(job);
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
