const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("❌ OPENROUTER_API_KEY is missing");
}

async function callOpenRouter(payload, retry = 2) {
  try {
    return await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        timeout: 60_000,
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000", // ใส่ไว้ปลอดภัย
          "X-Title": "Hotelplus AI Analyzer"
        }
      }
    );
  } catch (err) {
    if (retry > 0 && err.code === "ECONNRESET") {
      console.warn("เกิขข้อผิดพลาดกำลังเรียกใหม่...");
      return callOpenRouter(payload, retry - 1);
    }
    throw err;
  }
}

module.exports = { callOpenRouter };
