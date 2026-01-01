import React, { useState } from 'react';
import ProfileForm from './ProfileForm';

const CareGiverDash = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showWarning, setShowWarning] = useState(false);


  const notifications = [
    { id: 1, message: 'New care request assigned to you.' },
    { id: 2, message: 'Profile approved successfully.' },
    { id: 3, message: 'Reminder: Update your experience details.' },
  ];

  return (
    <div className="min-h-screen w-screen bg-gray-100 font-sans flex flex-col">
     {/* Hanging Poster Header */}
<header className="relative flex justify-center pt-12 mb-6">
  {/* Threads */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl flex justify-between px-12">
    <div className="w-px h-14 bg-gray-400"></div>
    <div className="w-px h-14 bg-gray-400"></div>
  </div>

  {/* Poster */}
  <div className="relative bg-gray-500 text-white px-12 py-10 rounded-md shadow-2xl w-[90%] max-w-4xl text-center transform rotate-[-1deg]">
    {/* Thread connection dots */}
    <div className="absolute -top-2 left-10 w-3 h-3 bg-gray-300 rounded-full shadow-inner"></div>
    <div className="absolute -top-2 right-10 w-3 h-3 bg-gray-300 rounded-full shadow-inner"></div>

    <h1 className="text-4xl font-bold mb-3">Welcome, Caregiver!</h1>
    <p className="text-lg mb-3">
      We're glad to have you here. Update your profile to help care receivers connect with you.
    </p>
    
  </div>
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
          {activeTab === 'profile' && (
  <ProfileForm onFirstFocus={() => setShowWarning(true)} />
)}

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
        {/* Floating Warning Popup */}
{showWarning && (
  <div className="fixed bottom-6 right-6 z-50 bg-yellow-100 text-yellow-900 px-6 py-4 rounded-xl shadow-2xl max-w-sm animate-slideIn">
    <div className="flex items-start gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="font-semibold">Important</p>
        <p className="text-sm">
          Please ensure all information you enter is accurate and truthful.
        </p>
      </div>
      <button
        onClick={() => setShowWarning(false)}
        className="ml-auto text-yellow-700 hover:text-yellow-900"
      >
        ✕
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default CareGiverDash;
