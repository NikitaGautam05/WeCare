import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FaTimes, 
  FaArrowRight, 
  FaSearch,
  FaShieldAlt // Added for consistency
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const BASE = "http://localhost:8080/api";

export default function Favourites() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "User";
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [favouriteIds, setFavouriteIds] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }
    fetchData();
    fetchUserPhoto();
  }, [navigate, userId, token]);

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
      const [favRes, cgRes] = await Promise.all([
        axios.get(`${BASE}/users/favorites/${userId}`, axiosConfig),
        axios.get(`${BASE}/caregivers/verified`, axiosConfig),
      ]);
      const ids = Array.isArray(favRes.data) ? favRes.data : [];
      const all = Array.isArray(cgRes.data) ? cgRes.data : [];
      setFavouriteIds(ids);
      setCaregivers(all.filter((c) => ids.includes(c.id)));
    } catch (err) {
      console.error(err);
      showToast("Failed to load favourites", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (caregiverId) => {
    setRemoving(caregiverId);
    try {
      await axios.post(`${BASE}/users/remove-favorite`, null, {
        ...axiosConfig,
        params: { userId, caregiverId },
      });
      setCaregivers((prev) => prev.filter((c) => c.id !== caregiverId));
      setFavouriteIds((prev) => prev.filter((id) => id !== caregiverId));
      showToast("Removed from favourites ✨");
    } catch (err) {
      showToast("Failed to remove", "error");
    } finally {
      setRemoving(null);
    }
  };

  const handleInterested = (caregiver) => {
    showToast(`${caregiver.fullName} has been notified!`);
  };

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const isActive = (link) => location.pathname === link;

  const filtered = caregivers.filter((c) =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      
      {/* SIDE MENU (Matched exactly with Caregivers) */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-[60] w-80 transform transition-all duration-500 ease-in-out border-r border-slate-100 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              <FaTimes size={20} />
            </button>
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : "https://ui-avatars.com/api/?name=" + userName}
                alt="Profile"
                className="w-14 h-14 rounded-2xl border-2 border-rose-500/30 object-cover shadow-lg"
              />
              <div>
                <h3 className="font-black text-lg leading-none">{userName}</h3>
                <p className="text-rose-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5">{role}</p>
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
                        active ? "bg-slate-900 text-white shadow-xl" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="font-bold text-sm">{name}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
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

      {/* STICKY GLASS HEADER (Matched placing with Caregivers) */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <img src={logo} alt="Logo" className="h-10 w-auto hover:opacity-80 transition cursor-pointer" onClick={() => navigate("/dash")} />
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 font-bold text-white hover:text-rose-600 transition">
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
              className={`text-sm font-bold cursor-pointer transition-colors ${isActive(item.link) ? "text-rose-600" : "text-slate-500 hover:text-rose-500"}`}
            >
              {item.name.split(" ")[1]}
            </span>
          ))}
          <div className="h-8 w-px bg-slate-200"></div>
          <img 
            onClick={() => navigate("/my-profile")}
            src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`} 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 ring-rose-100 transition-all" 
            alt="Profile"
          />
        </div>
      </header>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-rose-400">✦</span>
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* MAIN CONTENT (Aligned with Caregivers.jsx layout) */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <FaShieldAlt /> Your Trusted Circle
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Favourites</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            You have saved {caregivers.length} profiles to your favorites list for quick access.
          </p>
        </div>

        {/* SEARCH BAR (Matched Caregivers styling) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, expertise, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:shadow-xl focus:ring-0 focus:border-rose-500 transition-all outline-none text-slate-700"
            />
          </div>
          <div className="flex gap-4 items-center bg-rose-50 px-8 py-4 rounded-2xl border border-rose-100 shadow-sm">
            <div className="text-center px-4">
              <p className="text-2xl font-black text-rose-700">{filtered.length}</p>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Saved</p>
            </div>
          </div>
        </div>

        {/* LOADING & GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white/40 rounded-[2rem] border-2 border-dashed border-slate-200">
             <h3 className="text-2xl font-bold text-slate-400">No favorites found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((c) => {
              const photo = c.profilePhoto?.replace(/\s+/g, "_").trim();
              return (
                <div key={c.id} className="group bg-white rounded-[2rem] border border-slate-200 hover:border-rose-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col overflow-hidden">
                  <div className="h-64 relative overflow-hidden bg-slate-100">
                    <img
                      src={`http://localhost:8080/uploads/${photo}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=fff1f2&color=e11d48`)}
                    />
                    <button
                      onClick={() => removeFavourite(c.id)}
                      disabled={removing === c.id}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-all z-20"
                    >
                      {removing === c.id ? "..." : "♥"}
                    </button>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg self-start mb-4">
                      {c.speciality || "Healthcare Expert"}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-rose-600 transition-colors">
                      {c.fullName}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Experience</p>
                        <p className="text-sm font-black text-slate-700">{c.experience || "5+"} Yrs</p>
                      </div>
                      <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Rate</p>
                        <p className="text-sm font-black text-rose-700">Rs {c.chargeMin}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => navigate(`/profile/${c.id}`)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                      >
                        View Profile
                      </button>
                      <button 
                        onClick={() => handleInterested(c)}
                        className="px-4 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all"
                      >
                        Interested
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}