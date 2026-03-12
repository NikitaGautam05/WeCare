import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function Pending() {
  const navigate = useNavigate();

  const [all, setAll]                     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null); // { msg, type }

  // ── Fetch all caregivers, filter for PENDING ──────────────────────────────
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/caregivers/all`);
      const data = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.content) ? res.data.content
        : Array.isArray(res.data?.data) ? res.data.data
        : [];
      // show caregivers who are PENDING or have no status yet
      setAll(data.filter((c) => !c.status || c.status === "PENDING"));
    } catch (err) {
      console.error("Failed to fetch:", err);
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  // ── Show toast ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Verify action ─────────────────────────────────────────────────────────
  const verify = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setAll((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast("Caregiver verified successfully! ✅");
    } catch (err) {
      console.error(err);
      showToast("Failed to verify. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject / Block action ─────────────────────────────────────────────────
  const reject = async (id) => {
    setActionLoading(id + "_reject");
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setAll((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast("Caregiver rejected & blocked. 🚫", "warning");
    } catch (err) {
      console.error(err);
      showToast("Failed to reject. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter by search ──────────────────────────────────────────────────────
  const filtered = all.filter((c) =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-screen bg-amber-50 font-sans">

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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-amber-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="ElderEase" className="h-9 w-auto" />
            <div className="border-l border-gray-200 pl-3">
              <p className="text-xs text-amber-500 uppercase tracking-widest leading-none font-semibold">Admin</p>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Pending Verifications</h1>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-1.5 rounded-lg transition-all font-medium"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-all font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="pt-[57px]">

        {/* ── HERO BANNER ── */}
        <div className="w-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-400 px-6 py-10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-4 right-1/4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  ⏳ Awaiting Review
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">Pending Caregivers</h2>
              <p className="text-amber-100 mt-1.5 text-sm max-w-md">
                Review caregiver registrations below. Verified caregivers will appear in the care receiver dashboard.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{all.length}</p>
                <p className="text-xs text-amber-100 mt-1 uppercase tracking-widest">Pending</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{filtered.length}</p>
                <p className="text-xs text-amber-100 mt-1 uppercase tracking-widest">Shown</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Search + Refresh row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-amber-900">Unverified Registrations</h3>
              <p className="text-xs text-amber-600 mt-0.5">Tap a card to view full profile before verifying</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, speciality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-200 bg-white text-sm text-gray-700 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
                />
              </div>
              <button
                onClick={fetchPending}
                className="p-2.5 rounded-xl border border-amber-200 bg-white text-amber-500 hover:text-amber-700 hover:border-amber-300 transition-all"
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
              <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin mb-4" />
              <p className="text-amber-600 font-medium text-sm">Fetching pending caregivers...</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-amber-200">
                {search ? "🔍" : "🎉"}
              </div>
              <p className="text-lg font-bold text-amber-800">
                {search ? "No results found" : "All caught up!"}
              </p>
              <p className="text-sm text-amber-500 mt-1">
                {search ? "Try clearing the search." : "No pending caregivers at the moment."}
              </p>
            </div>

          ) : (
            /* ── Cards Grid ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c, idx) => {
                const busy        = actionLoading === c.id || actionLoading === c.id + "_reject";
                const photo       = c.profilePhoto?.replace(/\s+/g, "_").trim();
                const initials    = (c.fullName || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-amber-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Photo */}
                    <div className="relative h-44 bg-amber-50 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${photo}`}
                        alt={c.fullName}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=fde68a&color=92400e&size=200&bold=true`;
                        }}
                      />
                      {/* Pending badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-sm">
                          ⏳ Pending
                        </span>
                      </div>
                      {/* Registration number */}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 text-xs font-bold text-amber-700 shadow-sm">
                        #{String(c.id).padStart(4, "0")}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{c.fullName || "—"}</h3>
                        <p className="text-xs text-amber-600 font-medium mt-0.5 truncate">{c.speciality || "General Care"}</p>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <span>✉</span>
                          <span className="truncate">{c.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📞</span>
                          <span>{c.phoneNumber || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📍</span>
                          <span className="truncate">{c.address || "—"}</span>
                        </div>
                        {c.experience && (
                          <div className="flex items-center gap-1.5">
                            <span>💼</span>
                            <span>{c.experience} yrs exp
                              {c.chargeMin && c.chargeMax && ` · Rs ${c.chargeMin}–${c.chargeMax}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="mt-auto pt-3 border-t border-amber-50 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelected(c)}
                          className="text-xs text-amber-500 hover:text-amber-800 font-semibold underline underline-offset-2 transition-colors"
                        >
                          View Details
                        </button>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => reject(c.id)}
                            disabled={busy}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-all disabled:opacity-40"
                          >
                            {actionLoading === c.id + "_reject" ? "..." : "✕"}
                          </button>
                          <button
                            onClick={() => verify(c.id)}
                            disabled={busy}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all disabled:opacity-40"
                          >
                            {actionLoading === c.id ? "..." : "✓ Verify"}
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
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-amber-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Caregiver Profile</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  ⏳ Pending Review
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50 text-gray-400 hover:text-gray-700 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img
                  src={`http://localhost:8080/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`}
                  alt={selected.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-100 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=fde68a&color=92400e&size=200&bold=true`;
                  }}
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-amber-600 font-medium mt-0.5">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
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
                  <div key={label} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-xs text-amber-500 uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              {selected.details && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-500 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.details}</p>
                </div>
              )}

              {/* Citizenship doc */}
              {selected.citizenshipPhoto && (
                <div>
                  <p className="text-xs text-amber-500 uppercase tracking-wider mb-2">📄 Citizenship Document</p>
                  <img
                    src={`http://localhost:8080/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-amber-100 object-cover max-h-52"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              {/* Modal actions */}
              <div className="pt-3 border-t border-amber-100 flex gap-3">
                <button
                  onClick={() => reject(selected.id)}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-all disabled:opacity-40"
                >
                  {actionLoading === selected.id + "_reject" ? "Rejecting..." : "✕  Reject"}
                </button>
                <button
                  onClick={() => verify(selected.id)}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all disabled:opacity-40"
                >
                  {actionLoading === selected.id ? "Verifying..." : "✓  Verify Caregiver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}