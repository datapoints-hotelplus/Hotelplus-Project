import { useState } from "react";
import { searchKols } from "../../lib/api";



export default function Kols() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);  

  const handleSearch = async () => {
  if (!keyword.trim()) return;
  if (loading) return;

  setLoading(true);
  setResults([]);

  try {
    const data = await searchKols(keyword, source ? [source] : []);

    if (Array.isArray(data)) {
      setResults(data);
    } else {
      console.error("Search failed:", data);
      setResults([]);
    }
  } catch (err) {
    console.error(err);
    setResults([]);
  } finally {
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
              onChange={() => setSource("")}
            />
            ค้นหาทั่วไป
          </label>

          <label>
            <input
              type="radio"
              name="source"
              disabled={loading}   // 👈 เพิ่ม
              checked={source === "facebook"}
              onChange={() => setSource("facebook")}
            />
            Facebook
          </label>


          <label>
            <input
              type="radio"
              name="source"
              disabled={loading}   // 👈 เพิ่ม
              checked={source === "facebook_reels"}
              onChange={() => setSource("facebook_reels")}
            />
            Facebook Reels&Videos
          </label>

          <label>
            <input
              type="radio"
              name="source"
              disabled={loading}   // 👈 เพิ่ม
              checked={source === "tiktok"}
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

        {loading && <p>กำลังค้นหา...</p>}

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
