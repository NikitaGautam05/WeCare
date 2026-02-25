import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Caregivers = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // For active nav underline
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => setCaregivers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredCaregivers = caregivers
    .filter(
      (c) =>
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
    )
    

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
    {/* Search Bar */}
    <div className="flex justify-center">
      <input
        type="text"
        placeholder="Search caregivers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-2xl px-6 py-3 rounded-full shadow-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
      />
    </div>

    {/* Caregiver Cards */}
    {filteredCaregivers.map((c) => {
  return (
    <div
      key={c.id}
      className="bg-white shadow-lg rounded-3xl overflow-hidden hover:shadow-2xl transition duration-300 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 p-6"
    >
      {/* Photo Section */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <img
          src="https://randomuser.me/api/portraits/women/65.jpg" // static placeholder
          alt={c.fullName}
          className="w-48 h-48 md:w-56 md:h-56 rounded-xl border object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Name & Speciality */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{c.fullName}</h3>
          <p className="text-lg text-gray-700 mt-1">{c.speciality}</p>
          <p className="text-gray-500 mt-1">{c.address || "Address not provided"}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-4 text-gray-700 text-sm md:text-base">
          <div>
            <p className="font-semibold">{c.experience || "5+"} yrs</p>
            <p>Experience</p>
          </div>
          <div>
            <p className="font-semibold">Rs {c.charge || "500"}/day</p>
            <p>Charge</p>
          </div>
          <div>
            <p className="font-semibold">{c.rating || "4.5"} ⭐</p>
            <p>Rating</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
  onClick={() => navigate(`/profile/${c.userName}`)}
  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-500 transition font-medium"
>
  View Profile
</button>
          <button
            onClick={() => handleInterested(c)}
            className="flex-1 bg-gray-200 text-white py-3 rounded-xl hover:bg-gray-300 transition font-medium"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
})}

  </div>
</main>




      {/* Notification */}
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
