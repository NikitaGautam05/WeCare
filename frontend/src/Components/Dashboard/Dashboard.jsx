import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">EldERease Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="bg-white p-6 rounded shadow-md flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-4 md:mb-0">
          <img
            src="https://yoursay.plos.org/wp-content/uploads/sites/13/2024/10/pic-3.png"
            alt="Elder Care Illustration"
            className="rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-1/2 md:pl-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Welcome to EldERease</h2>
          <p className="text-gray-600">
            Here you can manage your caregiver profile, browse available care requests, or find
            suitable caregivers for your elderly loved ones. Use the navigation to explore your
            options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
