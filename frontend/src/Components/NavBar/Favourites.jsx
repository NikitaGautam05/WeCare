import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:8080/api";

export default function Favourites() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";

  const [favouriteIds, setFavouriteIds] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [favRes, cgRes] = await Promise.all([
        axios.get(`${BASE}/users/favorites/${userId}`),
        axios.get(`${BASE}/caregivers/verified`),
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
      params: { userId, caregiverId },
    });
    setCaregivers((prev) => prev.filter((c) => c.id !== caregiverId));
    setFavouriteIds((prev) => prev.filter((id) => id !== caregiverId));
    showToast("Removed from favourites ✨");
  } catch (err) {
    console.error(err);
    showToast("Failed to remove from favourites", "error");
  } finally {
    setRemoving(null);
  }
};


  const filtered = caregivers.filter((c) =>
    !search ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-screen max-w-screen overflow-x-hidden bg-[#f8fafc] font-sans text-slate-900 relative overflow-x-hidden">
      
      {/* FULLSCREEN BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 to-indigo-100/30" />
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-rose-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-indigo-100/30 rounded-full blur-[120px]" />
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="text-rose-400">✦</span>
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* NAVBAR */}
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 w-full px-6 md:px-[5vw]">
  <div className="h-20 flex items-center justify-between">
    <div className="flex items-center gap-8">
      {/* Simple Home Icon */}
   <div
  onClick={() => navigate("/dash")}
  className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-rose-500 font-semibold"
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

      <h1 className="heading-font text-xl font-bold tracking-tight hidden md:block italic">
        Elder<span className="text-rose-500 font-black">Ease</span>
      </h1>
    </div>

    <div className="flex items-center gap-4 bg-white/80 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
        {userName.charAt(0)}
      </div>
      <span className="text-sm font-bold text-slate-700">{userName}</span>
    </div>
  </div>
</nav>

      {/* MAIN */}
      <main className="relative z-10 w-full px-6 md:px-[5vw] py-16">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Your Trusted Circle
            </div>
            <h2 className="heading-font text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter mb-6 leading-[0.9]">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Favourites</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">
              Feel homely with your saved favourites caregivers. You have saved 
              <span className="text-slate-900 font-bold"> {caregivers.length} profiles</span>.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full xl:max-w-xl group">
            <input
              type="text"
              placeholder="Search by name, expertise, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-6 pl-16 pr-8 text-slate-700 shadow-xl shadow-slate-200/50 focus:outline-none focus:border-rose-400 transition-all text-lg"
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </span>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Loading Excellence</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center bg-white/40 rounded-[4rem] border-2 border-dashed border-slate-200">
            <div className="text-8xl mb-8 animate-float inline-block">💖</div>
            <h3 className="heading-font text-4xl font-bold text-slate-900 mb-4">
              {search ? "No matches found" : "Your list is empty"}
            </h3>
            <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">
              {search ? "Maybe try a broader search term?" : "Browse our verified experts and save the ones that resonate with you."}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/dash")}
                className="px-12 py-5 bg-slate-900 text-white rounded-full font-bold hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
              >
                Find Caregivers
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
            {filtered.map((c) => {
              const photo = c.profilePhoto?.replace(/\s+/g, "_").trim();
              return (
                <div key={c.id} className="care-card group bg-white rounded-[3rem] p-4 border border-slate-100">
                  <div className="relative h-80 w-full overflow-hidden rounded-[2.5rem] mb-6">
                    <img
                      src={`http://localhost:8080/uploads/${photo}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName || "C")}&background=fff1f2&color=e11d48&size=512`)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <button
                      onClick={() => removeFavourite(c.id)}
                      disabled={removing === c.id}
                      className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                    >
                      {removing === c.id ? "..." : "♥"}
                    </button>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                        {c.speciality || "Specialist"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">VERIFIED</span>
                    </div>
                    
                    <h3 className="heading-font text-2xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-4 truncate">
                      {c.fullName}
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">📍</span>
                        <span className="truncate">{c.address || "Location Private"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                           <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Exp.</p>
                           <p className="text-sm font-bold text-slate-700">{c.experience || 0} Years</p>
                        </div>
                        <div className="flex-1 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                           <p className="text-[10px] text-rose-400 font-bold uppercase mb-0.5">Daily</p>
                           <p className="text-sm font-bold text-rose-700">Rs.{c.chargeMin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/profile/${c.id}`)}
                        className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:shadow-lg transition-all"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => navigate(`/CareGiverDash/${c.id}`)}
                        className="py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:border-rose-200 hover:text-rose-500 transition-all"
                      >
                        Contact
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