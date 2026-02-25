import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const ProfileUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Nikita",
    lastName: "Sharma",
    username: "nikita123",
    nickname: "Nikki",
    email: "nikita@example.com",
    whatsapp: "@nikita",
    telegram: "@nikita",
    website: "https://nikita.io",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  });

  const navItems = [
    { name: "☰", isHamburger: true },
    { name: "🏠 Home", link: "/dash", isGrey: true },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "📜 History", link: "/history" },
    { name: "⭐ Top Interest", link: "/top-interest" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile", isGrey: true  },
    // { name: "👤 Profile", link: `/profile/${userName}`, isGrey: true },
  ];
  const isActive = (link) => location.pathname === link;

  return (
    <div className="min-h-screen w-screen bg-gray-50 font-sans">
      {/* SIDE MENU */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-72 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 h-full">
          <button
            className="self-end text-gray-700 hover:text-gray-900 mb-6"
            onClick={() => setMenuOpen(false)}
          >
            <FaTimes size={24} />
          </button>
          <ul className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => {
                    navigate(item.link);
                    setMenuOpen(false);
                  }}
                  className={`cursor-pointer px-4 py-3 rounded-xl shadow-sm transition duration-200 font-medium ${
                    isActive(item.link)
                      ? "bg-gray-200 text-gray-900 underline"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </div>
              </li>
            ))}
            <li className="mt-6">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition shadow-md"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

         {/* HEADER */}
      <header className="bg-white shadow-md w-full fixed top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-full">
          
          {/* Logo + Hamburger (as text) */}
          <div className="flex items-center gap-4">
            {/* Elder Ease Logo */}
            <img
              src={logo}
              alt="Elder Ease Logo"
              className="h-10 w-auto cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
      
            {/* Hamburger menu as text */}
            <span
              className="cursor-pointer text-gray-700 font-bold text-xl hover:text-black transition"
              onClick={() => setMenuOpen(true)}
            >
              ☰ Menu
            </span>
          </div>
      
          {/* Right-side top-level nav + user info */}
          <div className="flex items-center gap-6">
            {navItems
              .filter((i) => ["🏠 Home", "👩‍⚕️ Caregivers", "❤️ Favourites"].includes(i.name))
              .map((item) => {
                const name = item.name.replace(/[^a-zA-Z ]/g, "");
                return (
                  <span
                    key={item.name}
                    onClick={() => navigate(item.link)}
                    className="cursor-pointer text-gray-700 hover:text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    {name}
                  </span>
                );
              })}
      
            <div
        className="hidden md:flex items-center gap-4 ml-4 cursor-pointer"
        onClick={() => navigate("/my-profile")}
      >
        <img
          src="https://randomuser.me/api/portraits/women/65.jpg"
          alt="Profile"
          className="w-12 h-12 rounded-full border object-cover"
        />
        <div className="text-right">
          <h3 className="font-semibold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
          </div>
        </div>
      </header>
      

      {/* MAIN CONTENT */}
      <main className="pt-24 bg-gray-100 min-h-screen flex justify-center px-6">
        <div className="w-full max-w-6xl space-y-6">
          {/* PROFILE SECTION */}
          <div className="bg-white shadow-lg rounded-3xl overflow-hidden hover:shadow-2xl transition duration-300 w-full flex flex-col md:flex-row gap-6 p-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <img
                src={profileData.photo}
                alt={profileData.firstName}
                className="w-48 h-48 md:w-56 md:h-56 rounded-xl border object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profileData).map(([key, value]) => {
                  if (key === "photo") return null;
                  return (
                    <div key={key}>
                      <label className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                      {key === "bio" ? (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            setProfileData({ ...profileData, [key]: e.target.value })
                          }
                          className="w-full border rounded-lg p-2 mt-1 h-32 resize-none text-gray-900"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            setProfileData({ ...profileData, [key]: e.target.value })
                          }
                          className="w-full border rounded-lg p-2 mt-1 text-gray-900"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition">
                  Update Profile
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