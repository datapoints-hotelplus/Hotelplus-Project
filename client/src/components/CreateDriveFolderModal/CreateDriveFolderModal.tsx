import { useState } from "react";
import Loading from "../Loading/Loading";
import "./CreateDriveFolderModal.css";

interface Props {
  disabled?: boolean;
  onCreated: (folder: { id: string; name: string }) => void;
}

export default function CreateDriveFolderModal({
  disabled,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setName("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("กรุณาใส่ชื่อโฟลเดอร์");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/drive/folders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );

      if (!res.ok) throw new Error("create folder failed");

      const folder = await res.json();
      onCreated(folder);
      close();
    } catch (err) {
      console.error(err);
      alert("สร้างโฟลเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button disabled={disabled}
        onClick={() => setOpen(true)}
        className="create-folder-btn"
      >
        + Folders
      </button>

      {open && (
        <>
          {/* modal */}
          <div className="modal-backdrop" onClick={close}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>สร้างโฟลเดอร์ใหม่</h3>

              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อโฟลเดอร์"
                disabled={loading}
              />

              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={close}
                  disabled={loading}
                >
                  ยกเลิก
                </button>

                <button
                  className="modal-btn primary"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  สร้าง
                </button>
              </div>

            </div>
          </div>

          {/* loading overlay */}
          <Loading show={loading} text="กำลังสร้างโฟลเดอร์..." />
        </>
      )}
    </>
  );
}
