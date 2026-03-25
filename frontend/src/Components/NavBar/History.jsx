import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:8080/api";

const ACTION_META = {
  VIEWED: { label: "Viewed", icon: "👁️", color: "text-blue-600" },
  INTERESTED: { label: "Interested", icon: "⭐", color: "text-amber-600" },
  CONTACTED: { label: "Contacted", icon: "📞", color: "text-emerald-600" },
  SAVED: { label: "Saved", icon: "❤️", color: "text-red-600" },
  UNSAVED: { label: "Removed", icon: "💔", color: "text-red-500" },
  DEFAULT: { label: "Activity", icon: "◎", color: "text-gray-500" },
};

const getMeta = (action) =>
  ACTION_META[action?.toUpperCase()] || ACTION_META.DEFAULT;

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const getGroup = (ts) => {
  const days = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This Week";
  if (days < 30) return "This Month";
  return "Earlier";
};

export default function History() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";

  const [history, setHistory] = useState([]);
  const [caregivers, setCaregivers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          axios.get(`${BASE}/users/user/${userName}`),
          axios.get(`${BASE}/caregivers/verified`),
        ]);

        setHistory((uRes.data?.history || []).slice().reverse());

        const map = {};
        (cRes.data || []).forEach((c) => (map[c.id] = c));
        setCaregivers(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userName, navigate]);

  const actions = ["ALL", ...new Set(history.map((h) => h.action?.toUpperCase()).filter(Boolean))];

  const filtered = history.filter((h) => {
    const cg = caregivers[h.caregiverId];
    const matchesSearch =
      !search ||
      cg?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      cg?.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      h.action?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch && (filter === "ALL" || h.action?.toUpperCase() === filter);
  });

  const groups = filtered.reduce((acc, item) => {
    const g = getGroup(item.timestamp);
    (acc[g] = acc[g] || []).push(item);
    return acc;
  }, {});

  const ORDER = ["Today", "Yesterday", "This Week", "This Month"];
  const sortedGroups = [
    ...ORDER.filter((g) => groups[g]),
    ...Object.keys(groups).filter((g) => !ORDER.includes(g)),
  ];

  return (
    <div className="min-h-screen w-screen bg-orange-50">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-grey backdrop-blur-xl border-b border-slate-200/50 w-full px-6 md:px-[5vw]">
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Home Button */}
            <div
              onClick={() => navigate("/dash")}
              className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-grey-500 font-semibold transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5H9v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-9z"
                />
              </svg>
              <span className="text-sm md:text-base font-semibold">Home</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* ElderEase Logo */}
            <h1 className="heading-font text-xl font-bold tracking-tight hidden text-black md:block italic">
              Elder<span className="text-black font-black">Ease</span>
            </h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 bg-white/80 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-black flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0)}
            </div>
            <span className="text-sm font-bold text-slate-700">{userName}</span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT - Kept exactly as you liked */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Your Timeline
          </h1>
          <p className="text-gray-500 mt-2 text-[17px]">
            Track every caregiver you viewed, saved, or contacted.
          </p>
        </div>

        {/* Stats */}
        {!loading && history.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 ">
            {[
              { n: history.length, label: "Total Activities" },
              { n: new Set(history.map((h) => h.caregiverId)).size, label: "Unique Caregivers" },
              {
                n: history.filter((h) => Date.now() - new Date(h.timestamp) < 604800000).length,
                label: "This Week",
              },
              { n: new Set(history.map((h) => h.action)).size, label: "Action Types" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-yellow-100 rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <p className="text-4xl font-semibold text-gray-900">{s.n}</p>
                <p className="text-sm text-gray-500 mt-3 font-medium tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters + Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => {
              const meta = a === "ALL" ? { label: "All", icon: "" } : getMeta(a);
              return (
                <button
                  key={a}
                  onClick={() => setFilter(a)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium border transition-all ${
                    filter === a
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-300 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caregiver name, speciality or action..."
            className="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
          />
        </div>

        {/* Timeline Content */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading your activity history...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-green rounded-3xl py-20 text-center border border-gray-100">
            <p className="text-gray-500 text-lg">No activities found</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedGroups.map((group) => (
              <div key={group}>
                <div className="flex items-center gap-4 mb-4">
                  <p className="uppercase text-xs font-semibold tracking-widest text-gray-400">
                    {group}
                  </p>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="bg-yellow-100 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  {groups[group].map((item, i) => {
                    const cg = caregivers[item.caregiverId];
                    const meta = getMeta(item.action);
                    const photo = cg?.profilePhoto?.replace(/\s+/g, "_");

                    return (
                      <div
                        key={i}
                        onClick={() => cg && navigate(`/profile/${item.caregiverId}`)}
                        className="group flex items-center gap-5 px-6 py-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <img
                            src={`http://localhost:8080/uploads/${photo}`}
                            className="w-full h-full object-cover"
                            alt={cg?.fullName}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-[17px] group-hover:text-indigo-700 transition-colors">
                            {cg?.fullName || "Unknown Caregiver"}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span className={`flex items-center gap-1 font-medium ${meta.color}`}>
                              {meta.icon} {meta.label}
                            </span>
                            {cg?.speciality && <span>• {cg.speciality}</span>}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          {formatTime(item.timestamp)}
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
    </div>
  );
}