import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = "http://localhost:8080/api";

const TABS = [
  { key: "all",      label: "All",      icon: "👥", color: "text-gray-700" },
  { key: "pending",  label: "Pending",  icon: "⏳", color: "text-amber-600" },
  { key: "verified", label: "Verified", icon: "✅", color: "text-emerald-600" },
  { key: "blocked",  label: "Blocked",  icon: "🚫", color: "text-red-500" },
  { key: "reports",  label: "Reports",  icon: "⚠️", color: "text-red-700" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState("all");
  const [caregivers, setCaregivers]       = useState([]);
  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch caregivers ────────────────────────────────
  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/caregivers/all`);
      const data = Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || [];
      setCaregivers(data);
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
      setCaregivers([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch reported caregivers ───────────────────────
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else {
      fetchCaregivers();
    }
  }, [activeTab]);

  // ── Actions ─────────────────────────────────────
  const doAction = async (id, action, newStatus) => {
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setCaregivers((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
      setReports((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
      if (selected?.id === id) setSelected((p) => ({ ...p, status: newStatus }));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const verify  = (id) => doAction(id, "verify",  "VERIFIED");
  const block   = (id) => doAction(id, "block",   "BLOCKED");
  const unblock = (id) => doAction(id, "unblock", "PENDING");

  // ── Derived data ─────────────────────────────
  const counts = {
    all:      caregivers.length,
    pending:  caregivers.filter((c) => (c.status || "PENDING") === "PENDING").length,
    verified: caregivers.filter((c) => c.status === "VERIFIED").length,
    blocked:  caregivers.filter((c) => c.status === "BLOCKED").length,
    reports:  reports.length,
  };

  const filtered = (activeTab === "reports" ? reports : caregivers)
    .filter((c) => {
      const s = c.status || "PENDING";
      if (activeTab === "pending")  return s === "PENDING";
      if (activeTab === "verified") return s === "VERIFIED";
      if (activeTab === "blocked")  return s === "BLOCKED";
      return true;
    })
    .filter((c) =>
      !search ||
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase())
    );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  // ── Sub-components ─────────────────────────────
  const StatusBadge = ({ status = "PENDING" }) => {
    const cfg = {
      PENDING:  { cls: "bg-amber-50 text-amber-700 border-amber-200",   label: "Pending" },
      VERIFIED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Verified" },
      BLOCKED:  { cls: "bg-red-50 text-red-600 border-red-200",         label: "Blocked" },
    };
    const { cls, label } = cfg[status] ?? { cls: "bg-gray-100 text-gray-500 border-gray-200", label: status };
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
        {status === "PENDING" && "⏳"}
        {status === "VERIFIED" && "✅"}
        {status === "BLOCKED" && "🚫"}
        {label}
      </span>
    );
  };

  const ActionButtons = ({ c, size = "sm" }) => {
    const busy = actionLoading === c.id;
    const status = c.status || "PENDING";
    const base = size === "sm"
      ? "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
      : "text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5";

    return (
      <div className="flex gap-2 flex-wrap">
        {status !== "VERIFIED" && status !== "BLOCKED" && (
          <button onClick={() => verify(c.id)} disabled={busy}
            className={`${base} bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm`}>
            {busy ? <span className="animate-spin">⏳</span> : "✓"} Verify
          </button>
        )}
        {status === "VERIFIED" && (
          <button onClick={() => block(c.id)} disabled={busy}
            className={`${base} bg-red-500 hover:bg-red-600 text-white shadow-sm`}>
            {busy ? <span className="animate-spin">⏳</span> : "✕"} Block
          </button>
        )}
        {status === "PENDING" && (
          <button onClick={() => block(c.id)} disabled={busy}
            className={`${base} bg-gray-400 hover:bg-gray-500 text-white shadow-sm`}>
            {busy ? <span className="animate-spin">⏳</span> : "✕"} Block
          </button>
        )}
        {status === "BLOCKED" && (
          <button onClick={() => unblock(c.id)} disabled={busy}
            className={`${base} bg-blue-500 hover:bg-blue-600 text-white shadow-sm`}>
            {busy ? <span className="animate-spin">⏳</span> : "↩"} Unblock
          </button>
        )}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="h-9" />
            <h1 className="font-bold text-gray-800">ElderEase Admin</h1>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-[65px]">
        {/* HERO */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-8">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <div className="flex flex-wrap gap-4">
            {Object.keys(counts).map((key) => (
              <div key={key} className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center min-w-[120px]">
                <p className="text-2xl font-bold">{counts[key]}</p>
                <p className="text-xs uppercase">{key}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TABS + SEARCH */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${activeTab === t.key
                      ? "bg-gray-800 text-white border-gray-800 shadow-md"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                    ${activeTab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search caregivers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
              </div>
              <button
                onClick={activeTab === "reports" ? fetchReports : fetchCaregivers}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">No results</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={`http://localhost:8080/uploads/${c.profilePhoto?.replace(/\s+/g, "_")}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=e5e7eb&color=374151&size=200`; }}
                    />
                    <div className="absolute top-3 left-3"><StatusBadge status={c.status || "PENDING"} /></div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <h3 className="font-bold text-gray-900 text-base truncate">{c.fullName}</h3>
                    <p className="text-xs text-gray-400 truncate">{c.speciality || "General Care"}</p>
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button onClick={() => setSelected(c)} className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors">View</button>
                      <ActionButtons c={c} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Selected modal same as previous */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e)=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-lg">{selected.fullName} <StatusBadge status={selected.status || "PENDING"} /></h3>
            <p className="text-gray-500">{selected.email}</p>
            <div className="mt-4"><ActionButtons c={selected} size="md"/></div>
          </div>
        </div>
      )}
    </div>
  );
}