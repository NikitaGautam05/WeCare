import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaSearch,
  FaClock,
} from "react-icons/fa";
import Layout from "../Layout/Layout";

const BASE = `${import.meta.env.VITE_API_URL}/api`;

const ACTION_META = {
  VIEWED:    { label: "Viewed Profile",  dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-600 border-blue-100" },
  CONTACTED: { label: "Interested",      dot: "bg-violet-500", badge: "bg-violet-50 text-violet-600 border-violet-100" },
  BOOKED:    { label: "Booked",          dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  SAVED:     { label: "Saved",           dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-600 border-rose-100" },
  UNSAVED:   { label: "Removed",         dot: "bg-slate-300",  badge: "bg-slate-50 text-slate-500 border-slate-200" },
  DEFAULT:   { label: "Activity",        dot: "bg-slate-300",  badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

const getMeta  = (action) => ACTION_META[action?.toUpperCase()] || ACTION_META.DEFAULT;

const formatTime = (ts) => {
  if (!ts) return "";
  const d    = new Date(ts);
  const diff = Date.now() - d.getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(diff / 86400000);
  return days < 7 ? `${days}d ago` : d.toLocaleDateString();
};

const getGroup = (ts) => {
  const days = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return "This Week";
  return "Earlier";
};

export default function History() {
  const navigate = useNavigate();

  const userId      = localStorage.getItem("userId");
  const token       = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [history,    setHistory]    = useState([]);
  const [caregivers, setCaregivers] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("ALL");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        let userHistory = [];
        if (userId) {
          const uRes = await axios.get(`${BASE}/users/${userId}`, axiosConfig);
          userHistory = (uRes.data?.history || []).slice().reverse();
        }

        const bRes = await axios.get(`${BASE}/bookings/user/${userId}`, axiosConfig);
        const bookings = Array.isArray(bRes.data) ? bRes.data : [];
        const bookedCaregiverIds = new Set(
          userHistory
            .filter((item) => item.action?.toUpperCase() === "BOOKED")
            .map((item) => item.caregiverId)
        );
        const bookingHistory = bookings
          .filter((booking) => {
            const status = booking.status?.toUpperCase();
            return status === "PENDING" || status === "CONFIRMED" || status === "COMPLETED";
          })
          .filter((booking) => !bookedCaregiverIds.has(booking.caregiverId))
          .map((booking) => ({
            caregiverId: booking.caregiverId,
            action: "BOOKED",
            timestamp: booking.confirmedAt || booking.createdAt || booking.startTime || new Date().toISOString()
          }));

        setHistory([...bookingHistory, ...userHistory]);

        const cRes = await axios.get(`${BASE}/caregivers/all`, axiosConfig);
        const map  = {};
        console.log('History caregivers response:', cRes.data, 'Type:', typeof cRes.data, 'IsArray:', Array.isArray(cRes.data));
        const caregiverData = cRes.data;
        const caregiverList = Array.isArray(caregiverData) ? caregiverData : (caregiverData?.data && Array.isArray(caregiverData.data) ? caregiverData.data : []);
        caregiverList.forEach((c) => (map[c.id] = c));
        setCaregivers(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, token, navigate]);

  const filtered = history.filter((h) => {
    const cg          = caregivers[h.caregiverId];
    const matchSearch = !search ||
      cg?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      cg?.speciality?.toLowerCase().includes(search.toLowerCase());
    const actionKey   = h.action?.toUpperCase();
    const matchFilter = filter === "ALL" ||
      (filter === "INTERESTED" && actionKey === "CONTACTED") ||
      filter === actionKey;
    return matchSearch && matchFilter;
  });

  const groups = filtered.reduce((acc, item) => {
    const g = getGroup(item.timestamp);
    (acc[g] = acc[g] || []).push(item);
    return acc;
  }, {});

  const sortedGroups = ["Today", "Yesterday", "This Week", "Earlier"].filter((g) => groups[g]);

  const filterCategories = [
    { id: "ALL",        label: "All" },
    { id: "VIEWED",     label: "Viewed" },
    { id: "INTERESTED", label: "Interested" },
    { id: "BOOKED",     label: "Booked" },
    { id: "SAVED",      label: "Saved" },
    { id: "UNSAVED",    label: "Removed" },
  ];

  return (
    <Layout>

      {/* ── HERO ── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
              <FaClock size={9} />
              Activity Timeline
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Activity<br />
              <span className="text-orange-500">History</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm font-medium opacity-80">
              Keep track of everyone you've interacted with.
            </p>
            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                {filtered.length} logs found
              </div>
            )}
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-slate-800 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-8 py-8 pb-20">

        {/* ── FILTER TAB BAR ── */}
        {/* Using <div> + onClick instead of <button> to avoid any browser/Tailwind button base styles */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {filterCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className="relative pb-3 cursor-pointer select-none"
                  style={{ background: "none" }}
                >
                  <span
                    className={`text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                      filter === cat.id ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {cat.label}
                  </span>
                  {filter === cat.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full block" />
                  )}
                </div>
              ))}
            </div>

            {/* Count */}
            <div className="flex items-center gap-1.5 pb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filtered.length} logs found
              </span>
            </div>
          </div>
        </div>

        {/* ── HISTORY LIST ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-slate-200 bg-white">
            <FaClock size={28} className="text-slate-200 mb-3" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              No activity matches your filter
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedGroups.map((group) => (
              <div key={group}>
                <div className="flex items-center gap-4 mb-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex-shrink-0">
                    {group}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups[group].map((item, i) => {
                    const cg   = caregivers[item.caregiverId];
                    const meta = getMeta(item.action);
                    return (
                      <div
                        key={i}
                        onClick={() => cg && navigate(`/profile/${item.caregiverId}`)}
                        className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 p-4 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/${cg?.profilePhoto?.replace(/\s+/g, "_")}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt=""
                            onError={(e) =>
                              (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cg?.fullName || "C")}&background=1e293b&color=60a5fa&bold=true`)
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.badge}`}>
                              <span className={`w-1 h-1 rounded-full  ${meta.dot}`} />
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 tabular-nums">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                            {cg?.fullName || "Caregiver"}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate mt-0.5">
                            {cg?.speciality || "—"}{cg?.address ? ` · ${cg.address}` : ""}
                          </p>
                        </div>

                        <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all flex-shrink-0">
                          <FaArrowRight size={11} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </Layout>
  );
}