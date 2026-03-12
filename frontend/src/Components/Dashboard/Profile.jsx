import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart, FaStar, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaBriefcase, FaArrowLeft, FaIdCard
} from "react-icons/fa";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFavourited, setIsFavourited] = useState(false);
  const [interested, setInterested] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => {
        const caregiver = res.data.find((c) => String(c.id) === String(id));
        setProfile(caregiver || null);
        const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
        setIsFavourited(saved.some((f) => String(f.id) === String(id)));
      })
      .catch((err) => console.error(err));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInterested = async () => {
    if (!profile || interested) return;
    setInterested(true);
    showToast(`Interest sent to ${profile.fullName}!`);
    try {
      const userName = localStorage.getItem("userName") || "Someone";
      await axios.post(`http://localhost:8080/api/caregivers/${profile.id}/notify`, null, {
        params: { message: `${userName} is interested in you!` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavourite = () => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    let updated;
    if (isFavourited) {
      updated = saved.filter((f) => String(f.id) !== String(id));
      showToast("Removed from favourites");
    } else {
      updated = [...saved, {
        id: profile.id,
        fullName: profile.fullName,
        speciality: profile.speciality,
        profilePhoto: profile.profilePhoto,
      }];
      showToast("Added to favourites ❤️");
    }
    localStorage.setItem("favourites", JSON.stringify(updated));
    setIsFavourited(!isFavourited);
  };

  if (!profile) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const photo = profile.profilePhoto?.replace(/\s+/g, "_");
  const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");
  const rating = parseFloat(profile.rating) || 0;

  return (
    <div className="min-h-screen w-screen bg-gray-50 font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white border-b border-gray-100 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between gap-4">

          {/* Back button */}
          <button
            onClick={() => navigate("/dash")}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition group"
          >
            <span className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition">
              <FaArrowLeft size={13} />
            </span>
            <span className="text-sm font-semibold hidden sm:block">Back</span>
          </button>

          {/* Center title */}
          <div className="text-center">
            <p className="text-base font-bold text-gray-900">Caregiver Profile</p>
            <p className="text-xs text-gray-400 mt-0.5">View details & connect</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleFavourite}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition ${
              isFavourited
                ? "bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-100"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            <FaHeart size={14} className={isFavourited ? "text-pink-500" : "text-gray-400"} />
            {isFavourited ? "Saved" : "Save"}
          </button>

        </div>
      </header>

      {/* PAGE */}
      <main className="pt-20 max-w-4xl mx-auto px-6 py-10 space-y-5">

        {/* IDENTITY CARD */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Hero image area — full bleed photo as background */}
          <div className="relative h-56 w-full overflow-hidden bg-gray-200">
            {/* Blurred background photo */}
            <img
              src={photo ? `http://localhost:8080/uploads/${photo}` : `https://randomuser.me/api/portraits/women/44.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-sm opacity-60"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/10" />

            {/* Content over the hero */}
            <div className="absolute inset-0 flex items-end px-8 pb-6 gap-5">
              {/* Profile photo */}
              <div className="relative flex-shrink-0">
                <img
                  src={photo ? `http://localhost:8080/uploads/${photo}` : `https://randomuser.me/api/portraits/women/44.jpg`}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
                {isFavourited && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 rounded-full p-1 shadow">
                    <FaHeart className="text-white" size={9} />
                  </span>
                )}
              </div>

              {/* Name + speciality + stars */}
              <div className="flex-1 min-w-0 pb-1">
                <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 border border-white/20">
                  {profile.speciality || "Caregiver"}
                </span>
                <h1 className="text-3xl font-black text-white leading-tight drop-shadow-sm truncate">
                  {profile.fullName}
                </h1>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      size={12}
                      className={i < Math.floor(rating) ? "text-yellow-400" : "text-white/20"}
                    />
                  ))}
                  <span className="text-white/60 text-xs ml-1">
                    {rating ? `${rating} / 5` : "No rating yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Location chip — top right */}
            {profile.address && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <FaMapMarkerAlt size={10} />
                <span className="truncate max-w-[140px]">{profile.address.split(",")[0]}</span>
              </div>
            )}
          </div>

          {/* Action bar below hero */}
          <div className="px-8 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaBriefcase size={12} className="text-gray-400" />
              <span className="font-medium">{profile.experience || "2"}+ yrs experience</span>
              <span className="text-gray-300 mx-1">·</span>
              <span className="font-medium">Rs {profile.charge || "500"}/day</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFavourite}
                className={`p-2.5 rounded-xl border transition ${
                  isFavourited
                    ? "bg-pink-50 border-pink-200 text-pink-500"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <FaHeart size={14} />
              </button>
              <button
                onClick={handleInterested}
                disabled={interested}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ${
                  interested
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                }`}
              >
                {interested ? "✓ Sent" : "I'm Interested"}
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Experience", value: `${profile.experience || "2"}+ yrs` },
            { label: "Daily Rate",  value: `Rs ${profile.charge || "500"}` },
            { label: "Rating",      value: rating ? `${rating} / 5` : "New" },
            { label: "Location",    value: profile.address?.split(",")[0] || "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">{s.label}</p>
              <p className="text-base font-black text-gray-900 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ABOUT */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About</h2>
          <p className="text-gray-600 text-sm leading-7">
            {profile.details || "This caregiver hasn't added a bio yet. Reach out directly to learn more about their experience and availability."}
          </p>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: <FaPhone size={13} />,        label: "Phone",      value: profile.phoneNumber },
              { icon: <FaEnvelope size={13} />,     label: "Email",      value: profile.email },
              { icon: <FaMapMarkerAlt size={13} />, label: "Address",    value: profile.address },
              { icon: <FaBriefcase size={13} />,    label: "Speciality", value: profile.speciality },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCUMENT */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Verification</h2>
          {citizenshipPhoto ? (
            <div className="space-y-3">
              <img
                src={`http://localhost:8080/uploads/${citizenshipPhoto}`}
                alt="Citizenship"
                className="w-full max-w-lg rounded-2xl border border-gray-100 shadow-sm"
              />
              <p className="text-xs text-gray-400">Government-issued ID for identity verification.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
              <FaIdCard size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No document uploaded</p>
              <p className="text-xs text-gray-400 mt-1">All caregivers are manually verified.</p>
            </div>
          )}
        </div>

        {/* FEEDBACK & RATING */}
        <FeedbackSection caregiverName={profile.fullName} caregiverId={profile.id} />

        {/* BOTTOM CTA */}
        <div className="bg-gray-900 rounded-3xl px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg">Ready to connect?</p>
            <p className="text-gray-400 text-sm mt-0.5">
              Send your interest to {profile.fullName?.split(" ")[0]  }. <br/> So {profile.fullName?. split (" ")[0]} can contact you.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFavourite}
              className={`p-3 rounded-xl border transition ${
                isFavourited ? "bg-pink-500 border-pink-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <FaHeart size={16} />
            </button>
            <button
              onClick={handleInterested}
              disabled={interested}
              className={`px-7 py-3 rounded-xl text-white font-bold text-sm transition ${
                interested ? "bg-green-600 text-white cursor-default" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              {interested ? "✓ Interest Sent" : "I'm Interested"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

/* ── FEEDBACK SECTION COMPONENT ── */
const FeedbackSection = ({ caregiverName, caregiverId }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState(() => {
    const stored = localStorage.getItem(`reviews_${caregiverId}`);
    return stored ? JSON.parse(stored) : [];
  });

  const userName = localStorage.getItem("userName") || "You";

  const handleSubmit = () => {
    if (!selected || !comment.trim()) return;
    const newReview = {
      id: Date.now(),
      user: userName,
      rating: selected,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${caregiverId}`, JSON.stringify(updated));
    setSubmitted(true);
    setSelected(0);
    setComment("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reviews & Feedback</h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-2xl font-black text-gray-900">{avgRating}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <FaStar key={i} size={14} className={i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-200"} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>
        {reviews.length === 0 && (
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            Be the first to review
          </span>
        )}
      </div>

      {/* Write a review box */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Rate {caregiverName?.split(" ")[0]}</p>

        {/* Star selector */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(i + 1)}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                size={28}
                className={
                  i < (hovered || selected)
                    ? "text-yellow-400 drop-shadow-sm"
                    : "text-gray-200"
                }
              />
            </button>
          ))}
          {(hovered || selected) > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center font-medium">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hovered || selected]}
            </span>
          )}
        </div>

        {/* Comment box */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your experience with ${caregiverName?.split(" ")[0]}...`}
          rows={3}
          className="w-full px-4 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 transition"
        />

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {!selected && !comment ? "Select a rating and write a comment" :
             !selected ? "Please select a star rating" :
             !comment.trim() ? "Please write a comment" : ""}
          </p>
          <button
            onClick={handleSubmit}
            disabled={!selected || !comment.trim()}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ${
              submitted
                ? "bg-green-600 text-white cursor-default"
                : selected && comment.trim()
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitted ? "✓ Submitted!" : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">All Reviews</p>
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {r.user.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{r.user}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar key={i} size={10} className={i < r.rating ? "text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{r.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;