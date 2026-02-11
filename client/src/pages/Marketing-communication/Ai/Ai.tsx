import { useEffect, useState } from "react";
import { getDriveFiles, getSubDriveFiles } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import ThinkingDots from "../../../components/ThinkingDots/ThinkingDots"
import "./Ai.css";

type DriveItem = {
  id: string;
  name: string;
  mimeType?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
};


type SendMode = "analyze" | "chat";

const MAX_FILES = 3;



function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}


function rowsToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\r\n");
}

function exportCsvFromRows(
  rows: string[][],
  filename = "ai-result.csv"
) {
  const csvContent = "\uFEFF" + rowsToCsv(rows); // BOM สำคัญมาก
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function isValidUrl(text: string) {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}



const Ai = () => {
  /* =======================
      STATE
  ======================= */
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  // const [input, setInput] = useState("");

  const [savedMasterPrompt, setSavedMasterPrompt] = useState("");
  const [masterPrompt, setMasterPrompt] = useState("");
  const [loadingMasterPrompt, setLoadingMasterPrompt] = useState(true);
  const [statusText, setStatusText] = useState("");


  const [aiLoading, setAiLoading] = useState(false);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const [selectedModel, setSelectedModel] =
    useState("openai/gpt-4o-mini");

  /* =======================
      LOAD DRIVE FOLDERS
  ======================= */
  useEffect(() => {
    getDriveFiles()
      .then((data) => {
        const onlyFolders = data.filter((f: DriveItem) =>
          f.mimeType?.includes("folder")
        );
        setFolders(onlyFolders);
      })
      .catch(console.error);
  }, []);

  /* =======================
      LOAD MASTER PROMPT
  ======================= */
  useEffect(() => {
    async function loadMasterPrompt() {
      setLoadingMasterPrompt(true);

      const { data, error } = await supabase
        .from("master_prompts")
        .select("prompt")
        .eq("key", "default")
        .single();

      if (!error && data) {
        setSavedMasterPrompt(data.prompt);
        setMasterPrompt(data.prompt);
      }

      setLoadingMasterPrompt(false);
    }

    loadMasterPrompt();
  }, []);

  /* =======================
      FOLDER / FILE
  ======================= */
  const handleFolderChange = async (id: string) => {
    setSelectedFolder(id);
    setSelectedFiles([]);
    const data = await getSubDriveFiles(id);
    setFiles(data);
  };

  const toggleFile = (file: DriveItem) => {
    setSelectedFiles((prev) => {
      // ถ้ากดซ้ำ = เอาออก
      if (prev.some((f) => f.id === file.id)) {
        return prev.filter((f) => f.id !== file.id);
      }

      // ถ้าเกิน MAX_FILES → ตัดตัวเก่าสุด (index 0) ออก
      if (prev.length >= MAX_FILES) {
        return [...prev.slice(1), file];
      }

      // กรณีปกติ
      return [...prev, file];
    });
  };





  /* =======================
      AI SEND
  ======================= */
  const sendPromptToAI = async (
    promptText: string,
    mode: SendMode
  ) => {
    if (!promptText.trim()) return;

    if (mode === "analyze" && selectedFiles.length === 0) {
      alert("กรุณาเลือกไฟล์ก่อนวิเคราะห์");
      return;
    }

    // 🧠 Step 1: เริ่มต้น
    setStatusText("🧠 กำลังเตรียมข้อมูล...");
    setAiLoading(true);

    setMessages([
      {
        role: "assistant",
        content: "",
        loading: true
      }
    ]);

    try {
      // 📊 Step 2: วิเคราะห์
      setStatusText("กำลังวิเคราะห์ด้วย AI...");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            masterPrompt,
            files: selectedFiles,
            model: selectedModel,
            folderId: selectedFolder
          })
        }
      );

      // ☁️ Step 3: อัปโหลด Drive (backend ทำ)
      setStatusText("☁️ กำลังอัปโหลดลง Google Drive...");

      const data = await res.json();

      // ✅ Step 4: เสร็จสมบูรณ์
      if (data.status?.uploaded) {
        setStatusText("บันทึกไฟล์ลง Google Drive เรียบร้อย...");
      } else {
        setStatusText("วิเคราะห์เสร็จสมบูรณ์");
      }

      setMessages((m) => [
        ...m.filter((msg) => !msg.loading),
        data
      ]);
    } catch (err) {
      setStatusText("เกิดข้อผิดพลาด");

      setMessages((m) => [
        ...m.filter((msg) => !msg.loading),
        {
          role: "assistant",
          content: "AI error. Please try again."
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };


  // const sendMessage = () => {
  //   sendPromptToAI(input, "chat");
  //   setInput("");
  // };

  /* =======================
      SAVE MASTER PROMPT
  ======================= */
  const saveMasterPrompt = async () => {
    const { error } = await supabase
      .from("master_prompts")
      .update({
        prompt: masterPrompt,
        updated_at: new Date().toISOString()
      })
      .eq("key", "default");

    if (!error) {
      setSavedMasterPrompt(masterPrompt);
      alert("บันทึก Master Prompt แล้ว");
    }
  };

  /* =======================
      RENDER
  ======================= */
  return (
    <div className="gpt-layout">
      {/* SIDEBAR */}
      <aside className="gpt-sidebar">
        <h3>Files</h3>

        <select
          value={selectedFolder}
          onChange={(e) => handleFolderChange(e.target.value)}
        >
          <option value="">Select Folder</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>



        <div className="file-list">
          <h3>
            เลือกไฟล์ได้ทั้งหมด
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {" "}
              ({selectedFiles.length}/{MAX_FILES})
            </span>
          </h3>

          {files.map((f) => (
            <label key={f.id}>
              <input
                type="checkbox"
                checked={selectedFiles.some((sf) => sf.id === f.id)}
                disabled={
                  !selectedFiles.some((sf) => sf.id === f.id) &&
                  selectedFiles.length >= MAX_FILES
                }
                onChange={() => toggleFile(f)}
              />

              {f.name}
            </label>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="gpt-main">
        <div className="gpt-topbar">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
            <option value="anthropic/claude-3.5-sonnet">
              Claude 3.5 Sonnet
            </option>
            <option value="google/gemini-1.5-pro">
              Gemini 1.5 Pro
            </option>
          </select>

          <button onClick={() => setShowPromptModal(true)}>
            Master Prompt
          </button>

          <button
            className="Analyze-Masterprompt"
            onClick={() => sendPromptToAI(masterPrompt, "analyze")}
            disabled={aiLoading}
          >
            วิเคราะห์จาก Master Prompt
          </button>
        </div>

        

        {showPromptModal && (
          <div className="modal-backdrop">
            <div className="modal modal-large">
              <h3>Master Prompt</h3>

              {!isEditingPrompt ? (
                <>
                  <pre className="prompt-preview">
                    {savedMasterPrompt}
                  </pre>

                  <div className="modal-actions">
                    <button onClick={() => setIsEditingPrompt(true)}>
                      แก้ไข
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setShowPromptModal(false)}
                    >
                      ปิด
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    className="edit-modal-content"
                    value={masterPrompt}
                    onChange={(e) =>
                      setMasterPrompt(e.target.value)
                    }
                    rows={22}
                  />

                  <div className="modal-actions">
                    <button
                      className="save-btn"
                      onClick={async () => {
                        await saveMasterPrompt();
                        setIsEditingPrompt(false);
                      }}
                    >
                      บันทึก
                    </button>

                    <button
                      className="secondary"
                      onClick={() => {
                        setMasterPrompt(savedMasterPrompt);
                        setIsEditingPrompt(false);
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="gpt-messages">
          {messages.map((m, i) => {
            if (m.loading) {
              return (
                <div key={i} className="gpt-msg assistant">
                  <ThinkingDots text={statusText || "AI กำลังคิด..."} />
                </div>
              );
            }


            if (m.role === "assistant") {
              const rows = parseCsv(m.content);
              const [header, ...data] = rows;

              return (
                <div key={i} className="gpt-msg assistant wide">
                  {/* EXPORT BAR */}
                  <div className="ai-export-bar">
                    <button
                      onClick={() =>
                        exportCsvFromRows(
                          rows,
                          `kols_Ai_sumarize_${new Date().toISOString().slice(0, 10)}.csv`
                        )
                      }
                    >
                      Export CSV
                    </button>

                  </div>

                  <div className="ai-table-wrapper">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          {header.map((h, idx) => (
                            <th key={idx}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>
                                {isValidUrl(cell) ? (
                                  <a
                                    href={cell}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ai-link"
                                  >
                                    {cell}
                                  </a>
                                ) : (
                                  cell
                                )}
                              </td>
                            ))}


                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }


            return (
              <div key={i} className={`gpt-msg ${m.role}`}>
                {m.content}
              </div>
            );
          })}

        </div>


        {/* <div className="gpt-inputbar">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI..."
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            disabled={aiLoading}
          />
          <button onClick={sendMessage} disabled={aiLoading}>
            ➤
          </button>
        </div> */}


      </main>
    </div>
  );
};

export default Ai;
