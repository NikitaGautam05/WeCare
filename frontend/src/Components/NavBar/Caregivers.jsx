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
} from "react-icons/fa";
import Layout from "../Layout/Layout";

const Caregivers = () => {
  const [search, setSearch]       = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dialogue, setDialogue]   = useState(null);
  const [sentIds, setSentIds] = useState([]);

  const navigate = useNavigate();
  const token  = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchSentInterests = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interest/sent-interests/${userId}`, axiosConfig);
      const ids = Array.isArray(res.data)
        ? res.data.map((interest) => interest.caregiver?.id).filter(Boolean)
        : [];
      setSentIds(ids);
    } catch (err) {
      console.error("Failed to fetch sent interests", err);
      setSentIds([]);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [cgRes, interestRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers/verified`, axiosConfig),
          axios.get(`${import.meta.env.VITE_API_URL}/api/interest/sent-interests/${userId}`, axiosConfig)
        ]);

        const cgData = cgRes.data;
        console.log('Caregivers response:', cgData, 'Type:', typeof cgData, 'IsArray:', Array.isArray(cgData));
        const caregiversList = Array.isArray(cgData) ? cgData : (cgData?.data && Array.isArray(cgData.data) ? cgData.data : []);
        setCaregivers(caregiversList);
        const ids = Array.isArray(interestRes.data)
          ? interestRes.data.map((interest) => interest.caregiver?.id).filter(Boolean)
          : [];
        setSentIds(ids);
      } catch (err) {
        console.error("Data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleRequestsChanged = () => {
      fetchSentInterests();
    };
    window.addEventListener('requestsChanged', handleRequestsChanged);
    return () => window.removeEventListener('requestsChanged', handleRequestsChanged);
  }, [navigate, token, userId]);

  const filteredCaregivers = Array.isArray(caregivers) ? caregivers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleInterested = async (caregiver) => {
    if (!userId) { navigate('/login'); return; }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/interest/send`, null, {
        ...axiosConfig,
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.fullName || caregiver.userName || 'Caregiver',
          userId,
          userName: localStorage.getItem('userName') || 'User'
        }
      });
      setSentIds((s) => Array.from(new Set([...s, caregiver.id])));
      setDialogue({ caregiver, message: `We've sent your profile to ${caregiver.fullName}.` });
    } catch (err) {
      console.error('Failed to send interest', err);
      alert('Could not send interest. Please try again.');
    }
  };

  return (
    <Layout>

      {/* ── HERO — identical structure to Dashboard hero ── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">

          {/* Left copy */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <FaShieldAlt size={9} />
              100% Verified Professionals
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Browse &amp; Find<br />
              <span className="text-blue-500">Your Caregiver</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm font-medium opacity-80">
              Discover verified professionals available across your region.
            </p>
            {!loading && (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {Array.isArray(caregivers) ? caregivers.length : 0} professionals available
              </div>
            )}
          </div>

          {/* Right search — pixel-identical to Dashboard */}
          <div className="w-full max-w-md">
            <div className="bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, expertise, or city..."
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
      <div className="max-w-7xl mx-auto w-full px-8 py-10">

        {/* Section header — mirrors Dashboard */}
        <div className="flex items-end justify-between mb-8 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Professionals</h2>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mt-1">
              {loading ? "Loading…" : `${filteredCaregivers.length} caregivers found`}
            </p>
          </div>
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCaregivers.map((c) => {
              const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
              return (
                <div
                  key={c.id}
                  className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Photo panel */}
                  <div className="sm:w-52 h-56 sm:h-auto relative overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${cleanPhoto}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) =>
                        (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=1e293b&color=60a5fa&bold=true`)
                      }
                    />
                    {/* Speciality badge — same style as Dashboard cards */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm border border-slate-100">
                        {c.speciality || "Care"}
                      </span>
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                        {c.fullName}
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter mb-5">
                        📍 {c.address || "Location Hidden"}
                      </p>

                      {/* Stats row — same pill style as Dashboard */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
                          <p className="text-[11px] font-black text-slate-900">Rs {c.chargeMin}–{c.chargeMax}</p>
                        </div>
                        <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Experience</p>
                          <p className="text-[11px] font-black text-slate-900">{c.experience || "5+"} yrs</p>
                        </div>
                        <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                          <p className="text-[11px] font-black text-green-600">Verified</p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons — identical to Dashboard cards */}
                    <div className="grid grid-cols-2 gap-2 mt-5">
                      <button
                        onClick={() => navigate(`/profile/${c.id}`)}
                        className="py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleInterested(c)}
                        disabled={sentIds.includes(c.id)}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sentIds.includes(c.id) ? 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed' : 'border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
                      >
                        {sentIds.includes(c.id) ? 'Sent ✓' : 'Interested'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INTEREST MODAL — identical to Dashboard modal ── */}
      {dialogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
            onClick={() => setDialogue(null)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">

            {/* Dark header band */}
            <div className="relative bg-slate-900 px-8 pt-10 pb-14 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/15 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-600/10 rounded-full blur-xl" />

              <button
                onClick={() => setDialogue(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
              >
                <FaTimes size={12} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <FaCheck size={26} className="text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.25em] mb-1">Success</p>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">Request Sent!</h3>
                </div>
              </div>
            </div>

            {/* White body */}
            <div className="relative -mt-6 bg-white rounded-t-[2rem] px-8 pt-7 pb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaCheck size={14} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notified</p>
                  <p className="text-sm font-black text-slate-900 truncate">{dialogue.caregiver.fullName}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="text-[9px] font-black text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-lg uppercase tracking-tight">
                    Sent ✓
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-sm font-medium leading-relaxed text-center mb-8">
                We've notified{" "}
                <span className="font-black text-slate-800">{dialogue.caregiver.fullName}</span>.{" "}
                They will review your request and get back to you shortly.
              </p>

              <button
                onClick={() => setDialogue(null)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20"
              >
                Great, Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default Caregivers;