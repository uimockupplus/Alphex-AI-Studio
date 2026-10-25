
import Link from "next/link";
import Image from "next/image";
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
  Tablet,
  Smartphone,
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
  {
    number: "01",
    title: "Import",
    description: "Bring in your existing website or project."
  },
  {
    number: "02",
    title: "Edit",
    description: "Write code or collaborate with your AI assistant."
  },
  {
    number: "03",
    title: "Preview",
    description: "Check the layout and investigate errors."
  },
  {
    number: "04",
    title: "Export",
    description: "Download your edited project as a ZIP."
  }
];

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Alphex AI Studio home">
      <Image
        src="/alphex-logo.png"
        alt="Alphex"
        width={164}
        height={62}
        priority
        className="brand-logo"
      />
      <span className="brand-divider" />
      <span className="brand-product">
        <span>AI STUDIO</span>
        <small>POWERED BY ALPHEX AI</small>
      </span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-dot" />
      {children}
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="workspace-preview">
      <div className="preview-topbar">
        <div className="preview-window-controls">
          <span />
          <span />
          <span />
        </div>

        <div className="preview-brand">
          <span className="preview-brand-mark">A</span>
          alphex-studio
        </div>

        <span className="preview-status">
          <span className="green-dot" />
          Browser workspace
        </span>
      </div>

      <div className="preview-toolbar">
        <div className="preview-breadcrumb">
          <FolderOpen size={14} />
          <span>my-website</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">index.html</span>
        </div>

        <div className="preview-toolbar-actions">
          <span><Play size={12} /> Preview</span>
          <span className="preview-export">Export ZIP <ArrowUpRight size={12} /></span>
        </div>
      </div>

      <div className="preview-main">
        <aside className="preview-explorer">
          <div className="preview-section-label">EXPLORER</div>

          <div className="preview-folder">
            <ChevronDown size={13} />
            <FolderOpen size={14} />
            my-website
          </div>

          <div className="preview-file preview-file-active">
            <span className="file-type html-type">5</span>
            index.html
          </div>

          <div className="preview-file">
            <span className="file-type css-type">#</span>
            styles.css
          </div>

          <div className="preview-file">
            <span className="file-type js-type">JS</span>
            app.js
          </div>

          <div className="preview-file">
            <span className="file-type json-type">{ }</span>
            package.json
          </div>

          <div className="preview-file">
            <span className="file-type md-type">M</span>
            README.md
          </div>

          <div className="preview-local-note">
            <ShieldCheck size={14} />
            <span>Files stay local</span>
          </div>
        </aside>

        <section className="preview-editor">
          <div className="preview-editor-tab">
            <span className="file-type html-type">5</span>
            index.html
            <span className="preview-unsaved-dot" />
          </div>

          <div className="preview-code">
            <div><span>1</span><i className="code-muted">&lt;!DOCTYPE html&gt;</i></div>
            <div><span>2</span><i className="code-purple">&lt;html</i> <i className="code-blue">lang</i>=<i className="code-green">"en"</i><i className="code-purple">&gt;</i></div>
            <div><span>3</span>  <i className="code-purple">&lt;head&gt;</i></div>
            <div><span>4</span>    <i className="code-purple">&lt;title&gt;</i>My Website<i className="code-purple">&lt;/title&gt;</i></div>
            <div><span>5</span>    <i className="code-purple">&lt;link</i> <i className="code-blue">rel</i>=<i className="code-green">"stylesheet"</i></div>
            <div><span>6</span>      <i className="code-blue">href</i>=<i className="code-green">"styles.css"</i><i className="code-purple">&gt;</i></div>
            <div><span>7</span>  <i className="code-purple">&lt;/head&gt;</i></div>
            <div><span>8</span>  <i className="code-purple">&lt;body&gt;</i></div>
            <div><span>9</span>    <i className="code-purple">&lt;main</i> <i className="code-blue">class</i>=<i className="code-green">"hero"</i><i className="code-purple">&gt;</i></div>
            <div className="code-active"><span>10</span>      <i className="code-purple">&lt;h1&gt;</i></div>
            <div><span>11</span>        Build something</div>
            <div><span>12</span>        remarkable.</div>
            <div><span>13</span>      <i className="code-purple">&lt;/h1&gt;</i></div>
            <div><span>14</span>      <i className="code-purple">&lt;p&gt;</i></div>
            <div><span>15</span>        Your ideas start here.</div>
            <div><span>16</span>      <i className="code-purple">&lt;/p&gt;</i></div>
            <div><span>17</span>    <i className="code-purple">&lt;/main&gt;</i></div>
            <div><span>18</span>  <i className="code-purple">&lt;/body&gt;</i></div>
            <div><span>19</span><i className="code-purple">&lt;/html&gt;</i></div>
          </div>

          <div className="preview-editor-footer">
            <span>HTML</span>
            <span>Ln 10, Col 11</span>
            <span>UTF-8</span>
          </div>
        </section>

        <aside className="preview-assistant">
          <div className="assistant-heading">
            <span className="assistant-icon"><Sparkles size={15} /></span>
            <span>
              <strong>AI Assistant</strong>
              <small>Powered by your provider</small>
            </span>
          </div>

          <div className="assistant-context">
            <Code2 size={12} />
            index.html
          </div>

          <div className="assistant-message">
            <div className="assistant-message-title">
              <Sparkles size={12} />
              Suggested improvement
            </div>

            <p>
              Add a viewport meta tag to make your website display correctly
              on mobile devices.
            </p>

            <div className="assistant-code">
              <span className="code-purple">&lt;meta</span>{" "}
              <span className="code-blue">name</span>=
              <span className="code-green">"viewport"</span>
              <br />
              {"  "}<span className="code-blue">content</span>=
              <span className="code-green">"width=device-width, initial-scale=1"</span>
              <br />
              <span className="code-purple">/&gt;</span>
            </div>

            <button type="button" className="assistant-review">
              Review changes <ArrowRight size={12} />
            </button>
          </div>

          <div className="assistant-quick-actions">
            <span>Explain this file</span>
            <span>Find bugs</span>
            <span>Improve code</span>
          </div>

          <div className="assistant-input">
            <span>Ask about your code...</span>
            <span className="assistant-send"><ArrowUpRight size={14} /></span>
          </div>
        </aside>
      </div>

      <div className="preview-bottom">
        <div className="preview-bottom-tabs">
          <span className="bottom-tab-active"><Globe2 size={13} /> PREVIEW</span>
          <span><Braces size={13} /> DIAGNOSTICS</span>
        </div>

        <div className="preview-browser">
          <div className="preview-browser-copy">
            <span className="preview-browser-eyebrow">YOUR NEXT IDEA</span>
            <h3>Build something<br />remarkable.</h3>
            <p>Your code. Your creativity. Your rules.</p>
            <span className="preview-browser-button">Explore more <ArrowRight size={12} /></span>
          </div>

          <div className="preview-browser-art" aria-hidden="true">
            <div className="art-frame art-frame-one" />
            <div className="art-frame art-frame-two" />
            <div className="art-frame art-frame-three" />
          </div>
        </div>

        <div className="preview-browser-footer">
          <span><span className="green-dot" /> Ready to preview</span>
          <span className="preview-device-icons">
            <Monitor size={13} />
            <Tablet size={13} />
            <Smartphone size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand />

          <nav className="main-nav" aria-label="Main navigation">
            <Link href="#features">Features</Link>
            <Link href="#workflow">How it works</Link>
            <Link href="#privacy">Privacy</Link>
          </nav>

          <div className="header-actions">
            <Link href="/?studio=1" className="header-text-link">
              Open Studio <ArrowUpRight size={15} />
            </Link>
            <Link href="/?studio=1" className="button button-primary button-header">
              Launch Studio <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-copy">
            <Eyebrow>YOUR BROWSER. YOUR CODE. YOUR RULES.</Eyebrow>

            <h1>
              Ideas into
              <br />
              <span>working code.</span>
            </h1>

            <p className="hero-description">
              Bring your web projects into one focused workspace.
              Edit with a professional code editor, get help from AI,
              and preview your changes before you ship.
            </p>

            <div className="hero-actions">
              <Link href="/?studio=1" className="button button-primary button-large">
                <Code2 size={17} />
                Open AI Studio
                <ArrowRight size={17} />
              </Link>

              <Link href="/?studio=1&import=zip" className="button button-secondary button-large">
                <FileArchive size={17} />
                Import ZIP
              </Link>
            </div>

            <div className="hero-benefits">
              <span><ShieldCheck size={15} /> Browser-based project processing</span>
              <span><Zap size={15} /> Bring your own AI provider</span>
            </div>

            <div className="hero-attribution">
              <span className="attribution-line" />
              <span>POWERED BY <strong>ALPHEX AI</strong></span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-label">
              <span className="visual-label-dot" />
              INSIDE THE WORKSPACE
              <span className="visual-label-line" />
              <span>01 / 01</span>
            </div>

            <WorkspacePreview />

            <div className="floating-card floating-card-left">
              <span className="floating-icon"><Braces size={17} /></span>
              <span>
                <strong>Code without setup</strong>
                <small>Work in your browser</small>
              </span>
            </div>

            <div className="floating-card floating-card-right">
              <span className="floating-icon"><Sparkles size={17} /></span>
              <span>
                <strong>AI when you need it</strong>
                <small>Your provider, your key</small>
              </span>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <span>BUILT FOR PEOPLE WHO BUILD</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-heading">
          <Eyebrow>A SIMPLE WORKFLOW</Eyebrow>
          <h2>From source to shipped.</h2>
          <p>Four focused steps. One place to get your work done.</p>
        </div>

        <div className="workflow-grid">
          {workflow.map((step, index) => (
            <article className="workflow-item" key={step.number}>
              <div className="workflow-number">
                <span>{step.number}</span>
                {index !== workflow.length - 1 && <ArrowRight size={16} />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <Eyebrow>THE ESSENTIALS</Eyebrow>
          <h2>
            Everything you need.
            <br />
            <span>Nothing in your way.</span>
          </h2>
          <p>
            A practical coding environment designed around the things
            that matter: your files, your changes, your preview and your workflow.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card-top">
                  <span className="feature-icon"><Icon size={21} strokeWidth={1.7} /></span>
                  <span className="feature-number">{feature.number}</span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="feature-card-footer">
                  <span>BUILT INTO THE WORKSPACE</span>
                  <ArrowUpRight size={15} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div className="privacy-copy">
          <Eyebrow>YOUR WORK STAYS YOURS</Eyebrow>
          <h2>
            Your project.
            <br />
            <span>Your control.</span>
          </h2>
          <p>
            Project files are processed in your browser. Your configured AI
            provider receives only the code and context you choose to send.
            Your API key stays in browser storage rather than being sent to
            an Alphex backend.
          </p>

          <Link href="/?studio=1" className="text-link">
            Explore the workspace <ArrowRight size={16} />
          </Link>
        </div>

        <div className="privacy-list">
          <div className="privacy-row">
            <span className="privacy-icon"><FolderOpen size={19} /></span>
            <span className="privacy-row-copy">
              <strong>Browser-based project handling</strong>
              <small>No project upload to an Alphex backend is required.</small>
            </span>
            <Check size={17} className="privacy-check" />
          </div>

          <div className="privacy-row">
            <span className="privacy-icon"><Bot size={19} /></span>
            <span className="privacy-row-copy">
              <strong>Your AI provider, your credentials</strong>
              <small>Configure the endpoint, model and API key yourself.</small>
            </span>
            <Check size={17} className="privacy-check" />
          </div>

          <div className="privacy-row">
            <span className="privacy-icon"><FileArchive size={19} /></span>
            <span className="privacy-row-copy">
              <strong>Export when you're ready</strong>
              <small>Download your edited project and decide where it goes.</small>
            </span>
            <Check size={17} className="privacy-check" />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-overline">ALPHEX AI STUDIO / 001</div>

        <div className="cta-content">
          <Eyebrow>YOUR NEXT PROJECT STARTS HERE</Eyebrow>
          <h2>
            Bring the code.
            <br />
            <span>Build the rest.</span>
          </h2>
          <p>Import. Edit. Preview. Deploy.</p>

          <Link href="/?studio=1" className="button button-primary button-large">
            Open your workspace <ArrowRight size={17} />
          </Link>

          <div className="cta-attribution">
            Powered by <strong>Alphex AI</strong>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <Brand />

        <p>Import. Edit. Preview. Deploy.</p>

        <div className="footer-right">
          <span>Powered by Alphex AI</span>
          <span>© {new Date().getFullYear()} Alphex</span>
        </div>
      </footer>
    </main>
  );
}
