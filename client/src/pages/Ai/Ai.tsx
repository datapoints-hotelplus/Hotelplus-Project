import { useEffect, useState } from "react";
import { getDriveFiles, getSubDriveFiles } from "../../lib/api";
import "./Ai.css";

type DriveItem = {
  id: string;
  name: string;
  mimeType?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Ai = () => {
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [selectedModel, setSelectedModel] =
    useState("openai/gpt-4o-mini");

  // LOAD FOLDERS
  useEffect(() => {
    getDriveFiles()
      .then((data) => {
        const onlyFolders = data.filter(
          (f: DriveItem) =>
            f.mimeType?.includes("folder")
        );
        setFolders(onlyFolders);
      })
      .catch(console.error);
  }, []);

  // SELECT FOLDER
  const handleFolderChange = async (id: string) => {
    setSelectedFolder(id);
    setSelectedFiles([]);
    const data = await getSubDriveFiles(id);
    setFiles(data);
  };

  // TOGGLE FILE
  const toggleFile = (file: DriveItem) => {
    setSelectedFiles((prev) => {
      const exists = prev.find(
        f => f.id === file.id
      );

      if (exists) {
        return prev.filter(
          f => f.id !== file.id
        );
      }

      return [...prev, file];
    });
  };

  // SELECT ALL
  const selectAll = () => {
    setSelectedFiles(files);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: userMsg.content,
            files: selectedFiles,
            model: selectedModel
          })
        }
      );

      const data = await res.json();
      setMessages((m) => [...m, data]);

    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "AI error. Please try again."
        }
      ]);
    }
  };

  return (
    <div className="gpt-layout">

      {/* SIDEBAR */}
      <aside className="gpt-sidebar">
        <h3>Files</h3>

        <select
          value={selectedFolder}
          onChange={(e) =>
            handleFolderChange(e.target.value)
          }
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
                checked={selectedFiles.some(
                  sf => sf.id === f.id
                )}
                onChange={() => toggleFile(f)}
              />
              {f.name}
            </label>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <main className="gpt-main">

        {/* TOP BAR */}
        <div className="gpt-topbar">
          <select
            value={selectedModel}
            onChange={(e) =>
              setSelectedModel(e.target.value)
            }
          >
            <option value="openai/gpt-4o-mini">
              GPT-4o Mini
            </option>
            <option value="anthropic/claude-3.5-sonnet">
              Claude 3.5 Sonnet
            </option>
            <option value="google/gemini-1.5-pro">
              Gemini 1.5 Pro
            </option>
          </select>
        </div>

        {/* MESSAGES */}
        <div className="gpt-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`gpt-msg ${m.role}`}
            >
              {m.content}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="gpt-inputbar">
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Message AI..."
          />
          <button onClick={sendMessage}>
            ➤
          </button>
        </div>

      </main>
    </div>
  );


};

export default Ai;
