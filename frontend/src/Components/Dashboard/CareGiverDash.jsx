import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { FaUserCircle, FaBell } from "react-icons/fa";


const demoProfiles = [
  {
    id: 1,
    name: "Ramesh Thapa",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    specialty: "Elderly Care",
    location: "Kathmandu",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Sita Gurung",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    specialty: "Alzheimer's Care",
    location: "Pokhara",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Hari Bahadur",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    specialty: "Post-Surgery Care",
    location: "Biratnagar",
    rating: 4.8,
  },
];

const CareGiverDash = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentProfile = {
    name: "Nikita Sharma",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    completedSteps: 3,
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">

      <header className="bg-gray-600 text-white py-6 shadow w-full flex items-center justify-between px-6">
  <div>
    <h1 className="text-3xl md:text-4xl font-bold">Welcome, Caregiver</h1>
    <p className="text-gray-200 mt-1">
      Manage your profile and availability from here
    </p>
  </div>
  <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="p-2 rounded-md hover:bg-gray-500 md:hidden"
  >
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</header>

      {/* TOP TAB BAR (Full Width) */}
<div className="bg-white border-b">
  <div className="grid grid-cols-2 text-center">

    {/* PROFILE TAB */}
    <div
      onClick={() => setActiveTab("profile")}
      className={`py-4 cursor-pointer flex justify-center items-center border-b-4 transition
        ${activeTab === "profile"
          ? "border-black text-black bg-gray-50"
          : "border-transparent text-gray-400 hover:bg-gray-100"}`}
    >
      <FaUserCircle size={22} />
    </div>

    {/* NOTIFICATION TAB */}
    <div
      onClick={() => setActiveTab("notifications")}
      className={`relative py-4 cursor-pointer flex justify-center items-center border-b-4 transition
        ${activeTab === "notifications"
          ? "border-black text-black bg-gray-50"
          : "border-transparent text-gray-400 hover:bg-gray-100"}`}
    >
      <FaBell size={20} />

      {/* Badge */}
      <span className="absolute top-2 right-[40%] bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
        2
      </span>
    </div>

  </div>
</div>



      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6 p-6">

        {/* LEFT SIDEBAR (UNCHANGED STYLE) */}
        <aside className="bg-white border rounded-xl p-5 h-fit">

          {/* NAME */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentProfile.photo}
              alt={currentProfile.name}
              className="w-12 h-12 rounded-full object-cover border"
            />
            <h3 className="font-semibold text-gray-900">
              {currentProfile.name}
            </h3>
          </div>

          {/* PROFILE BUTTON */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium mb-2
              ${activeTab === "profile"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"}`}
          >
            Profile
          </button>

          {/* PROFILE STEPS */}
          {activeTab === "profile" && (
            <div className="ml-2 mt-3 space-y-2 text-sm">
              <p className="text-gray-400 uppercase text-xs mb-1">
                Profile Steps
              </p>
              <ul className="space-y-2">
                {["Documents", "Personal", "Professional", "Charges"].map(
                  (label, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs
                          ${i < currentProfile.completedSteps
                            ? "bg-black text-white"
                            : "bg-gray-300 text-gray-700"}`}
                      >
                        {i + 1}
                      </span>
                      {label}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* NOTIFICATIONS (UNCHANGED) */}
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium mt-6
              ${activeTab === "notifications"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-500"}`}
          >
            Notifications
          </button>
          {/* HELP SECTION */}
{/* HELP BUTTON */}
<button
  onClick={() => console.log("Help clicked")}
  className={`w-full text-left px-4 py-2 rounded-lg font-medium mt-2
    hover:bg-gray-100 text-grey-00`}
>
  Help?
</button>

        </aside>

        {/* CENTER CONTENT */}
        <main className="w-full">
          {activeTab === "profile" && (
            <div className="bg-white border rounded-xl p-6">
              <ProfileForm />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <ul className="space-y-3">
                <li className="border-l-4 border-black bg-gray-50 p-4 rounded">
                  New care request assigned
                </li>
                <li className="border-l-4 border-black bg-gray-50 p-4 rounded">
                  Profile approved successfully
                </li>
              </ul>
            </div>
          )}
        </main>

        {/* RIGHT PANEL */}
        <aside className="bg-gray-50 border rounded-xl p-6 h-fit">
          <h3 className="font-semibold mb-4 text-black">Suggested Ideal Profile </h3>
          <div className="space-y-4">
            {demoProfiles.map((p) => (
              <div
                key={p.id}
                className="bg-white border rounded-xl p-4 flex items-center gap-3"
              >
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{p.name}</p>
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
