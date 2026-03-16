import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState("all");
  const [caregivers, setCaregivers]       = useState([]);
  const [reported, setReported]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch caregivers ────────────────────────────────
  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/caregivers/all`);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setCaregivers(data);
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
      setCaregivers([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch reported caregivers ────────────────────────
  const fetchReported = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setReported(data);
    } catch (err) {
      console.error("Failed to fetch reported profiles:", err);
      setReported([]);
    }
  };

  useEffect(() => {
    fetchCaregivers();
    fetchReported();
  }, []);

  // ── Actions ─────────────────────────────────────
  const doAction = async (id, action, newStatus) => {
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setCaregivers((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
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
    reports:  reported.length,
  };

  const NAV_TABS = [
    { key: "all",      label: "All",      icon: "👥", path: null,              activeBg: "bg-white text-gray-900",          inactiveBg: "bg-white/10 text-white hover:bg-white/20" },
    { key: "pending",  label: "Pending",  icon: "⏳", path: "/admin/pending",  activeBg: "bg-amber-400 text-white",          inactiveBg: "bg-white/10 text-white hover:bg-amber-400/40" },
    { key: "verified", label: "Verified", icon: "✅", path: "/admin/verified", activeBg: "bg-emerald-500 text-white",        inactiveBg: "bg-white/10 text-white hover:bg-emerald-500/40" },
    { key: "blocked",  label: "Blocked",  icon: "🚫", path: "/admin/blocked",  activeBg: "bg-red-500 text-white",            inactiveBg: "bg-white/10 text-white hover:bg-red-500/40" },
    { key: "reports",  label: "Reports",  icon: "⚠️", path: "/admin/reports",  activeBg: "bg-orange-400 text-white",         inactiveBg: "bg-white/10 text-white hover:bg-orange-400/40" },
  ];

  const filtered = activeTab === "reports"
    ? reported.filter((r) => !search || r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.reason?.toLowerCase().includes(search.toLowerCase()))
    : caregivers
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

  const handleTabClick = (tab) => {
    if (tab.path) {
      navigate(tab.path);
    } else {
      setActiveTab(tab.key);
    }
  };

  // ── Sub-components ─────────────────────────────
  const StatusBadge = ({ status = "PENDING" }) => {
    const cfg = {
      PENDING:  { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "Pending" },
      VERIFIED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Verified" },
      BLOCKED:  { cls: "bg-red-50 text-red-600 border-red-200",             label: "Blocked" },
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
      <main className="pt-[57px]">

        {/* ── HERO ── */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 pt-8 pb-0">
          <div className="max-w-7xl mx-auto">

            {/* Title */}
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Caregiver Management</p>
            <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>

            {/* Stat boxes */}
            <div className="flex gap-4 flex-wrap mb-6">
              <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-white">{counts.all}</p>
                <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">Total</p>
              </div>
              <div className="bg-amber-400/20 border border-amber-400/30 rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-amber-300">{counts.pending}</p>
                <p className="text-xs text-amber-400 mt-0.5 uppercase tracking-widest">Pending</p>
              </div>
              <div className="bg-emerald-400/20 border border-emerald-400/30 rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-emerald-300">{counts.verified}</p>
                <p className="text-xs text-emerald-400 mt-0.5 uppercase tracking-widest">Verified</p>
              </div>
              <div className="bg-red-400/20 border border-red-400/30 rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-red-300">{counts.blocked}</p>
                <p className="text-xs text-red-400 mt-0.5 uppercase tracking-widest">Blocked</p>
              </div>
              <div className="bg-orange-400/20 border border-orange-400/30 rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-orange-300">{counts.reports}</p>
                <p className="text-xs text-orange-400 mt-0.5 uppercase tracking-widest">Reports</p>
              </div>
            </div>

            {/* Inline nav — below the boxes, flush to hero bottom */}
            <div className="flex flex-wrap border-t border-white/10">
              {[
                { key: "all",      label: "All",      icon: "👥", path: null              },
                { key: "pending",  label: "Pending",  icon: "⏳", path: "/admin/pending"  },
                { key: "verified", label: "Verified", icon: "✅", path: "/admin/verified" },
                { key: "blocked",  label: "Blocked",  icon: "🚫", path: "/admin/blocked"  },
                { key: "reports",  label: "Reports",  icon: "⚠️", path: "/admin/reports"  },
              ].map((t) => (
                <span
                  key={t.key}
                  onClick={() => t.path ? navigate(t.path) : setActiveTab("all")}
                  className="cursor-pointer flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  {t.icon} {t.label}
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-0.5">
                    {counts[t.key]}
                  </span>
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* ── CONTENT area (tabs filter inline, nav tabs route away) ── */}
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Search + Refresh */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Search ${activeTab === "reports" ? "reported profiles..." : "caregivers..."}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
            </div>
            <button
              onClick={() => { fetchCaregivers(); fetchReported(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
              title="Refresh"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Loading / Empty / Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <svg className="animate-spin h-10 w-10 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm font-medium">Loading caregivers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
              <p className="text-base font-semibold text-gray-500">No {activeTab === "reports" ? "reported profiles" : "caregivers"} found</p>
              <p className="text-sm mt-1 text-gray-400">Try a different tab or clear the search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c) => {
                if (activeTab === "reports") {
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                      <div className="p-4 flex flex-col flex-1 gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{c.fullName || "—"}</h3>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{c.speciality || "General Care"}</p>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-gray-400">✉</span> <span className="truncate">{c.email || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">📞</span> {c.phoneNumber || "—"}
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-gray-400">📍</span> <span className="truncate">{c.address || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-red-600">
                            <span className="text-gray-400">⚠️</span> <span>{c.reason || "Reported"}</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <button onClick={() => setSelected(c)} className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const status = c.status || "PENDING";
                const photo  = c.profilePhoto?.replace(/\s+/g, "_").trim();
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${photo}`}
                        alt={c.fullName}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=e5e7eb&color=374151&size=200`; }}
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={status} />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{c.fullName || "—"}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.speciality || "General Care"}</p>
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400">✉</span> <span className="truncate">{c.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">📞</span> {c.phoneNumber || "—"}
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400">📍</span> <span className="truncate">{c.address || "—"}</span>
                        </div>
                        {(c.experience || c.chargeMin) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">💼</span>
                            {c.experience && `${c.experience} yrs`}
                            {c.chargeMin && c.chargeMax && ` · Rs ${c.chargeMin}–${c.chargeMax}`}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button onClick={() => setSelected(c)} className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors">
                          View Details
                        </button>
                        <ActionButtons c={c} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Caregiver Profile</h3>
                <StatusBadge status={selected.status || "PENDING"} />
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={`http://localhost:8080/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`}
                  alt={selected.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=e5e7eb&color=374151&size=200`; }}
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: "📞", label: "Phone",      val: selected.phoneNumber },
                  { icon: "📍", label: "Address",    val: selected.address },
                  { icon: "💼", label: "Experience", val: selected.experience ? `${selected.experience} Years` : null },
                  { icon: "💰", label: "Rate",       val: selected.chargeMin && selected.chargeMax ? `Rs ${selected.chargeMin} – ${selected.chargeMax}/day` : null },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{val || "—"}</p>
                  </div>
                ))}
              </div>
              {selected.details && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.details}</p>
                </div>
              )}
              {selected.citizenshipPhoto && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">📄 Citizenship Document</p>
                  <img
                    src={`http://localhost:8080/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-gray-200 object-cover max-h-52"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <ActionButtons c={selected} size="md" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}