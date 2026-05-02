import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart, FaPhone, FaEnvelope, FaRegCommentDots,
  FaMapMarkerAlt, FaArrowLeft, FaIdCard, FaCheckCircle,
  FaPaperPlane, FaTimes, FaCheck, FaShieldAlt, FaFlag
} from "react-icons/fa";
import Layout from "../Layout/Layout";

const BASE = "http://localhost:8080/api";

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, accent = "blue" }) => {
  const colors = {
    blue:    "bg-blue-50   border-blue-100   text-blue-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    violet:  "bg-violet-50  border-violet-100  text-violet-700",
    amber:   "bg-amber-50   border-amber-100   text-amber-700",
  };
  return (
    <div className={`rounded-2xl border p-4 text-center ${colors[accent]}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1.5">{label}</p>
      <p className="text-lg font-black leading-none">{value}</p>
    </div>
  );
};

// ── Contact row ───────────────────────────────────────────────────────────────
const ContactRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ── Profile Page ───────────────────────────────────────────────────────────────
const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile,             setProfile]             = useState(null);
  const [toast,               setToast]               = useState(null);
  const [dialogue,            setDialogue]            = useState(null);
  const [acceptedConnection,  setAcceptedConnection]  = useState(null);
  const [showBookingModal,    setShowBookingModal]    = useState(false);
  const [bookingForm,         setBookingForm]         = useState({
    serviceType: '',
    serviceDate: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '17:00',
    hourlyRate: 0,
    location: '',
    notes: ''
  });
  const [bookingLoading,      setBookingLoading]      = useState(false);
  const [isFavourited,        setIsFavourited]        = useState(false);
  const [comment,             setComment]             = useState("");
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [isReported,          setIsReported]          = useState(false);

  const userId      = localStorage.getItem("userId");
  const token       = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  /* ── helpers ──────────────────────────────────────────────── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const logHistory = async (actionType) => {
    try {
      await axios.post(`${BASE}/users/add-history`, null, {
        ...axiosConfig,
        params: { userId, caregiverId: id, action: actionType }
      });
    } catch (err) { console.error(`Failed to log ${actionType}:`, err); }
  };

  const fetchProfileData = async () => {
    try {
      const res    = await axios.get(`${BASE}/caregivers/${id}`, axiosConfig);
      const profileData = res.data;
      setProfile(profileData);
      loadBookingDefaults(profileData);

      if (userId) {
        const favRes = await axios.get(`${BASE}/users/favorites/${userId}`, axiosConfig);
        setIsFavourited(Array.isArray(favRes.data) && favRes.data.includes(Number(id)));
        logHistory("VIEWED");

        try {
          const acceptedRes = await axios.get(`${BASE}/chat/accepted-for-receiver/${userId}`, axiosConfig);
          const matched = (acceptedRes.data || []).find((conn) =>
            conn?.caregiver?.id === id || conn?.caregiverId === id || conn?.caregiver?.userId === id
          );
          if (matched) {
            setAcceptedConnection(matched);
          }
        } catch (err) {
          console.warn("Failed to fetch accepted connections:", err);
        }
      }
    } catch (err) { console.error("Failed to fetch caregiver:", err); }
  };

  const loadBookingDefaults = (profileData) => {
    setBookingForm((current) => ({
      ...current,
      serviceType: '',
      hourlyRate: Number(profileData?.chargeMin || profileData?.chargeMax || 0),
      location: ''
    }));
  };

  useEffect(() => {
    if (!token || !userId) { navigate("/login"); return; }
    fetchProfileData();
  }, [id, userId, token, navigate]);

  /* ── actions ──────────────────────────────────────────────── */
  const handleFavourite = async () => {
    if (!userId) return showToast("Please login to save");
    const prev = isFavourited;
    setIsFavourited(!prev);
    try {
      const action = prev ? "remove-favorite" : "add-favorite";
      await axios.post(`${BASE}/users/${action}`, null, { ...axiosConfig, params: { userId, caregiverId: id } });
      logHistory(prev ? "UNSAVED" : "SAVED");
      showToast(prev ? "Removed from favourites" : "Added to favourites ❤️");
    } catch {
      setIsFavourited(prev);
      showToast("Error updating favourites");
    }
  };

  const handleInterestClick = () => {
    logHistory("CONTACTED");
    setDialogue({ caregiver: profile });
  };

  const handleReport = async () => {
    if (!userId) return showToast("Please login to report");
    if (!window.confirm("Report this profile for misconduct?")) return;
    try {
      await axios.post(`${BASE}/caregivers/${id}/report`, null, axiosConfig);
      setIsReported(true);
      showToast("Profile reported to Admin.");
    } catch { showToast("Failed to submit report"); }
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
    } catch { showToast("Error posting comment"); }
    finally { setIsSubmitting(false); }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedConnection) return showToast("Please connect with this caregiver before booking.");
    if (!bookingForm.serviceType || !bookingForm.serviceDate || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.hourlyRate || !bookingForm.location) {
      return showToast("Please complete all required booking fields.");
    }
    if (bookingForm.startTime >= bookingForm.endTime) {
      return showToast("End time must be after start time.");
    }

    const startDateTime = `${bookingForm.serviceDate} ${bookingForm.startTime}`;
    const endDateTime = `${bookingForm.serviceDate} ${bookingForm.endTime}`;
    const notesPayload = bookingForm.notes ? `${bookingForm.notes}\nLocation: ${bookingForm.location}` : `Location: ${bookingForm.location}`;

    try {
      setBookingLoading(true);
      await axios.post(`${BASE}/bookings/create`, null, {
        ...axiosConfig,
        params: {
          caregiverId: profile.id,
          caregiverName: profile.fullName || profile.userName,
          userId,
          userName: localStorage.getItem("userName") || "",
          userPhone: localStorage.getItem("userPhone") || "",
          serviceType: bookingForm.serviceType,
          startTime: startDateTime,
          endTime: endDateTime,
          hourlyRate: Number(bookingForm.hourlyRate),
          notes: notesPayload,
          location: bookingForm.location
        }
      });
      setShowBookingModal(false);
      showToast("Booking request sent!");
    } catch (err) {
      console.error("Booking error:", err);
      showToast("Failed to submit booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── loading ──────────────────────────────────────────────── */
  if (!profile) return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile</p>
      </div>
    </Layout>
  );

  const photo            = profile.profilePhoto?.replace(/\s+/g, "_");
  const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");
  const photoUrl         = photo ? `http://localhost:8080/uploads/${photo}` : null;

  return (
    <Layout>

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-none">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
          {toast}
        </div>
      )}

      {/* ── Interest Sent Modal ─────────────────────────────────── */}
      {dialogue && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center relative">
            <button onClick={() => setDialogue(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors">
              <FaTimes size={18} />
            </button>
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-emerald-100">
              <FaCheck className="text-emerald-500" size={22} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Request Sent!</h3>
            <p className="text-center text-slate-500 text-sm leading-relaxed">
              We've notified <span className="font-semibold text-slate-700">{profile.fullName}</span>. They'll reach out to you soon.
            </p>
            <button onClick={() => setDialogue(null)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all">
              Done
            </button>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-900">Request care</h3>
                <p className="text-sm text-slate-500 mt-1">Describe your care needs, schedule, and location for this accepted caregiver.</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <FaTimes size={18} />
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Service needed
                  <input
                    type="text"
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    placeholder="E.g. personal care, medication support, companionship"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Desired date
                  <input
                    type="date"
                    value={bookingForm.serviceDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceDate: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Start time
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  End time
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Hourly rate
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bookingForm.hourlyRate}
                    onChange={(e) => setBookingForm({ ...bookingForm, hourlyRate: Number(e.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Care location
                  <input
                    type="text"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                    placeholder="Where do you need care?"
                    required
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                Additional details
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400"
                  placeholder="Describe the care tasks, frequency, or special needs..."
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all disabled:opacity-60"
                >
                  {bookingLoading ? 'Booking…' : 'Send Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page content — Layout already provides pt-20 ─────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* ── Back + Action bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between py-5">
        
          <div className="flex items-center gap-2">
            {!isReported ? (
              <button onClick={handleReport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                <FaFlag size={11} /> Report
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                <FaCheckCircle size={11} /> Flagged
              </span>
            )}

            <button onClick={handleFavourite}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                isFavourited
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50"
              }`}>
              <FaHeart size={12} className={isFavourited ? "text-rose-500" : ""} />
              {isFavourited ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* ── HERO BANNER ────────────────────────────────────────── */}
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden mb-7">
          {/* dot grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* colour glows */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

          {/* Ghosted cover photo */}
          {photoUrl && (
            <div className="absolute inset-0 overflow-hidden opacity-[0.18]">
              <img src={photoUrl} className="w-full h-full object-cover scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
            </div>
          )}

          <div className="relative z-10 px-8 pt-8 pb-9 flex flex-col sm:flex-row gap-6 items-start sm:items-end">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
                {photoUrl ? (
                  <img src={photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-5xl font-black text-slate-400">
                    {profile.fullName?.[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                <FaCheck className="text-white" size={11} />
              </div>
            </div>

            {/* Name + tags */}
            <div className="flex-1 pb-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  {profile.speciality || "General Care"}
                </span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <FaShieldAlt size={9} /> Verified
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight truncate">
                {profile.fullName}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
                <FaMapMarkerAlt size={11} className="text-slate-500" />
                {profile.address || "Kathmandu, Nepal"}
              </p>
            </div>

            {/* Rate + CTA */}
            <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
              <div className="sm:text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Daily Rate</p>
                <p className="text-2xl font-black text-white leading-none mt-0.5">
                  Rs {profile.chargeMin}
                  <span className="text-slate-500 font-medium text-sm"> – {profile.chargeMax}</span>
                </p>
              </div>
              {acceptedConnection ? (
                <button onClick={() => setShowBookingModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95">
                  <FaPaperPlane size={11} /> Book Service
                </button>
              ) : (
                <button onClick={handleInterestClick}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95">
                  <FaPaperPlane size={11} /> Send Interest
                </button>
              )}
            </div>
            {acceptedConnection && (
              <div className="mt-2 text-sm text-emerald-200 font-semibold">
                This caregiver has accepted your interest. You can now book a service.
              </div>
            )}
          </div>
        </div>

        {/* ── TWO COLUMN BODY ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — main content */}
          <div className="lg:col-span-8 space-y-5">

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">About</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {profile.details || "This caregiver is dedicated to providing compassionate, high-quality assistance tailored to each individual's unique needs."}
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Min Rate"   value={`Rs ${profile.chargeMin}`} accent="blue" />
              <StatTile label="Max Rate"   value={`Rs ${profile.chargeMax}`} accent="violet" />
              <StatTile label="Experience" value={`${profile.experience || 0} yrs`} accent="emerald" />
              <StatTile label="Status"     value="Verified" accent="amber" />
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-violet-500 rounded-full"></div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Reviews</h2>
                {profile.comments?.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    {profile.comments.length}
                  </span>
                )}
              </div>

              {/* Comment input */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReviewSubmit(e)}
                  placeholder="Write a review..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || !comment.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm active:scale-95"
                >
                  <FaPaperPlane size={13} />
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {profile.comments && profile.comments.length > 0 ? (
                  profile.comments.map((text, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaRegCommentDots className="text-violet-500" size={11} />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed italic flex-1">"{text}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <FaRegCommentDots className="text-slate-300 mx-auto mb-2" size={20} />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No reviews yet</p>
                    <p className="text-slate-300 text-xs mt-1">Be the first to leave a review</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className="lg:col-span-4 space-y-5">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Contact</h2>
              </div>
              <div className="space-y-2.5">
                <ContactRow icon={<FaPhone size={11} />}        label="Phone"    value={profile.phoneNumber} />
                <ContactRow icon={<FaEnvelope size={11} />}     label="Email"    value={profile.email} />
                <ContactRow icon={<FaMapMarkerAlt size={11} />} label="Location" value={profile.address || "Kathmandu"} />
              </div>

              <div className="border-t border-slate-100 mt-5 pt-5">
                <button onClick={handleFavourite}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isFavourited
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50"
                  }`}>
                  <FaHeart size={12} className={isFavourited ? "text-rose-500" : ""} />
                  {isFavourited ? "Remove from Favourites" : "Add to Favourites"}
                </button>
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-amber-400 rounded-full"></div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Credentials</h2>
              </div>

              {citizenshipPhoto ? (
                <>
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                    <img
                      src={`http://localhost:8080/uploads/${citizenshipPhoto}`}
                      alt="Verified ID"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                    <FaShieldAlt size={11} /> Identity Verified by Admin
                  </div>
                </>
              ) : (
                <div className="py-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FaIdCard className="text-slate-300" size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verification</p>
                </div>
              )}
            </div>

            {/* CTA card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ready to connect?</p>
                <h3 className="text-lg font-black text-white mb-4 leading-tight">
                  Work with {profile.fullName?.split(" ")[0]}
                </h3>
                <button onClick={handleInterestClick}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-95">
                  <FaPaperPlane size={11} /> Send Interest
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Hide Layout's floating chat FAB z-conflict on this page — it still works, just sits behind modals */}
      <style>{`body .profile-page-fix { z-index: 39; }`}</style>
    </Layout>
  );
};

export default Profile;