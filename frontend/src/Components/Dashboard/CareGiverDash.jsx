import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const demoProfiles = [
  { id: 1, name: "Ramesh Thapa", photo: "https://randomuser.me/api/portraits/men/32.jpg", specialty: "Elderly Care", location: "Kathmandu", rating: 4.5 },
  { id: 2, name: "Sita Gurung", photo: "https://randomuser.me/api/portraits/women/44.jpg", specialty: "Alzheimer's Care", location: "Pokhara", rating: 4.7 },
  { id: 3, name: "Hari Bahadur", photo: "https://randomuser.me/api/portraits/men/45.jpg", specialty: "Post-Surgery Care", location: "Biratnagar", rating: 4.8 },
];

const CareGiverDash = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const currentProfile = {
    name: "Nikita Sharma",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    completedSteps: 3,
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">

      {/* TOP TAB BAR */}
      <div className="bg-gray-200 border-b border-gray-300">
        <div className="grid grid-cols-2 text-center">

          {/* PROFILE TAB */}
          <div
            onClick={() => setActiveTab("profile")}
            className={`py-4 cursor-pointer flex justify-center items-center border-b-4 transition
              ${activeTab === "profile"
                ? "border-gray-700 text-gray-900 bg-gray-100 shadow-md font-semibold"
                : "border-transparent text-gray-600 hover:bg-gray-300"}`}
          >
            <FaUserCircle size={22} />
          </div>

          {/* NOTIFICATION TAB */}
          <div
            onClick={() => setActiveTab("notifications")}
            className={`relative py-4 cursor-pointer flex justify-center items-center border-b-4 transition
              ${activeTab === "notifications"
                ? "border-gray-700 text-gray-900 bg-gray-100 shadow-md font-semibold"
                : "border-transparent text-gray-600 hover:bg-gray-300"}`}
          >
            <FaBell size={20} />
            <span className="absolute top-2 right-[40%] bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              2
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE HAMBURGER BUTTON */}
      <div className="md:hidden flex justify-end p-4 bg-gray-200 border-b border-gray-300">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md bg-gray-300 hover:bg-gray-400">
          <svg
            className="w-6 h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 p-6">

        {/* LEFT SIDEBAR */}
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <aside className="bg-white border rounded-xl p-6 h-full shadow-lg">

            {/* PROFILE INFO */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={currentProfile.photo}
                alt={currentProfile.name}
                className="w-14 h-14 rounded-full object-cover border"
              />
              <h3 className="font-semibold text-gray-900">{currentProfile.name}</h3>
            </div>

            {/* PROFILE BUTTON */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium mb-3 transition
                ${activeTab === "profile"
                  ? "bg-gray-300 text-gray-300 shadow"
                  : "hover:bg-gray-200 text-gray-700"}`}
            >
              Profile
            </button>

            {/* PROFILE STEPS */}
            {activeTab === "profile" && (
              <div className="ml-2 mt-3 space-y-3 text-sm">
                <p className="text-gray-500 uppercase text-xs mb-1">Profile Steps</p>
                <ul className="space-y-2">
                  {["Documents", "Personal", "Professional", "Charges"].map((label, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm
                        ${i < currentProfile.completedSteps
                          ? "bg-gray-700 text-white"
                          : "bg-gray-300 text-gray-700"}`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-900">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* NOTIFICATIONS BUTTON */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium mt-6 transition
                ${activeTab === "notifications"
                  ? "bg-gray-300 text-gray-300 shadow"
                  : "hover:bg-gray-200 text-gray-300"}`}
            >
              Notifications
            </button>

            {/* HELP BUTTON */}
            <button
              onClick={() => console.log("Help clicked")}
              className="w-full text-left px-4 py-3 rounded-lg font-medium mt-2 hover:bg-gray-200 text-gray-300 transition"
            >
              Help?
            </button>
              {/* LOGOUT BUTTON */}
            <button
             onClick={() => navigate("/")}
              className="w-full text-left px-4 py-3 rounded-lg font-medium mt-2 bg-red-500 hover:bg-red-600 text-white transition"
            >
              Logout
            </button>

          </aside>
        )}

        {/* CENTER CONTENT */}
        <main className="w-full">
          {activeTab === "profile" && (
            <div className="bg-white border rounded-xl p-8 shadow-lg min-h-[600px]">
              <ProfileForm />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white border rounded-xl p-8 shadow-lg min-h-[600px]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Notifications</h2>
              <ul className="space-y-3">
                <li className="border-l-4 border-gray-700 bg-gray-50 p-4 rounded text-gray-700">
                  New care request assigned
                </li>
                <li className="border-l-4 border-gray-700 bg-gray-50 p-4 rounded text-gray-700">
                  Profile approved successfully
                </li>
              </ul>
            </div>
          )}
        </main>

        {/* RIGHT PANEL */}
        <aside className="bg-white border rounded-xl p-6 shadow-lg h-full">
          <h3 className="font-semibold mb-4 text-gray-900">Suggested Ideal Profile</h3>
          <div className="space-y-4">
            {demoProfiles.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
              >
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.specialty}</p>
                  <p className="text-xs text-gray-500">
                    {p.location} • {p.rating} ⭐
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default CareGiverDash;
