import React, { useEffect, useState } from "react";
import { History, RefreshCw, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { fetchHistory, getImageUrl } from "../utils/api";

export default function HistoryPanel({ onSelect }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(20, 0);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const STATUS_ICON = {
    completed: <CheckCircle2 size={13} color="var(--success)" />,
    failed: <XCircle size={13} color="var(--danger)" />,
    processing: <Clock size={13} color="var(--accent)" />,
    pending: <Clock size={13} color="var(--text-muted)" />,
  };

  const PERSONA_COLORS = {
    Professional: "#7c5cff", Witty: "#ff5cf7", Urgent: "#ff4f6a",
    Inspirational: "#ffcc55", Casual: "#5cfff0",
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <History size={16} color="var(--accent)" />
        <span style={styles.title}>History</span>
        <span style={styles.count}>{total} jobs</span>
        <button onClick={load} style={styles.refreshBtn} title="Refresh">
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
        </button>
      </div>

      {items.length === 0 && !loading && (
        <div style={styles.empty}>
          <History size={24} color="var(--border)" />
          <span>No history yet</span>
        </div>
      )}

      <div style={styles.list}>
        {items.map((item) => {
          const imgUrl = getImageUrl(item.image_url);
          const color = PERSONA_COLORS[item.persona] || "#7c5cff";
          return (
            <button
              key={item.job_id}
              style={styles.item}
              onClick={() => onSelect && onSelect(item)}
            >
              {/* Thumbnail */}
              <div style={styles.thumb}>
                {imgUrl ? (
                  <img src={imgUrl} alt="" style={styles.thumbImg}
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div style={styles.thumbPlaceholder} />
                )}
              </div>

              {/* Info */}
              <div style={styles.info}>
                <div style={styles.infoTop}>
                  <span style={{ ...styles.persona, color }}>{item.persona}</span>
                  <span style={styles.platform}>{item.platform}</span>
                  {STATUS_ICON[item.status] || STATUS_ICON.pending}
                </div>
                <p style={styles.brief}>"{item.brief}"</p>
                <span style={styles.time}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                </span>
              </div>

              <ChevronRight size={14} color="var(--border-hi)" />
            </button>
          );
        })}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

const styles = {
  wrap: {
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", overflow: "hidden",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "14px 16px", borderBottom: "1px solid var(--border)",
  },
  title: { fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, flex: 1 },
  count: { fontSize: 11, color: "var(--text-muted)" },
  refreshBtn: {
    background: "none", border: "none", color: "var(--text-muted)",
    cursor: "pointer", padding: 4, display: "flex",
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 8, padding: 32, color: "var(--text-muted)", fontSize: 13,
  },
  list: { overflow: "auto", maxHeight: 500 },
  item: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", width: "100%", background: "none",
    border: "none", borderBottom: "1px solid var(--border)",
    cursor: "pointer", textAlign: "left", color: "var(--text)",
    transition: "background 0.15s",
  },
  thumb: {
    width: 44, height: 44, borderRadius: "var(--radius-sm)",
    overflow: "hidden", background: "var(--bg3)", flexShrink: 0,
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  thumbPlaceholder: { width: "100%", height: "100%", background: "var(--bg3)" },
  info: { flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  infoTop: { display: "flex", alignItems: "center", gap: 6 },
  persona: { fontSize: 10, fontWeight: 700, fontFamily: "var(--font-head)", letterSpacing: "0.05em" },
  platform: { fontSize: 10, color: "var(--text-muted)" },
  brief: {
    fontSize: 12, color: "var(--text)", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0,
  },
  time: { fontSize: 10, color: "var(--text-muted)" },
};
