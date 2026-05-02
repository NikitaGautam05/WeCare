import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaHeart } from "react-icons/fa";
import Layout from "../Layout/Layout";

const BASE = "http://localhost:8080/api";

export default function Favourites() {
  const navigate = useNavigate();

  const userId      = localStorage.getItem("userId");
  const token       = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [favouriteIds, setFavouriteIds] = useState([]);
  const [caregivers,   setCaregivers]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [removing,     setRemoving]     = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (!userId || !token) { navigate("/login"); return; }
    fetchData();
  }, [navigate, userId, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [favRes, cgRes] = await Promise.all([
        axios.get(`${BASE}/users/favorites/${userId}`, axiosConfig),
        axios.get(`${BASE}/caregivers/verified`, axiosConfig),
      ]);
      const ids = Array.isArray(favRes.data) ? favRes.data : [];
      const all = Array.isArray(cgRes.data)  ? cgRes.data  : [];
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

  const filtered = caregivers.filter(
    (c) =>
      !search ||
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-3">
          <span className="text-pink-400">✦</span>
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* ── HERO — identical structure to Dashboard / Caregivers / History ── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">

          {/* Left copy */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest">
              <FaHeart size={9} />
              Your Trusted Circle
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              My<br />
              <span className="text-pink-400">Favourites</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm font-medium opacity-80">
              Caregivers you've saved for quick access and booking.
            </p>
            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                {caregivers.length} saved profile{caregivers.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Right search — same frosted box */}
          <div className="w-full max-w-md">
            <div className="bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, expertise, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-none focus:ring-2 focus:ring-pink-500/50 focus:outline-none text-slate-800 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-8 py-10 pb-20">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shortlisted Caregivers</h2>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mt-1">
              {loading ? "Loading…" : `${filtered.length} caregiver${filtered.length !== 1 ? "s" : ""} in your list`}
            </p>
          </div>
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-slate-200 bg-white">
            <FaHeart size={28} className="text-slate-200 mb-3" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No favourites found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const photo = c.profilePhoto?.replace(/\s+/g, "_").trim();
              return (
                <div
                  key={c.id}
                  className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Photo */}
                  <div className="h-56 relative overflow-hidden bg-slate-100">
                    <img
                      src={`http://localhost:8080/uploads/${photo}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) =>
                        (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=1e293b&color=60a5fa&bold=true`)
                      }
                    />
                    {/* Speciality badge — same as Dashboard cards */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm border border-slate-100">
                        {c.speciality || "Care"}
                      </span>
                    </div>
                    {/* Remove heart button */}
                    <button
                      onClick={() => removeFavourite(c.id)}
                      disabled={removing === c.id}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-pink-500 shadow-sm border border-white/50 hover:bg-pink-500 hover:text-white transition-all z-20 disabled:opacity-50"
                    >
                      {removing === c.id ? (
                        <div className="w-3 h-3 border border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                      ) : (
                        <FaHeart size={12} />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-blue-600 transition-colors mb-0.5">
                      {c.fullName}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter truncate mb-4">
                      📍 {c.address || "Location Hidden"}
                    </p>

                    {/* Stats row — same pill style as Dashboard */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
                        <p className="text-[11px] font-black text-slate-900">Rs {c.chargeMin}–{c.chargeMax}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Exp</p>
                        <p className="text-[11px] font-black text-slate-900">{c.experience || "5+"} yrs</p>
                      </div>
                      <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                        <p className="text-[11px] font-black text-green-600">Verified</p>
                      </div>
                    </div>

                    {/* Buttons — same two-button grid as Dashboard */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        onClick={() => navigate(`/profile/${c.id}`)}
                        className="py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleInterested(c)}
                        className="py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all"
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
      </div>

    </Layout>
  );
}