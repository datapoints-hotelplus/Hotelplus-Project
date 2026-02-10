import { useEffect, useState } from "react";
import CreateDriveFolderModal from "../../../components/CreateDriveFolderModal/CreateDriveFolderModal";
import Loading from "../../../components/Loading/Loading";
import "./DriveFolders.css";

export default function DriveFolders() {
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);



    const loadFolders = async (folderId: string | null = null) => {
        setLoading(true);

        const url = folderId
            ? `${import.meta.env.VITE_API_URL}/api/drive/subfiles/${folderId}`
            : `${import.meta.env.VITE_API_URL}/api/drive/files`;

        const res = await fetch(url);
        const data = await res.json();

        setFolders(data);
        setLoading(false);
    };

    const handleItemClick = (item: any) => {
        if (item.mimeType === "application/vnd.google-apps.folder") {
            setCurrentFolderId(item.id);
        } else if (item.webViewLink) {
            window.open(item.webViewLink, "_blank");
        }
    };

    const handleDelete = async (item: any, e: React.MouseEvent) => {
        e.stopPropagation(); // กันไม่ให้ trigger click เข้าโฟลเดอร์

        const ok = window.confirm(`ลบ "${item.name}" ใช่ไหม?`);
        if (!ok) return;

        await fetch(
            `${import.meta.env.VITE_API_URL}/api/drive/files/${item.id}`,
            { method: "DELETE" }

        );


        loadFolders(currentFolderId);
    };




    useEffect(() => {
        loadFolders(currentFolderId);
    }, [currentFolderId]);



    return (
        <div className="drive-folders">
            <h2>จัดการโฟลเดอร์</h2>

            <CreateDriveFolderModal
                onCreated={() => loadFolders()}
            />



            <div className="folder-list">
                {currentFolderId && (
                    <div
                        className="folder-row back-row"
                        onClick={() => setCurrentFolderId(null)}
                    >
                        ⬅ โฟลเดอร์หลัก
                    </div>
                )}

                {folders.map((item) => (
                    <div
                        key={item.id}
                        className="folder-row clickable"
                        onClick={() => handleItemClick(item)}
                    >
                        <span>
                            {item.mimeType === "application/vnd.google-apps.folder" ? "📁" : "📄"}{" "}
                            {item.name}
                        </span>

                        <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(item, e)}
                        >
                            ลบ
                        </button>

                    </div>
                ))}
            </div>








            <Loading show={loading} text="กำลังโหลดโฟลเดอร์..." />
        </div>
    );
}
