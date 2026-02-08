const axios = require("axios");
const { buildSourceQuery, detectSource } = require("../utils/source.util");

async function searchKols({ keyword, sources = [] }) {
  const sourceQuery = buildSourceQuery(sources);
  const finalQuery = `${keyword} ${sourceQuery}`.trim();

  console.log("SEARCH:", finalQuery);
  
  const MAX_PAGES = 1;
  const PAGE_SIZE = 10;

  const seen = new Set();
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
      if (!r.link || seen.has(r.link)) continue;

      seen.add(r.link);

      results.push({
        order: results.length + 1,
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        source: detectSource(r.link),
      });
    }
  }

  return results;
}

module.exports = { searchKols };
