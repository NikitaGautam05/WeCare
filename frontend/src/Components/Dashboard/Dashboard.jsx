import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaHeart, FaSearch, FaArrowRight, FaComments, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaUserEdit } from "react-icons/fa";
import logo from "../../assets/logo.jpg";
import Layout from "../Layout/Layout";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [favouriteCaregivers, setFavouriteCaregivers] = useState([]);
  const [showProfileReminder, setShowProfileReminder] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const currentSessions = parseInt(localStorage.getItem(`profileReminder_${userId}`)) || 0;
    const newSessionCount = currentSessions + 1;
    localStorage.setItem(`profileReminder_${userId}`, newSessionCount);

    if (newSessionCount === 10) {
      setShowProfileReminder(true);
      localStorage.setItem(`profileReminder_${userId}`, 0);
    }

    axios.get("http://localhost:8080/api/caregivers/verified", axiosConfig)
      .then((res) => setCaregivers(res.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate("/");
      });

    axios.get(`http://localhost:8080/api/users/favorites/${userId}`, axiosConfig)
      .then((res) => {
        const favIds = res.data;
        if (Array.isArray(favIds) && favIds.length > 0) {
          axios.get("http://localhost:8080/api/caregivers/verified", axiosConfig)
            .then((res) => {
              const favCaregivers = res.data.filter((c) => favIds.includes(c.id));
              setFavouriteCaregivers(favCaregivers);
            });
        }
      })
      .catch((err) => console.error("Failed to fetch favourites", err));
  }, [userId, token]);

  const handleInterest = async (caregiver) => {
    try {
      await axios.post(`http://localhost:8080/api/caregivers/${caregiver.id}/interest`, { userId }, axiosConfig);
      setDialogue({ type: "interest", caregiver });
    } catch (err) {
      alert("Could not send interest.");
    }
  };

  const filteredCaregivers = caregivers.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 12);

  return (
    <Layout>
      {/* HERO SECTION */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Live Portal
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-blue-500">{userName}</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm font-medium opacity-80">
              Find and manage the best professional support for your family's daily needs.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, skill, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-slate-800 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 py-10">
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Professionals</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mt-1">Available across your region</p>
            </div>
            <button
              onClick={() => navigate("/my-caregivers")}
              className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-slate-400 text-white px-5 py-3 rounded-xl hover:bg-blue-600 transition-all"
            >
              View All <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCaregivers.map((c) => (
              <div key={c.id} className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={`http://localhost:8080/uploads/${c.profilePhoto?.replace(/\s+/g, "_")}`}
                    alt={c.fullName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${c.fullName}`)}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm border border-slate-100">
                      {c.speciality || "Care"}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-blue-600 transition-colors">
                    {c.fullName}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tighter truncate">
                    📍 {c.address || "Location Hidden"}
                  </p>

                  <div className="mt-4 flex items-center justify-between bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
                      <p className="text-[11px] font-black text-slate-900">Rs {c.chargeMin}-{c.chargeMax}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                      <p className="text-[11px] font-black text-green-600">Verified</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <button onClick={() => navigate(`/profile/${c.id}`)} className="py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                      View
                    </button>
                    <button onClick={() => handleInterest(c)} className="py-2.5 rounded-xl border border-slate-200 text-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Interest
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAVOURITES */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FaHeart className="text-pink-500" size={18} /> Shortlisted
              </h2>
            </div>
            <button
              onClick={() => navigate("/favourites")}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 hover:text-pink-500 hover:border-pink-500 transition-all"
            >
              View All
            </button>
          </div>

          {favouriteCaregivers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {favouriteCaregivers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/profile/${c.id}`)}
                  className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={`http://localhost:8080/uploads/${c.profilePhoto?.replace(/\s+/g, "_")}`}
                      alt={c.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${c.fullName}&background=f1f5f9&color=475569&bold=true`)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight shadow-sm border border-slate-100">
                        {c.speciality || "Care"}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <FaHeart size={9} className="text-pink-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-black text-slate-900 text-[11px] tracking-tight truncate leading-tight group-hover:text-blue-600 transition-colors">
                      {c.fullName}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate mt-0.5">
                      📍 {c.address || "Kathmandu"}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="text-[9px] font-black text-slate-900">Rs {c.chargeMin}–{c.chargeMax}</p>
                      <span className="text-[8px] font-black text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md uppercase tracking-tight">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900 py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">View Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-widest italic">
              No favorites saved yet
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════
          PROFILE REMINDER MODAL — redesigned
      ══════════════════════════════════════════════ */}
      {showProfileReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
            onClick={() => setShowProfileReminder(false)}
          />

          {/* Card */}
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">

            {/* Top dark header band */}
            <div className="relative bg-slate-900 px-8 pt-10 pb-14 overflow-hidden">
              {/* Glow orbs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600/10 rounded-full blur-xl" />

              {/* Close */}
              <button
                onClick={() => setShowProfileReminder(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
              >
                <FaTimes size={12} />
              </button>

              {/* Icon */}
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FaUserEdit size={26} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-1">Action Required</p>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                    Complete Your<br />Profile
                  </h3>
                </div>
              </div>
            </div>

            {/* White body — overlaps the header */}
            <div className="relative -mt-6 bg-white rounded-t-[2rem] px-8 pt-7 pb-8">
              {/* Progress bar decoration */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              </div>

              <p className="text-slate-600 text-sm font-medium leading-relaxed text-center mb-2">
                Make sure to update your profile so caregivers can see the real you.
              </p>
              <p className="text-slate-400 text-xs font-bold text-center mb-8">
                A complete profile leads to <span className="text-blue-500">3× better matches</span>.
              </p>

              {/* Checklist */}
              <div className="space-y-2.5 mb-8">
                {["Add a profile photo", "Fill in your address", "Describe your needs"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{item}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowProfileReminder(false)}
                  className="py-3.5 rounded-2xl border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowProfileReminder(false);
                    navigate("/my-profile");
                  }}
                  className="py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  <FaArrowUp size={9} /> Update Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          INTEREST SENT MODAL — redesigned
      ══════════════════════════════════════════════ */}
      {dialogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
            onClick={() => setDialogue(null)}
          />

          {/* Card */}
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">

            {/* Top dark header band */}
            <div className="relative bg-slate-900 px-8 pt-10 pb-14 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/15 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-600/10 rounded-full blur-xl" />

              {/* Close */}
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
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                    Request Sent!
                  </h3>
                </div>
              </div>
            </div>

            {/* White body */}
            <div className="relative -mt-6 bg-white rounded-t-[2rem] px-8 pt-7 pb-8">
              {/* Caregiver row */}
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
                We've notified <span className="font-black text-slate-800">{dialogue.caregiver.fullName}</span>. They may contact you shortly.
              </p>

              <button
                onClick={() => setDialogue(null)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;