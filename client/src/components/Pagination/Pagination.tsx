import "./Pagination.css";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  maxVisible?: number; // จำนวนปุ่มเลขที่แสดง
};

export default function Pagination({
  page,
  totalPages,
  onChange,
  maxVisible = 5,
}: Props) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, page - half);
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ←
      </button>

      {pages.map(p => (
        <button
          key={p}
          className={p === page ? "active" : ""}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        →
      </button>
    </div>
  );
}
