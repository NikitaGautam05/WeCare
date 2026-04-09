import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart, FaPhone, FaEnvelope, FaRegCommentDots,
  FaMapMarkerAlt, FaArrowLeft, FaIdCard, FaCheckCircle, FaPaperPlane, FaTimes
} from "react-icons/fa";

const BASE = "http://localhost:8080/api";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  const [dialogue, setDialogue] = useState(null); 
  const [isFavourited, setIsFavourited] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const logHistory = async (actionType) => {
    try {
      await axios.post(`${BASE}/users/add-history`, null, {
        ...axiosConfig,
        params: { userId, caregiverId: id, action: actionType }
      });
    } catch (err) {
      console.error(`Failed to log ${actionType}:`, err);
    }
  };

  const fetchProfileData = async () => {
    try {
      const res = await axios.get(`${BASE}/caregivers/${id}`, axiosConfig);
      setProfile(res.data);

      if (userId) {
        const favRes = await axios.get(`${BASE}/users/favorites/${userId}`, axiosConfig);
        const favIds = favRes.data;
        setIsFavourited(Array.isArray(favIds) && favIds.includes(Number(id)));
        
        logHistory("VIEWED");
      }
    } catch (err) {
      console.error("Failed to fetch caregiver:", err);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchProfileData();
  }, [id, userId, token, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleFavourite = async () => {
    if (!userId) return showToast("Please login to save");
    const previousState = isFavourited;
    setIsFavourited(!previousState);

    try {
      const action = previousState ? "remove-favorite" : "add-favorite";
      const historyAction = previousState ? "UNSAVED" : "SAVED";
      await axios.post(`${BASE}/users/${action}`, null, {
        ...axiosConfig,
        params: { userId, caregiverId: id }
      });
      logHistory(historyAction);
      showToast(!previousState ? "Added to favourites ❤️" : "Removed from favourites");
    } catch (err) {
      setIsFavourited(previousState);
      showToast("Error updating favourites");
    }
  };

  // DASHBOARD STYLE: Allows infinite clicks and shows the notification dialogue
  const handleInterestClick = () => {
    logHistory("CONTACTED");
    setDialogue({
      caregiver: profile,
      message: `${profile.fullName} has been notified of your interest!`,
    });
  };

  const handleReport = async () => {
    if (!userId) return showToast("Please login to report");
    const confirmReport = window.confirm("Report this profile for misconduct?");
    if (!confirmReport) return;
    try {
      await axios.post(`${BASE}/caregivers/${id}/report`, null, axiosConfig);
      setIsReported(true);
      showToast("Profile reported to Admin.");
    } catch (err) {
      showToast("Failed to submit report");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setIsSubmitting(true);
      await axios.post(`${BASE}/caregivers/${id}/comment`, null, {
        ...axiosConfig,
        params: { comment: comment.trim() }
      });
      showToast("Comment posted!");
      setComment("");
      fetchProfileData(); 
    } catch (err) {
      showToast("Error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-900 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile</p>
    </div>
  );

  const photo = profile.profilePhoto?.replace(/\s+/g, "_");
  const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] font-sans pb-20 selection:bg-blue-100 relative">
      
      {/* Toast Overlay */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-black px-8 py-4 rounded-2xl shadow-2xl animate-bounce uppercase tracking-tighter">
          {toast}
        </div>
      )}

      {/* DASHBOARD STYLE MODAL */}
      {dialogue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <button 
              onClick={() => setDialogue(null)} 
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 text-3xl mx-auto shadow-inner">
                ✨
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Notification Sent!</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{dialogue.message}</p>
              <button 
                onClick={() => setDialogue(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-blue-50 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/dash")} className="group flex items-center gap-3 text-white hover:text-blue-600 transition-all font-bold text-sm">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Home
          </button>
          
          <div className="flex items-center gap-4">
            {!isReported ? (
              <button onClick={handleReport} className="text-[10px] font-black text-slate-300 hover:text-red-500 transition uppercase tracking-widest px-4">
                Report
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-black text-blue-900 uppercase tracking-widest">
                <FaCheckCircle /> Flagged
              </span>
            )}
            <button 
              onClick={handleFavourite} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full border-2 transition-all font-black text-xs uppercase tracking-widest ${
                isFavourited 
                  ? "bg-red-50 text-red-600 border-red-100 shadow-inner" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-blue-200"
              }`}
            >
              <FaHeart className={isFavourited ? "animate-pulse text-red-600" : ""} /> 
              {isFavourited ? "Saved ❤️" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3rem] border border-blue-50 shadow-sm overflow-hidden group">
            <div className="relative h-80 w-full bg-slate-100">
              <img 
                src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 flex items-end px-10 pb-10 gap-8">
                <img 
                  src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} 
                  className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl object-cover" 
                  alt={profile.fullName} 
                />
                <div className="flex-1 pb-2">
                  <span className="inline-block bg-green-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-3 uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20">
                    {profile.speciality || "General Care"}
                  </span>
                  <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{profile.fullName}</h1>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60 text-xs font-bold ml-2">Verified Professional</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 flex items-center justify-between bg-slate-50/50">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Service Investment</span>
                <span className="text-2xl font-black text-slate-900">Rs {profile.chargeMin} - {profile.chargeMax} <span className="text-slate-300 font-medium">/ day</span></span>
              </div>
              <button 
                onClick={handleInterestClick} 
                className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-900 hover:-translate-y-1 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
              >
                Interested
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-[2.5rem] border border-blue-50 shadow-sm p-10">
            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] mb-6">Professional Narrative</h2>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {profile.details || "This caregiver is dedicated to providing high-quality assistance."}
            </p>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-[2.5rem] text-black border border-blue-50 shadow-sm p-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <FaRegCommentDots className="text-blue-900" /> Community Feedback
            </h2>
            <div className="flex gap-4 mb-10">
              <input 
                type="text"
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a review..."
                className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-sm font-medium outline-none focus:border-blue-100 focus:bg-white transition-all"
              />
              <button 
                onClick={handleReviewSubmit} 
                disabled={isSubmitting || !comment} 
                className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-900 disabled:opacity-30 transition-all shadow-lg"
              >
                <FaPaperPlane />
              </button>
            </div>

            <div className="space-y-4">
              {profile.comments && profile.comments.length > 0 ? (
                profile.comments.map((text, i) => (
                  <div key={i} className="bg-blue-50/30 p-6 rounded-[1.5rem] border border-blue-50/50">
                    <p className="text-slate-700 text-sm font-medium italic leading-relaxed">"{text}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-300 text-xs font-black uppercase tracking-widest italic">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Min Rate", val: `Rs ${profile.chargeMin}` },
              { label: "Max Rate", val: `Rs ${profile.chargeMax}` },
              { label: "Exp", val: `${profile.experience || 0}y` },
              { label: "Verified", val: `Yes` },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-blue-50 p-6 text-center shadow-sm">
                <p className="text-[10px] text-slate-300 font-black uppercase mb-1">{s.label}</p>
                <p className="text-lg font-black text-slate-900 tracking-tighter">{s.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-blue-50 shadow-sm p-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Coordinates</h2>
            <div className="space-y-3">
              {[
                { icon: <FaPhone />, label: "Call", value: profile.phoneNumber },
                { icon: <FaEnvelope />, label: "Email", value: profile.email },
                { icon: <FaMapMarkerAlt />, label: "Area", value: profile.address || "Kathmandu" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-400">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{item.label}</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-blue-50 shadow-sm p-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Credentials</h2>
            {citizenshipPhoto ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                <img 
                  src={`http://localhost:8080/uploads/${citizenshipPhoto}`} 
                  alt="Verified ID" 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center text-slate-200">
                <FaIdCard size={32} className="mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Pending Verification</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;