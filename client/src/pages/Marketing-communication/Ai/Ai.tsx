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

const Ai = () => {
  /* =======================
      STATE
  ======================= */
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [savedMasterPrompt, setSavedMasterPrompt] = useState("");
  const [masterPrompt, setMasterPrompt] = useState("");
  const [loadingMasterPrompt, setLoadingMasterPrompt] = useState(true);

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
    setSelectedFiles((prev) =>
      prev.some((f) => f.id === file.id)
        ? prev.filter((f) => f.id !== file.id)
        : [...prev, file]
    );
  };

  const selectAll = () => {
    setSelectedFiles(files);
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

    setAiLoading(true);

    setMessages((m) => [
      ...m,
      { role: "user", content: promptText },
      {
        role: "assistant",
        content: "",
        loading: true
      }
    ]);


    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            files: selectedFiles,
            model: selectedModel,
            mode
          })
        }
      );

      const data = await res.json();

      setMessages((m) => [
        ...m.filter((msg) => !msg.loading),
        data
      ]);
    } catch (err) {
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

  const sendMessage = () => {
    sendPromptToAI(input, "chat");
    setInput("");
  };

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

        <button className="select-all-btn" onClick={selectAll}>
          Select All
        </button>

        <div className="file-list">
          {files.map((f) => (
            <label key={f.id}>
              <input
                type="checkbox"
                checked={selectedFiles.some((sf) => sf.id === f.id)}
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
          {messages.map((m, i) => (
            <div key={i} className={`gpt-msg ${m.role}`}>
              {m.loading ? <ThinkingDots /> : m.content}
            </div>
          ))}
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
