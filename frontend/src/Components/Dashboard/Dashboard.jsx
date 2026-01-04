import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyCaregivers = [
  {
    id: 1,
    name: "Ramesh Thapa",
    age: 28,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    experience: "3 years",
    specialty: "Elderly Care",
    location: "Kathmandu",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Sita Gurung",
    age: 25,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    experience: "2 years",
    specialty: "Alzheimer's Care",
    location: "Pokhara",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Binod Shrestha",
    age: 30,
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    experience: "5 years",
    specialty: "General Care",
    location: "Lalitpur",
    rating: 4.2,
  },
  {
    id: 4,
    name: "Anita Rai",
    age: 27,
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    experience: "4 years",
    specialty: "Dementia Care",
    location: "Bhaktapur",
    rating: 4.8,
  },
  {
    id: 5,
    name: "Sujan KC",
    age: 32,
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    experience: "6 years",
    specialty: "Physical Therapy",
    location: "Chitwan",
    rating: 4.6,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredCaregivers = dummyCaregivers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
   <div className="min-h-screen w-screen bg-gray-50">
      {/* Top bar / Welcome section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-lg px-8 py-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">Elder Ease</h1>
          <p className="text-green-700 italic mt-1 text-lg">
            Compassionate care for your loved ones.
          </p>
          <p className="text-gray-600 mt-2 max-w-lg">
            Discover trusted caregivers, manage care requests, and find the perfect companion for your elderly family members.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 md:mt-0 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Search bar */}
      <div className="p-6 flex justify-center">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search caregivers by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pl-12 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 placeholder-gray-400"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
        </div>
      </div>

      {/* Caregiver cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-8 pb-12">
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transform transition-all duration-300 border border-gray-200"
          >
            <img
              src={caregiver.photo}
              alt={caregiver.name}
              className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-green-200 shadow-sm"
            />
            <h2 className="text-xl font-semibold text-gray-800">{caregiver.name}</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">{caregiver.specialty}</span>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{caregiver.location}</span>
            </div>
            <p className="text-gray-600 mt-2">{caregiver.age} years old</p>
            <p className="text-gray-600">{caregiver.experience} experience</p>
            <p className="text-gray-600">{caregiver.phone}</p>
            <p className="text-gray-600">{caregiver.email}</p>
            <div className="flex items-center mt-3">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.round(caregiver.rating) ? "text-yellow-400" : "text-gray-300"}>⭐</span>
              ))}
              <span className="ml-2 text-gray-700 font-semibold">{caregiver.rating}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
                Book Appointment
              </button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
