import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.get(`${BASE_URL}/admin/reported`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      const caregivers = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.content) ? res.data.content
        : Array.isArray(res.data?.data) ? res.data.data
        : [];

      const entries = caregivers.flatMap((caregiver) => {
        const reportList = Array.isArray(caregiver.reports) ? caregiver.reports : [];
        if (reportList.length > 0) {
          return reportList.map((report) => ({
            reportId: report.id || `${caregiver.id}-${report.reportedAt || Math.random()}`,
            caregiverId: caregiver.id,
            fullName: caregiver.fullName,
            email: caregiver.email,
            phoneNumber: caregiver.phoneNumber,
            profilePhoto: caregiver.profilePhoto,
            speciality: caregiver.speciality,
            address: caregiver.address,
            gender: caregiver.gender,
            details: caregiver.details,
            chargeMin: caregiver.chargeMin,
            chargeMax: caregiver.chargeMax,
            certification: caregiver.certification,
            citizenshipPhoto: caregiver.citizenshipPhoto,
            certificatePhoto: caregiver.certificatePhoto,
            reportsCount: caregiver.reportsCount ?? reportList.length,
            reason: report.reason,
            proof: report.proof,
            reportedAt: report.reportedAt,
            reportedByUserId: report.reportedByUserId,
          }));
        }

        return [{
          reportId: `${caregiver.id}-legacy`,
          caregiverId: caregiver.id,
          fullName: caregiver.fullName,
          email: caregiver.email,
          phoneNumber: caregiver.phoneNumber,
          profilePhoto: caregiver.profilePhoto,
          speciality: caregiver.speciality,
          address: caregiver.address,
          gender: caregiver.gender,
          details: caregiver.details,
          chargeMin: caregiver.chargeMin,
          chargeMax: caregiver.chargeMax,
          certification: caregiver.certification,
          citizenshipPhoto: caregiver.citizenshipPhoto,
          certificatePhoto: caregiver.certificatePhoto,
          reportsCount: caregiver.reportsCount ?? 1,
          reason: caregiver.reason,
          proof: caregiver.proof,
          reportedAt: caregiver.reportedAt,
          reportedByUserId: caregiver.reportedByUserId,
        }];
      });

      setReports(entries);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    const fetchBookings = async (id) => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/caregiver/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
        });
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async (id, action, newStatus) => {
    setActionLoading(id);
    try {
      await axios.put(`${BASE_URL}/admin/caregivers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      
      // Update reports with new status
      setReports((prev) =>
        prev.map((r) =>
          r.caregiverId === id ? { ...r, status: newStatus } : r
        )
      );
      
      // Update selected if it's the one being modified
      if (selected?.caregiverId === id) {
        setSelected((p) => ({ ...p, status: newStatus }));
      }

      const actionNames = { verify: "Verified ✅", block: "Blocked 🚫", unblock: "Unblocked ↩️" };
      showToast(`Caregiver ${actionNames[action]}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Action failed. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const verify  = (id) => doAction(id, "verify",  "VERIFIED");
  const block   = (id) => doAction(id, "block",   "BLOCKED");
  const unblock = (id) => doAction(id, "unblock", "PENDING");

  const blockCaregiver = (caregiverId) => block(caregiverId);

  const filtered = reports.filter((r) =>
    !search ||
    r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const ReportCard = ({ r }) => {
    const busy  = actionLoading === r.caregiverId + "_block";
    const photo = r.profilePhoto?.replace(/\s+/g, "_").trim();

    return (
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group shadow-sm">

        {/* ── Photo header ── */}
        <div className="relative bg-gradient-to-br from-orange-100 to-amber-50 pt-6 pb-4 px-4 flex flex-col items-center">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-orange-100 text-orange-700 border-orange-200 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Reported
            </span>
          </div>

          {/* Report count badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500 text-white shadow-sm">
              ⚠️ {r.reportsCount ?? 1}
            </span>
          </div>

          {/* Avatar with glow */}
          <div className="relative mt-4">
            <div className="absolute inset-0 rounded-full blur-md opacity-30 scale-110 bg-orange-300" />
            <div className="relative w-24 h-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-orange-50">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${photo}`}
                alt={r.fullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.fullName || "C")}&background=fed7aa&color=9a3412&size=200&bold=true`;
                }}
              />
            </div>
          </div>

          {/* Name + speciality */}
          <div className="relative mt-3 text-center">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{r.fullName || "—"}</h3>
            <p className="text-xs text-orange-600 font-medium mt-0.5">{r.speciality || "General Care"}</p>
          </div>
        </div>

        {/* ── Info body ── */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2 truncate">
              <span className="w-5 text-center text-gray-400">✉</span>
              <span className="truncate">{r.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 text-center text-gray-400">📞</span>
              <span>{r.phoneNumber || "—"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 text-center text-gray-400">📝</span>
              <span className="text-sm text-gray-600">{r.reason || "No report reason provided."}</span>
            </div>
            {r.proof && (
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-1">Proof</p>
                {r.proof.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${r.proof.replace(/\s+/g, "_")}`}
                    alt="Report proof"
                    className="w-full h-24 rounded-2xl object-cover border border-orange-100"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x240?text=Proof+not+available"; }}
                  />
                ) : (
                  <p className="text-sm text-gray-500 break-words">{r.proof}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-orange-50 flex items-center justify-between gap-2">
            <button onClick={() => setSelected(r)} className="text-xs text-orange-400 hover:text-orange-700 font-semibold underline underline-offset-2 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
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

  const ActionButtons = ({ r, size = "sm" }) => {
    const busy   = actionLoading === r.caregiverId;
    const status = r.status || "PENDING";
    const base   = size === "sm"
      ? "text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
      : "text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5";

    return (
      <div className="flex gap-2 flex-wrap">
        {status !== "VERIFIED" && status !== "BLOCKED" && (
          <button onClick={() => verify(r.caregiverId)} disabled={busy}
            className={`${base} bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✓</span>} Verify
          </button>
        )}
        {status === "VERIFIED" && (
          <button onClick={() => block(r.caregiverId)} disabled={busy}
            className={`${base} bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-sm shadow-red-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✕</span>} Block
          </button>
        )}
        {status === "PENDING" && (
          <button onClick={() => block(r.caregiverId)} disabled={busy}
            className={`${base} bg-gray-400 hover:bg-gray-500 active:scale-95 text-white shadow-sm`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>✕</span>} Block
          </button>
        )}
        {status === "BLOCKED" && (
          <button onClick={() => unblock(r.caregiverId)} disabled={busy}
            className={`${base} bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-sm shadow-blue-200`}>
            {busy ? <span className="animate-spin inline-block">⏳</span> : <span>↩</span>} Unblock
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-orange-50 font-sans">

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
              <h1 className="text-base font-bold text-gray-800 leading-tight">Reports & Complaints</h1>
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
        <div className="w-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 px-6 py-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-4 right-1/4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">⚠️ Reported</span>
              <h2 className="text-3xl font-bold text-white leading-tight">Reports & Complaints</h2>
              <p className="text-orange-100 mt-1.5 text-sm max-w-md">Review caregiver complaints submitted by care receivers. Investigate and take action.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{reports.length}</p>
                <p className="text-xs text-orange-100 mt-1 uppercase tracking-widest">Reports</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center min-w-[90px]">
                <p className="text-3xl font-bold text-white">{filtered.length}</p>
                <p className="text-xs text-orange-100 mt-1 uppercase tracking-widest">Shown</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-6 w-full sm:w-auto ml-auto justify-end">
            <div className="relative flex-1 sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input type="text" placeholder="Search by name, email, reason..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-gray-700 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
            </div>
            <button onClick={fetchReports} className="p-2.5 rounded-xl border border-orange-200 bg-white text-orange-500 hover:text-orange-700 hover:border-orange-300 transition-all" title="Refresh">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mb-4" />
              <p className="text-orange-500 font-medium text-sm">Fetching reports...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36">
              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-orange-200">{search ? "🔍" : "✅"}</div>
              <p className="text-lg font-bold text-orange-800">{search ? "No results found" : "No reports!"}</p>
              <p className="text-sm text-orange-400 mt-1">{search ? "Try clearing the search." : "All caregivers are behaving well."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r) => <ReportCard key={r.reportId} r={r} />)}
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-4 border-b border-orange-100 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Report Details</h3>
                <StatusBadge status={selected.status || "PENDING"} />
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-50 text-gray-400 hover:text-gray-700 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Modal hero */}
              <div className="rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 p-5 flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full blur-md opacity-30 scale-110 bg-orange-300" />
                  <div className="relative">
                    <img src={selected.profilePhoto?.startsWith('http') ? selected.profilePhoto : `${import.meta.env.VITE_API_URL}/uploads/${selected.profilePhoto?.replace(/\s+/g, "_")}`} alt={selected.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.fullName || "C")}&background=fed7aa&color=9a3412&size=200&bold=true`; }} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                      {selected.reportsCount ?? 1}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-orange-500 font-medium mt-0.5">{selected.speciality || "General Care"}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.email}</p>
                </div>
              </div>

              {/* Comments */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-orange-500 mb-2">💬 Comments</p>
                {selected.comments && selected.comments.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selected.comments.map((c, i) => (
                      <div key={i} className="bg-white border border-orange-100 rounded-lg px-3 py-2 text-sm text-gray-700">{c}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No comments available</p>
                )}
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
                  <div key={label} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs text-orange-400 uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {selected.details && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.details}</p>
                </div>
              )}

              {selected.reason && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Report reason</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selected.reason}</p>
                </div>
              )}

              {selected.reportedAt && (
                <div className="bg-white rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Reported at</p>
                  <p className="text-sm text-gray-700">{new Date(selected.reportedAt).toLocaleString()}</p>
                </div>
              )}

              {selected.proof && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Proof</p>
                  {selected.proof.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                    <img
                      src={selected.proof?.startsWith("http") ? selected.proof : `${import.meta.env.VITE_API_URL}/uploads/${selected.proof?.replace(/\s+/g, "_")}`}
                      alt="Report proof"
                      className="w-full rounded-xl border border-orange-100 object-cover max-h-72"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/600x400?text=Proof+not+available";
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 break-words">{selected.proof}</p>
                  )}
                </div>
              )}

              {selected.citizenshipPhoto && (
                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">📄 Citizenship Document</p>
                  <img
                    src={selected.citizenshipPhoto?.startsWith("http")
                      ? selected.citizenshipPhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.citizenshipPhoto?.replace(/\s+/g, "_")}`}
                    alt="Citizenship"
                    className="w-full rounded-xl border border-orange-100 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {selected.certificatePhoto && (
                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">🧾 Certification Proof</p>
                  <img
                    src={selected.certificatePhoto?.startsWith("http")
                      ? selected.certificatePhoto
                      : `${import.meta.env.VITE_API_URL}/uploads/${selected.certificatePhoto?.replace(/\s+/g, "_")}`}
                    alt="Certification Proof"
                    className="w-full rounded-xl border border-orange-100 object-cover max-h-52"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=Document+not+available";
                    }}
                  />
                </div>
              )}

              {bookings && bookings.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">📅 Bookings</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {bookings.map((b) => (
                      <li key={b.id}>{b.userName || b.userId}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-orange-100">
                <ActionButtons r={selected} size="md" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}