import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    favourite: true
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
    favourite: false
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
    favourite: true
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
    favourite: false
  },
];

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  //  Later you can decode JWT instead of this
  const userName = localStorage.getItem("userName") || "Nikita";
  const role = localStorage.getItem("role") || "User";

  const filteredCaregivers = dummyCaregivers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const favouriteCaregivers = dummyCaregivers.filter(c => c.favourite);

  // Collect unique top interest profiles
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

      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-lg fixed h-full flex flex-col justify-between border-r">
        <div className="p-6">
          {/* App Name */}
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
            {[
              "Dashboard",
              "My Caregivers",
              "History",
              "Top Interest",
              "Favourites",
              "Profile",
              
            ].map((item) => (
              <button
                key={item}
                className="w-full text-left px-4 py-3 rounded-lg
                           text-white-800 font-medium
                           hover:bg-gray-200 transition"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-6 border-t bg-white">
           <button
        onClick={() => navigate("/")}
        className="w-full bg-red-500 text-white py-2.5 rounded-lg
                   font-semibold hover:bg-red-600 transition"
      >
        Logout
      </button>
        </div>
      </aside>

      {/* MAIN CONTENT*/}
      <main className="flex-1 ml-72 p-8">

        {/*  Welcome Message */}
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

        {/* Caregiver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredCaregivers.map((c) => (
            <div
              key={c.id}
              className="bg-gray-200 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4 border-b">
                <img src={c.photo} alt={c.name} className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-400">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.specialty}</p>
                  <p className="text-xs text-gray-500">{c.location}</p>
                </div>
                <span className="font-bold text-gray-400">{c.rating} ⭐</span>
              </div>

              <div className="p-4 border-t">
                <p className="text-gray-600 text-sm mb-3">
                  Short intro about {c.name} and experience. Specialty: {c.specialty}.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg">
                    View Profile
                  </button>
                  <button className="flex-1 bg-gray-100 py-2 rounded-lg">
                    Interested
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Favourites Section */}
        {favouriteCaregivers.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold bg text-gray-400 mb-6">Favourites</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favouriteCaregivers.map((c) => (
                <div
                  key={c.id}
                  className="bg-pink-100 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <div className="flex items-center  gap-4 p-4 border-b">
                    <img src={c.photo} alt={c.name} className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-400">{c.name}</h3>
                      <p className="text-sm text-gray-600">{c.specialty}</p>
                      <p className="text-xs text-gray-500">{c.location}</p>
                    </div>
                    <span className="font-bold text-gray-400">{c.rating} ⭐</span>
                  </div>

                  <div className="p-4 border-t">
                    <p className="text-gray-600 text-sm mb-3">
                      I am {c.name} and experience. Specialty: {c.specialty}.
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg">
                        View Profile
                      </button>
                      <button className="flex-1 bg-gray-100 py-2 rounded-lg">
                        Interested
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TOP INTEREST PROFILES  */}
        <section className="mb-12">
  <h3 className="text-2xl font-bold text-gray-900 mb-6">
    Top Interest Profiles
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {topInterestProfiles.map((profile, index) => (
      <div
        key={index}
        className="bg-green-100 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
      >
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <img
            src={profile.photo}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-600">Top Caregiver</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4">
          <button className="flex-1 bg-gray-900 text-white py-2 rounded-lg">
            View Profile
          </button>
          <button className="flex-1 bg-gray-100 py-2 rounded-lg">
            Interested
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

      </main>
    </div>
  );
};

export default Dashboard;
