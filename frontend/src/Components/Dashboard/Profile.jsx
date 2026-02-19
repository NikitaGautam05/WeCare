import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHome } from "react-icons/fa";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => {
        const caregiver = res.data.find((c) => c.id === id);
        setProfile(caregiver || null);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Handler for "I'm Interested"
  const handleInterested = async () => {
    if (!profile) return;

    // Show toast immediately
    setToast(`${profile.fullName} will receive your interest!`);

    try {
      const userName = localStorage.getItem("userName") || "Someone";
      await axios.post(
        `http://localhost:8080/api/caregivers/${profile.id}/notify`,
        null,
        { params: { message: `${userName} is interested in you!` } }
      );
      console.log("Notification sent to caregiver");
    } catch (err) {
      console.error("Failed to send notification:", err);
      setToast("Failed to send interest. Try again.");
    }

    // Auto-dismiss toast
    setTimeout(() => setToast(null), 3000);
  };

  if (!profile) {
    return (
      <div className="fixed inset-0 w-screen h-full bg-gray-100 flex items-center justify-center z-50">
        <div className="text-center px-4">
          <div className="animate-pulse text-2xl sm:text-3xl md:text-4xl font-medium text-gray-700">
            Loading caregiver profile...
          </div>
          <div className="mt-8 w-16 h-16 mx-auto border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const photo = profile.profilePhoto?.replace(/\s+/g, "_");
  const citizenshipPhoto = profile.citizenshipPhoto?.replace(/\s+/g, "_");

  return (
    <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-5 ...">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <span className="text-xl font-bold">✔</span>
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 font-bold hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="w-full bg-white/50 backdrop-blur-md shadow-md border-b border-gray-200 py-4">
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 flex items-center justify-between relative">
          <button
            onClick={() => navigate("/dash")}
            className="bg-white/70 hover:bg-white/80 text-white px-4 py-2 rounded-full flex items-center gap-2 transition shadow-sm"
            title="Back to Dashboard"
          >
            <FaHome size={20} />
            <span className="font-medium">Home</span>
          </button>

          <h1 className="text-xl font-semibold text-gray-900 text-center absolute left-1/2 transform -translate-x-1/2">
            Caregiver Profile
          </h1>
        </div>
      </div>

      {/* Cloud background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-52 left-1/4 w-[900px] h-[900px] bg-white/80 rounded-full blur-[180px]" />
        <div className="absolute top-32 right-[-300px] w-[1000px] h-[1000px] bg-gray-50/80 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-400px] left-[-300px] w-[1100px] h-[1100px] bg-gray-100/60 rounded-full blur-[220px]" />
      </div>

      {/* HERO SECTION */}
      <div className="relative z-10 bg-transparent overflow-hidden w-screen border-b border-gray-100">
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 lg:py-20 space-y-20 lg:space-y-24">
          <div className="flex flex-col items-center text-center gap-8">
            
            {/* Profile Photo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white shadow-2xl" />
              <img
                src={photo ? `http://localhost:8080/uploads/${photo}` : "/default-avatar.png"}
                alt={profile.fullName}
                className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover border-8 border-white shadow-xl"
              />
            </div>

            {/* Name & Speciality */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900">{profile.fullName}</h1>
              <p className="mt-3 text-xl lg:text-2xl font-semibold text-gray-600">{profile.speciality}</p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleInterested} // <-- Here it calls the toast + backend
              className="mt-6 bg-black text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition"
            >
              I'm Interested
            </button>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Experience" value={`${profile.experience || "2"} Years`} />
            <StatCard title="Charges" value={`Rs ${profile.chargeMin || 40000} – ${profile.chargeMax || 60000}`} />
            <StatCard title="Rating" value={profile.rating || "New"} />
            <StatCard title="Location" value={profile.address?.split(",")[0] || "Tinkune"} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 lg:py-20 space-y-20 lg:space-y-24">
        {/* About */}
        <section className="bg-gray-100/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 lg:p-14 border border-gray-200">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-950 mb-10 tracking-tight">About Me</h2>
          <p className="text-xl leading-relaxed text-gray-700">
            {profile.details || "Detailed description coming soon... Feel free to contact for more information."}
          </p>
        </section>

        {/* Contact & Details */}
        <section className="bg-gray-100/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 lg:p-14 border border-gray-200">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-950 mb-12 tracking-tight">Contact & Details</h2>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-10">
              <Info label="Phone" value={profile.phoneNumber} />
              <Info label="Email" value={profile.email} />
              <Info label="Address" value={profile.address} />
            </div>
            <div className="self-start">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Speciality</h3>
              <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-md border border-gray-200">
                <p className="text-2xl font-semibold text-gray-800">{profile.speciality}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Document */}
        <section className="bg-gray-100/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-200">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-950 mb-10 tracking-tight">Verification Document</h2>
          {citizenshipPhoto ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-200">
              <img
                src={`http://localhost:8080/uploads/${citizenshipPhoto}`}
                alt="Citizenship Verification"
                className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-gray-300 hover:shadow-3xl transition-shadow duration-500"
              />
              <p className="mt-8 text-center text-lg text-gray-600 font-medium">
                Government-issued citizenship for identity verification
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 border-4 border-dashed border-gray-300 rounded-3xl p-16 text-center">
              <p className="text-2xl font-bold text-gray-700">No document uploaded yet</p>
              <p className="mt-4 text-lg text-gray-600">All caregivers undergo manual verification for safety.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition">
    <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">{title}</p>
    <p className="mt-3 text-2xl font-black text-gray-900">{value}</p>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <span className="block text-base font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</span>
    <span className="block text-2xl font-medium text-gray-900 break-words">{value || "—"}</span>
  </div>
);

export default Profile;