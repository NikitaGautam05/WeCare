import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaSearch, FaStar, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Caregivers = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => setCaregivers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredCaregivers = caregivers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInterested = (caregiver) => {
    setDialogue({
      caregiver,
      message: `${caregiver.fullName} has been notified of your interest!`,
    });
  };

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

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 4.5;
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        size={12}
        className={i < Math.floor(r) ? "text-yellow-400" : "text-gray-200"}
      />
    ));
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 font-sans">
      {/* SIDE MENU — UNCHANGED */}
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

      {/* HEADER — UNCHANGED */}
      <header className="bg-white shadow-md w-full fixed top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-full">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Elder Ease Logo"
              className="h-10 w-auto cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
            <span
              className="cursor-pointer text-gray-700 font-bold text-xl hover:text-black transition"
              onClick={() => setMenuOpen(true)}
            >
              ☰ Menu
            </span>
          </div>

          <div className="flex items-center gap-6">
            {navItems
              .filter((i) =>
                ["🏠 Home", "👩‍⚕️ Caregivers", "❤️ Favourites"].includes(i.name)
              )
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
      <main className="pt-24 min-h-screen bg-gray-100 px-6 pb-12">
        <div className="w-full max-w-5xl mx-auto">

          {/* Page heading */}
          <div className="pt-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">👩‍⚕️ All Caregivers</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse and connect with verified caregivers near you
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, speciality or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full shadow-sm border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm text-gray-700"
            />
          </div>

          {/* Count */}
          <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
            {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? "s" : ""} found
          </p>

          {/* Caregiver Cards */}
          <div className="space-y-4">
            {filteredCaregivers.map((c, idx) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-0">
                  
                  {/* Left: Photo */}
                  <div className="flex-shrink-0 md:w-44 h-44 md:h-auto relative overflow-hidden">
                    <img
                      src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? "women" : "men"}/${30 + idx}.jpg`}
                      alt={c.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                    {/* Rating badge on photo */}
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                      <FaStar size={10} className="text-yellow-400" />
                      <span className="text-xs font-bold text-gray-700">{c.rating || "4.5"}</span>
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-lg font-bold text-gray-900">{c.fullName}</h3>
                          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {c.speciality || "General Care"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(c.rating)}
                          <span className="text-xs text-gray-400 ml-1">({c.rating || "4.5"})</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                          <FaMapMarkerAlt size={10} />
                          <span>{c.address || "Location not provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-3" />

                    {/* Stats + Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Stats */}
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="bg-indigo-50 p-1.5 rounded-lg">
                            <FaBriefcase size={12} className="text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Experience</p>
                            <p className="text-sm font-semibold text-gray-800">{c.experience || "5+"} yrs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="bg-green-50 p-1.5 rounded-lg">
                            <FaMoneyBillWave size={12} className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Charge</p>
                            <p className="text-sm font-semibold text-gray-800">Rs {c.charge || "500"}/day</p>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/profile/${c.id}`)}
                          className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition shadow-sm"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleInterested(c)}
                          className="bg-gray-100 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                        >
                          Interested
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredCaregivers.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">👩‍⚕️</p>
              <p className="text-lg font-medium text-gray-500">No caregivers found</p>
              <p className="text-sm">Try adjusting your search</p>
            </div>
          )}
        </div>
      </main>

      {/* Notification Modal */}
      {dialogue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-400 text-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center relative">
            <button
              className="absolute top-4 right-4 text-gray-200 hover:text-white"
              onClick={() => setDialogue(null)}
            >
              <FaTimes size={20} />
            </button>
            <FaCheck className="text-green-500 text-6xl mb-6" />
            <p className="text-center text-xl font-semibold">{dialogue.message}</p>
            <p className="mt-4 text-center text-gray-200 text-sm">
              The caregiver will be notified and can contact you if interested.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caregivers;