import React, {
  useEffect,
  useState,
} from "react";
import ProfileForm from "./ProfileForm";
import AcceptedConnections from "../Chat/AcceptedConnections";
import BookingsList from "../Chat/BookingsList";
import {
  FaUserCircle,
  FaBell,
  FaFileAlt,
  FaCheckDouble,
  FaStar,
  FaWallet,
  FaCalendarAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CareGiverDash = () => {
  const [activeTab, setActiveTab]         = useState("profile");
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile]             = useState(null);
  const navigate                          = useNavigate();
  const userId                            = localStorage.getItem("userId");

  // ── ALL ORIGINAL LOGIC UNCHANGED ──
  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    const token       = localStorage.getItem("jwtToken");
    const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig)
      .then((res) => {
        setProfile(res.data);
        const parsed = (res.data.notifications || []).map((notif) => {
          try { return typeof notif === "string" ? JSON.parse(notif) : notif; }
          catch { return { message: notif, type: "general", userId: null }; }
        });
        setNotifications(parsed);
      })
      .catch((err) => console.error("Sync Error:", err.message));
  }, [userId, navigate]);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const displayName = profile?.fullName || "Caregiver";
  const initials    = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const completedSteps =
    (profile?.profilePhoto ? 1 : 0) +
    (profile?.fullName && profile?.phoneNumber ? 1 : 0) +
    (profile?.details && profile?.speciality ? 1 : 0) +
    (profile?.chargeMin && profile?.chargeMax ? 1 : 0);

  const navTabs = [
    { key: "profile",       label: "My Profile",    icon: <FaUserCircle size={14} /> },
    { key: "chats",         label: "Connections",   icon: <FaCheckDouble size={13} /> },
    { key: "bookings",      label: "Bookings",      icon: <FaCalendarAlt size={13} /> },
    { key: "notifications", label: "Notifications", icon: <FaBell size={13} /> },
  ];

  const tabSubtitle = {
    profile:       "Manage your caregiver profile and documents",
    chats:         "Chat with care receivers who accepted your profile",
    bookings:      "View and manage your care booking requests",
    notifications: "Interest notifications from care receivers",
  };

  const statusCfg = {
    VERIFIED: { dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PENDING:  { dot: "bg-amber-400",   pill: "bg-amber-50  text-amber-700  border-amber-200"  },
    BLOCKED:  { dot: "bg-red-400",     pill: "bg-red-50    text-red-700    border-red-200"    },
  };
  const sc = statusCfg[profile?.status] || statusCfg.PENDING;

  return (
    <div className="min-h-screen w-screen bg-[#f8f8f6] font-sans text-gray-900 antialiased">

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-black tracking-tight">EE</span>
          </div>
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
            Elder<span className="text-gray-400 font-normal">Ease</span>
          </span>
          <span className="hidden sm:inline-flex items-center text-[11px] text-gray-400 font-medium bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
            Caregiver Portal
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Bell */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <FaBell size={14} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            )}
          </button>

          {/* Avatar pill */}
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center text-white text-[9px] font-bold">
              {initials}
            </div>
            <span className="text-[13px] font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
              {displayName}
            </span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-rose-500 transition-colors ml-1"
          >
            <FaSignOutAlt size={11} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════ LAYOUT ═══════════════════ */}
      <div className="flex pt-14 min-h-screen">

        {/* ═══════════════════ SIDEBAR ═══════════════════ */}
        <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 bg-white border-r border-gray-100 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">

          {/* Identity */}
          <div className="px-5 py-6 border-b border-gray-100">
            {/* Avatar block */}
            <div className="relative w-fit mb-4">
              <div className="w-[54px] h-[54px] rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
                {initials}
              </div>
              {/* Online dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${sc.dot}`} />
            </div>

            <p className="text-[13.5px] font-semibold text-gray-900 leading-tight truncate">
              {displayName}
            </p>
            <p className="text-[11.5px] text-gray-400 mt-0.5 truncate">
              {profile?.speciality || "Care Professional"}
            </p>

            {/* Status badge */}
            {profile?.status && (
              <span className={`inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.pill}`}>
                <FaShieldAlt size={8} /> {profile.status}
              </span>
            )}

            {/* Profile completion bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-gray-400">Completion</span>
                <span className="text-[11px] font-bold text-gray-600">{completedSteps * 25}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completedSteps === 4 ? "bg-emerald-500" : "bg-gray-800"}`}
                  style={{ width: `${completedSteps * 25}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5">
                {4 - completedSteps > 0 ? `${4 - completedSteps} step${4-completedSteps>1?"s":""} remaining` : "Profile complete"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em] px-3 mb-2 mt-1">Navigation</p>
            {navTabs.map((tab) => {
              const isAct = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left group ${
                    isAct
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <span className={`flex-shrink-0 transition-transform duration-150 ${isAct ? "scale-110" : "group-hover:scale-110"}`}>
                    {tab.icon}
                  </span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.key === "notifications" && notifications.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isAct ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600"
                    }`}>
                      {notifications.length}
                    </span>
                  )}
                  {isAct && <FaChevronRight size={9} className="opacity-40" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 pb-4 border-t border-gray-100 pt-3">
            <button
              onClick={() => navigate("/terms")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <FaFileAlt size={12} /> Terms & Service
            </button>
          </div>
        </aside>

        {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            {[
              {
                icon: <FaShieldAlt size={14} />,
                label: "Profile Status",
                value: profile?.status || "Pending",
                valueClass: profile?.status === "VERIFIED" ? "text-emerald-600" : "text-amber-600",
                iconBg: "bg-gray-50",
              },
              {
                icon: <FaWallet size={14} />,
                label: "Daily Rate",
                value: profile?.chargeMin ? `Rs ${profile.chargeMin} – ${profile.chargeMax}` : "Not set",
                valueClass: "text-gray-900",
                iconBg: "bg-gray-50",
              },
              {
                icon: <FaStar size={14} />,
                label: "Experience",
                value: profile?.experience ? `${profile.experience} years` : "New joiner",
                valueClass: "text-gray-900",
                iconBg: "bg-gray-50",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} border border-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0`}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{s.label}</p>
                  <p className={`text-[13.5px] font-bold truncate ${s.valueClass}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tab panel ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* Panel header bar */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">
                  {navTabs.find((t) => t.key === activeTab)?.label}
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">{tabSubtitle[activeTab]}</p>
              </div>

              {/* Profile quick-info strip */}
              {activeTab === "profile" && profile && (
                <div className="hidden md:flex items-center gap-4 text-[11.5px] text-gray-400">
                  {profile.address    && <span className="flex items-center gap-1.5"><FaMapMarkerAlt size={9} /> {profile.address}</span>}
                  {profile.email      && <span className="flex items-center gap-1.5"><FaEnvelope size={9} /> {profile.email}</span>}
                  {profile.phoneNumber && <span className="flex items-center gap-1.5"><FaPhone size={9} /> {profile.phoneNumber}</span>}
                </div>
              )}
            </div>

            {/* Panel body */}
            <div className="p-7">

              {/* PROFILE TAB */}
              {activeTab === "profile" && <ProfileForm userId={userId} />}

              {/* CHATS TAB */}
              {activeTab === "chats" && <AcceptedConnections userType="caregiver" userId={userId} />}

              {/* BOOKINGS TAB */}
              {activeTab === "bookings" && <BookingsList userType="caregiver" userId={profile?.id} />}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <FaBell size={20} className="text-gray-300" />
                    </div>
                    <p className="text-[13.5px] font-semibold text-gray-500">No notifications yet</p>
                    <p className="text-[12px] text-gray-400 text-center max-w-xs">
                      When someone shows interest in your profile, you will see it here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {notifications.map((notif, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                          <FaBell size={12} className="text-gray-400" />
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-gray-700 font-medium leading-snug">{notif.message}</p>
                          {notif.type && (
                            <span className="inline-block mt-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">
                              {notif.type}
                            </span>
                          )}
                        </div>

                        {/* View profile button — only when type === 'interest' */}
                        {notif.type === "interest" && notif.userId && (
                          <button
                            onClick={() => navigate(`/profileReciever/${notif.userId}`)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-[11.5px] font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            View Profile <FaChevronRight size={9} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CareGiverDash;