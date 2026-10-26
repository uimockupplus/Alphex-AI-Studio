"use client";

import "./studio.css";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  Download,
  FileCode2,
  FilePlus2,
  FolderOpen,
  PanelLeftClose,
  PanelRightClose,
  Play,
  Settings2,
  Sparkles,
  Upload,
  X,
  Send,
  LoaderCircle,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="studio-editor-loading">Loading code editor…</div>
  ),
});

type StudioTheme = "light" | "dark";

type ProjectFile = {
  name: string;
  content: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AISettings = {
  endpoint: string;
  model: string;
  apiKey: string;
};

const STORAGE_KEY = "alphex-studio-project-v1";
const AI_SETTINGS_KEY = "alphex-studio-ai-settings-v1";
const CHAT_KEY = "alphex-studio-chat-v1";
const THEME_KEY = "alphex-studio-theme-v1";
const MAX_FILE_SIZE = 2_000_000;

const DEFAULT_AI_SETTINGS: AISettings = {
  endpoint: "https://api.groq.com/openai/v1/chat/completions",
  model: "llama-3.3-70b-versatile",
  apiKey: "",
};

const starterFiles: ProjectFile[] = [
  {
    name: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="hero">
    <span class="eyebrow">YOUR NEXT IDEA</span>
    <h1>Build something<br /><span>remarkable.</span></h1>
    <p>Your code. Your creativity. Your rules.</p>
    <button onclick="showMessage()">Get started</button>
  </main>
  <script src="app.js"><\/script>
</body>
</html>`,
  },
  {
    name: "styles.css",
    content: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background: #101010;
  color: #f5f5f5;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 10%;
}

.eyebrow {
  color: #ff7900;
  font-size: 12px;
  letter-spacing: 3px;
}

h1 {
  font-size: clamp(44px, 8vw, 88px);
  line-height: 1.04;
  letter-spacing: -3px;
}

h1 span {
  color: #ff7900;
}

p {
  color: #aaa;
  line-height: 1.8;
}

button {
  padding: 13px 20px;
  border: 0;
  border-radius: 6px;
  background: #ff7900;
  color: white;
  font-weight: 700;
  cursor: pointer;
}`,
  },
  {
    name: "app.js",
    content: `function showMessage() {
  alert("Your project is ready to build.");
}`,
  },
];

function getLanguage(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase();

  const languages: Record<string, string> = {
    html: "html",
    css: "css",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    md: "markdown",
    py: "python",
    xml: "xml",
    svg: "xml",
    yml: "yaml",
    yaml: "yaml",
  };

  return languages[extension || ""] || "plaintext";
}

function isIgnoredPath(name: string): boolean {
  return name.split("/").some(
    (part) =>
      part === "node_modules" ||
      part === ".git" ||
      part === ".next" ||
      part === "__MACOSX",
  );
}

function isValidSavedProject(value: unknown): value is ProjectFile[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.name === "string" &&
        typeof item.content === "string" &&
        item.name.length > 0,
    )
  );
}

function readStoredMessages(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return [];

    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return value
      .filter(
        (item): item is ChatMessage =>
          item !== null &&
          typeof item === "object" &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string",
      )
      .slice(-30);
  } catch {
    return [];
  }
}

export default function StudioPage() {
  const [files, setFiles] = useState<ProjectFile[]>(starterFiles);
  const [activeFile, setActiveFile] = useState("index.html");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAssistant, setShowAssistant] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [notice, setNotice] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [theme, setTheme] = useState<StudioTheme>("light");

  const [aiSettings, setAiSettings] =
    useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [settingsDraft, setSettingsDraft] =
    useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    try {
      const savedProject = window.localStorage.getItem(STORAGE_KEY);

      if (savedProject) {
        const parsed: unknown = JSON.parse(savedProject);

        if (isValidSavedProject(parsed)) {
          setFiles(parsed);

          const savedActive = window.localStorage.getItem(
            `${STORAGE_KEY}:active`,
          );

          const restored =
            savedActive && parsed.some((file) => file.name === savedActive)
              ? savedActive
              : parsed.find(
                  (file) =>
                    file.name === "index.html" ||
                    file.name.endsWith("/index.html"),
                )?.name || parsed[0].name;

          setActiveFile(restored);
        }
      }

      const storedAI = window.localStorage.getItem(AI_SETTINGS_KEY);

      if (storedAI) {
        const parsed: unknown = JSON.parse(storedAI);

        if (parsed && typeof parsed === "object") {
          const candidate = parsed as Partial<AISettings>;

          setAiSettings({
            endpoint:
              typeof candidate.endpoint === "string"
                ? candidate.endpoint
                : DEFAULT_AI_SETTINGS.endpoint,
            model:
              typeof candidate.model === "string"
                ? candidate.model
                : DEFAULT_AI_SETTINGS.model,
            apiKey:
              typeof candidate.apiKey === "string" ? candidate.apiKey : "",
          });
        }
      }

      setMessages(readStoredMessages());

      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }
    } catch {
      setNotice("Some saved settings could not be restored.");
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      window.localStorage.setItem(`${STORAGE_KEY}:active`, activeFile);
      setLastSaved(true);
    } catch {
      setLastSaved(false);
    }
  }, [files, activeFile, storageReady]);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(
        AI_SETTINGS_KEY,
        JSON.stringify(aiSettings),
      );
    } catch {
      setAiError("Could not save AI settings in browser storage.");
    }
  }, [aiSettings, storageReady]);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // Chat can continue even if browser storage is unavailable.
    }
  }, [messages, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme, storageReady]);

  const currentFile = files.find((file) => file.name === activeFile);

  const updateCurrentFile = useCallback(
    (content: string | undefined) => {
      setFiles((previous) =>
        previous.map((file) =>
          file.name === activeFile
            ? { ...file, content: content ?? "" }
            : file,
        ),
      );
    },
    [activeFile],
  );

  const createFile = () => {
    const name = newFileName.trim().replace(/^\/+/, "");

    if (
      !name ||
      name.includes("..") ||
      name.endsWith("/") ||
      isIgnoredPath(name)
    ) {
      setNotice("Enter a valid file path, such as components/header.js.");
      return;
    }

    if (files.some((file) => file.name === name)) {
      setNotice("A file with that name already exists.");
      return;
    }

    setFiles((previous) => [...previous, { name, content: "" }]);
    setActiveFile(name);
    setPreviewMode(false);
    setNewFileName("");
    setShowNewFile(false);
    setNotice("");
  };

  const importZip = async (file?: File) => {
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      const imported: ProjectFile[] = [];

      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir || isIgnoredPath(name)) continue;

        try {
          const content = await entry.async("string");
          if (new Blob([content]).size > MAX_FILE_SIZE) continue;
          imported.push({ name, content });
        } catch {
          // Skip unreadable files.
        }
      }

      if (!imported.length) {
        setNotice("No readable project files were found in that ZIP.");
        return;
      }

      setFiles(imported);

      const indexFile = imported.find(
        (item) =>
          item.name === "index.html" || item.name.endsWith("/index.html"),
      );

      setActiveFile(indexFile?.name || imported[0].name);
      setPreviewMode(false);
      setNotice(`Imported ${imported.length} files.`);
    } catch {
      setNotice("Could not read that ZIP. Please choose a valid archive.");
    }
  };

  const importFolder = async (list: FileList | null) => {
    if (!list?.length) return;

    const imported: ProjectFile[] = [];

    for (const file of Array.from(list)) {
      const name =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name;

      if (isIgnoredPath(name) || file.size > MAX_FILE_SIZE) continue;

      try {
        imported.push({ name, content: await file.text() });
      } catch {
        // Skip unreadable files.
      }
    }

    if (!imported.length) {
      setNotice("No readable files were found in that folder.");
      return;
    }

    setFiles(imported);

    const indexFile = imported.find(
      (item) =>
        item.name === "index.html" || item.name.endsWith("/index.html"),
    );

    setActiveFile(indexFile?.name || imported[0].name);
    setPreviewMode(false);
    setNotice(`Imported ${imported.length} files.`);
  };

  const exportZip = async () => {
    try {
      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file.content));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = "alphex-studio-project.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Project ZIP exported.");
    } catch {
      setNotice("Could not export the project. Please try again.");
    }
  };

  const previewDocument = () => {
    const htmlFile = files.find(
      (file) =>
        file.name === "index.html" || file.name.endsWith("/index.html"),
    );

    if (!htmlFile) {
      setNotice("Add or import an index.html file to preview this project.");
      return;
    }

    setPreviewMode(true);
    setPreviewKey((value) => value + 1);
  };

  const previewHtml = (() => {
    const htmlFile = files.find(
      (file) =>
        file.name === "index.html" || file.name.endsWith("/index.html"),
    );

    if (!htmlFile) return "";

    let html = htmlFile.content;

    const cssFile = files.find(
      (file) =>
        file.name === "styles.css" || file.name.endsWith("/styles.css"),
    );

    const jsFile = files.find(
      (file) =>
        file.name === "app.js" || file.name.endsWith("/app.js"),
    );

    html = html.replace(
      /<link\b[^>]*href=["'][^"']*\.css(?:\?[^"']*)?["'][^>]*>/gi,
      "",
    );

    html = html.replace(
      /<script\b[^>]*src=["'][^"']*\.js(?:\?[^"']*)?["']\s*>\s*<\/script>/gi,
      "",
    );

    const safeCss = (cssFile?.content || "").replace(
      /<\/style/gi,
      "<\\/style",
    );

    const safeJs = (jsFile?.content || "").replace(
      /<\/script/gi,
      "<\\/script",
    );

    if (/<\/head>/i.test(html)) {
      html = html.replace(
        /<\/head>/i,
        `<style>${safeCss}</style></head>`,
      );
    } else {
      html = `<style>${safeCss}</style>${html}`;
    }

    if (/<\/body>/i.test(html)) {
      html = html.replace(
        /<\/body>/i,
        `<script>${safeJs}<\/script></body>`,
      );
    } else {
      html += `<script>${safeJs}<\/script>`;
    }

    return html;
  })();

  const saveAISettings = () => {
    const endpoint = settingsDraft.endpoint.trim();
    const model = settingsDraft.model.trim();

    try {
      const parsedURL = new URL(endpoint);

      if (
        parsedURL.protocol !== "https:" &&
        parsedURL.hostname !== "localhost"
      ) {
        setAiError("Use a valid HTTPS API endpoint.");
        return;
      }
    } catch {
      setAiError("Enter a valid API endpoint URL.");
      return;
    }

    if (!model) {
      setAiError("Enter the model name provided by your AI provider.");
      return;
    }

    setAiSettings({ ...settingsDraft, endpoint, model });
    setShowSettings(false);
    setAiError("");
    setNotice("AI settings saved in this browser.");
  };

  const sendMessage = async () => {
    const prompt = chatInput.trim();

    if (!prompt || sending) return;

    if (!aiSettings.apiKey.trim()) {
      setAiError("Add your API key in Settings before sending a message.");
      setShowSettings(true);
      setSettingsDraft(aiSettings);
      return;
    }

    if (!aiSettings.endpoint.trim() || !aiSettings.model.trim()) {
      setAiError("Configure your API endpoint and model in Settings.");
      setShowSettings(true);
      setSettingsDraft(aiSettings);
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: prompt };
    const previousMessages = messages.slice(-10);

    setMessages((previous) => [...previous, userMessage]);
    setChatInput("");
    setSending(true);
    setAiError("");

    const activeCode = currentFile
      ? `\n\nCurrently selected file: ${currentFile.name}\n\`\`\`\n${currentFile.content.slice(0, 12000)}\n\`\`\``
      : "";

    try {
      const response = await fetch(aiSettings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiSettings.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: aiSettings.model.trim(),
          messages: [
            {
              role: "system",
              content:
                "You are the coding assistant inside Alphex AI Studio. Help users understand, debug, and improve their code. When providing code, identify the filename and provide complete replacement code when practical. Do not claim that you edited files; you only provide suggestions in chat. Be concise and explain steps for beginners.",
            },
            ...previousMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            {
              role: "user",
              content: prompt + activeCode,
            },
          ],
          temperature: 0.2,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const apiError =
          data &&
          typeof data === "object" &&
          "error" in data &&
          data.error &&
          typeof data.error === "object" &&
          "message" in data.error &&
          typeof data.error.message === "string"
            ? data.error.message
            : `The provider returned HTTP ${response.status}.`;

        throw new Error(apiError);
      }

      const result = data as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const answer = result.choices?.[0]?.message?.content;

      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error("The provider returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: answer.trim() },
      ]);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Could not connect to the AI provider. Check your settings and try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAiError("");
  };

  return (
    <main className="studio-shell" data-theme={theme}>
      <header className="studio-topbar">
        <div className="studio-topbar-left">
          <Link href="/" className="studio-back" aria-label="Back to homepage">
            <ArrowLeft size={16} />
          </Link>

          <img
            className="studio-brand-logo"
            src={
              theme === "dark"
                ? "/alphex-logo-dark.png"
                : "/alphex-logo-light.png"
            }
            alt="Alphex AI"
          />
        </div>

        <div className="studio-topbar-actions">
          <button
            className="studio-theme-toggle"
            type="button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>

          <label className="studio-tool-button">
            <Upload size={15} />
            Import ZIP
            <input
              type="file"
              accept=".zip,application/zip"
              hidden
              onChange={(event) => {
                void importZip(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>

          <label className="studio-tool-button">
            <FolderOpen size={15} />
            Import folder
            <input
              type="file"
              hidden
              multiple
              {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              onChange={(event) => {
                void importFolder(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>

          <button
            className="studio-tool-button"
            onClick={() => {
              setSettingsDraft(aiSettings);
              setAiError("");
              setShowSettings(true);
            }}
          >
            <Settings2 size={15} />
            Settings
          </button>

          <button
            className="studio-export-button"
            onClick={() => void exportZip()}
          >
            <Download size={15} />
            Export ZIP
          </button>
        </div>
      </header>

      <div className="studio-workspace">
        {showExplorer && (
          <aside className="studio-explorer">
            <div className="studio-panel-heading">
              <span>EXPLORER</span>
              <div>
                <button
                  title="New file"
                  onClick={() => setShowNewFile(true)}
                >
                  <FilePlus2 size={15} />
                </button>
                <button
                  title="Hide explorer"
                  onClick={() => setShowExplorer(false)}
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
            </div>

            <div className="studio-project-name">
              <FolderOpen size={15} />
              MY PROJECT
            </div>

            {showNewFile && (
              <form
                className="studio-new-file"
                onSubmit={(event) => {
                  event.preventDefault();
                  createFile();
                }}
              >
                <input
                  autoFocus
                  value={newFileName}
                  onChange={(event) => setNewFileName(event.target.value)}
                  placeholder="path/to/file.js"
                  aria-label="New file name"
                />
                <button type="submit">Add</button>
                <button
                  type="button"
                  onClick={() => setShowNewFile(false)}
                  aria-label="Cancel new file"
                >
                  <X size={13} />
                </button>
              </form>
            )}

            <div className="studio-file-list">
              {files.map((file) => (
                <button
                  key={file.name}
                  className={`studio-file-row ${
                    activeFile === file.name ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveFile(file.name);
                    setPreviewMode(false);
                  }}
                >
                  <FileCode2 size={14} />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            <div className="studio-local-note">
              {lastSaved
                ? "Project saved in this browser."
                : "Export a ZIP backup regularly."}
            </div>
          </aside>
        )}

        <section className="studio-editor-area">
          <div className="studio-editor-toolbar">
            <div className="studio-editor-tabs">
              {currentFile && (
                <button className="studio-editor-tab">
                  <FileCode2 size={14} />
                  {currentFile.name}
                </button>
              )}
            </div>

            <div className="studio-editor-actions">
              {!showExplorer && (
                <button
                  title="Show explorer"
                  onClick={() => setShowExplorer(true)}
                >
                  <PanelLeftClose size={15} />
                </button>
              )}

              <button
                className="studio-preview-button"
                onClick={previewDocument}
              >
                <Play size={13} />
                Preview
              </button>

              <button
                title="Toggle AI assistant"
                onClick={() => setShowAssistant((value) => !value)}
              >
                <PanelRightClose size={15} />
              </button>
            </div>
          </div>

          <div className="studio-editor-container">
            {previewMode ? (
              <iframe
                key={previewKey}
                title="Project preview"
                sandbox="allow-scripts"
                srcDoc={previewHtml}
                className="studio-preview-frame"
              />
            ) : currentFile ? (
              <Editor
                height="100%"
                theme={theme === "dark" ? "vs-dark" : "light"}
                language={getLanguage(currentFile.name)}
                path={currentFile.name}
                value={currentFile.content}
                onChange={updateCurrentFile}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  padding: { top: 16 },
                  tabSize: 2,
                }}
              />
            ) : (
              <div className="studio-empty-state">
                Choose a file or create a new one.
              </div>
            )}
          </div>

          <footer className="studio-statusbar">
            <span>
              {previewMode
                ? "PREVIEW"
                : getLanguage(currentFile?.name || "").toUpperCase()}
            </span>
            <span>{files.length} files</span>
            <span>{lastSaved ? "Saved locally" : "Not saved locally"}</span>
          </footer>
        </section>

        {showAssistant && (
          <aside
            className="studio-assistant"
            style={{ minHeight: 0 }}
          >
            <div className="studio-panel-heading">
              <span>
                <Sparkles size={15} />
                AI ASSISTANT
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button title="Clear chat" onClick={clearChat}>
                  <Trash2 size={14} />
                </button>
                <button
                  title="Hide assistant"
                  onClick={() => setShowAssistant(false)}
                >
                  <PanelRightClose size={15} />
                </button>
              </div>
            </div>

            <div
              className="studio-assistant-content"
              style={{
                alignItems: "stretch",
                textAlign: "left",
                padding: 12,
                gap: 12,
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  className="studio-ai-orb"
                  style={{ width: 32, height: 32, borderRadius: 9 }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <strong style={{ color: "#f1f1f3", fontSize: 12 }}>
                    Alphex AI
                  </strong>
                  <div style={{ color: "#999ca5", fontSize: 10 }}>
                    {aiSettings.apiKey ? aiSettings.model : "Setup required"}
                  </div>
                </div>
              </div>

              {messages.length === 0 && (
                <div
                  style={{
                    border: "1px solid #303137",
                    background: "#1d1e22",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <strong style={{ color: "#f0f0f2", fontSize: 12 }}>
                    What are we building?
                  </strong>
                  <p
                    style={{
                      color: "#999ca5",
                      fontSize: 11,
                      lineHeight: 1.8,
                      margin: "8px 0 12px",
                    }}
                  >
                    Ask a question about your selected file, request a code
                    review, or ask for a suggested fix.
                  </p>
                  {[
                    "Explain this file",
                    "Find possible bugs",
                    "Improve the code",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setChatInput(suggestion)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        marginTop: 6,
                        padding: "8px 9px",
                        border: "1px solid #373940",
                        borderRadius: 5,
                        background: "#24262b",
                        color: "#dedfe3",
                        fontSize: 10,
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${index}-${message.role}`}
                  style={{
                    padding: 10,
                    borderRadius: 7,
                    border:
                      message.role === "user"
                        ? "1px solid #51351f"
                        : "1px solid #303137",
                    background:
                      message.role === "user" ? "#2b2119" : "#1d1e22",
                  }}
                >
                  <div
                    style={{
                      color:
                        message.role === "user" ? "#ffad66" : "#bfc1c9",
                      fontSize: 9,
                      fontWeight: 800,
                      marginBottom: 6,
                      letterSpacing: 0.5,
                    }}
                  >
                    {message.role === "user" ? "YOU" : "ALPHEX AI"}
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      color: "#e4e5e9",
                      fontFamily: "inherit",
                      fontSize: 11,
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {message.content}
                  </pre>
                </div>
              ))}

              {sending && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#bfc1c9",
                    fontSize: 11,
                    padding: 8,
                  }}
                >
                  <LoaderCircle
                    size={15}
                    className="studio-ai-loading-icon"
                  />
                  Thinking…
                </div>
              )}

              {aiError && (
                <div
                  role="alert"
                  style={{
                    padding: 10,
                    border: "1px solid #75403a",
                    borderRadius: 6,
                    background: "#321f20",
                    color: "#ffb8b0",
                    fontSize: 11,
                    lineHeight: 1.7,
                    overflowWrap: "anywhere",
                  }}
                >
                  {aiError}
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
              style={{
                flexShrink: 0,
                padding: 10,
                borderTop: "1px solid #292b30",
                background: "#17181b",
              }}
            >
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask Alphex AI…"
                aria-label="Message Alphex AI"
                rows={3}
                disabled={sending}
                style={{
                  width: "100%",
                  resize: "vertical",
                  minHeight: 72,
                  padding: 10,
                  border: "1px solid #3a3c42",
                  borderRadius: 7,
                  background: "#101113",
                  color: "#f0f0f2",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSettingsDraft(aiSettings);
                    setAiError("");
                    setShowSettings(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    border: 0,
                    background: "transparent",
                    color: "#a5a7af",
                    fontSize: 10,
                  }}
                >
                  <Settings2 size={13} />
                  Configure
                </button>

                <button
                  type="submit"
                  disabled={sending || !chatInput.trim()}
                  className="studio-export-button"
                  style={{
                    minHeight: 31,
                    padding: "0 12px",
                    opacity: sending || !chatInput.trim() ? 0.5 : 1,
                  }}
                >
                  {sending ? (
                    <LoaderCircle size={13} />
                  ) : (
                    <Send size={13} />
                  )}
                  Send
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {notice && (
        <div className="studio-notice" role="status">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {showSettings && (
        <div
          className="studio-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <section
            className="studio-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="studio-settings-heading">
              <div>
                <span className="studio-settings-eyebrow">
                  WORKSPACE CONFIGURATION
                </span>
                <h2 id="settings-title">AI provider settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#c9cbd1", fontSize: 11 }}>
                  API endpoint
                </span>
                <input
                  value={settingsDraft.endpoint}
                  onChange={(event) =>
                    setSettingsDraft((previous) => ({
                      ...previous,
                      endpoint: event.target.value,
                    }))
                  }
                  placeholder="https://api.groq.com/openai/v1/chat/completions"
                  style={settingInputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#c9cbd1", fontSize: 11 }}>
                  Model name
                </span>
                <input
                  value={settingsDraft.model}
                  onChange={(event) =>
                    setSettingsDraft((previous) => ({
                      ...previous,
                      model: event.target.value,
                    }))
                  }
                  placeholder="llama-3.3-70b-versatile"
                  style={settingInputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#c9cbd1", fontSize: 11 }}>
                  API key
                </span>
                <input
                  type="password"
                  autoComplete="off"
                  value={settingsDraft.apiKey}
                  onChange={(event) =>
                    setSettingsDraft((previous) => ({
                      ...previous,
                      apiKey: event.target.value,
                    }))
                  }
                  placeholder="Paste your provider API key"
                  style={settingInputStyle}
                />
              </label>
            </div>

            {aiError && (
              <p
                role="alert"
                style={{
                  color: "#ffaaa0",
                  fontSize: 11,
                  lineHeight: 1.7,
                  overflowWrap: "anywhere",
                  marginTop: 14,
                }}
              >
                {aiError}
              </p>
            )}

            <div className="studio-settings-message" style={{ marginTop: 18 }}>
              <Settings2 size={18} />
              <div>
                <strong>Browser-only configuration</strong>
                <p>
                  These settings, including your key, are stored in this
                  browser. Requests are sent to the endpoint above. Only use a
                  provider and key you trust. This direct-browser setup is for
                  prototyping, not a secure public multi-user deployment.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              <button
                className="studio-tool-button"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="studio-export-button"
                onClick={saveAISettings}
              >
                Save settings
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const settingInputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "10px 11px",
  border: "1px solid #41434a",
  borderRadius: 6,
  background: "#101113",
  color: "#f2f2f3",
  fontSize: 12,
};
