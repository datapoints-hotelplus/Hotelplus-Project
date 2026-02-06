import { useState } from "react";
import { searchKols, getKolsResult } from "../../lib/api";

export default function Kols() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [queuePos, setQueuePos] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!keyword.trim() || loading) return;

    setLoading(true);
    setResults([]);
    setQueuePos(null);

    try {
      // 1️⃣ ส่ง search
      const res = await searchKols(keyword, source ? [source] : []);

      if (res.status !== "queued") {
        throw new Error("Invalid response");
      }

      setQueuePos(res.position);

      // 2️⃣ polling
      const jobId = res.jobId;
      const interval = setInterval(async () => {
        const result = await getKolsResult(jobId);

        if (result.status === "done") {
          clearInterval(interval);
          setResults(result.data);
          setLoading(false);
          setQueuePos(null);
        }

        if (result.status === "error") {
          clearInterval(interval);
          setLoading(false);
          alert("เกิดข้อผิดพลาดในการค้นหา");
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>ค้นหาเว็บไซต์จาก keyword</h2>

      <div>
        <label>
          <input
            type="radio"
            name="source"
            checked={source === ""}
            disabled={loading}
            onChange={() => setSource("")}
          />
          ค้นหาทั่วไป
        </label>

        <label>
          <input
            type="radio"
            name="source"
            checked={source === "facebook"}
            disabled={loading}
            onChange={() => setSource("facebook")}
          />
          Facebook
        </label>

        <label>
          <input
            type="radio"
            name="source"
            checked={source === "facebook_reels"}
            disabled={loading}
            onChange={() => setSource("facebook_reels")}
          />
          Facebook Reels
        </label>

        <label>
          <input
            type="radio"
            name="source"
            checked={source === "tiktok"}
            disabled={loading}
            onChange={() => setSource("tiktok")}
          />
          TikTok
        </label>
      </div>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="เช่น โรงแรมยอดนิยม"
      />

      <button disabled={loading} onClick={handleSearch}>
        ค้นหา
      </button>

      {loading && (
        <p>
          {queuePos !== null
            ? `อยู่ลำดับคิวที่ ${queuePos}`
            : "กำลังค้นหา..."}
        </p>
      )}

      <div>
        {results.map((item, index) => (
          <div key={item.url} style={{ marginTop: 20 }}>
            <h3>{index + 1}. {item.title}</h3>
            <p>{item.snippet}</p>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
