import React, { useState } from "react";
import { Copy, CheckCheck, Download, Eye, EyeOff, Sparkles, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "../utils/api";

export default function ResultCard({ result }) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  if (!result) return null;

  const imageUrl = getImageUrl(result.image_url);

  const copyText = () => {
    navigator.clipboard.writeText(result.marketing_copy || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `viralgen-${result.job_id?.slice(0, 8)}.png`;
    a.click();
  };

  const PERSONA_COLORS = {
    Professional: "#7c5cff",
    Witty: "#ff5cf7",
    Urgent: "#ff4f6a",
    Inspirational: "#ffcc55",
    Casual: "#5cfff0",
  };

  const accentColor = PERSONA_COLORS[result.persona] || "#7c5cff";

  return (
    <div style={styles.card}>
      {/* Header badges */}
      <div style={styles.badges}>
        <span style={{ ...styles.badge, borderColor: accentColor + "88", color: accentColor }}>
          {result.persona}
        </span>
        <span style={styles.badge2}>{result.platform}</span>
        <span style={{ ...styles.badge2, marginLeft: "auto", fontSize: 10 }}>
          Job {result.job_id?.slice(0, 8)}
        </span>
      </div>

      {/* Image */}
      {imageUrl && (
        <div style={styles.imageWrap}>
          <img
            src={imageUrl}
            alt="Generated visual"
            style={styles.image}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div style={styles.imageOverlay}>
            <button onClick={downloadImage} style={styles.overlayBtn}>
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      )}

      {!imageUrl && (
        <div style={styles.noImage}>
          <ImageIcon size={28} color="var(--text-muted)" />
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Text-only mode</span>
        </div>
      )}

      {/* Marketing Copy */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Sparkles size={14} color={accentColor} />
          <span style={{ ...styles.sectionTitle, color: accentColor }}>Marketing Copy</span>
          <button onClick={copyText} style={styles.copyBtn}>
            {copied ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <div style={styles.copyBox}>
          <pre style={styles.copyText}>{result.marketing_copy}</pre>
        </div>
      </div>

      {/* Refined Prompt (collapsible) */}
      {result.refined_prompt && (
        <div style={styles.section}>
          <button
            style={styles.promptToggle}
            onClick={() => setShowPrompt(!showPrompt)}
          >
            {showPrompt ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPrompt ? "Hide" : "Show"} AI-Refined Image Prompt
          </button>
          {showPrompt && (
            <div style={styles.promptBox}>
              <p style={styles.promptText}>{result.refined_prompt}</p>
            </div>
          )}
        </div>
      )}

      {/* Brief */}
      <div style={styles.briefRow}>
        <span style={styles.briefLabel}>Original Brief:</span>
        <span style={styles.briefVal}>"{result.brief}"</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--bg2)",
    border: "1px solid var(--border-hi)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  badges: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "14px 18px", borderBottom: "1px solid var(--border)",
  },
  badge: {
    padding: "3px 10px", borderRadius: 100, fontSize: 11,
    border: "1px solid", fontWeight: 700, fontFamily: "var(--font-head)",
    letterSpacing: "0.05em",
  },
  badge2: {
    padding: "3px 10px", borderRadius: 100, fontSize: 11,
    border: "1px solid var(--border)", color: "var(--text-muted)",
    fontFamily: "var(--font-head)",
  },
  imageWrap: {
    position: "relative", overflow: "hidden",
    maxHeight: 400, background: "var(--bg3)",
  },
  image: {
    width: "100%", display: "block", objectFit: "cover",
    transition: "transform 0.3s",
  },
  imageOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "20px 16px 12px",
    display: "flex", justifyContent: "flex-end",
    opacity: 0, transition: "opacity 0.2s",
    // hover via CSS class not easily done inline; always visible on mobile
    pointerEvents: "none",
  },
  overlayBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)",
    color: "#fff", padding: "7px 14px", fontSize: 12, cursor: "pointer",
    pointerEvents: "all",
  },
  noImage: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 8, padding: "32px",
    background: "var(--bg3)", borderBottom: "1px solid var(--border)",
  },
  section: { padding: "16px 18px", borderTop: "1px solid var(--border)" },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-head)",
    letterSpacing: "0.1em", textTransform: "uppercase", flex: 1,
  },
  copyBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
    padding: "5px 12px", fontSize: 12, cursor: "pointer",
  },
  copyBox: {
    background: "var(--bg3)", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)", padding: "14px",
  },
  copyText: {
    whiteSpace: "pre-wrap", fontFamily: "var(--font-body)",
    fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: 0,
  },
  promptToggle: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", color: "var(--text-muted)",
    fontSize: 12, cursor: "pointer", padding: 0,
  },
  promptBox: {
    marginTop: 10, background: "var(--bg3)",
    border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
  },
  promptText: {
    fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7,
    fontStyle: "italic",
  },
  briefRow: {
    padding: "12px 18px", borderTop: "1px solid var(--border)",
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  briefLabel: { fontSize: 11, color: "var(--text-muted)", fontWeight: 600 },
  briefVal: { fontSize: 12, color: "var(--text)" },
};
