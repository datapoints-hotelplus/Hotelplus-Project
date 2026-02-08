const express = require("express");
const router = express.Router();
const { callOpenRouter } = require("../services/openrouter.service");
const { downloadFile } = require("../services/drive.service");

async function buildFilesContext(files) {
  let context = "";

  for (const file of files) {
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

router.post("/analyze", async (req, res) => {
  const { files = [], prompt = "", model } = req.body;

  try {
    const filesContext = await buildFilesContext(files);

    const aiMessage = await callOpenRouter({
      model: model || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a data analyst." },
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

module.exports = router;
