import { useState } from "react";
import { searchKols } from "../../lib/api";

export default function Kols() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    const data = await searchKols(keyword);
    setResults(data);
  };

  return (
    <div>
      <h2>ค้นหาเว็บไซต์จาก keyword</h2>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="เช่น โรงแรมยอดนิยม"
      />

      <button onClick={handleSearch}>ค้นหา</button>

      <div>
        {results.map((item) => (
          <div key={item.url} style={{ marginTop: 20 }}>
            <h3>{item.title}</h3>
            <p>{item.snippet}</p>
            <a href={item.url} target="_blank">ไปที่เว็บ</a>
          </div>
        ))}
      </div>
    </div>
  );
}
