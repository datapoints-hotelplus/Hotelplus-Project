const axios = require("axios");

async function callOpenRouter({ model, messages }) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    { model, messages },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message;
}

module.exports = { callOpenRouter };
