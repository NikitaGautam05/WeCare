import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes, FaCheck } from "react-icons/fa";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [favouriteCaregivers, setFavouriteCaregivers] = useState([]);
  const [topInterestProfiles, setTopInterestProfiles] = useState([]);
  const [dialogue, setDialogue] = useState(null); // <-- Dialogue state
  const navigate = useNavigate();

  // User info
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  // Fetch caregivers from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => {
        const data = res.data;
        setCaregivers(data);

        const favourites = data.filter((c) => c.favourite);
        setFavouriteCaregivers(favourites);

        const topProfiles = [];
        data.forEach((c) => {
          c.topProfiles?.forEach((tp) => {
            if (!topProfiles.find((p) => p.name === tp.name)) topProfiles.push(tp);
          });
        });
        setTopInterestProfiles(topProfiles);
      })
      .catch((err) => console.error("Error fetching caregivers:", err));
  }, []);

  // Filter caregivers by search
  const filteredCaregivers = caregivers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLower())
  );

  // Handle Interested click
  const handleInterested = (caregiver) => {
    setDialogue({
      caregiver,
      message: `${caregiver.fullName} has been notified of your interest!`,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-lg fixed h-full flex flex-col justify-between border-r">
        <div className="p-6">
          <h1 className="text-3xl font-extrabold mb-10 text-gray-900 tracking-wide">ElderEase</h1>

          <div className="flex items-center gap-4 mb-10 p-4 bg-gray-100 rounded-xl">
            <img
              src="https://randomuser.me/api/portraits/women/65.jpg"
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-600">{role}</p>
            </div>
          </div>

          <nav className="space-y-2 text-white">
            {["Dashboard", "My Caregivers", "History", "Top Interest", "Favourites", "Profile"].map(
              (item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-3  text-white rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </div>

        <div className="p-6 border-t bg-white">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8">
        <div className="mb-6 bg-gray-200 rounded-2xl shadow-md p-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {userName} 👋</h2>
          <p className="text-gray-700 mt-2 text-lg">Discover caring hands who feel like family</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search caregivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md text-gray-400 px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredCaregivers.map((c) => {
            const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();

            return (
              <div
                key={c.id}
                className="bg-gray-200 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4 border-b">
                  <img
                    src={`http://localhost:8080/uploads/${cleanPhoto}`}
                    alt={c.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">{c.fullName}</h3>
                    <p className="text-xs text-gray-500">{c.address}</p>
                  </div>
                  <span className="font-bold text-gray-500">{c.rating} ⭐</span>
                </div>

                <div className="grid grid-cols-3 text-center py-4 text-sm text-gray-600 border-b">
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

                <div className="p-4 bg-gray-100 border-t">
                  <p className="text-gray-700 text-sm">
                    Specialities: <span className="font-medium">{c.speciality}</span>
                  </p>
                </div>

                <div className="flex gap-2 p-4">
                  <button
                    onClick={() => navigate(`/profile/${c.id}`)}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleInterested(c)}
                    className="flex-1 bg-gray-100 py-2 rounded-lg"
                  >
                    Interested
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Big Notification Dialogue */}
      {dialogue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-400 text-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setDialogue(null)}
            >
              <FaTimes size={20} />
            </button>

            {/* Green tick */}
            <FaCheck className="text-green-500 text-6xl mb-6" />

            {/* Message */}
            <p className="text-center text-xl font-semibold">
              {dialogue.message}
            </p>

            {/* Extra info */}
            <p className="mt-4 text-center text-gray-300">
              The caregiver will be notified and can contact you if interested.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
