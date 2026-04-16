import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import AcceptedConnections from "../Chat/AcceptedConnections";
import { 
  FaUserCircle, 
  FaBell, 
  FaFileAlt, 
  FaCheckDouble, 
  FaStar, 
  FaWallet,
  FaComments
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const CareGiverDash = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    // Move token inside useEffect to keep the dependency array stable
    const token = localStorage.getItem("jwtToken");
    const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig)
      .then((res) => {
        setProfile(res.data);
        const parsedNotifications = (res.data.notifications || []).map(notif => {
          try {
            return typeof notif === 'string' ? JSON.parse(notif) : notif;
          } catch (e) {
            return { message: notif, type: 'general', userId: null };
          }
        });
        setNotifications(parsedNotifications);
      })
      .catch((err) => console.error("Sync Error:", err.message));
    
    // Dependencies must stay constant in size. 
    // We removed 'token' from here because we fetch it from localStorage inside the effect.
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const displayName = profile?.fullName || "Caregiver";
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen w-screen bg-[#F4F4F5] text-[#18181B] font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-black/10">CS</div>
            <h1 className="text-xl font-bold tracking-tighter">Caregiver<span className="text-gray-400"> Portal</span></h1>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 text-gray-400 hover:text-black transition-colors"
            >
              <FaBell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
            <button onClick={handleLogout} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900"><FaCheckDouble /></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Profile Status</p>
              <p className="font-bold text-sm">{profile?.status || "Pending"}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900"><FaWallet /></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pricing</p>
              <p className="font-bold text-sm">{profile?.chargeMin ? `Rs. ${profile.chargeMin}/day` : "Not Set"}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900"><FaStar /></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Experience</p>
              <p className="font-bold text-sm">{profile?.experience ? `${profile.experience} Years` : "New Joiner"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <aside className="space-y-10">
            <div className="px-2">
              <div className="w-20 h-20 rounded-[28px] bg-black text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-2xl shadow-black/20 italic">
                {initials}
              </div>
              <h3 className="font-black text-2xl tracking-tight leading-none mb-2">{displayName}</h3>
              <p className="text-gray-400 font-medium text-sm">{profile?.speciality || "Care Professional"}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "profile" ? "bg-black text-white shadow-xl shadow-black/10 scale-[1.02]" : "text-gray-400 hover:bg-white hover:text-black"
                }`}
              >
                <FaUserCircle size={18} /> Profile
              </button>
              <button
                onClick={() => setActiveTab("chats")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "chats" ? "bg-black text-white shadow-xl shadow-black/10 scale-[1.02]" : "text-gray-400 hover:bg-white hover:text-black"
                }`}
              >
                <FaCheckDouble size={18} /> Accepted (Chats)
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "notifications" ? "bg-black text-white shadow-xl shadow-black/10 scale-[1.02]" : "text-gray-400 hover:bg-white hover:text-black"
                }`}
              >
                <FaBell size={18} /> Alerts
              </button>
            </nav>

            {/* Re-added Terms & Service */}
            <div className="pt-8 border-t border-gray-200">
              <button 
                onClick={() => navigate('/terms')} 
                className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-400 hover:text-black transition-colors"
              >
                <FaFileAlt /> Terms & Service
              </button>
            </div>
          </aside>

          {/* Tab Content Section */}
          <section>
            <div className="bg-white border border-gray-200 rounded-[40px] p-12 shadow-sm min-h-[600px] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
               
               <div className="relative z-10">
                {activeTab === "profile" ? (
                  <ProfileForm userId={userId} />
                ) : activeTab === "chats" ? (
                  <div>
                    <h2 className="text-3xl font-black mb-8">Confirmed Connections</h2>
                    <AcceptedConnections userType="caregiver" userId={userId} />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-black mb-8">Notifications</h2>
                    {notifications.length === 0 ? (
                      <div className="py-20 text-center">
                        <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Inbox Empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notif, i) => (
                          <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                            <div className="text-gray-600 font-medium">
                              {notif.message}
                            </div>
                            {notif.type === 'interest' && (
                              <button
                                onClick={() => navigate(`/profileReciever/${notif.userId}`)}
                                className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                              >
                                View Profile
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
               </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => navigate("/messages")}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 hover:shadow-blue-500/50"
        title="Open Messages"
      >
        <FaComments size={20} />
      </button>
    </div>
  );
};

export default CareGiverDash;