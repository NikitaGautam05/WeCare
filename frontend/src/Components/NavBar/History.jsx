import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FaTimes, 
  FaArrowRight, 
  FaSearch, 
  FaClock, 
  FaChartLine,
  FaFilter,
  FaShieldAlt 
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const BASE = "http://localhost:8080/api";

// REFINED THEME: Professional typography-based styles without bulky boxes/emojis
const ACTION_META = {
  VIEWED: { label: "Viewed", color: "text-sky-600" },
  CONTACTED: { label: "Interested", color: "text-blue-600" },
  SAVED: { label: "Saved", color: "text-rose-600" },
  UNSAVED: { label: "Removed", color: "text-slate-400" },
  DEFAULT: { label: "Activity", color: "text-slate-500" },
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
  return days < 7 ? `${days}d ago` : d.toLocaleDateString();
};

const getGroup = (ts) => {
  const days = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This Week";
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
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (userId) {
          const uRes = await axios.get(`${BASE}/users/${userId}`, axiosConfig);
          const rawPhoto = uRes.data?.photo || uRes.data?.profilePhoto || uRes.data?.photoUrl;
          if (rawPhoto && rawPhoto !== "undefined") setUserPhoto(rawPhoto.toString().trim());
          
          setHistory((uRes.data?.history || []).slice().reverse());
        }
        
        const cRes = await axios.get(`${BASE}/caregivers/verified`, axiosConfig);
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
  }, [userId, token, navigate]);

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "� History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const isActive = (link) => location.pathname === link;

  const filtered = history.filter((h) => {
    const cg = caregivers[h.caregiverId];
    const matchesSearch = !search ||
      cg?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      cg?.speciality?.toLowerCase().includes(search.toLowerCase());
    
    const actionKey = h.action?.toUpperCase();
    const matchesFilter = filter === "ALL" || 
                         (filter === "INTERESTED" && actionKey === "CONTACTED") ||
                         (filter === actionKey);

    return matchesSearch && matchesFilter;
  });

  const groups = filtered.reduce((acc, item) => {
    const g = getGroup(item.timestamp);
    (acc[g] = acc[g] || []).push(item);
    return acc;
  }, {});

  const sortedGroups = ["Today", "Yesterday", "This Week", "Earlier"].filter(g => groups[g]);

  const filterCategories = [
    { id: "ALL", label: "All Activity" },
    { id: "VIEWED", label: "Viewed" },
    { id: "INTERESTED", label: "Interested" },
    { id: "SAVED", label: "Saved" },
    { id: "UNSAVED", label: "Removed" },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      
      {/* SIDE MENU (Synced with Caregivers.jsx) */}
      <aside className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-[60] w-80 transform transition-all duration-500 ease-in-out border-r border-slate-100 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              <FaTimes size={20} />
            </button>
            <div className="flex items-center gap-4 relative z-10">
               <img
                src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`}
                alt="Profile"
                className="w-14 h-14 rounded-2xl border-2 border-sky-500/30 object-cover"
              />
              <div>
                <h3 className="font-black text-lg leading-none">{userName}</h3>
                <p className="text-sky-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5">{role}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-8">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.name} onClick={() => { navigate(item.link); setMenuOpen(false); }} className={`cursor-pointer flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${isActive(item.link) ? "bg-slate-900 text-white shadow-xl" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className="font-bold text-sm">{item.name}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* PERFECTED HEADER (Synced with Caregivers.jsx) */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <img src={logo} alt="Logo" className="h-10 w-auto hover:opacity-80 transition cursor-pointer" onClick={() => navigate("/dash")} />
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 font-bold text-white hover:text-sky-600 transition">
            <div className="w-8 h-8 flex flex-col justify-center gap-1.5">
              <span className="h-0.5 w-6 bg-current rounded-full"></span>
              <span className="h-0.5 w-4 bg-current rounded-full"></span>
              <span className="h-0.5 w-6 bg-current rounded-full"></span>
            </div>
            Menu
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.slice(0, 4).map(item => (
            <span 
              key={item.name} 
              onClick={() => navigate(item.link)}
              className={`text-sm font-bold cursor-pointer transition-colors ${isActive(item.link) ? "text-sky-600" : "text-slate-500 hover:text-sky-600"}`}
            >
              {item.name.split(" ")[1]}
            </span>
          ))}
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none mb-1">{userName}</p>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-tighter">{role}</p>
            </div>
            <img 
              onClick={() => navigate("/my-profile")}
              src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 ring-sky-100 transition-all object-cover" 
              alt="Profile"
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <FaClock /> Activity Timeline
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
             History
          </h1>
        </div>

        {/* STATS & SEARCH */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{filtered.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {filter === "ALL" ? "Logs Found" : `${filter.toLowerCase()} items`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 relative group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter by caregiver name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full pl-14 pr-6 py-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:shadow-xl focus:border-sky-500 transition-all outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* REFINED PROFESSIONAL CATEGORY LINKS */}
        <div className="flex flex-wrap gap-8 mb-12 border-b border-slate-100 pb-2">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`relative pb-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === cat.id 
                ? "text-sky-600" 
                : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {cat.label}
              {filter === cat.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-full animate-in slide-in-from-left duration-300"></div>
              )}
            </button>
          ))}
        </div>

        {/* LISTING */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[2rem]"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <p className="text-slate-400 font-bold tracking-wide">No activity matches your current filter.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedGroups.map((group) => (
              <div key={group}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 flex items-center gap-4">
                  {group} <div className="h-px flex-1 bg-slate-100"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {groups[group].map((item, i) => {
                    const cg = caregivers[item.caregiverId];
                    const meta = getMeta(item.action);
                    return (
                      <div
                        key={i}
                        onClick={() => cg && navigate(`/profile/${item.caregiverId}`)}
                        className="group bg-white rounded-[2rem] border border-slate-200 hover:border-sky-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 flex items-center p-6 gap-6 cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50">
                          <img
                            src={`http://localhost:8080/uploads/${cg?.profilePhoto?.replace(/\s+/g, "_")}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt=""
                            onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cg?.fullName || "C")}&background=f0f9ff&color=0369a1`)}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`${meta.color} text-[10px] font-black uppercase tracking-widest`}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">{formatTime(item.timestamp)}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                            {cg?.fullName || "Caregiver"}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium truncate">{cg?.speciality} • {cg?.address}</p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                          <FaArrowRight size={12} />
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