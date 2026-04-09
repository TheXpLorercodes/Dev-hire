import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Zap, LayoutGrid, History, Info, Github } from "lucide-react";
import GenerateForm from "./components/GenerateForm";
import JobStatusBar from "./components/JobStatusBar";
import ResultCard from "./components/ResultCard";
import HistoryPanel from "./components/HistoryPanel";
import { useGenerate } from "./hooks/useGenerate";
import "./index.css";

const TABS = [
  { key: "generate", label: "Generate", icon: Zap },
  { key: "history",  label: "History",  icon: History },
];

export default function App() {
  const [tab, setTab] = useState("generate");
  const { generate, reset, status, jobId, result, error, elapsed } = useGenerate();

  const handleGenerate = async (payload) => {
    toast.loading("Submitting job…", { id: "gen", duration: 3000 });
    await generate(payload);
    toast.dismiss("gen");
  };

  const handleHistorySelect = (item) => {
    // Show selected history item in a toast for now
    toast(`Brief: "${item.brief}" — ${item.status}`, { icon: "📋" });
  };

  const isLoading = status === "queued" || status === "processing";

  return (
    <div style={styles.root}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={styles.logoName}>ViralGen AI</div>
            <div style={styles.logoSub}>by Infotact Solutions</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              style={{
                ...styles.navBtn,
                background: tab === key ? "rgba(124,92,255,0.15)" : "transparent",
                borderColor: tab === key ? "var(--accent)" : "transparent",
                color: tab === key ? "var(--accent)" : "var(--text-muted)",
              }}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Info box */}
        <div style={styles.infoBox}>
          <Info size={13} color="var(--accent)" />
          <p style={styles.infoText}>
            Powered by GPT-4 + Stability AI SDXL. Jobs are processed asynchronously via Celery + Redis.
          </p>
        </div>

        <div style={styles.sidebarFooter}>
          <span style={styles.footerText}>ViralGen AI v1.0</span>
          <span style={styles.footerText}>Confidential — Infotact Solutions</span>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              {tab === "generate" ? "Generate Content" : "History"}
            </h1>
            <p style={styles.pageSubtitle}>
              {tab === "generate"
                ? "Enter a brief → GPT-4 refines it → SDXL generates the visual"
                : "Past generation jobs from MongoDB"}
            </p>
          </div>
          {tab === "generate" && result && (
            <button style={styles.newBtn} onClick={reset}>
              + New Generation
            </button>
          )}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {tab === "generate" && (
            <div style={styles.generateLayout}>
              {/* Left panel */}
              <div style={styles.leftPanel}>
                <div style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <Zap size={14} color="var(--accent)" />
                    <span style={styles.panelTitle}>Campaign Brief</span>
                  </div>
                  <GenerateForm onSubmit={handleGenerate} loading={isLoading} />
                </div>

                {/* Status bar */}
                {status !== "idle" && (
                  <JobStatusBar
                    status={status}
                    jobId={jobId}
                    elapsed={elapsed}
                    error={error}
                  />
                )}
              </div>

              {/* Right panel — Result */}
              <div style={styles.rightPanel}>
                {result ? (
                  <ResultCard result={result} />
                ) : (
                  <div style={styles.placeholder}>
                    <div style={styles.placeholderIcon}>
                      <LayoutGrid size={32} color="var(--border-hi)" />
                    </div>
                    <p style={styles.placeholderTitle}>Your content will appear here</p>
                    <p style={styles.placeholderSub}>
                      Submit a brief on the left to generate multi-modal ad content
                    </p>
                    <div style={styles.featureList}>
                      {[
                        "🤖 Prompt Refinement Agent (GPT-4)",
                        "🎨 Image Generation (Stability AI SDXL)",
                        "📝 Brand Voice Enforcement",
                        "⚡ Async Queue (Celery + Redis)",
                        "💾 History Logging (MongoDB)",
                      ].map((f) => (
                        <div key={f} style={styles.featureItem}>{f}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "history" && (
            <HistoryPanel onSelect={handleHistorySelect} />
          )}
        </div>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
          },
        }}
      />
    </div>
  );
}

const styles = {
  root: {
    display: "flex", minHeight: "100vh", position: "relative", zIndex: 1,
  },

  // Sidebar
  sidebar: {
    width: 240, flexShrink: 0, background: "var(--bg2)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column", padding: "24px 16px",
    position: "sticky", top: 0, height: "100vh", overflow: "hidden",
  },
  logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 36 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 20px rgba(124,92,255,0.4)",
  },
  logoName: {
    fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 15,
    letterSpacing: "-0.02em",
  },
  logoSub: { fontSize: 10, color: "var(--text-muted)", marginTop: 1 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", borderRadius: "var(--radius-sm)",
    border: "1px solid", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "var(--font-head)",
    transition: "all 0.2s", textAlign: "left",
  },
  infoBox: {
    background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.2)",
    borderRadius: "var(--radius-sm)", padding: "12px",
    display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16,
  },
  infoText: { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 },
  sidebarFooter: {
    display: "flex", flexDirection: "column", gap: 3,
    paddingTop: 16, borderTop: "1px solid var(--border)",
  },
  footerText: { fontSize: 10, color: "var(--text-muted)" },

  // Main
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  topBar: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "28px 32px 0", flexWrap: "wrap", gap: 12,
  },
  pageTitle: {
    fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 26,
    letterSpacing: "-0.03em",
  },
  pageSubtitle: { color: "var(--text-muted)", fontSize: 13, marginTop: 4 },
  newBtn: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", color: "var(--text)",
    padding: "9px 18px", fontSize: 13, cursor: "pointer",
    fontFamily: "var(--font-head)", fontWeight: 600,
    transition: "border-color 0.2s",
  },
  content: { flex: 1, padding: "24px 32px 32px" },
  generateLayout: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
    alignItems: "start",
  },
  leftPanel: { display: "flex", flexDirection: "column", gap: 16 },
  rightPanel: {},
  panelCard: {
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: 22,
    display: "flex", flexDirection: "column", gap: 20,
  },
  panelHeader: { display: "flex", alignItems: "center", gap: 8 },
  panelTitle: {
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14,
  },

  // Placeholder
  placeholder: {
    background: "var(--bg2)", border: "1px dashed var(--border-hi)",
    borderRadius: "var(--radius)", padding: 40,
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 12, textAlign: "center", minHeight: 400, justifyContent: "center",
  },
  placeholderIcon: {
    width: 64, height: 64, borderRadius: 20,
    background: "var(--bg3)", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  placeholderTitle: {
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16,
  },
  placeholderSub: { color: "var(--text-muted)", fontSize: 13, maxWidth: 280 },
  featureList: {
    display: "flex", flexDirection: "column", gap: 8, marginTop: 16, width: "100%",
  },
  featureItem: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", padding: "9px 14px",
    fontSize: 12, color: "var(--text-muted)", textAlign: "left",
  },
};
