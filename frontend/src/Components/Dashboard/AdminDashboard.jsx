import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState("all");
  const [caregivers, setCaregivers]       = useState([]);
  const [reported, setReported]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");

  const adminToken = localStorage.getItem("adminToken");
  const axiosConfig = adminToken
    ? { headers: { Authorization: `Bearer ${adminToken}` } }
    : {};

  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const [pendingRes, verifiedRes, blockedRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/pending`, axiosConfig),
        axios.get(`${BASE_URL}/admin/verified`, axiosConfig),
        axios.get(`${BASE_URL}/admin/blocked`, axiosConfig),
      ]);

      const normalize = (res) => Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setCaregivers([
        ...normalize(pendingRes),
        ...normalize(verifiedRes),
        ...normalize(blockedRes),
      ]);
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
      setCaregivers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReported = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/reported`, axiosConfig);
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

  const fetchAdminBookings = async (status = "ALL") => {
    try {
      const url = status === "ALL"
        ? `${import.meta.env.VITE_API_URL}/api/bookings/admin`
        : `${import.meta.env.VITE_API_URL}/api/bookings/admin?status=${status}`;
      const res = await axios.get(url, axiosConfig);
      setAdminBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch admin bookings:", err);
      setAdminBookings([]);
    }
  };

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin");
      return;
    }
    fetchCaregivers();
    fetchReported();
  }, [adminToken, navigate]);

  useEffect(() => {
    fetchAdminBookings(bookingStatusFilter);
  }, [bookingStatusFilter]);

  useEffect(() => {
    const fetchBookings = async (id) => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/caregiver/${id}`, axiosConfig);
        const data = Array.isArray(res.data) ? res.data : [];
        const now = new Date();
        const isCurrent = (b) => {
          if (!b) return false;
          const status = (b.status || "").toUpperCase();
          if (status !== "CONFIRMED") return false;
          if (!b.startTime && !b.endTime) return true;
          const start = b.startTime ? new Date(b.startTime) : null;
          const end = b.endTime ? new Date(b.endTime) : null;
          if (start && end) return now >= start && now <= end;
          if (start && !end) return now >= start;
          if (!start && end) return now <= end;
          return false;
        };
        setBookings(data.filter(isCurrent));
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      }
    };
    if (selected?.id) fetchBookings(selected.id);
    else setBookings([]);
  }, [selected]);

  const doAction = async (id, action, newStatus) => {
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/${action}`, {}, axiosConfig);
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

  const counts = {
    all:      caregivers.length,
    pending:  caregivers.filter((c) => (c.status || "PENDING") === "PENDING").length,
    verified: caregivers.filter((c) => c.status === "VERIFIED").length,
    blocked:  caregivers.filter((c) => c.status === "BLOCKED").length,
    reports:  reported.length,
  };

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

  // Status config
  const STATUS_CFG = {
    PENDING:  { badge: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   label: "Pending",  icon: "⏳" },
    VERIFIED: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", label: "Verified", icon: "✅" },
    BLOCKED:  { badge: "bg-red-100 text-red-600 border-red-200",             dot: "bg-red-400",     label: "Blocked",  icon: "🚫" },
  };

  const StatusBadge = ({ status = "PENDING" }) => {
    const cfg = STATUS_CFG[status] ?? { badge: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400", label: status, icon: "" };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const ActionButtons = ({ c, size = "sm" }) => {
    const busy   = actionLoading === c.id;
    const status = c.status || "PENDING";
    const base   = size === "sm"
      ? "text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
      : "text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5";

    return (
      <div className="flex gap-2 flex-wrap">
        {status !== "VERIFIED" && status !== "BLOCKED" && (
          <button onClick={() => verify(c.id)} disabled={busy}
            className={`${base} bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✓</span>} Verify
          </button>
        )}
        {status === "VERIFIED" && (
          <button onClick={() => block(c.id)} disabled={busy}
            className={`${base} bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-sm shadow-red-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✕</span>} Block
          </button>
        )}
        {status === "PENDING" && (
          <button onClick={() => block(c.id)} disabled={busy}
            className={`${base} bg-gray-400 hover:bg-gray-500 active:scale-95 text-white shadow-sm`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✕</span>} Block
          </button>
        )}
        {status === "BLOCKED" && (
          <button onClick={() => unblock(c.id)} disabled={busy}
            className={`${base} bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-sm shadow-blue-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>↩</span>} Unblock
          </button>
        )}
      </div>
    );
  };

  // Gradient backgrounds per status for the card header area
  const cardGradient = {
    PENDING:  "from-amber-100 to-orange-50",
    VERIFIED: "from-emerald-100 to-teal-50",
    BLOCKED:  "from-red-100 to-rose-50",
  };

  const CaregiverCard = ({ c }) => {
    const status  = c.status || "PENDING";
    const photo   = c.profilePhoto?.replace(/\s+/g, "_").trim();
    const initials = (c.fullName || "C").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const gradient = cardGradient[status] ?? "from-gray-100 to-gray-50";

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-250 group shadow-sm">

        {/* ── Photo header ── */}
        <div className={`relative bg-gradient-to-br ${gradient} pt-6 pb-4 px-4 flex flex-col items-center`}>

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Status badge — top right */}
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={status} />
          </div>

          {/* Avatar ring */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-md opacity-30 scale-110 ${
              status === "VERIFIED" ? "bg-emerald-400" :
              status === "BLOCKED"  ? "bg-red-400"     :
                                      "bg-amber-300"
            }`} />
            <div className="relative w-24 h-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-gray-200">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${photo}`}
                alt={c.fullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=e5e7eb&color=374151&size=200&bold=true&font-size=0.4`;
                }}
              />
            </div>
          </div>

          {/* Name + speciality under avatar */}
          <div className="relative mt-3 text-center">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{c.fullName || "—"}</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{c.speciality || "General Care"}</p>
          </div>
        </div>

        {/* ── Info body ── */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2 truncate">
              <span className="w-5 text-center text-gray-400">✉</span>
              <span className="truncate">{c.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 text-center text-gray-400">📞</span>
              <span>{c.phoneNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="w-5 text-center text-gray-400">📍</span>
              <span className="truncate">{c.address || "—"}</span>
            </div>
            {(c.experience || c.chargeMin) && (
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-gray-400">💼</span>
                <span>
                  {c.experience && `${c.experience} yrs`}
                  {c.chargeMin && c.chargeMax && ` · Rs ${c.chargeMin}–${c.chargeMax}`}
                </span>
              </div>
            )}
          </div>

          {/* Actions row */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              onClick={() => setSelected(c)}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors"
            >
              View Details
            </button>
            <ActionButtons c={c} size="sm" />
          </div>
        </div>
      </div>
    );
  };

  const ReportCard = ({ c }) => (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-250 group shadow-sm">
      {/* Reported header — no photo */}
      <div className="relative bg-gradient-to-br from-orange-50 to-red-50 pt-5 pb-4 px-4 flex flex-col items-center">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-orange-100 text-orange-700 border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Reported
          </span>
        </div>
        <div className="relative w-16 h-16 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-orange-100 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="relative mt-2 text-center">
          <h3 className="font-bold text-gray-900 text-base">{c.fullName || "—"}</h3>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{c.speciality || "General Care"}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-2 truncate">
            <span className="w-5 text-center text-gray-400">✉</span>
            <span className="truncate">{c.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 text-center text-gray-400">📞</span>
            {c.phoneNumber || "—"}
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="w-5 text-center text-gray-400">📍</span>
            <span className="truncate">{c.address || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <span className="w-5 text-center">⚠️</span>
            <span>{c.reason || "Reported"}</span>
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

  return (
    <div className="min-h-screen w-screen bg-gray-50">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="h-9" />
            <div className="border-l border-gray-200 pl-3">
              <p className="text-xs text-emerald-600 uppercase tracking-widest leading-none font-semibold">Admin</p>
              <h1 className="font-bold text-gray-800">ElderEase Admin</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="pt-[57px]">

        {/* HERO */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 pt-8 pb-0">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Caregiver Management</p>
            <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>

            {/* Stat boxes */}
            <div className="flex gap-4 flex-wrap mb-6">
              {[
                { label: "Total",    val: counts.all,      cls: "text-white",         sub: "text-gray-400",    bg: "bg-white/10 border-white/20" },
                { label: "Pending",  val: counts.pending,  cls: "text-amber-300",     sub: "text-amber-400",   bg: "bg-amber-400/20 border-amber-400/30" },
                { label: "Verified", val: counts.verified, cls: "text-emerald-300",   sub: "text-emerald-400", bg: "bg-emerald-400/20 border-emerald-400/30" },
                { label: "Blocked",  val: counts.blocked,  cls: "text-red-300",       sub: "text-red-400",     bg: "bg-red-400/20 border-red-400/30" },
                { label: "Reports",  val: counts.reports,  cls: "text-orange-300",    sub: "text-orange-400",  bg: "bg-orange-400/20 border-orange-400/30" },
              ].map(({ label, val, cls, sub, bg }) => (
                <div key={label} className={`${bg} border rounded-xl px-6 py-4 text-center min-w-[110px]`}>
                  <p className={`text-2xl font-bold ${cls}`}>{val}</p>
                  <p className={`text-xs mt-0.5 uppercase tracking-widest ${sub}`}>{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 border border-white/20 rounded-3xl p-5 mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white/80">Who booked who</p>
                  <h3 className="text-lg font-semibold text-white">Booking records</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-xs text-white/70 uppercase tracking-wider">Filter</label>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-400 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="ALL">All</option>
                    <option value="BOOKED">Booked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {adminBookings.length === 0 ? (
                  <p className="text-sm text-white/70">No bookings match this filter.</p>
                ) : (
                  adminBookings.map((b) => (
                    <div key={b.id} className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-white flex items-center justify-between gap-3">
                      <span>{b.userName || b.userId} → {b.caregiverName || b.caregiverId}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">{(b.status || "UNKNOWN").toLowerCase()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nav tabs */}
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
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-0.5">{counts[t.key]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
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
              onClick={() => { fetchCaregivers(); fetchReported(); fetchAdminBookings(bookingStatusFilter); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
              title="Refresh"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Cards grid */}
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
              {filtered.map((c) =>
                activeTab === "reports"
                  ? <ReportCard key={c.id} c={c} />
                  : <CaregiverCard key={c.id} c={c} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Caregiver Profile</h3>
                <StatusBadge status={selected.status || "PENDING"} />
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Modal hero with photo */}
              <div className={`rounded-xl bg-gradient-to-br ${cardGradient[selected.status || "PENDING"] ?? "from-gray-100 to-gray-50"} p-5 flex items-center gap-4`}>
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-30 scale-110 ${
                    (selected.status || "PENDING") === "VERIFIED" ? "bg-emerald-400" :
                    (selected.status || "PENDING") === "BLOCKED"  ? "bg-red-400"     : "bg-amber-300"
                  }`} />
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`}
                    alt={selected.fullName}
                    className="relative w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=e5e7eb&color=374151&size=200`;
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-gray-600 mt-0.5 font-medium">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: "📞", label: "Phone",           val: selected.phoneNumber },
                  { icon: "✉️", label: "Email",           val: selected.email },
                  { icon: "📍", label: "Address",         val: selected.address },
                  { icon: "👤", label: "Gender",          val: selected.gender },
                  { icon: "🎯", label: "Speciality",      val: selected.speciality },
                  { icon: "🧾", label: "Certification",   val: selected.certification },
                  { icon: "💼", label: "Experience",      val: selected.experience ? `${selected.experience} Years` : null },
                  { icon: "💰", label: "Daily Rate",      val: selected.chargeMin && selected.chargeMax ? `Rs ${selected.chargeMin} – ${selected.chargeMax}/day` : null },
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
                    src={selected.citizenshipPhoto?.startsWith("http")
                      ? selected.citizenshipPhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-gray-200 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {selected.certificatePhoto && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">🧾 Certification Proof</p>
                  <img
                    src={selected.certificatePhoto?.startsWith("http")
                      ? selected.certificatePhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.certificatePhoto?.replace(/\s+/g, "_")}`}
                    alt="Certification Proof"
                    className="w-full rounded-xl border border-gray-200 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {bookings && bookings.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">📅 Bookings</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {bookings.map((b) => (
                      <li key={b.id}>{b.userName || b.userId}</li>
                    ))}
                  </ul>
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