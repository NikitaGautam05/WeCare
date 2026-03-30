// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FaHeart, FaStar, FaPhone, FaEnvelope,
//   FaMapMarkerAlt, FaBriefcase, FaArrowLeft, FaIdCard
// } from "react-icons/fa";

// const BASE = "http://localhost:8080/api";

// const Profile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [isFavourited, setIsFavourited] = useState(false);
//   const [interested, setInterested] = useState(false);

//   const userId = localStorage.getItem("userId");
//   const userName = localStorage.getItem("userName") || "User";
//   useEffect(() => {
//   const fetchProfile = async () => {
//     try {
//       const res = await axios.get(`http://localhost:8080/api/caregivers/${id}`);
//       setProfile(res.data); // store the fetched caregiver in state
//     } catch (err) {
//       console.error("Failed to fetch caregiver:", err);
//     }
//   };
//   fetchProfile();
// }, [id]);

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3000);
//   };

// useEffect(() => {
//   const fetchProfile = async () => {
//     try {
//       const res = await axios.get(`${BASE}/caregivers/${id}`);
//       setProfile(res.data);

//       // ✅ TRACK VIEW
//       if (userId) {
//         await axios.post(`${BASE}/users/add-history`, null, {
//           params: {
//             userId,
//             caregiverId: id,
//             action: "VIEWED"
//           }
//         });
//       }

//     } catch (err) {
//       console.error("Failed to fetch caregiver:", err);
//     }
//   };

//   fetchProfile();
// }, [id]);

// const handleFavourite = async () => {
//   if (!profile) return;

//   try {
//     if (isFavourited) {
//       await axios.post(`${BASE}/users/remove-favorite`, null, {
//         params: { userId, caregiverId: profile.id }
//       });

//       // ✅ TRACK UNSAVE
//       await axios.post(`${BASE}/users/add-history`, null, {
//         params: {
//           userId,
//           caregiverId: profile.id,
//           action: "UNSAVED"
//         }
//       });

//       showToast("Removed from favourites");
//       setIsFavourited(false);

//     } else {
//       await axios.post(`${BASE}/users/add-favorite`, null, {
//         params: { userId, caregiverId: profile.id }
//       });

//       // ✅ TRACK SAVE
//       await axios.post(`${BASE}/users/add-history`, null, {
//         params: {
//           userId,
//           caregiverId: profile.id,
//           action: "SAVED"
//         }
//       });

//       showToast("Added to favourites ❤️");
//       setIsFavourited(true);
//     }
//   } catch (err) {
//     console.error(err);
//     showToast("Failed to update favourites");
//   }
// };

// const handleInterested = async () => {
//   if (!userId || interested) return;

//   try {
//     await axios.post(`${BASE}/caregivers/${id}/notify`, null, {
//       params: {
//         message: `${userName} is interested in you!`,
//         userId: userId
//       }
//     });

//     // track history
//     await axios.post(`${BASE}/users/add-history`, null, {
//       params: {
//         userId,
//         caregiverId: id,
//         action: "INTERESTED"
//       }
//     });

//     setInterested(true);
//     showToast(`Interest sent to ${profile.fullName}`);
//   } catch (err) {
//     console.error(err);
//     showToast("Failed to send interest");
//   }
// };

//   if (!profile) return <p className="text-center mt-20">Loading profile...</p>;

//   const photo = profile.profilePhoto?.replace(/\s+/g, "_");
//   const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");
//   const rating = parseFloat(profile.rating) || 0;

//   return (
//     <div className="min-h-screen w-screen bg-gray-50 font-sans">

//       {/* Toast */}
//       {toast && (
//         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-xl">
//           {toast}
//         </div>
//       )}

//       {/* Header */}
//       <header className="fixed top-0 w-full bg-white border-b border-gray-100 z-40 shadow-sm">
//         <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
//           <button onClick={() => navigate("/dash")} className="flex items-center gap-3 text-gray-600">
//             <FaArrowLeft /> Back
//           </button>
//           <h1 className="text-lg font-bold text-gray-900">Caregiver Profile</h1>
//           <button onClick={handleFavourite} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${isFavourited ? "bg-pink-50 text-pink-500 border-pink-200" : "bg-white text-gray-600 border-gray-200"}`}>
//             <FaHeart /> {isFavourited ? "Saved" : "Save"}
//           </button>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="pt-24 max-w-4xl mx-auto px-6 space-y-5">

//         {/* Hero */}
//         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
//           <div className="relative h-56 w-full bg-gray-200">
//             <img src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-60" />
//             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/10" />
//             <div className="absolute inset-0 flex items-end px-8 pb-6 gap-5">
//               <img src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} alt={profile.fullName} className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl" />
//               <div className="flex-1 min-w-0 pb-1">
//                 <span className="inline-block bg-white/15 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 border border-white/20">{profile.speciality || "Caregiver"}</span>
//                 <h1 className="text-3xl font-black text-white truncate">{profile.fullName}</h1>
//                 <div className="flex items-center gap-1 mt-1.5">
//                   {Array.from({ length: 5 }, (_, i) => <FaStar key={i} size={12} className={i < Math.floor(rating) ? "text-yellow-400" : "text-white/20"} />)}
//                   <span className="text-white/60 text-xs ml-1">{rating ? `${rating} / 5` : "No rating yet"}</span>
//                 </div>
//               </div>
//             </div>
//             {profile.address && (
//               <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
//                 <FaMapMarkerAlt size={10} />
//                 <span>{profile.address.split(",")[0]}</span>
//               </div>
//             )}
//           </div>

//           {/* Action buttons */}
//           <div className="px-8 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <FaBriefcase size={12} className="text-gray-400" />
//               <span>{profile.experience || 2}+ yrs experience</span>
//               <span className="text-gray-300 mx-1">·</span>
//               <span>Rs {profile.charge || 500}/day</span>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={handleFavourite} className={`p-2.5 rounded-xl border ${isFavourited ? "bg-pink-50 border-pink-200 text-pink-500" : "bg-white border-gray-200 text-gray-400"}`}>
//                 <FaHeart size={14} />
//               </button>
//               <button onClick={handleInterested} disabled={interested} className={`px-6 py-2.5 rounded-xl text-sm font-bold ${interested ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
//                 {interested ? "✓ Sent" : "I'm Interested"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             { label: "Experience", value: `${profile.experience || 2}+ yrs` },
//             { label: "Daily Rate",  value: `Rs ${profile.charge || 500}` },
//             { label: "Rating",      value: rating ? `${rating} / 5` : "New" },
//             { label: "Location",    value: profile.address?.split(",")[0] || "—" },
//           ].map((s) => (
//             <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 text-center">
//               <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">{s.label}</p>
//               <p className="text-base font-black text-gray-900 truncate">{s.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* About */}
//         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
//           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About</h2>
//           <p className="text-gray-600 text-sm leading-7">{profile.details || "No bio available."}</p>
//         </div>

//         {/* Contact */}
//         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
//           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contact</h2>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {[{icon: <FaPhone />, label:"Phone", value: profile.phoneNumber},
//               {icon: <FaEnvelope />, label:"Email", value: profile.email},
//               {icon: <FaMapMarkerAlt />, label:"Address", value: profile.address},
//               {icon: <FaBriefcase />, label:"Speciality", value: profile.speciality}].map((item)=>(
//               <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
//                 <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">{item.icon}</div>
//                 <div className="min-w-0">
//                   <p className="text-xs text-gray-400 font-medium">{item.label}</p>
//                   <p className="text-sm font-semibold text-gray-800 truncate">{item.value || "—"}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Verification */}
//         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-7">
//           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Verification</h2>
//           {citizenshipPhoto ? (
//             <img src={`http://localhost:8080/uploads/${citizenshipPhoto}`} alt="ID" className="w-full max-w-lg rounded-2xl border border-gray-100 shadow-sm" />
//           ) : (
//             <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
//               <FaIdCard size={28} className="text-gray-300 mb-3" />
//               <p className="text-sm font-semibold text-gray-500">No document uploaded</p>
//             </div>
//           )}
//         </div>

//       </main>
//     </div>
//   );
// };

// export default Profile;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart, FaStar, FaPhone, FaEnvelope, FaRegCommentDots,
  FaMapMarkerAlt, FaArrowLeft, FaIdCard, FaRegStar, FaCheckCircle
} from "react-icons/fa";

const BASE = "http://localhost:8080/api";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFavourited, setIsFavourited] = useState(false);
  const [interested, setInterested] = useState(false);
  
  // Comment & Report States
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";

  const fetchProfileData = async () => {
    try {
      const res = await axios.get(`${BASE}/caregivers/${id}`);
      setProfile(res.data);
      
      if (userId) {
        axios.post(`${BASE}/users/add-history`, null, {
          params: { userId, caregiverId: id, action: "VIEWED" }
        }).catch(() => {}); 
      }
    } catch (err) {
      console.error("Failed to fetch caregiver:", err);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, userId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleFavourite = async () => {
    if (!userId) return showToast("Please login to save");
    try {
      const action = isFavourited ? "remove-favorite" : "add-favorite";
      const historyAction = isFavourited ? "UNSAVED" : "SAVED";
      
      await axios.post(`${BASE}/users/${action}`, null, {
        params: { userId, caregiverId: id }
      });

      await axios.post(`${BASE}/users/add-history`, null, {
        params: { userId, caregiverId: id, action: historyAction }
      });

      setIsFavourited(!isFavourited);
      showToast(isFavourited ? "Removed from favourites" : "Added to favourites ❤️");
    } catch (err) {
      showToast("Error updating favourites");
    }
  };

  // ✅ Updated Report Logic: Increments reportsCount in Backend
  const handleReport = async () => {
    if (!userId) return showToast("Please login to report");
    const confirmReport = window.confirm("Are you sure you want to report this profile for misconduct?");
    if (!confirmReport) return;

    try {
      // Create this endpoint in your Controller to increment caregiver.reportsCount
      await axios.post(`${BASE}/caregivers/${id}/report`);
      
      setIsReported(true);
      showToast("Profile reported to Admin.");
    } catch (err) {
      showToast("Failed to submit report");
    }
  };

  // ✅ Updated Comment Submission (Matches your List<String> backend)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return showToast("Please login to comment");
    if (!comment.trim()) return showToast("Please write a comment");

    try {
      setIsSubmitting(true);
      // Matches: @PostMapping("/{id}/comment")
      await axios.post(`${BASE}/caregivers/${id}/comment`, null, {
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

  const handleInterested = async () => {
    if (!userId || interested) return;
    try {
      await axios.post(`${BASE}/caregivers/${id}/notify`, null, {
        params: { message: `${userName} is interested in your services!`, userId }
      });
      setInterested(true);
      showToast(`Interest sent to ${profile.fullName}`);
    } catch (err) {
      showToast("Failed to send interest");
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-gray-400 font-medium">Loading profile...</div>
    </div>
  );

  const photo = profile.profilePhoto?.replace(/\s+/g, "_");
  const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");

  return (
    <div className="min-h-screen w-screen bg-gray-50 font-sans pb-12">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white border-b border-gray-100 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/dash")} className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition">
            <FaArrowLeft /> Back
          </button>
          
          <div className="flex items-center gap-6">
            {!isReported ? (
              <button onClick={handleReport} className="text-xs font-bold text-red-500 hover:text-red-700 transition uppercase tracking-wider">
                Report Profile
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-orange-600 uppercase tracking-wider">
                <FaCheckCircle /> Reported
              </span>
            )}

            <button onClick={handleFavourite} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${isFavourited ? "bg-pink-50 text-pink-500 border-pink-200" : "bg-white text-gray-600 border-gray-200"}`}>
              <FaHeart /> {isFavourited ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-4xl mx-auto px-6 space-y-5">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="relative h-64 w-full bg-gray-200">
            <img src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} className="absolute inset-0 w-full h-full object-cover blur-md opacity-40" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-end px-8 pb-8 gap-6">
              <img src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"} className="w-28 h-28 rounded-2xl border-4 border-white shadow-2xl object-cover" alt={profile.fullName} />
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-2 border border-white/30 uppercase tracking-wider">{profile.speciality || "General Care"}</span>
                <h1 className="text-4xl font-black text-white tracking-tight truncate">{profile.fullName}</h1>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
            <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-bold uppercase">Estimated Cost</span>
               <span className="text-lg font-black text-gray-900">Rs {profile.chargeMin} - {profile.chargeMax} <small className="text-gray-400 font-medium">/ day</small></span>
            </div>
            <button onClick={handleInterested} disabled={interested} className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${interested ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-black"}`}>
              {interested ? "✓ Request Sent" : "Book Interest"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: "Experience", value: `${profile.experience || 0}+ Years` }, { label: "Min Rate", value: `Rs ${profile.chargeMin}` }, { label: "Max Rate", value: `Rs ${profile.chargeMax}` }, { label: "Location", value: profile.address?.split(",")[0] || "Nepal" }].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{s.label}</p>
              <p className="text-sm font-black text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Professional Bio</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{profile.details || "No bio available."}</p>
            </div>

            {/* Comments/Feedback Section */}
            <div id="feedback-section" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FaRegCommentDots className="text-blue-500" /> Comments
              </h2>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                <textarea 
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  className="w-full bg-white text-black border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition h-20"
                />
                <button onClick={handleReviewSubmit} disabled={isSubmitting} className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:bg-gray-300">
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>

              <div className="space-y-4">
                {profile.comments && profile.comments.length > 0 ? (
                  profile.comments.map((text, i) => (
                    <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                      <p className="text-gray-700 text-sm italic">"{text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs italic">No comments yet. Be the first to write one!</p>
                )}
              </div>
            </div>

            {/* Identity Verification */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Identity Verification</h2>
              {citizenshipPhoto ? (
                <div className="group relative rounded-2xl overflow-hidden border border-gray-100">
                  <img src={`http://localhost:8080/uploads/${citizenshipPhoto}`} alt="Verification ID" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center text-gray-300">
                  <FaIdCard size={32} className="mb-2" />
                  <p className="text-xs font-medium">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contact Info</h2>
              <div className="space-y-4">
                {[{ icon: <FaPhone size={12} />, label: "Phone", value: profile.phoneNumber }, { icon: <FaEnvelope size={12} />, label: "Email", value: profile.email }, { icon: <FaMapMarkerAlt size={12} />, label: "Address", value: profile.address }].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 flex-shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</p>
                      <p className="text-xs font-bold text-gray-700 truncate">{item.value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;