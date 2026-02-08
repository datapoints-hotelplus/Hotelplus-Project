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
function resultsToCsv(results = []) {
  const header = ["order", "source", "title", "snippet", "url"];
  const rows = results.map((r) => [
    r.order,
    r.source,
    r.title,
    r.snippet,
    r.url,
  ]);

  return [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}



module.exports = { generateCsv , resultsToCsv};
