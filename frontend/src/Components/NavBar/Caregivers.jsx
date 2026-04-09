import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FaTimes, 
  FaCheck, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaArrowRight,
  FaShieldAlt,
  FaChevronRight
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Caregivers = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "User";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");

  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (userId) {
          const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig);
          const rawPhoto = userRes.data?.photo || userRes.data?.profilePhoto || userRes.data?.photoUrl;
          if (rawPhoto && rawPhoto !== "undefined") setUserPhoto(rawPhoto.toString().trim());
        }
        const cgRes = await axios.get("http://localhost:8080/api/caregivers/verified", axiosConfig);
        setCaregivers(cgRes.data);
      } catch (err) {
        console.error("Data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token, userId]);

  const filteredCaregivers = caregivers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInterested = (caregiver) => {
    setDialogue({
      caregiver,
      message: `We've sent your profile to ${caregiver.fullName}. They will review your request and get back to you shortly.`,
    });
  };

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const isActive = (link) => location.pathname === link;

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      
      {/* SIDE MENU (AS REQUESTED) */}
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

      {/* STICKY GLASS HEADER */}
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
              className={`text-sm font-bold cursor-pointer transition-colors ${isActive(item.link) ? "text-sky-600" : "text-slate-500 hover:text-sky-500"}`}
            >
              {item.name.split(" ")[1]}
            </span>
          ))}
          <div className="h-8 w-px bg-slate-200"></div>
          <img 
            onClick={() => navigate("/my-profile")}
            src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`} 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 ring-sky-100 transition-all" 
            alt="Profile"
          />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <FaShieldAlt /> 100% Verified Professionals
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Find the Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-slate-700">Caregiver</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Browse our community of certified health experts dedicated to providing compassionate elderly care in your area.
          </p>
        </div>

        {/* SEARCH & STATS BAR */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, expertise, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:shadow-xl focus:ring-0 focus:border-sky-500 transition-all outline-none text-slate-700"
            />
          </div>
          {/* AVAILABLE STAT KEPT, RATING REMOVED */}
          <div className="flex gap-4 items-center bg-sky-50 px-8 py-4 rounded-2xl border border-sky-100 shadow-sm">
            <div className="text-center px-4">
              <p className="text-2xl font-black text-sky-700">{caregivers.length}</p>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Available</p>
            </div>
          </div>
        </div>

        {/* DIRECTORY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCaregivers.map((c, idx) => {
              const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
              return (
                <div key={c.id} className="group bg-white rounded-[2rem] border border-slate-200 hover:border-sky-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col sm:flex-row overflow-hidden">
                  
                  {/* Image Side (Rating star removed) */}
                  <div className="sm:w-56 h-64 sm:h-auto relative overflow-hidden bg-slate-100">
                    <img
                      src={`http://localhost:8080/uploads/${cleanPhoto}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=f0f9ff&color=0369a1`)}
                    />
                  </div>

                  {/* Info Side */}
                  <div className="flex-1 p-8 flex flex-col">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest bg-sky-100 px-3 py-1 rounded-lg">
                          {c.speciality || "Healthcare Expert"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
                        {c.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                        <FaMapMarkerAlt className="text-sky-300" />
                        {c.address || "Area Private"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Experience</p>
                        <p className="text-sm font-black text-slate-700">{c.experience || "5+" } Years</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rate</p>
                        <p className="text-sm font-black text-slate-700">Rs {c.chargeMin || "700"}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => navigate(`/profile/${c.id}`)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg"
                      >
                        View Profile
                      </button>
                      {/* REPLACED TICK WITH INTERESTED */}
                      <button 
                        onClick={() => handleInterested(c)}
                        className="px-4 py-4 border-2 border-slate-100 text-white rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all"
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

      {/* REFINED MODAL */}
      {dialogue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-sky-100">
              <FaCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Request Sent!</h2>
            <p className="text-slate-500 leading-relaxed mb-10">{dialogue.message}</p>
            <button 
              onClick={() => setDialogue(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl"
            >
              Great, Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caregivers;