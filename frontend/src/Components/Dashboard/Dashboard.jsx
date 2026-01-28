import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [favouriteCaregivers, setFavouriteCaregivers] = useState([]);
  const [topInterestProfiles, setTopInterestProfiles] = useState([]);
  const navigate = useNavigate();

  // User info (from localStorage for now)
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  // Fetch caregivers from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/caregivers/all")
      .then((res) => {
        const data = res.data;
        setCaregivers(data);

        // Favourites
        const favourites = data.filter((c) => c.favourite);
        setFavouriteCaregivers(favourites);

        // Top Interest Profiles (unique)
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
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-lg fixed h-full flex flex-col justify-between border-r">
        <div className="p-6">
          <h1 className="text-3xl font-extrabold mb-10 text-gray-900 tracking-wide">
            ElderEase
          </h1>

          {/* Profile Section */}
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

          {/* Navigation */}
          <nav className="space-y-2">
            {["Dashboard", "My Caregivers", "History", "Top Interest", "Favourites", "Profile"].map(
              (item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Logout */}
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
        {/* Welcome Message */}
        <div className="mb-6 bg-gray-200 rounded-2xl shadow-md p-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {userName} 👋
          </h2>
          <p className="text-gray-700 mt-2 text-lg">
            Discover caring hands who feel like family
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search caregivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md text-gray-400 px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* CAREGIVERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredCaregivers.map((c) => {
  const cleanPhoto = c.profilePhoto?.replace(/\s+/g, "_").trim();

  return (
    <div
      key={c.id}
      className="bg-gray-200 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
    >
      {/* Top Section: Photo + Name + Address only */}
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

      {/* Info Box: Years / Rating / Charge */}
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

      {/* Short Intro */}
      <div className="p-4 bg-gray-100 border-t">
        <p className="text-gray-700 text-sm">
          <span className="font-bold"></span> Specialities:{" "}
          <span className="font-medium">{c.speciality}</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 p-4">
        <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg">
          View Profile
        </button>
        <button className="flex-1 bg-gray-100 py-2 rounded-lg">
          Interested
        </button>
      </div>
    </div>
  );
})}

            </div>
      </main>
    </div>
  );
};

export default Dashboard;
