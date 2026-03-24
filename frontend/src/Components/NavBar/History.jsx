import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:8080/api";

const ACTION_META = {
  VIEWED:    { label: "Viewed",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  icon: "👁" },
  INTERESTED:{ label: "Interested",color: "#d4a843", bg: "rgba(212,168,67,0.1)",  icon: "⭐" },
  CONTACTED: { label: "Contacted", color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: "📞" },
  HIRED:     { label: "Hired",     color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: "✅" },
  DEFAULT:   { label: "Activity",  color: "#d4a843", bg: "rgba(212,168,67,0.1)",  icon: "◎" },
};

const getActionMeta = (action) => ACTION_META[action?.toUpperCase()] || ACTION_META.DEFAULT;

const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  try {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return "—"; }
};

export default function History() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";

  const [history, setHistory] = useState([]);
  const [caregivers, setCaregivers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user data to get history
      const userRes = await axios.get(`${BASE}/users/user/${userName}`);
      const historyItems = userRes.data?.history || [];
      setHistory(historyItems.slice().reverse()); // newest first

      // Fetch all verified caregivers once
      const cgRes = await axios.get(`${BASE}/caregivers/verified`);
      const cgMap = {};
      (cgRes.data || []).forEach(c => { cgMap[c.id] = c; });
      setCaregivers(cgMap);
    } catch (err) {
      console.error(err);
      showToast("Failed to load history", "error");
    } finally {
      setLoading(false);
    }
  };

  const uniqueActions = ["ALL", ...new Set(history.map(h => h.action?.toUpperCase()).filter(Boolean))];

  const filtered = history.filter(item => {
    const cg = caregivers[item.caregiverId];
    const matchSearch = !search ||
      cg?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      cg?.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      cg?.address?.toLowerCase().includes(search.toLowerCase()) ||
      item.action?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterAction === "ALL" || item.action?.toUpperCase() === filterAction;
    return matchSearch && matchFilter;
  });

  // Group by date
  const grouped = filtered.reduce((acc, item) => {
    let label = "Unknown";
    try {
      const d = new Date(item.timestamp);
      const now = new Date();
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays === 0) label = "Today";
      else if (diffDays === 1) label = "Yesterday";
      else if (diffDays < 7) label = "This Week";
      else if (diffDays < 30) label = "This Month";
      else label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {}
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "This Week", "This Month"];
  const sortedGroups = [
    ...groupOrder.filter(g => grouped[g]),
    ...Object.keys(grouped).filter(g => !groupOrder.includes(g)),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        :root { --gold: #d4a843; --dark: #080810; --card: #0d0d1c; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }

        .page-load { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .item-in { opacity:0; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        .shimmer-gold {
          background: linear-gradient(90deg, var(--gold) 0%, #f0c96a 40%, var(--gold) 60%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 3s linear infinite;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          background: var(--card);
          border: 1px solid rgba(212,168,67,0.06);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
        }
        .history-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--gold);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .history-item:hover {
          border-color: rgba(212,168,67,0.2);
          background: rgba(212,168,67,0.03);
          transform: translateX(4px);
        }
        .history-item:hover::before { transform: scaleY(1); }

        .filter-pill {
          border: 1px solid rgba(212,168,67,0.15);
          background: transparent;
          color: rgba(255,255,255,0.45);
          padding: 8px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .filter-pill:hover { border-color: rgba(212,168,67,0.4); color: var(--gold); }
        .filter-pill.active { background: rgba(212,168,67,0.12); border-color: var(--gold); color: var(--gold); }

        .search-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,168,67,0.12);
          color: #fff;
          padding: 12px 20px 12px 44px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
          width: 300px;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-input:focus { border-color: rgba(212,168,67,0.45); }

        .back-btn {
          background: transparent;
          border: 1px solid rgba(212,168,67,0.18);
          color: rgba(255,255,255,0.55);
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex; align-items: center; gap: 8px;
        }
        .back-btn:hover { border-color: var(--gold); color: var(--gold); }

        .stat-pill {
          background: rgba(212,168,67,0.06);
          border: 1px solid rgba(212,168,67,0.12);
          padding: 16px 24px;
          text-align: center;
          transition: all 0.3s;
        }
        .stat-pill:hover { background: rgba(212,168,67,0.1); border-color: rgba(212,168,67,0.3); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--gold); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999, padding: "14px 24px", background: toast.type === "error" ? "#ef4444" : toast.type === "success" ? "#22c55e" : "#d4a843", color: toast.type === "info" ? "#080810" : "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, animation: "fadeUp 0.4s both" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(212,168,67,0.1)", padding: "0 48px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,8,16,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button className="back-btn" onClick={() => navigate("/dash")}>← Dashboard</button>
          <div style={{ width: 1, height: 24, background: "rgba(212,168,67,0.12)" }} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
              Activity <span style={{ color: "var(--gold)", fontStyle: "italic" }}>History</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(212,168,67,0.5)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>
              Your Timeline
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
          Hello, <span style={{ color: "var(--gold)" }}>{userName}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 48px" }}>

        {/* Hero */}
        <div className="page-load" style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 1, height: 48, background: "rgba(212,168,67,0.4)" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase" }}>Your Journey</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1 }}>
            Activity <span className="shimmer-gold" style={{ fontStyle: "italic", fontWeight: 600 }}>Timeline</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
            Every caregiver you viewed, starred, or contacted — all in one place.
          </p>
        </div>

        {/* Stats row */}
        {!loading && history.length > 0 && (
          <div className="page-load" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
            {[
              { label: "Total Activities", val: history.length },
              { label: "Caregivers Seen", val: new Set(history.map(h => h.caregiverId)).size },
              { label: "This Week", val: history.filter(h => { try { return (new Date() - new Date(h.timestamp)) < 604800000; } catch { return false; } }).length },
              { label: "Unique Actions", val: new Set(history.map(h => h.action?.toUpperCase())).size },
            ].map((s, i) => (
              <div key={i} className="stat-pill">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: "var(--gold)", lineHeight: 1, marginBottom: 8 }}>{s.val}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {uniqueActions.map(action => (
              <button
                key={action}
                className={`filter-pill ${filterAction === action ? "active" : ""}`}
                onClick={() => setFilterAction(action)}
              >
                {action === "ALL" ? "All" : getActionMeta(action).label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(212,168,67,0.4)", fontSize: 14 }}>🔍</span>
            <input
              className="search-input"
              placeholder="Search history..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0" }}>
            <div style={{ width: 48, height: 48, border: "2px solid rgba(212,168,67,0.15)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.9s linear infinite", marginBottom: 20 }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>Loading history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📜</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>
              {search || filterAction !== "ALL" ? "No results found" : "No history yet"}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 300, marginBottom: 28 }}>
              {search || filterAction !== "ALL" ? "Try adjusting your filters." : "Start browsing caregivers to build your history."}
            </p>
            {(!search && filterAction === "ALL") && (
              <button
                onClick={() => navigate("/dash")}
                style={{ background: "var(--gold)", color: "#080810", border: "none", padding: "12px 32px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}
              >
                Browse Caregivers
              </button>
            )}
          </div>
        ) : (
          /* Timeline */
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {sortedGroups.map((group, gi) => (
              <div key={group}>
                {/* Group label */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{group}</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.08)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{grouped[group].length} item{grouped[group].length !== 1 ? "s" : ""}</span>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {grouped[group].map((item, idx) => {
                    const cg = caregivers[item.caregiverId];
                    const meta = getActionMeta(item.action);
                    const photo = cg?.profilePhoto?.replace(/\s+/g, "_").trim();

                    return (
                      <div
                        key={`${item.caregiverId}-${idx}`}
                        className="history-item item-in"
                        style={{ animationDelay: `${(gi * 100) + idx * 40}ms` }}
                        onClick={() => cg && navigate(`/profile/${item.caregiverId}`)}
                      >
                        {/* Action icon */}
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: meta.bg, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {meta.icon}
                        </div>

                        {/* Caregiver photo */}
                        {cg ? (
                          <div style={{ width: 48, height: 48, flexShrink: 0, overflow: "hidden" }}>
                            <img
                              src={`http://localhost:8080/uploads/${photo}`}
                              alt={cg.fullName}
                              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cg.fullName || "C")}&background=1a1a2e&color=d4a843&size=100&bold=true`; }}
                            />
                          </div>
                        ) : (
                          <div style={{ width: 48, height: 48, background: "rgba(212,168,67,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,168,67,0.3)", fontSize: 18, flexShrink: 0 }}>?</div>
                        )}

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {cg?.fullName || `Caregiver #${item.caregiverId?.slice(-6) || "—"}`}
                            </h3>
                            {cg?.speciality && (
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>
                                · {cg.speciality}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: meta.color, letterSpacing: 1, textTransform: "uppercase", background: meta.bg, padding: "3px 10px", border: `1px solid ${meta.color}25` }}>
                              {meta.label}
                            </span>
                            {cg?.address && (
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                                📍 {cg.address}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Time + arrow */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                            {formatTime(item.timestamp)}
                          </span>
                          {cg && (
                            <span style={{ color: "rgba(212,168,67,0.4)", fontSize: 14, transition: "color 0.2s" }}>→</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 48, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>
            Showing {filtered.length} of {history.length} activities
          </div>
        )}

      </div>
    </div>
  );
}