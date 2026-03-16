import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // TODO: replace with GET /api/admin/reports when backend is ready
  const fetchReports = async () => {
    setLoading(true);
    try {
const res = await axios.get(`${BASE_URL}/caregivers/admin/verified`);      
const data = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.content) ? res.data.content
        : Array.isArray(res.data?.data) ? res.data.data
        : [];

      // Augment with mock report data for UI testing
      const augmented = data.map((c, i) => ({
        ...c,
        reportCount: (i % 4) + 1,
        reason:      ["Inappropriate behavior", "Fraudulent credentials", "No-show without notice", "Verbal abuse", "Theft reported", "Unprofessional conduct"][i % 6],
        reportedBy:  `user_${1000 + i}`,
        reportedAt:  new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
      }));

      setReports(augmented);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Block reported caregiver ──────────────────────────────────────────────
  const blockCaregiver = async (id) => {
    setActionLoading(id + "_block");
    try {
      await axios.put(`${BASE_URL}/caregivers/admin/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast("Caregiver blocked successfully. 🚫", "warning");
    } catch (err) {
      console.error(err);
      showToast("Failed to block. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };


  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = reports.filter((r) =>
      !search ||
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
    );

  const totalCount = reports.length;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };



  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-screen bg-orange-50 font-sans">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toast.type === "error"   ? "bg-red-500 text-white" :
            toast.type === "warning" ? "bg-orange-500 text-white" :
            "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ElderEase" className="h-9 w-auto" />
            <div className="border-l border-gray-200 pl-3">
              <p className="text-xs text-orange-500 uppercase tracking-widest leading-none font-semibold">Admin</p>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Reports & Complaints</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-white hover:text-white border border-gray-200 hover:border-gray-300 px-4 py-1.5 rounded-lg transition-all font-medium"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-all font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="pt-[57px]">

        {/* ── HERO ── */}
        <div className="w-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 px-6 py-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-4 right-1/4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  ⚠️ Reported
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">Reports & Complaints</h2>
              <p className="text-orange-100 mt-1.5 text-sm max-w-md">
                Review caregiver complaints submitted by care receivers. Investigate and take action.
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{totalCount}</p>
                <p className="text-xs text-orange-100 mt-1 uppercase tracking-widest">Reports</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{filtered.length}</p>
                <p className="text-xs text-orange-100 mt-1 uppercase tracking-widest">Shown</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">

            {/* Search + Refresh */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-gray-700 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                />
              </div>
              <button
                onClick={fetchReports}
                className="p-2.5 rounded-xl border border-orange-200 bg-white text-orange-500 hover:text-orange-700 hover:border-orange-300 transition-all"
                title="Refresh"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mb-4" />
              <p className="text-orange-500 font-medium text-sm">Fetching reports...</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-orange-200">
                {search ? "🔍" : "✅"}
              </div>
              <p className="text-lg font-bold text-orange-800">
                {search ? "No results found" : "No reports!"}
              </p>
              <p className="text-sm text-orange-400 mt-1">
                {search ? "Try clearing the search." : "All caregivers are behaving well."}
              </p>
            </div>

          ) : (
            /* ── Report Cards ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r, idx) => {
                const busy  = actionLoading === r.id + "_block";
                const photo = r.profilePhoto?.replace(/\s+/g, "_").trim();

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-orange-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
                  >
                    {/* Top color strip */}
                    <div className="h-1.5 w-full bg-orange-400" />

                    {/* Card header with photo + name */}
                    <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                      <div className="relative flex-shrink-0">
                        <img
                          src={`http://localhost:8080/uploads/${photo}`}
                          alt={r.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.fullName || "C")}&background=fed7aa&color=9a3412&size=100&bold=true`;
                          }}
                        />
                        {/* Report count bubble */}
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                          {r.reportCount}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{r.fullName || "—"}</h3>
                        <p className="text-xs text-gray-400 truncate">{r.speciality || "General Care"}</p>
                      </div>
                    </div>

                    {/* Report details */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      {/* Reason box */}
                      <div className="rounded-xl p-3 border bg-orange-50 border-orange-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">⚠️ Reason</p>
                        <p className="text-sm font-semibold text-gray-800">{r.reason}</p>
                      </div>

                      {/* Meta info */}
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <span>✉</span>
                          <span className="truncate">{r.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📞</span>
                          <span>{r.phoneNumber || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>👤</span>
                            <span>Reported by: <span className="font-medium text-gray-700">{r.reportedBy}</span></span>
                          </div>
                          <span className="text-gray-400">{r.reportedAt}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelected(r)}
                          className="text-xs text-orange-400 hover:text-orange-700 font-semibold underline underline-offset-2 transition-colors"
                        >
                          View Details
                        </button>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => blockCaregiver(r.id)}
                            disabled={busy}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-40"
                          >
                            {actionLoading === r.id + "_block" ? "..." : "🚫 Block"}
                          </button>
                        </div>
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
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-orange-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Report Details</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-50 text-gray-400 hover:text-gray-700 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={`http://localhost:8080/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`}
                    alt={selected.fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-100 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=fed7aa&color=9a3412&size=200&bold=true`;
                    }}
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {selected.reportCount}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-orange-500 font-medium mt-0.5">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
                </div>
              </div>

              {/* Report summary */}
              <div className="rounded-xl p-4 border bg-orange-50 border-orange-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">⚠️ Report Reason</p>
                <p className="text-sm font-semibold text-gray-800 mb-3">{selected.reason}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>👤 Reported by: <span className="font-medium">{selected.reportedBy}</span></span>
                  <span>📅 {selected.reportedAt}</span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: "📞", label: "Phone",      val: selected.phoneNumber },
                  { icon: "📍", label: "Address",    val: selected.address },
                  { icon: "💼", label: "Experience", val: selected.experience ? `${selected.experience} Years` : null },
                  { icon: "💰", label: "Rate",       val: selected.chargeMin && selected.chargeMax ? `Rs ${selected.chargeMin}–${selected.chargeMax}/day` : null },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs text-orange-400 uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              {selected.details && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.details}</p>
                </div>
              )}

              {/* Citizenship doc */}
              {selected.citizenshipPhoto && (
                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">📄 Citizenship Document</p>
                  <img
                    src={`http://localhost:8080/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-orange-100 object-cover max-h-52"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              {/* Modal actions */}
              <div className="pt-3 border-t border-orange-100 flex gap-3">
                <button
                  onClick={() => blockCaregiver(selected.id)}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-40"
                >
                  {actionLoading === selected.id + "_block" ? "Blocking..." : "🚫  Block Caregiver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}