import React, { useState } from "react";

const dummyCaregivers = [
  {
    id: 1,
    name: "Ramesh Thapa",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    specialty: "Elderly Care",
    location: "Kathmandu",
    rating: 4.5,
    beds: 3,
    baths: 2,
    sqft: 1500,
    topProfiles: [
      { name: "Sita Gurung", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "Hari Bahadur", photo: "https://randomuser.me/api/portraits/men/45.jpg" },
    ],
  },
  {
    id: 2,
    name: "Sita Gurung",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    specialty: "Alzheimer's Care",
    location: "Pokhara",
    rating: 4.7,
    beds: 4,
    baths: 2,
    sqft: 1600,
    topProfiles: [
      { name: "Gita Sharma", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
      { name: "Ramesh Thapa", photo: "https://randomuser.me/api/portraits/men/32.jpg" },
    ],
  },
  {
    id: 3,
    name: "Hari Bahadur",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    specialty: "Post-Surgery Care",
    location: "Biratnagar",
    rating: 4.8,
    beds: 2,
    baths: 2,
    sqft: 1200,
    topProfiles: [
      { name: "Sita Gurung", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
    ],
  },
  {
    id: 4,
    name: "Gita Sharma",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    specialty: "Dementia Care",
    location: "Lalitpur",
    rating: 4.9,
    beds: 4,
    baths: 3,
    sqft: 1800,
    topProfiles: [
      { name: "Hari Bahadur", photo: "https://randomuser.me/api/portraits/men/45.jpg" },
      { name: "Ramesh Thapa", photo: "https://randomuser.me/api/portraits/men/32.jpg" },
    ],
  },
];

const Dashboard = () => {
  const [search, setSearch] = useState("");

  const filteredCaregivers = dummyCaregivers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  // Collect all unique top interest profiles
  const topInterestProfiles = [];
  dummyCaregivers.forEach((c) => {
    c.topProfiles.forEach((tp) => {
      if (!topInterestProfiles.find((p) => p.name === tp.name)) {
        topInterestProfiles.push(tp);
      }
    });
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ElderEase</h1>
          </div>

          <nav className="space-y-2">
            {[
              { name: "Dashboard", active: false },
              { name: "My Caregivers", active: true },
              { name: "Schedule", active: false },
              { name: "Messages", active: false },
              { name: "Analytics", active: false },
              { name: "Transactions", active: false },
            ].map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition ${
                  item.active
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <nav className="space-y-2">
              {["Settings", "Help & Support"].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition"
                >
                  <span className="text-lg">{item}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Caregivers</h2>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition shadow-md">
            + Add Caregiver
          </button>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Caregiver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCaregivers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden"
            >
              {/* Profile */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-gray-600 text-sm">{c.specialty}</p>
                  <p className="text-gray-500 text-xs">{c.location}</p>
                </div>
                <span className="text-gray-800 font-bold">{c.rating} ⭐</span>
              </div>

              {/* Details */}
              <div className="flex justify-between px-4 py-3 text-gray-600 text-sm">
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{c.beds}</span>
                  <span>Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{c.baths}</span>
                  <span>Baths</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{c.sqft}</span>
                  <span>sqft</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t border-gray-200">
                <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                  Book
                </button>
                <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Top Interest Profiles Section */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Top Interest Profiles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topInterestProfiles.map((profile, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-xl bg-green-50 hover:bg-green-100 transition cursor-pointer shadow-sm"
              >
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-100 shadow-sm"
                />
                <span className="mt-2 text-sm font-medium text-gray-900 text-center">
                  {profile.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
