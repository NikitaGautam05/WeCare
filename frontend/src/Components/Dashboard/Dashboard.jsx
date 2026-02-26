import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck, FaHeart, FaStar, FaSearch, FaArrowRight } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";
  const location = useLocation();
  const isActive = (link) => location.pathname === link;

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
    { name: "👤 Profile", link: "/my-profile", isGrey: true },
  ];

  const quickLinks = [
    { icon: "👩‍⚕️", label: "Caregivers", link: "/my-caregivers" },
    { icon: "❤️", label: "Favourites", link: "/favourites" },
    { icon: "📜", label: "History", link: "/history" },
    { icon: "⭐", label: "Top Interest", link: "/top-interest" },
  ];

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 4.5;
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} size={10} className={i < Math.floor(r) ? "text-gray-700" : "text-gray-200"} />
    ));
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 font-sans">

      {/* SIDE MENU — UNCHANGED */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-72 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 h-full">
          <button className="self-end text-gray-700 hover:text-gray-900 mb-6" onClick={() => setMenuOpen(false)}>
            <FaTimes size={24} />
          </button>
          <ul className="flex flex-col gap-4 mt-4">
            {navItems.filter((i) => !i.isHamburger).map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => { navigate(item.link); setMenuOpen(false); }}
                  className={`cursor-pointer px-4 py-3 rounded-xl shadow-sm transition duration-200 font-medium ${
                    isActive(item.link) ? "bg-gray-200 text-gray-900 underline" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </div>
              </li>
            ))}
            <li className="mt-6">
              <button onClick={() => navigate("/")} className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition shadow-md">
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
            <img src={logo} alt="Elder Ease Logo" className="h-10 w-auto cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            <span className="cursor-pointer text-gray-700 font-bold text-xl hover:text-black transition" onClick={() => setMenuOpen(true)}>
              ☰ Menu
            </span>
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

      {/* MAIN — starts right below header, 100% width */}
      <main className="pt-[72px] w-full min-h-screen flex flex-col bg-gray-100">

        {/* ── HERO BANNER — edge to edge ── */}
        <div className="w-full bg-gray-900 px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Dashboard</p>
            <h2 className="text-4xl font-bold text-white">Welcome back, {userName} 👋</h2>
            <p className="text-gray-400 mt-2 text-base">Discover caring hands who feel like family.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-7 py-4 text-center">
              <p className="text-3xl font-bold text-white">{caregivers.length}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Caregivers</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-7 py-4 text-center">
              <p className="text-3xl font-bold text-white">{favourites.length}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Favourites</p>
            </div>
          </div>
        </div>

        {/* ── QUICK NAV STRIP — edge to edge ── */}
        <div className="w-full bg-white border-b border-gray-200 px-8 py-3 flex gap-3 flex-wrap items-center">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-2">Quick Access:</span>
          {quickLinks.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate(q.link)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-400 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 transition-all duration-200"
            >
              <span>{q.icon}</span>
              {q.label}
              <FaArrowRight size={9} className="opacity-30" />
            </button>
          ))}
        </div>

        {/* ── PAGE CONTENT — padded ── */}
        <div className="w-full px-8 pb-16 flex-1">

          {/* Search */}
          <div className="relative mt-8 mb-6 max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search caregivers by name, speciality or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none text-sm text-gray-700"
            />
          </div>

          {/* ── CAREGIVERS ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Caregivers</h2>
                <p className="text-xs text-gray-400 mt-0.5">{filteredCaregivers.length} available</p>
              </div>
              <button
                onClick={() => navigate("/my-caregivers")}
                className="flex items-center gap-2 text-sm font-semibold border border-gray-300 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
              >
                View all <FaArrowRight size={10} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCaregivers.map((c, idx) => {
                const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {/* Photo */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${cleanPhoto}`}
                        alt={c.fullName}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => (e.target.src = `https://randomuser.me/api/portraits/${idx % 2 === 0 ? "women" : "men"}/${30 + idx}.jpg`)}
                      />
                      <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {c.speciality || "General"}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-0.5 text-xs font-bold text-gray-800 shadow">
                        ★ {c.rating || "4.5"}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-base truncate">{c.fullName}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {c.address || "N/A"}</p>
                      <div className="flex items-center gap-0.5 mt-2">{renderStars(c.rating)}</div>

                      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
                        <div className="text-center">
                          <p className="font-bold text-gray-800">{c.experience || "5+"}yr</p>
                          <p>Exp.</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="text-center">
                          <p className="font-bold text-gray-800">Rs{c.charge || "500"}</p>
                          <p>/day</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={() => navigate(`/profile/${c.id}`)} className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-xl hover:bg-gray-700 transition font-semibold">
                          View Profile
                        </button>
                        <button onClick={() => handleInterested(c)} className="flex-1 bg-gray-100 text-white text-xs py-2 rounded-xl hover:bg-gray-200 transition font-semibold">
                          Interested
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── FAVOURITES ── */}
          {Array.isArray(favourites) && favourites.length > 0 && (
            <section className="bg-pink-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Your Favourites</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Caregivers you love</p>
                </div>
                <button
                  onClick={() => navigate("/favourites")}
                  className="flex items-center gap-2 text-sm font-semibold border border-pink-300 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                >
                  View all <FaArrowRight size={10} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {favourites.map((c, idx) => {
                  const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-pink-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      <div className="relative h-36 bg-pink-50 overflow-hidden">
                        <img
                          src={`http://localhost:8080/uploads/${cleanPhoto}`}
                          alt={c.fullName}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => (e.target.src = `https://randomuser.me/api/portraits/women/${50 + idx}.jpg`)}
                        />
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow">
                          <FaHeart className="text-pink-400" size={11} />
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{c.fullName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{c.speciality}</p>
                        <div className="flex gap-2 mt-auto pt-3">
                          <button onClick={() => navigate(`/profile/${c.id}`)} className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-xl hover:bg-gray-700 transition font-semibold">
                            View
                          </button>
                          <button onClick={() => handleInterested(c)} className="flex-1 bg-pink-100 text-white text-xs py-2 rounded-xl hover:bg-pink-200 transition font-semibold">
                            Interested
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Notification Modal */}
      {dialogue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-400 text-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center relative">
            <button className="absolute top-4 right-4 text-gray-200 hover:text-white" onClick={() => setDialogue(null)}>
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