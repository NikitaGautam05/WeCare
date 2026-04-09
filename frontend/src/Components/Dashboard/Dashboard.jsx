import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaHeart, FaSearch, FaArrowRight } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [favouriteCaregivers, setFavouriteCaregivers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("role") || "User";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");
  const location = useLocation();
  const isActive = (link) => location.pathname === link;

  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const fetchUserPhoto = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig);
        const rawPhoto = res.data?.photo || res.data?.profilePhoto || res.data?.photoUrl || null;
        if (rawPhoto && rawPhoto !== "undefined" && rawPhoto !== "null") {
          setUserPhoto(rawPhoto.toString().trim());
        }
      } catch (err) {
        console.error("Failed to fetch user photo", err);
      }
    };

    fetchUserPhoto();

   axios
  .get("http://localhost:8080/api/caregivers/verified", axiosConfig)
  .then((res) => setCaregivers(res.data))
  .catch((err) => {
    if (err.response && err.response.status === 401) {
      handleLogout(); // Force logout if the token is invalid/expired
    }
  });
    if (userId) {
      axios
        .get(`http://localhost:8080/api/users/favorites/${userId}`, axiosConfig)
        .then((res) => {
          const favIds = res.data;
          if (Array.isArray(favIds) && favIds.length > 0) {
            axios
              .get("http://localhost:8080/api/caregivers/verified", axiosConfig)
              .then((res) => {
                const allCaregivers = res.data;
                const favCaregivers = allCaregivers.filter((c) => favIds.includes(c.id));
                setFavouriteCaregivers(favCaregivers);
              });
          }
        })
        .catch((err) => console.error("Failed to fetch favourites", err));
    }
  }, [userId, token, navigate]);

  const filteredCaregivers = caregivers
    .filter(
      (c) =>
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 12);
    const handleLogout = () => {
  // 1. Clear all session data from the browser
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");

  // 2. Redirect to the login page or splash screen
  navigate("/"); 
};

const handleInterest = async (caregiver) => {
  try {
    // 1. Send the request to the backend
    // Assumes you have an endpoint: /api/caregivers/{id}/interest
    await axios.post(
      `http://localhost:8080/api/caregivers/${caregiver.id}/interest`, 
      { userId: userId }, // Sending the ID of the person interested
      axiosConfig
    );

    // 2. Only show the success UI if the request succeeds
    setDialogue({ type: "interest", caregiver });
  } catch (err) {
    console.error("Failed to send interest:", err);
    alert("Could not send interest. Please try again.");
  }
};

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const quickLinks = [
    { icon: "👩‍⚕️", label: "Caregivers", link: "/my-caregivers" },
    { icon: "❤️", label: "Favourites", link: "/favourites" },
    { icon: "📜", label: "History", link: "/history" },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-50 font-sans text-slate-900">
      
      {/* BEAUTIFIED SIDE MENU */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 w-80 transform transition-all duration-500 ease-in-out border-r border-slate-100 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Part with Profile Context */}
         <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
  
  <button 
    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors" 
    onClick={() => setMenuOpen(false)}
  >
    <FaTimes size={20} />
  </button>

  <div className="flex items-center gap-4 relative z-10">
    <img
      // Same logic as Header: Use userPhoto, format path, or fallback to UI-Avatar
      src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`}
      alt="Profile"
      className="w-14 h-14 rounded-2xl border-2 border-blue-500/30 object-cover shadow-lg"
      // Error handling to ensure it never shows a broken image icon
      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userName}`; }}
    />
    <div>
      <h3 className="font-black text-lg leading-none">{userName}</h3>
      <p className="text-blue-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5">{role}</p>
    </div>
  </div>
</div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Main Menu</p>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.link);
                return (
                  <li key={item.name}>
                    <div
                      onClick={() => { navigate(item.link); setMenuOpen(false); }}
                      className={`group cursor-pointer flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                        active 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`text-lg transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                        {item.name.split(" ")[0]}
                      </span>
                      <span className="font-bold text-sm tracking-tight">
                        {item.name.split(" ")[1]}
                      </span>
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Logout Section */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
  onClick={handleLogout} // ✅ Now it clears the token first
  className="group w-full flex items-center justify-center gap-3 ..."
>
  <span className="group-hover:rotate-12 text-white transition-transform">Logout</span>
  <FaArrowRight size={12} className="opacity-50 group-hover:opacity-100" />
</button>
          </div>
        </div>
      </aside>

      {/* HEADER */}
      {/* STICKY GLASS HEADER - MATCHED TO CAREGIVERS PAGE */}
<header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8">
  <div className="flex items-center gap-6">
    <img 
      src={logo} 
      alt="Logo" 
      className="h-10 w-auto hover:opacity-80 transition cursor-pointer" 
      onClick={() => navigate("/dash")} 
    />
    <button 
      onClick={() => setMenuOpen(true)} 
      className="flex items-center gap-2 font-bold text-white hover:text-sky-600 transition"
    >
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
        className={`text-sm font-bold cursor-pointer transition-colors ${
          isActive(item.link) ? "text-sky-600" : "text-slate-500 hover:text-sky-500"
        }`}
      >
        {item.name.split(" ")[1]}
      </span>
    ))}
    <div className="h-8 w-px bg-slate-200"></div>
    
    <div 
      className="flex items-center gap-3 cursor-pointer group" 
      onClick={() => navigate("/my-profile")}
    >
      <div className="text-right hidden sm:block">
        <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
          {userName}
        </h3>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          {role}
        </p>
      </div>
      <img 
        src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`} 
        className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:ring-2 ring-sky-100 transition-all object-cover" 
        alt="Profile"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userName}`; }}
      />
    </div>
  </div>
</header>

      {/* MAIN CONTENT */}
      <main className="pt-[64px] w-full min-h-screen flex flex-col">
        
        {/* UPDATED WELCOME & SEARCH HERO */}
        <div className="relative w-full bg-slate-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 Online
              </div>
              <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
                Welcome back, <br />
                <span className="text-blue-500">{userName}</span> 👋
              </h2>
              <p className="text-slate-400 text-lg max-w-sm font-medium">
                Manage your caregivers and find the best support for your family's ease.
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="bg-white/5 p-2 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, skill, or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-none focus:ring-4 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS STRIP */}
        <div className="w-full bg-white border-b border-slate-200 px-8 py-4 sticky top-[64px] z-30">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mr-4 whitespace-nowrap">Dashboard Links</span>
            {quickLinks.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(q.link)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-600 hover:text-slate-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-100 transition-all duration-300 whitespace-nowrap"
              >
                <span>{q.icon}</span> {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="max-w-7xl mx-auto w-full px-8 py-12">
          
          {/* CAREGIVERS SECTION */}
          <section className="mb-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verified Caregivers</h2>
                <p className="text-slate-400 font-medium text-sm mt-1">Showing {filteredCaregivers.length} available professionals</p>
              </div>
              <button 
                onClick={() => navigate("/my-caregivers")}
                className="group flex items-center gap-2 text-xs font-bold bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
              >
                View Directory <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 l:grid-cols-4 gap-8">
              {filteredCaregivers.map((c, idx) => {
                const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
                return (
                  <div key={c.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden flex flex-col">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${cleanPhoto}`}
                        alt={c.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => (e.target.src = `https://randomuser.me/api/portraits/${idx % 2 === 0 ? "women" : "men"}/${30 + idx}.jpg`)}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">
                          {c.speciality || "Caregiver"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight group-hover:text-blue-600 transition-colors">{c.fullName}</h3>
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter italic">
                        📍 {c.address || "Location Hidden"}
                      </p>

                      <div className="mt-6 flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Rate / Day</p>
                          <p className="text-sm font-black text-slate-900">Rs {c.chargeMin} - {c.chargeMax}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Experience</p>
                          <p className="text-sm font-black text-blue-600">Verified</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={() => navigate(`/profile/${c.id}`)} className="py-3.5 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">
                          Profile
                        </button>
                        <button onClick={() => handleInterest(c)} className="py-6 rounded-2xl border-2 border-slate-100 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                          Interested
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAVOURITES SECTION */}
          <section className="bg-gradient-to-br from-pink- to-white rounded-[3rem] p-10 border border-pink-100 shadow-xl shadow-pink-900/5">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <FaHeart className="text-pink-500" /> Your Favorites
                </h2>
                <p className="text-pink-400 font-bold text-xs uppercase tracking-widest mt-1">Shortlisted Caregivers</p>
              </div>
              <button onClick={() => navigate("/favourites")} className="text-xs font-white  text-white border-b-2 border-slate-900 pb-1 hover:text-pink-500 hover:border-pink-500 transition-all">
                View All Shortlists
              </button>
            </div>

            {favouriteCaregivers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favouriteCaregivers.map((c, idx) => (
                  <div key={c.id} className="bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative border border-white">
                    <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                      <img
                        src={`http://localhost:8080/uploads/${c.profilePhoto?.replace(/\s+/g, "_")}`}
                        alt={c.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = `https://randomuser.me/api/portraits/women/${50 + idx}.jpg`)}
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full text-pink-500 shadow-md">
                        <FaHeart size={12} />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{c.fullName}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-4">{c.speciality}</p>
                    <button onClick={() => navigate(`/profile/${c.id}`)} className="w-full py-2 bg-slate-50 text-white text-[10px] font-black uppercase rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/50 rounded-2xl border-2 border-dashed border-pink-200 text-bla font-bold text-sm italic">
                Your heart list is empty. Start adding some!
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL */}
      {dialogue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 flex flex-col items-center relative animate-in fade-in zoom-in duration-300">
            <button className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors" onClick={() => setDialogue(null)}>
              <FaTimes size={20} />
            </button>
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <FaCheck className="text-green-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-900 leading-tight mb-2">Request Sent!</h3>
            <p className="text-center text-slate-500 text-sm font-medium px-4">
              We've notified {dialogue.caregiver.fullName}. They might contact you soon.
            </p>
            <button onClick={() => setDialogue(null)} className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;