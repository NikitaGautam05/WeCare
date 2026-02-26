import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes, FaCamera, FaUser, FaEnvelope, FaGlobe, FaWhatsapp, FaTelegram } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const ProfileUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Nikita",
    lastName: "Sharma",
    username: "nikita123",
    nickname: "Nikki",
    email: "nikita@example.com",
    whatsapp: "@nikita",
    telegram: "@nikita",
    website: "https://nikita.io",
    bio: "Hard working is my passion.",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  });

  const navItems = [
    { name: "☰", isHamburger: true },
    { name: "🏠 Home", link: "/dash", isGrey: true },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "⭐ Top Interest", link: "/top-interest" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile", isGrey: true },
  ];
  const isActive = (link) => location.pathname === link;

  const handleUpdate = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fieldConfig = {
    firstName:  { label: "First Name",  icon: <FaUser size={12} />,     col: 1 },
    lastName:   { label: "Last Name",   icon: <FaUser size={12} />,     col: 1 },
    username:   { label: "Username",    icon: <FaUser size={12} />,     col: 1 },
    nickname:   { label: "Nickname",    icon: <FaUser size={12} />,     col: 1 },
    email:      { label: "Email",       icon: <FaEnvelope size={12} />, col: 2 },
    whatsapp:   { label: "WhatsApp",    icon: <FaWhatsapp size={12} />, col: 2 },
    telegram:   { label: "Telegram",    icon: <FaTelegram size={12} />, col: 2 },
    website:    { label: "Website",     icon: <FaGlobe size={12} />,    col: 2 },
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 font-sans">

      {/* SIDE MENU — UNCHANGED */}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-72 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col p-6 h-full">
          <button className="self-end text-gray-700 hover:text-gray-900 mb-6" onClick={() => setMenuOpen(false)}>
            <FaTimes size={24} />
          </button>
          <ul className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => { navigate(item.link); setMenuOpen(false); }}
                  className={`cursor-pointer px-4 py-3 rounded-xl shadow-sm transition duration-200 font-medium ${isActive(item.link) ? "bg-gray-200 text-gray-900 underline" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                >
                  {item.name}
                </div>
              </li>
            ))}
            <li className="mt-6">
              <button onClick={() => navigate("/")} className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition shadow-md">Logout</button>
            </li>
          </ul>
        </div>
      </aside>

      {/* HEADER — UNCHANGED */}
      <header className="bg-white shadow-md w-full fixed top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-full">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Elder Ease Logo" className="h-10 w-auto cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            <span className="cursor-pointer text-gray-700 font-bold text-xl hover:text-black transition" onClick={() => setMenuOpen(true)}>☰ Menu</span>
          </div>
          <div className="flex items-center gap-6">
            {navItems.filter((i) => ["🏠 Home", "👩‍⚕️ Caregivers", "❤️ Favourites"].includes(i.name)).map((item) => {
              const name = item.name.replace(/[^a-zA-Z ]/g, "");
              return (
                <span key={item.name} onClick={() => navigate(item.link)} className="cursor-pointer text-gray-700 hover:text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium">
                  {name}
                </span>
              );
            })}
            <div className="hidden md:flex items-center gap-4 ml-4 cursor-pointer" onClick={() => navigate("/my-profile")}>
              <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Profile" className="w-12 h-12 rounded-full border object-cover" />
              <div className="text-right">
                <h3 className="font-semibold text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-[72px] w-full min-h-screen bg-gray-100">

        {/* Dark top banner */}
        <div className="w-full bg-gray-900 px-8 py-8">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal information</p>
        </div>

        {/* Content */}
        <div className="w-full px-8 py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── LEFT: Avatar card ── */}
            <div className="flex-shrink-0 w-full lg:w-64">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                {/* Photo */}
                <div className="relative mb-4">
                  <img
                    src={profileData.photo}
                    alt={profileData.firstName}
                    className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-100 shadow"
                  />
                  <button className="absolute -bottom-2 -right-2 bg-gray-900 text-white rounded-full p-2 shadow hover:bg-gray-700 transition">
                    <FaCamera size={12} />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-sm text-gray-400 mt-0.5">@{profileData.username}</p>
                <span className="mt-3 inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{role}</span>

                <div className="w-full border-t border-gray-100 mt-5 pt-4 space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaEnvelope size={11} className="text-gray-400" />
                    <span className="truncate">{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaGlobe size={11} className="text-gray-400" />
                    <span className="truncate">{profileData.website}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaWhatsapp size={11} className="text-gray-400" />
                    <span>{profileData.whatsapp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Edit form ── */}
            <div className="flex-1 space-y-5">

              {/* Personal Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["firstName", "lastName", "username", "nickname"].map((key) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        {fieldConfig[key]?.label || key}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                          {fieldConfig[key]?.icon}
                        </span>
                        <input
                          type="text"
                          value={profileData[key]}
                          onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Contact & Social
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["email", "whatsapp", "telegram", "website"].map((key) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        {fieldConfig[key]?.label || key}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                          {fieldConfig[key]?.icon}
                        </span>
                        <input
                          type="text"
                          value={profileData[key]}
                          onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                  Bio
                </h3>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us something about yourself..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none transition resize-none"
                />
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleUpdate}
                  className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm ${
                    saved
                      ? "bg-green-600 text-white scale-95"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  }`}
                >
                  {saved ? "✓ Profile Updated!" : "Update Profile"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileUser;