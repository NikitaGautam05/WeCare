import React, { useState } from 'react';
import ProfileForm from './ProfileForm';

const CareGiverDash = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const notifications = [
    { id: 1, message: 'New care request assigned to you.' },
    { id: 2, message: 'Profile approved successfully.' },
    { id: 3, message: 'Reminder: Update your experience details.' },
  ];

  return (
    <div className="min-h-screen w-screen bg-gray-100 font-sans flex flex-col">
      {/* Header with Welcome */}
      <header className="bg-green-500 text-white p-8 shadow flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-2">👋 Welcome, Caregiver!</h1>
        <p className="text-lg mb-2">We're glad to have you here. Update your profile to help care receivers connect with you.</p>
        <p className="text-sm bg-yellow-100 text-yellow-800 px-4 py-1 rounded">⚠️ Please ensure all information you enter is accurate and truthful.</p>
      </header>

      <div className="flex flex-1 w-full mt-6 gap-6 px-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded shadow p-4 flex flex-col gap-4">
          <button
            className={`py-2 px-4 rounded text-left ${
              activeTab === 'profile' ? 'bg-green-500 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>

          <button
            className={`py-2 px-4 rounded text-left ${
              activeTab === 'notifications' ? 'bg-green-500 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded shadow p-8">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
              <ul className="flex flex-col gap-3">
                {notifications.map((n) => (
                  <li key={n.id} className="border-l-4 border-green-500 bg-gray-50 p-4 rounded shadow-sm">
                    {n.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CareGiverDash;
