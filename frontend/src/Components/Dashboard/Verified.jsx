import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function Verified() {
  const navigate = useNavigate();

  const [all, setAll]                     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null);

  const adminToken = localStorage.getItem("adminToken");
  const axiosConfig = adminToken ? { headers: { Authorization: `Bearer ${adminToken}` } } : {};

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    fetchVerified();
  }, [adminToken, navigate]);

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

  const fetchVerified = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/verified`, axiosConfig);
      const data = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.content) ? res.data.content
        : Array.isArray(res.data?.data) ? res.data.data
        : [];
      setAll(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const block = async (id) => {
    if (!window.confirm("Are you sure you want to block this caregiver?")) return;
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/block`, {}, axiosConfig);
      setAll((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast("Caregiver blocked. 🚫", "warning");
    } catch (err) {
      console.error("Block failed:", err);
      showToast("Failed to block. Check console for details.", "error");
    } finally {
      setActionLoading(null);
    }
  };

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

  const VerifiedCard = ({ c }) => {
    const busy  = actionLoading === c.id;
    const photo = c.profilePhoto?.replace(/\s+/g, "_").trim();

    return (
      <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group shadow-sm">

        {/* ── Photo header ── */}
        <div className="relative bg-gradient-to-br from-emerald-100 to-teal-50 pt-6 pb-4 px-4 flex flex-col items-center">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
            </span>
          </div>

          {/* ID chip */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-bold text-emerald-600 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
              #{String(c.id).padStart(4, "0")}
            </span>
          </div>

          {/* Avatar with glow */}
          <div className="relative mt-4">
            <div className="absolute inset-0 rounded-full blur-md opacity-30 scale-110 bg-emerald-400" />
            <div className="relative w-24 h-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-emerald-50">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${photo}`}
                alt={c.fullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=d1fae5&color=065f46&size=200&bold=true`;
                }}
              />
            </div>
          </div>

          {/* Name + speciality */}
          <div className="relative mt-3 text-center">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{c.fullName || "—"}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">{c.speciality || "General Care"}</p>
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
            {c.experience && (
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-gray-400">💼</span>
                <span>{c.experience} yrs exp{c.chargeMin && c.chargeMax && ` · Rs ${c.chargeMin}–${c.chargeMax}`}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-emerald-50 flex items-center justify-between gap-2">
            <button onClick={() => setSelected(c)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold underline underline-offset-2 transition-colors">
              View Details
            </button>
            <button onClick={() => block(c.id)} disabled={busy}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 active:scale-95 transition-all disabled:opacity-40">
              {busy ? "..." : "🚫 Block"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-emerald-50 font-sans">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toast.type === "error" ? "bg-red-500 text-white" : toast.type === "warning" ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ElderEase" className="h-9 w-auto" />
            <div className="border-l border-gray-200 pl-3">
              <p className="text-xs text-emerald-600 uppercase tracking-widest leading-none font-semibold">Admin</p>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Verified Caregivers</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/dashboard")} className="text-sm text-black hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-4 py-1.5 rounded-lg transition-all font-medium">
              ← Dashboard
            </button>
            <button onClick={handleLogout} className="text-sm text-black hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-all font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[57px]">
        {/* HERO */}
        <div className="w-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 px-6 py-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-4 right-1/4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">✅ Verified</span>
              <h2 className="text-3xl font-bold text-white leading-tight">Verified Caregivers</h2>
              <p className="text-emerald-100 mt-1.5 text-sm max-w-md">These caregivers have been approved and are visible to care receivers on ElderEase.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{all.length}</p>
                <p className="text-xs text-emerald-100 mt-1 uppercase tracking-widest">Verified</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{filtered.length}</p>
                <p className="text-xs text-emerald-100 mt-1 uppercase tracking-widest">Shown</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-emerald-900">Approved Caregivers</h3>
              <p className="text-xs text-emerald-600 mt-0.5">These caregivers are live and visible to care receivers</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input type="text" placeholder="Search by name, email, speciality..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm text-gray-700 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
              </div>
              <button onClick={fetchVerified} className="p-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 transition-all" title="Refresh">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mb-4" />
              <p className="text-emerald-600 font-medium text-sm">Fetching verified caregivers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-emerald-200">{search ? "🔍" : "🎉"}</div>
              <p className="text-lg font-bold text-emerald-800">{search ? "No results found" : "All caught up!"}</p>
              <p className="text-sm text-emerald-600 mt-1">{search ? "Try clearing the search." : "No verified caregivers at the moment."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c) => <VerifiedCard key={c.id} c={c} />)}
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-emerald-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Caregiver Profile</h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-50 text-gray-400 hover:text-gray-700 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Modal hero */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 p-5 flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full blur-md opacity-30 scale-110 bg-emerald-400" />
                  <img src={selected.profilePhoto?.startsWith('http') ? selected.profilePhoto : `${import.meta.env.VITE_API_URL}/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`} alt={selected.fullName}
                    className="relative w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=d1fae5&color=065f46&size=200&bold=true`; }} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-emerald-600 font-medium mt-0.5">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: "📞", label: "Phone",           val: selected.phoneNumber },
                  { icon: "✉️", label: "Email",           val: selected.email },
                  { icon: "📍", label: "Address",         val: selected.address },
                  { icon: "👤", label: "Gender",          val: selected.gender },
                  { icon: "🎯", label: "Speciality",      val: selected.speciality },
                  { icon: "🧾", label: "Certification",   val: selected.certification },
                  { icon: "💼", label: "Experience",      val: selected.experience ? `${selected.experience} Years` : null },
                  { icon: "💰", label: "Daily Rate",      val: selected.chargeMin && selected.chargeMax ? `Rs ${selected.chargeMin}–${selected.chargeMax}/day` : null },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-600 uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {selected.details && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.details}</p>
                </div>
              )}

              {selected.citizenshipPhoto && (
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2">📄 Citizenship Document</p>
                  <img
                    src={selected.citizenshipPhoto?.startsWith("http")
                      ? selected.citizenshipPhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-emerald-100 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {selected.certificatePhoto && (
                <div>
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2">🧾 Certification Proof</p>
                  <img
                    src={selected.certificatePhoto?.startsWith("http")
                      ? selected.certificatePhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.certificatePhoto?.replace(/\s+/g, "_")}`}
                    alt="Certification Proof"
                    className="w-full rounded-xl border border-emerald-100 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {bookings && bookings.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2">📅 Bookings</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {bookings.map((b) => (
                      <li key={b.id}>{b.userName || b.userId}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-emerald-100 flex gap-3">
                <button onClick={() => block(selected.id)} disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-all disabled:opacity-40">
                  {actionLoading === selected.id ? "Blocking..." : "🚫  Block Caregiver"}
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-all">
                  ✓  Already Verified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}