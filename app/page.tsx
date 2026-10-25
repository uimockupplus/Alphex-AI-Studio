import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  Code2,
  FileArchive,
  Files,
  FolderOpen,
  Globe2,
  Monitor,
  Play,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Tablet,
  Zap
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: Files,
    title: "Your entire project",
    description:
      "Import ZIP archives or folders. Explore nested files and work with your existing website in the browser."
  },
  {
    number: "02",
    icon: Braces,
    title: "A real code editor",
    description:
      "Edit HTML, CSS, JavaScript, JSON and more with Monaco, syntax highlighting, search and familiar shortcuts."
  },
  {
    number: "03",
    icon: Bot,
    title: "AI on your terms",
    description:
      "Use your own compatible AI provider to explain code, find bugs, improve files and generate new features."
  },
  {
    number: "04",
    icon: Monitor,
    title: "Preview as you build",
    description:
      "Inspect your website at desktop, tablet and mobile widths. Catch problems before exporting your project."
  }
];

const workflow = [
  { number: "01", title: "Import", description: "Bring in your existing website or project." },
  { number: "02", title: "Edit", description: "Write code or collaborate with your AI assistant." },
  { number: "03", title: "Preview", description: "Check the layout and investigate errors." },
  { number: "04", title: "Export", description: "Download your edited project as a ZIP." }
];

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Alphex AI Studio home">
      <Image
        src="/alphex-logo.png"
        alt="Alphex AI Studio"
        width={230}
        height={76}
        priority
        className="brand-logo"
      />
      <span className="brand-attribution">POWERED BY <strong>ALPHEX AI</strong></span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>;
}

function WorkspacePreview() {
  return (
    <div className="workspace-preview" aria-label="Illustration of the Alphex AI Studio workspace">
      <div className="preview-topbar">
        <div className="preview-window-controls"><span /><span /><span /></div>
        <div className="preview-brand"><span className="preview-brand-mark">A</span>alphex-studio</div>
        <span className="preview-status"><span className="green-dot" />Browser workspace</span>
      </div>
      <div className="preview-toolbar">
        <div className="preview-breadcrumb"><FolderOpen size={14} /><span>my-website</span><span className="breadcrumb-separator">/</span><span className="breadcrumb-current">index.html</span></div>
        <div className="preview-toolbar-actions"><span><Play size={12} /> Preview</span><span className="preview-export">Export ZIP <ArrowUpRight size={12} /></span></div>
      </div>
      <div className="preview-main">
        <aside className="preview-explorer">
          <div className="preview-section-label">EXPLORER</div>
