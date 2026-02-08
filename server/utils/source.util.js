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
  return "generic";
}

module.exports = { buildSourceQuery, detectSource };
