import "./Loading.css";

interface LoadingProps {
  show: boolean;
  text?: string;
}

export default function Loading({ show, text }: LoadingProps) {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner" />
        <p>{text || "กำลังโหลด..."}</p>
      </div>
    </div>
  );
}
