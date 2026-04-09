import React, { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";

const PERSONAS = ["Professional", "Witty", "Urgent", "Inspirational", "Casual"];
const PLATFORMS = ["LinkedIn", "Instagram", "Twitter", "Facebook"];

const PERSONA_META = {
  Professional: { color: "#7c5cff", emoji: "💼" },
  Witty:        { color: "#ff5cf7", emoji: "🎭" },
  Urgent:       { color: "#ff4f6a", emoji: "🔥" },
  Inspirational:{ color: "#ffcc55", emoji: "✨" },
  Casual:       { color: "#5cfff0", emoji: "😎" },
};

export default function GenerateForm({ onSubmit, loading }) {
  const [brief, setBrief] = useState("");
  const [persona, setPersona] = useState("Professional");
  const [platform, setPlatform] = useState("Instagram");
  const [includeImage, setIncludeImage] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brief.trim()) return;
    onSubmit({ brief: brief.trim(), persona, platform, include_image: includeImage });
  };

  const accent = PERSONA_META[persona]?.color || "#7c5cff";

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Brief */}
      <div style={styles.field}>
        <label style={styles.label}>Campaign Brief</label>
        <textarea
          style={{ ...styles.textarea, borderColor: brief ? accent + "66" : "var(--border)" }}
          placeholder='e.g. "red running shoes for marathon athletes"'
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          maxLength={500}
          required
        />
        <span style={styles.charCount}>{brief.length}/500</span>
      </div>

      {/* Persona */}
      <div style={styles.field}>
        <label style={styles.label}>Brand Persona</label>
        <div style={styles.chipRow}>
          {PERSONAS.map((p) => (
            <button
              key={p}
              type="button"
              style={{
                ...styles.chip,
                background: persona === p ? PERSONA_META[p].color + "22" : "transparent",
                borderColor: persona === p ? PERSONA_META[p].color : "var(--border)",
                color: persona === p ? PERSONA_META[p].color : "var(--text-muted)",
              }}
              onClick={() => setPersona(p)}
            >
              {PERSONA_META[p].emoji} {p}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div style={styles.twoCol}>
        <div style={styles.field}>
          <label style={styles.label}>Platform</label>
          <div style={{ position: "relative" }}>
            <select
              style={styles.select}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map((pl) => <option key={pl}>{pl}</option>)}
            </select>
            <ChevronDown size={14} style={styles.selectIcon} />
          </div>
        </div>

        {/* Image toggle */}
        <div style={styles.field}>
          <label style={styles.label}>Generate Visual</label>
          <button
            type="button"
            style={{
              ...styles.toggle,
              background: includeImage ? "var(--accent)" : "var(--bg3)",
              borderColor: includeImage ? "var(--accent)" : "var(--border)",
            }}
            onClick={() => setIncludeImage(!includeImage)}
          >
            <span style={{
              ...styles.toggleKnob,
              transform: includeImage ? "translateX(22px)" : "translateX(2px)",
            }} />
          </button>
          <span style={{ ...styles.toggleLabel, color: includeImage ? "var(--success)" : "var(--text-muted)" }}>
            {includeImage ? "Image ON" : "Text Only"}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !brief.trim()}
        style={{
          ...styles.submit,
          opacity: loading || !brief.trim() ? 0.5 : 1,
          background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
          boxShadow: loading || !brief.trim() ? "none" : "0 0 30px rgba(124,92,255,0.4)",
        }}
      >
        <Zap size={16} />
        {loading ? "Generating…" : "Generate Content"}
      </button>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8, position: "relative" },
  label: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "var(--text-muted)",
    fontFamily: "var(--font-head)",
  },
  textarea: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", color: "var(--text)",
    padding: "12px 14px", fontSize: 14, resize: "vertical",
    fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.2s",
  },
  charCount: { position: "absolute", bottom: 8, right: 12, fontSize: 11, color: "var(--text-muted)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "6px 14px", borderRadius: 100, border: "1px solid",
    fontSize: 13, cursor: "pointer", transition: "all 0.2s",
    fontFamily: "var(--font-body)", fontWeight: 500,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" },
  select: {
    width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", color: "var(--text)", padding: "10px 36px 10px 14px",
    fontSize: 14, appearance: "none", cursor: "pointer", outline: "none",
    fontFamily: "var(--font-body)",
  },
  selectIcon: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" },
  toggle: {
    width: 48, height: 26, borderRadius: 100, border: "1px solid",
    cursor: "pointer", position: "relative", transition: "all 0.3s",
    padding: 0,
  },
  toggleKnob: {
    position: "absolute", top: 2, width: 20, height: 20,
    borderRadius: "50%", background: "#fff", transition: "transform 0.3s",
  },
  toggleLabel: { fontSize: 13, marginTop: 4, fontWeight: 500 },
  submit: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 24px", borderRadius: "var(--radius)", border: "none",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "var(--font-head)", letterSpacing: "0.03em",
    transition: "all 0.3s", marginTop: 4,
  },
};
