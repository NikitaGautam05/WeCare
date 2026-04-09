import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FaTimes, 
  FaArrowRight, 
  FaSearch, 
  FaClock, 
  FaShieldAlt 
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const BASE = "http://localhost:8080/api";

const ACTION_META = {
  VIEWED: { label: "Viewed", icon: "👁️", color: "text-orange-600", bg: "bg-orange-50" },
  CONTACTED: { label: "Interested", icon: "📞", color: "text-emerald-600", bg: "bg-emerald-50" },
  SAVED: { label: "Saved", icon: "❤️", color: "text-red-600", bg: "bg-red-50" },
  UNSAVED: { label: "Removed", icon: "💔", color: "text-slate-500", bg: "bg-slate-50" },
  DEFAULT: { label: "Activity", icon: "◎", color: "text-gray-500", bg: "bg-gray-50" },
};

const getMeta = (action) => ACTION_META[action?.toUpperCase()] || ACTION_META.DEFAULT;

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
  const location = useLocation();
  
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "User";
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [history, setHistory] = useState([]);
  const [caregivers, setCaregivers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }
    fetchData();
    fetchUserPhoto();
  }, [userId, userName, token, navigate]);

  const fetchUserPhoto = async () => {
    try {
      const res = await axios.get(`${BASE}/users/${userId}`, axiosConfig);
      const rawPhoto = res.data?.photo || res.data?.profilePhoto || res.data?.photoUrl || null;
      if (rawPhoto && rawPhoto !== "undefined" && rawPhoto !== "null") {
        setUserPhoto(rawPhoto.toString().trim());
      }
    } catch (err) {
      console.error("Failed to fetch user photo", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        axios.get(`${BASE}/users/user/${userName}`, axiosConfig),
        axios.get(`${BASE}/caregivers/verified`, axiosConfig),
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

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const isActive = (link) => location.pathname === link;

  const actions = ["ALL", ...new Set(history.map((h) => h.action?.toUpperCase()).filter(a => a && a !== "INTERESTED"))];

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
    <div className="min-h-screen w-screen bg-[#fdfcfb] font-sans text-slate-900 overflow-x-hidden relative">
      
      {/* SIDE MENU */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-[60] w-80 transform transition-all duration-500 ease-in-out border-r border-orange-100 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              <FaTimes size={20} />
            </button>
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}&background=f97316&color=fff`}
                alt="Profile"
                className="w-14 h-14 rounded-2xl border-2 border-orange-500/30 object-cover shadow-lg"
              />
              <div>
                <h3 className="font-black text-lg leading-none">{userName}</h3>
                <p className="text-orange-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5">{role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Main Navigation</p>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.link);
                const [emoji, ...nameParts] = item.name.split(" ");
                const name = nameParts.join(" ");
                return (
                  <li key={item.name}>
                    <div
                      onClick={() => { navigate(item.link); setMenuOpen(false); }}
                      className={`group cursor-pointer flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                        active ? "bg-slate-900 text-white shadow-xl" : "text-slate-600 hover:bg-orange-50 hover:text-orange-900"
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="font-bold text-sm">{name}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button onClick={() => navigate("/")} className="group w-full flex items-center justify-center gap-3 bg-white text-red-600 border border-red-100 font-black text-xs py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
              <span>Logout</span>
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* STICKY HEADER (Matches Caregivers UI) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 h-20 flex items-center">
        <div className="flex items-center justify-between px-8 w-full">
          <div className="flex items-center gap-6">
            <img src={logo} alt="Logo" className="h-10 w-auto cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/dash")} />
            <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 font-bold text-white hover:text-orange-600 transition">
              <div className="w-8 h-8 flex flex-col justify-center gap-1.5">
                <span className="h-0.5 w-6 bg-current rounded-full"></span>
                <span className="h-0.5 w-4 bg-current rounded-full"></span>
                <span className="h-0.5 w-6 bg-current rounded-full"></span>
              </div>
              Menu
            </button>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex gap-8">
              {navItems.slice(0, 4).map((item) => (
                <span 
                  key={item.name} 
                  onClick={() => navigate(item.link)} 
                  className={`cursor-pointer font-bold text-sm transition-colors ${isActive(item.link) ? "text-orange-600" : "text-slate-500 hover:text-orange-500"}`}
                >
                  {item.name.split(" ")[1]}
                </span>
              ))}
            </div>
            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/my-profile")}>
                <img 
                  src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}&background=f97316&color=fff`} 
                  className="w-10 h-10 rounded-full border border-orange-200 shadow-sm group-hover:ring-2 ring-orange-100 transition-all" 
                  alt="Profile" 
                />
                <span className="font-bold text-slate-700 hidden sm:block group-hover:text-orange-600 transition-colors">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 py-16">
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest mb-6">
              <FaClock className="animate-pulse" />
              Activity Log
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tighter mb-6 leading-[0.9]">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">Timeline</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium">
              You have <span className="text-slate-900 font-bold">{history.length} recent activities</span> recorded.
            </p>
          </div>

          <div className="relative w-full xl:max-w-xl group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-5 pl-16 pr-8 text-slate-700 shadow-xl focus:outline-none focus:border-orange-400 transition-all text-lg"
            />
          </div>
        </div>

        {!loading && history.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { n: history.length, label: "Total Actions", color: "bg-orange-50 text-orange-700" },
              { n: new Set(history.map((h) => h.caregiverId)).size, label: "Caregivers", color: "bg-amber-50 text-amber-700" },
              { n: history.filter((h) => Date.now() - new Date(h.timestamp) < 604800000).length, label: "This Week", color: "bg-orange-100 text-orange-800" },
              { n: actions.length - 1, label: "Action Types", color: "bg-yellow-50 text-yellow-700" },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-[2rem] p-8 border border-white shadow-sm`}>
                <p className="text-4xl font-black mb-1">{s.n}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-12">
          {actions.map((a) => {
            const meta = a === "ALL" ? { label: "All Activity", icon: "✨" } : getMeta(a);
            return (
              <button
                key={a}
                onClick={() => setFilter(a)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  filter === a
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-400 border-slate-100 hover:border-orange-200 hover:text-orange-600"
                }`}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : sortedGroups.length === 0 ? (
          <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-orange-200">
            <div className="text-8xl mb-8">⏳</div>
            <h3 className="text-4xl font-bold text-slate-900 mb-4">No activity yet</h3>
            <button onClick={() => navigate("/my-caregivers")} className="px-12 py-5 bg-slate-900 text-white rounded-full font-bold hover:bg-orange-600 transition-all">
              Browse Caregivers
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedGroups.map((group) => (
              <div key={group} className="relative">
                <div className="flex items-center gap-6 mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 bg-orange-50 px-6 py-2 rounded-full">
                    {group}
                  </h3>
                  <div className="flex-1 h-px bg-orange-100"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {groups[group].map((item, i) => {
                    const cg = caregivers[item.caregiverId];
                    const meta = getMeta(item.action);
                    const photo = cg?.profilePhoto?.replace(/\s+/g, "_");

                    return (
                      <div
                        key={i}
                        onClick={() => cg && navigate(`/profile/${item.caregiverId}`)}
                        className="group flex items-center gap-6 p-4 bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-50 flex-shrink-0 shadow-sm">
                          <img
                            src={`http://localhost:8080/uploads/${photo}`}
                            className="w-full h-full object-cover transition-all duration-500"
                            alt=""
                            onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cg?.fullName || "C")}&background=fff7ed&color=c2410c`)}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`${meta.bg} ${meta.color} text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-lg`}>
                              {meta.icon} {meta.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {cg?.fullName || "Unknown Caregiver"}
                          </h4>
                          <p className="text-sm text-slate-500 font-medium truncate">
                            {cg?.speciality || "General Assistance"} • {cg?.address || "Location Private"}
                          </p>
                        </div>

                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 group-hover:bg-orange-600 group-hover:text-white transition-all">
                          <FaArrowRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}