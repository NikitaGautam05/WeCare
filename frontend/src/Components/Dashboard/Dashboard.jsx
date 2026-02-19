import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaBars } from "react-icons/fa";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  // Dummy favourites data
  const favourites = [
    { id: 101, fullName: "Anita Sharma", speciality: "Senior Care", profilePhoto: "anita_sharma.jpg" },
    { id: 102, fullName: "Ramesh Thapa", speciality: "Medical Assistance", profilePhoto: "ramesh_thapa.jpg" },
    { id: 103, fullName: "Sita Gurung", speciality: "Physical Therapy", profilePhoto: "sita_gurung.jpg" },
    { id: 104, fullName: "Kiran Rai", speciality: "Child Care", profilePhoto: "kiran_rai.jpg" },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => setCaregivers(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Filter caregivers based on search and only show first 16
  const filteredCaregivers = caregivers
    .filter(
      (c) =>
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 12);

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
    { name: "👤 Profile", link: `/profile/${userName}`, isGrey: true },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
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
            {navItems
              .filter((i) => !i.isHamburger)
              .map((item) => (
                <li key={item.name}>
                  <div
                    onClick={() => {
                      navigate(item.link);
                      setMenuOpen(false);
                    }}
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl shadow-sm transition duration-200 text-gray-800 font-medium"
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">ElderEase</h1>
          <div className="hidden md:flex items-center gap-4">
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
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-36 w-full px-6">
        {/* Welcome Box */}
        <div className="mb-6 bg-gray-500 rounded-2xl shadow-md p-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-white-900">Welcome, {userName} 👋</h2>
          <p className="text-white-700 mt-2 text-lg">Discover caring hands who feel like family</p>
        </div>

        {/* Navigation Box */}
        <div className="mb-6 bg-gray-200 w-full rounded-2xl shadow-md p-6">
          <nav className="flex items-center gap-x-30 overflow-x-auto">
            {navItems.map((item) => {
              if (item.isHamburger) {
                return (
                  <span
                    key="hamburger"
                    className="cursor-pointer text-gray-700 hover:text-black text-xl"
                    onClick={() => setMenuOpen(true)}
                  >
                    ☰
                  </span>
                );
              } else {
                return (
                  <span
                    key={item.name}
                    onClick={() => navigate(item.link)}
                    className="cursor-pointer text-gray-700 hover:text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    {item.name}
                  </span>
                );
              }
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search caregivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md text-gray-600 px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
        </div>

        {/* Caregiver Cards (First 16) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCaregivers.map((c) => {
            const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                  <img
                    src={`http://localhost:8080/uploads/${cleanPhoto}`}
                    alt={c.fullName}
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{c.fullName}</h3>
                    <p className="text-xs text-gray-500">{c.address}</p>
                  </div>
                  <span className="font-bold text-gray-600">{c.rating || "4.5"} ⭐</span>
                </div>

                <div className="grid grid-cols-3 text-center py-4 text-sm text-gray-600 border-b border-gray-200">
                  <div>
                    <p className="font-semibold">{c.experience || "5+"}</p>
                    <p className="text-xs">Years</p>
                  </div>
                  <div>
                    <p className="font-semibold">{c.rating || "4.5"}</p>
                    <p className="text-xs">Rating</p>
                  </div>
                  <div>
                    <p className="font-semibold">Rs {c.charge || "500"}</p>
                    <p className="text-xs">Per Day</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 text-sm">
                    Specialities: <span className="font-medium">{c.speciality}</span>
                  </p>
                </div>

                <div className="flex gap-2 p-4">
                  <button
                    onClick={() => navigate(`/profile/${c.id}`)}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleInterested(c)}
                    className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Interested
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Favourites Section */}
        {Array.isArray(favourites) && favourites.length > 0 && (
  <div className="mt-10 p-6 rounded-2xl shadow-md bg-pink-100">
    <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Favourites</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favourites.map((c) => {
        const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
        return (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            <div className="flex items-center gap-4 p-4 border-b border-gray-200">
              <img
                src={`http://localhost:8080/uploads/${cleanPhoto}`}
                alt={c.fullName}
                className="w-16 h-16 rounded-full object-cover border"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{c.fullName}</h3>
                <p className="text-xs text-gray-500">{c.address || "N/A"}</p>
              </div>
              <span className="font-bold text-gray-600">{c.rating || "4.5"} ⭐</span>
            </div>

            <div className="grid grid-cols-3 text-center py-4 text-sm text-gray-600 border-b border-gray-200">
              <div>
                <p className="font-semibold">{c.experience || "5+"}</p>
                <p className="text-xs">Years</p>
              </div>
              <div>
                <p className="font-semibold">{c.rating || "4.5"}</p>
                <p className="text-xs">Rating</p>
              </div>
              <div>
                <p className="font-semibold">Rs {c.charge || "500"}</p>
                <p className="text-xs">Per Day</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700 text-sm">
                Specialities: <span className="font-medium">{c.speciality}</span>
              </p>
            </div>

            <div className="flex gap-2 p-4">
              <button
                onClick={() => navigate(`/profile/${c.id}`)}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
              >
                View Profile
              </button>
              <button
                onClick={() => handleInterested(c)}
                className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Interested
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
        
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

export default Dashboard;
