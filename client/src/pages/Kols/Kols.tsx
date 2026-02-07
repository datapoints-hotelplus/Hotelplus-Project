import { useState, useMemo } from "react";
import { searchKols } from "../../lib/api";
import Pagination from "../../components/Pagination/Pagination";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import "./Kols.css";

const PAGE_SIZE = 10;

export default function Kols() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  const currentResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const handleSearch = async () => {
    if (!keyword.trim() || loading) return;

    setLoading(true);
    setPage(1);
    setResults([]);

    try {
      const data = await searchKols(keyword, source ? [source] : []);
      if (Array.isArray(data)) {
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kols-container">
      <h2>ค้นหาเว็บไซต์จาก keyword</h2>

      {/* radio */}
      <div className="source-filter">
        <label className="radio-card">
          <input
            type="radio"
            name="source"
            checked={source === ""}
            onChange={() => setSource("")}
          />
          <span>ค้นหาทั่วไป</span>
        </label>

        <label className="radio-card">
          <input
            type="radio"
            name="source"
            disabled={loading}
            checked={source === "facebook"}
            onChange={() => setSource("facebook")}
          />
          <span>Facebook</span>
        </label>

        <label className="radio-card">
          <input
            type="radio"
            name="source"
            disabled={loading}
            checked={source === "facebook_reels"}
            onChange={() => setSource("facebook_reels")}
          />
          <span>Facebook Reels & Videos</span>
        </label>

        <label className="radio-card">
          <input
            type="radio"
            name="source"
            disabled={loading}
            checked={source === "tiktok"}
            onChange={() => setSource("tiktok")}
          />
          <span>TikTok</span>
        </label>
      </div>


      {/* search bar */}
      <div className="search-bar">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="เช่น โรงแรมยอดนิยม"
        />
        <button disabled={loading} onClick={handleSearch}>
          search
        </button>
      </div>

      {loading && <p className="loading-text">กำลังค้นหา...</p>}

      {/* result */}
      {currentResults.length > 0 && (
        <>
          <table className="kols-table">
            <thead>
              <tr>
                <th className="table-ranking">ลำดับ</th>
                <th>แหล่งที่มา</th>
                <th>ชื่อเรื่อง</th>
                <th>รายละเอียด</th>
                <th>ลิงก์</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.map((item) => (
                <tr key={item.order}>
                  <td>{item.order}</td>
                  <td>{item.source || "ทั่วไป"}</td>
                  <td>{item.title}</td>
                  <td>{item.snippet}</td>
                  <td>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </table>



        </>
      )}
      <LoadingOverlay
        visible={loading}
        message={`กำลังค้นหา "${keyword}"`}
        subMessage={source ? `แหล่งที่มา: ${source}` : undefined}
      />

    </div>
  );
}
