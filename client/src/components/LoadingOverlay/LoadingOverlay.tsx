import "./LoadingOverlay.css";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({
  visible,
  message = "กำลังประมวลผล...",
  subMessage,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="spinner" />
        <p>{message}</p>
        {subMessage && <span>{subMessage}</span>}
      </div>
    </div>
  );
}
