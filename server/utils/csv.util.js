const { Parser } = require("json2csv");

function generateCsv(results = []) {
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

  return "\uFEFF" + parser.parse(rows); // BOM กัน Excel ไทย
}

module.exports = { generateCsv };
