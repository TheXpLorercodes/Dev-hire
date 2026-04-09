import React from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const STEPS = [
  { key: "queued",     label: "Queued",            desc: "Waiting for worker…" },
  { key: "processing", label: "AI Refining Brief",  desc: "GPT-4 crafting prompts…" },
  { key: "generating", label: "Image Generation",   desc: "Stability AI painting…" },
  { key: "completed",  label: "Done!",              desc: "Your assets are ready." },
];

const STATUS_STEP = {
  queued:     0,
  processing: 1,
  completed:  3,
  failed:     -1,
};

export default function JobStatusBar({ status, jobId, elapsed, error }) {
  if (status === "idle") return null;

  const stepIdx = STATUS_STEP[status] ?? 1;

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        {status === "failed" ? (
          <XCircle size={18} color="var(--danger)" />
        ) : status === "completed" ? (
          <CheckCircle2 size={18} color="var(--success)" />
        ) : (
          <Loader2 size={18} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
        )}
        <span style={styles.headerText}>
          {status === "failed" ? "Generation Failed" :
           status === "completed" ? "Content Ready!" :
           "Generating your content…"}
        </span>
        {elapsed > 0 && (
          <span style={styles.elapsed}>
            <Clock size={11} /> {elapsed}s
          </span>
        )}
      </div>

      {/* Job ID */}
      {jobId && (
        <div style={styles.jobId}>
          Job: <code>{jobId.slice(0, 8)}…</code>
        </div>
      )}

      {/* Progress steps */}
      {status !== "failed" && (
        <div style={styles.steps}>
          {STEPS.map((step, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx && status !== "completed";
            const complete = status === "completed";
            return (
              <div key={step.key} style={styles.stepRow}>
                <div style={{
                  ...styles.dot,
                  background: (done || complete) ? "var(--success)" :
                              active ? "var(--accent)" : "var(--bg3)",
                  borderColor: (done || complete) ? "var(--success)" :
                               active ? "var(--accent)" : "var(--border)",
                  boxShadow: active ? "0 0 12px var(--accent)" : "none",
                }}>
                  {(done || complete) && <CheckCircle2 size={10} color="#000" />}
                  {active && <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    ...styles.line,
                    background: (done || complete) ? "var(--success)" : "var(--border)",
                  }} />
                )}
                <div style={styles.stepInfo}>
                  <span style={{ ...styles.stepLabel, color: active ? "var(--text)" : (done || complete) ? "var(--success)" : "var(--text-muted)" }}>
                    {step.label}
                  </span>
                  {active && <span style={styles.stepDesc}>{step.desc}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {status === "failed" && error && (
        <div style={styles.error}>{error}</div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const styles = {
  wrap: {
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: 20, display: "flex",
    flexDirection: "column", gap: 12,
  },
  header: { display: "flex", alignItems: "center", gap: 10 },
  headerText: { fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, flex: 1 },
  elapsed: { display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 12 },
  jobId: { fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" },
  steps: { display: "flex", flexDirection: "column", gap: 0, paddingLeft: 4 },
  stepRow: { display: "flex", alignItems: "flex-start", gap: 10, position: "relative" },
  dot: {
    width: 22, height: 22, borderRadius: "50%", border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 2, transition: "all 0.3s", zIndex: 1,
  },
  line: {
    position: "absolute", left: 10, top: 24, width: 2, height: 28,
    transition: "background 0.3s",
  },
  stepInfo: { paddingBottom: 28, display: "flex", flexDirection: "column", gap: 2 },
  stepLabel: { fontSize: 13, fontWeight: 600, transition: "color 0.3s" },
  stepDesc: { fontSize: 11, color: "var(--accent2)" },
  error: {
    background: "rgba(255,79,106,0.1)", border: "1px solid var(--danger)",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: 13, color: "var(--danger)",
  },
};
