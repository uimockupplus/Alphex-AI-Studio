
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
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="studio-editor-loading">Loading code editor…</div>
  ),
});

type ProjectFile = {
  name: string;
  content: string;
};

const STORAGE_KEY = "alphex-studio-project-v1";
const MAX_FILE_SIZE = 2_000_000;

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
  if (!Array.isArray(value) || value.length === 0) return false;

  return value.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      typeof item.name === "string" &&
      typeof item.content === "string" &&
      item.name.length > 0,
  );
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

  // Restore the last project before enabling automatic saving.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (isValidSavedProject(parsed)) {
          setFiles(parsed);

          const savedActiveFile = window.localStorage.getItem(
            `${STORAGE_KEY}:active`,
          );

          const restoredActiveFile =
            savedActiveFile &&
            parsed.some((file) => file.name === savedActiveFile)
              ? savedActiveFile
              : parsed.find(
                  (file) =>
                    file.name === "index.html" ||
                    file.name.endsWith("/index.html"),
                )?.name || parsed[0].name;

          setActiveFile(restoredActiveFile);
          setNotice("Your previous project has been restored.");
        }
      }
    } catch {
      setNotice("Saved project data could not be restored. Starting a new project.");
    } finally {
      setStorageReady(true);
    }
  }, []);

  // Save changes automatically after restoration has completed.
  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      window.localStorage.setItem(`${STORAGE_KEY}:active`, activeFile);
      setLastSaved(true);
    } catch {
      setLastSaved(false);
      setNotice(
        "Browser storage is full or unavailable. Export your project ZIP to keep a backup.",
      );
    }
  }, [files, activeFile, storageReady]);

  const currentFile = files.find((file) => file.name === activeFile);

  const getContent = (name: string): string =>
    files.find((file) => file.name === name)?.content || "";

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
          // Skip files that cannot be decoded as text.
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
      setNotice(`Imported ${imported.length} files into this browser workspace.`);
    } catch {
      setNotice("Could not read that ZIP. Please choose a valid project archive.");
    }
  };

  const importFolder = async (list: FileList | null) => {
    if (!list?.length) return;

    const imported: ProjectFile[] = [];

    for (const file of Array.from(list)) {
      const relativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name;

      if (isIgnoredPath(relativePath) || file.size > MAX_FILE_SIZE) continue;

      try {
        imported.push({
          name: relativePath,
          content: await file.text(),
        });
      } catch {
        // Skip files that cannot be read as text.
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
    setNotice(`Imported ${imported.length} files into this browser workspace.`);
  };

  const exportZip = async () => {
    try {
      const zip = new JSZip();

      files.forEach((file) => {
        zip.file(file.name, file.content);
      });

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

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <div className="studio-topbar-left">
          <Link href="/" className="studio-back" aria-label="Back to homepage">
            <ArrowLeft size={16} />
          </Link>

          <span className="studio-brand-mark">A</span>
          <span className="studio-brand-name">alphex-studio</span>
          <span className="studio-powered">POWERED BY ALPHEX AI</span>
        </div>

        <div className="studio-topbar-actions">
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
            onClick={() => setShowSettings(true)}
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
                : "Browser storage unavailable. Export a backup."}
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
                theme="vs-dark"
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
          <aside className="studio-assistant">
            <div className="studio-panel-heading">
              <span>
                <Sparkles size={15} />
                AI ASSISTANT
              </span>
              <button
                title="Hide assistant"
                onClick={() => setShowAssistant(false)}
              >
                <PanelRightClose size={15} />
              </button>
            </div>

            <div className="studio-assistant-content">
              <div className="studio-ai-orb">
                <Sparkles size={22} />
              </div>

              <h2>Your coding partner.</h2>

              <p>
                AI chat and provider configuration will be added in a later
                batch. Your current code remains editable without an AI key.
              </p>

              <button
                className="studio-connect-button"
                onClick={() => setShowSettings(true)}
              >
                <Settings2 size={15} />
                AI settings
              </button>

              <div className="studio-ai-disclaimer">
                <strong>Local project storage</strong>
                <span>
                  Project files are saved in this browser. Export a ZIP for a
                  portable backup.
                </span>
              </div>
            </div>
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
                <h2 id="settings-title">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="studio-settings-message">
              <Sparkles size={18} />
              <div>
                <strong>AI configuration is coming next.</strong>
                <p>
                  Automatic local saving is enabled where browser storage is
                  available. AI provider integration will be implemented in a
                  later batch.
                </p>
              </div>
            </div>

            <button
              className="studio-export-button studio-modal-close"
              onClick={() => setShowSettings(false)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
