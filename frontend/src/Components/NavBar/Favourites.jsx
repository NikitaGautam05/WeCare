import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaHeart, FaSearch, FaStar } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Favourites = () => {
  const [search, setSearch] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => setFavourites(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredFavourites = favourites.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
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
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        size={11}
        className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="min-h-screen w-screen bg-pink-500 font-sans">
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

      {/* MAIN CONTENT — REDESIGNED */}
      <main className="pt-24 min-h-screen bg-pink-50 px-6 pb-12">
        <div className="max-w-6xl mx-auto">

          {/* Page Title */}
          <div className="flex items-center justify-between mb-2 pt-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☆</span>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">
                Favourites
              </h1>
            </div>
            {/* Search icon button */}
            <button className="text-gray-500 hover:text-pink-600 transition">
              <FaSearch size={18} />
            </button>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Here you can find all your favorite caregivers, if you need their service contact them 😊
          </p>

          {/* Search bar */}
          <div className="relative mb-8 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search favourites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none text-sm text-gray-700"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFavourites.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group"
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ transform: hoveredId === c.id ? "translateY(-4px)" : "translateY(0)" }}
              >
                {/* Heart icon */}
                <button className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-sm">
                  <FaHeart className="text-pink-500" size={14} />
                </button>

                {/* Tag */}
                {(c.tag || c.speciality) && (
                  <span className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {c.tag || c.speciality}
                  </span>
                )}

                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={
                      c.profilePhoto
                        ? `http://localhost:8080/uploads/${c.profilePhoto.replace(/\s+/g, "_").trim()}`
                        : `https://randomuser.me/api/portraits/${c.id % 2 === 0 ? "women" : "men"}/${30 + (c.id % 20)}.jpg`
                    }
                    alt={c.fullName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-pink-500 font-semibold uppercase tracking-wide mb-0.5">
                    {c.speciality}
                  </p>
                  <h3 className="text-base font-bold text-gray-800 truncate">{c.fullName}</h3>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mt-1 mb-3">
                    {renderStars(c.rating)}
                    <span className="text-xs text-gray-500 ml-1">({c.rating})</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 mb-3">
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">{c.experience}yr</p>
                      <p>Exp.</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">Rs{c.charge}</p>
                      <p>/day</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700 truncate max-w-[60px]">{c.address.split(" ").slice(-1)}</p>
                      <p>Area</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/profile/${c.id}`)}
                      className="flex-1 bg-indigo-600 text-white text-xs py-2 rounded-lg hover:bg-indigo-500 transition font-semibold"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleInterested(c)}
                      className="flex-1 bg-pink-100 text-pink-600 text-xs py-2 rounded-lg hover:bg-pink-200 transition font-semibold"
                    >
                      Interested
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFavourites.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <FaHeart size={40} className="mx-auto mb-4 text-pink-300" />
              <p className="text-lg font-medium">No favourites found</p>
              <p className="text-sm">Try a different search term</p>
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

export default Favourites;