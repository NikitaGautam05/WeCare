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
  const [interestRequests, setInterestRequests] = useState([]);
  const [bookingRequests, setBookingRequests]   = useState([]);
  const [profile, setProfile]             = useState(null);
  const navigate                          = useNavigate();
  const userId                            = localStorage.getItem("userId");

  const resolveCaregiverId = (profileData) => {
    return profileData?.id || profileData?.caregiverId || profileData?.userId || userId;
  };

  // ── ALL ORIGINAL LOGIC UNCHANGED ──
  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    const token       = localStorage.getItem("jwtToken");
    const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    
    // Fetch profile and notifications
    axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig)
      .then((res) => {
        setProfile(res.data);

        let rawNotifications = res.data.notifications || [];
        if (typeof rawNotifications === "string") {
          try {
            rawNotifications = JSON.parse(rawNotifications);
          } catch {
            rawNotifications = [];
          }
        }

        const parsed = Array.isArray(rawNotifications)
          ? rawNotifications.map((notif) => {
              try {
                return typeof notif === "string" ? JSON.parse(notif) : notif;
              } catch {
                return { message: notif, type: "general", userId: null };
              }
            })
          : [];

        setSortedNotifications(parsed);
        setRequestFetchError("");

        axios.get(`http://localhost:8080/api/notifications/${userId}`, axiosConfig)
          .then((notifRes) => {
            const remoteNotifs = Array.isArray(notifRes.data) ? notifRes.data : [];
            const merged = [...remoteNotifs];

            const existingIds = new Set(remoteNotifs.filter((n) => n && n.id).map((n) => n.id));
            parsed.forEach((notif) => {
              if (!notif || !notif.id || !existingIds.has(notif.id)) {
                merged.push(notif);
              }
            });

            if (merged.length > 0) {
              setSortedNotifications(merged);
            } else {
              setSortedNotifications(parsed);
            }
          })
          .catch((err) => {
            console.error("Notification fetch error:", err);
            setSortedNotifications(parsed);
          });
        
        // Fetch interest and booking requests for caregiver
        const caregiverId = resolveCaregiverId(res.data);
        const caregiverName = res.data?.fullName || res.data?.userName || "Caregiver";

        if (caregiverId) {
          axios.get(`http://localhost:8080/api/interest/pending-requests/${caregiverId}`, axiosConfig)
            .then((intRes) => {
              const interestData = Array.isArray(intRes.data) ? intRes.data : [];
              if (interestData.length > 0) {
                setInterestRequests(interestData);
                return;
              }

              const fallbackFromNotifications = parsed
                .filter((notif) => {
                  const type = (notif?.type || "").toString().toLowerCase();
                  return type.includes("interest") || type.includes("interest_sent");
                })
                .map((notif, index) => ({
                  id: notif.actionId || notif.id || `interest-fallback-${index}`,
                  status: "PENDING",
                  sentAt: notif.createdAt || new Date().toISOString(),
                  caregiverId,
                  caregiverName,
                  userId: notif.senderId || notif.userId || "",
                  userName: notif.senderName || notif.userName || notif.message?.split(" is interested")[0] || "Care receiver",
                  user: {
                    id: notif.senderId || notif.userId || "",
                    userName: notif.senderName || notif.userName || notif.message?.split(" is interested")[0] || "Care receiver",
                    email: "",
                    photo: "",
                    address: "",
                    serviceType: "Interest request",
                    accountType: "INDIVIDUAL",
                  },
                }));

              setInterestRequests(fallbackFromNotifications);
            })
            .catch((err) => {
              console.error("Interest fetch error:", err);
              const message = err.response?.status === 403
                ? "Interest request endpoint blocked (403)."
                : err.response?.data?.message || err.message || "Failed to fetch interest requests.";
              setRequestFetchError(message);
              setInterestRequests([]);
            });
          
          axios.get(`http://localhost:8080/api/bookings/caregiver/${caregiverId}`, axiosConfig)
              .then((bookRes) => {
                const list = Array.isArray(bookRes.data) ? bookRes.data : [];
                // sort newest first by createdAt or startTime
                list.sort((a, b) => {
                  const ad = Date.parse(a?.createdAt || a?.startTime || "");
                  const bd = Date.parse(b?.createdAt || b?.startTime || "");
                  if (Number.isFinite(ad) && Number.isFinite(bd)) return bd - ad;
                  return 0;
                });
                setBookingRequests(list);
              })
            .catch((err) => {
              console.error("Booking fetch error:", err);
              const message = err.response?.status === 403
                ? "Booking request endpoint blocked (403)."
                : err.response?.data?.message || err.message || "Failed to fetch booking requests.";
              setRequestFetchError((prev) => prev || message);
              setBookingRequests([]);
            });
        }
      })
      .catch((err) => {
        console.error("Sync Error:", err);
        setRequestFetchError("Failed to load caregiver profile.");
      });
  }, [userId, navigate]);

  // Refresh booking/interest requests when accepted connections change (e.g., booking completed)
  useEffect(() => {
    const handler = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const caregiverId = resolveCaregiverId(profile);
        if (!caregiverId) return;

        const intRes = await axios.get(`http://localhost:8080/api/interest/pending-requests/${caregiverId}`, axiosConfig).catch(() => ({ data: [] }));
        setInterestRequests(Array.isArray(intRes.data) ? intRes.data : []);

        const bookRes = await axios.get(`http://localhost:8080/api/bookings/caregiver/${caregiverId}`, axiosConfig).catch(() => ({ data: [] }));
        const list = Array.isArray(bookRes.data) ? bookRes.data : [];
        list.sort((a, b) => {
          const ad = Date.parse(a?.createdAt || a?.startTime || "");
          const bd = Date.parse(b?.createdAt || b?.startTime || "");
          if (Number.isFinite(ad) && Number.isFinite(bd)) return bd - ad;
          return 0;
        });
        setBookingRequests(list);
      } catch (e) {
        console.warn('Failed to refresh requests after acceptedConnectionsChanged', e);
      }
    };
    window.addEventListener('acceptedConnectionsChanged', handler);
    return () => window.removeEventListener('acceptedConnectionsChanged', handler);
  }, [profile]);

  const [requestFilter, setRequestFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestFetchError, setRequestFetchError] = useState("");

  const getNotificationTimestamp = (notif) => {
    const rawTimestamp = notif?.createdAt || notif?.sentAt || notif?.timestamp || notif?.date || "";
    const parsedDate = Date.parse(rawTimestamp);
    return Number.isFinite(parsedDate) ? parsedDate : 0;
  };

  const sortNotificationsNewestFirst = (notificationList) => {
    return [...notificationList].sort((a, b) => {
      return getNotificationTimestamp(b) - getNotificationTimestamp(a);
    });
  };

  const setSortedNotifications = (notificationList) => {
    setNotifications(sortNotificationsNewestFirst(notificationList));
  };

  const isInterestNotification = (type) => {
    if (!type) return false;
    return type.toString().toLowerCase().includes("interest");
  };

  const handleNotificationClick = (notif) => {
    setNotifications((current) => current.filter((item) => {
      if (notif.id) return item.id !== notif.id;
      return item !== notif;
    }));

    const targetUserId = notif.senderId || notif.userId;
    if (isInterestNotification(notif.type) && targetUserId) {
      navigate(`/profileReciever/${targetUserId}`);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const displayName = profile?.fullName || "Caregiver";
  const initials    = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const totalRequestCount = (Array.isArray(interestRequests) ? interestRequests.length : 0) +
                            (Array.isArray(bookingRequests) ? bookingRequests.length : 0);
  const notificationCount = (Array.isArray(notifications) ? notifications.length : 0) + totalRequestCount;

  const parseRequestDate = (request) => {
    const dateString = request.date || request.sentAt || request.createdAt || request.startTime;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  const allRequests = [
    ...(Array.isArray(interestRequests) ? interestRequests : []).map((request) => ({
      ...request,
      type: "interest",
      title: request.user?.userName || request.userName || "Care Receiver",
      subtitle: request.user?.serviceType || "Interest request",
      date: request.sentAt,
      profileId: request.user?.id,
      statusLabel: request.status || "PENDING",
    })),
    ...(Array.isArray(bookingRequests) ? bookingRequests : []).map((request) => ({
      ...request,
      type: "booking",
      title: request.userName || request.user?.userName || "Care Receiver",
      subtitle: request.serviceType || "Booking request",
      date: request.startTime || request.createdAt || request.sentAt,
      profileId: request.userId || request.user?.id,
      statusLabel: request.status || "PENDING",
    })),
  ].sort((a, b) => parseRequestDate(b).getTime() - parseRequestDate(a).getTime());

  const filteredRequests = allRequests.filter((request) => {
    const matchesFilter = requestFilter === "all" || request.type === requestFilter;
    const matchesSearch = request.title.toLowerCase().includes(requestSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const visibleRequests = requestFilter === "all" ? filteredRequests.slice(0, 6) : filteredRequests;

  const completedSteps =
    (profile?.profilePhoto ? 1 : 0) +
    (profile?.fullName && profile?.phoneNumber ? 1 : 0) +
    (profile?.details && profile?.speciality ? 1 : 0) +
    (profile?.chargeMin && profile?.chargeMax ? 1 : 0);

  const navTabs = [
    { key: "profile",       label: "My Profile",    icon: <FaUserCircle size={14} /> },
    { key: "chats",         label: "Chat",   icon: <FaCheckDouble size={13} /> },
    { key: "bookings",      label: "Bookings",      icon: <FaCalendarAlt size={13} /> },
    { key: "requests",      label: "Requests",      icon: <FaFileAlt size={13} /> },
    { key: "notifications", label: "Notifications", icon: <FaBell size={13} /> },
  ];

  const tabSubtitle = {
    profile:       "Manage your caregiver profile and documents",
    chats:         "Chat with care receivers who accepted your profile",
    bookings:      "View and manage your care booking requests",
    requests:      "Review interest and booking requests from care receivers",
    notifications: "System notifications and updates",
  };

  const statusCfg = {
    VERIFIED: { dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PENDING:  { dot: "bg-amber-400",   pill: "bg-amber-50  text-amber-700  border-amber-200"  },
    BLOCKED:  { dot: "bg-red-400",     pill: "bg-red-50    text-red-700    border-red-200"    },
  };
  const sc = statusCfg[profile?.status] || statusCfg.PENDING;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 font-sans text-gray-900 antialiased">

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 h-21 bg-gradient-to-r from-slate-900 via-blue-900 to-teal-900 border-b border-teal-700/30 flex items-center justify-between px-7 shadow-lg">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-[11px] font-black tracking-tight">EE</span>
          </div>
          <span className="text-[16px] font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
            Elder<span className="font-normal text-blue-300">Ease</span>
          </span>
          <span className="hidden sm:inline-flex items-center text-[12px] text-blue-200 font-medium bg-blue-800/40 border border-blue-500/40 px-3 py-0.5 rounded-full">
            Caregiver Portal
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-9 text-blue-100">
          {/* Bell */}
          <div
            onClick={() => setActiveTab("notifications")}
            className="relative cursor-pointer text-3xl leading-none text-white hover:text-white transition-colors"
            role="button"
            aria-label="Notifications"
          >
            <span role="img" aria-hidden="false">🔔</span>
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-5 px-1.5 bg-orange-400 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>

          {/* Avatar */}
          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
              {initials}
            </div>
            <span className="text-[14px] font-medium text-blue-100 hidden sm:block max-w-[130px] truncate">
              {displayName}
            </span>
          </div>

          {/* Sign out */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 text-[16px] font-medium text-blue-200 hover:text-orange-300 transition-colors cursor-pointer ml-1"
          >
            <FaSignOutAlt size={11} />
            <span className="hidden sm:block">Sign out</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════ LAYOUT ═══════════════════ */}
      <div className="flex pt-14 min-h-screen">

        {/* ═══════════════════ SIDEBAR ═══════════════════ */}
        <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 bg-gradient-to-b from-white via-blue-50 to-slate-50 border-r border-blue-100/50 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto shadow-sm">

          {/* Identity */}
          <div className="px-5 py-9 border-b border-blue-100/50 bg-gradient-to-b from-slate-50 to-transparent">
            {/* Avatar block */}
            <div className="relative w-fit mb-7">
              <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                {initials}
              </div>
              {/* Online dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${sc.dot}`} />
            </div>

            <p className="text-[13.5px] font-semibold text-slate-900 leading-tight truncate">
              {displayName}
            </p>
            <p className="text-[11.5px] text-teal-600 font-medium mt-0.5 truncate">
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
                <span className="text-[11px] text-slate-500 font-medium">Completion</span>
                <span className="text-[11px] font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">{completedSteps * 25}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completedSteps === 4 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-blue-500 to-teal-500"}`}
                  style={{ width: `${completedSteps * 25}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {4 - completedSteps > 0 ? `${4 - completedSteps} step${4-completedSteps>1?"s":""} remaining` : "✓ Profile complete"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-3 mb-2 mt-1">Navigation</p>
            {navTabs.map((tab) => {
              const isAct = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left group ${
                    isAct
                      ? "bg-slate-300 text-slate-800 shadow-md"
                      : "text-slate-500 hover:bg-transparent hover:text-slate-500"
                  }`}
                >
                  <span className={`flex-shrink-0 transition-transform duration-150 ${isAct ? "scale-110" : "group-hover:scale-110"}`}>
                    {tab.icon}
                  </span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.key === "notifications" && notificationCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isAct ? "bg-white/20 text-white" : "bg-orange-200 text-orange-700 font-bold"
                    }`}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                  {isAct && <FaChevronRight size={9} className="opacity-60" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 pb-4 border-t border-blue-100/50 pt-3">
            <button
              onClick={() => navigate("/terms")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:text-teal-700 hover:bg-teal-50/60 transition-all"
            >
              <FaFileAlt size={12} /> Terms & Service
            </button>
          </div>
        </aside>

        {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: <FaShieldAlt size={16} />,
                label: "Profile Status",
                value: profile?.status || "Pending",
                valueClass: profile?.status === "VERIFIED" ? "text-emerald-600" : "text-amber-600",
                iconBg: "from-blue-500 to-blue-600",
                iconColor: "text-blue-600",
              },
              {
                icon: <FaWallet size={16} />,
                label: "Daily Rate",
                value: profile?.chargeMin ? `Rs ${profile.chargeMin} – ${profile.chargeMax}` : "Not set",
                valueClass: "text-teal-700 font-bold",
                iconBg: "from-teal-500 to-emerald-600",
                iconColor: "text-teal-600",
              },
              {
                icon: <FaStar size={16} />,
                label: "Experience",
                value: profile?.experience ? `${profile.experience} years` : "New joiner",
                valueClass: "text-slate-900",
                iconBg: "from-orange-500 to-rose-600",
                iconColor: "text-orange-600",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-blue-100/50 px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`text-[14px] font-bold truncate ${s.valueClass}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tab panel ── */}
          <div className="bg-white rounded-2xl border border-blue-100/50 shadow-lg overflow-hidden">

            {/* Panel header bar */}
            <div className="flex items-center justify-between px-7 py-6 border-b border-blue-100/50 bg-gradient-to-r from-slate-50 via-blue-50 to-teal-50">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                  {navTabs.find((t) => t.key === activeTab)?.label}
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">{tabSubtitle[activeTab]}</p>
              </div>

              {/* Profile quick-info strip */}
              {activeTab === "profile" && profile && (
                <div className="hidden md:flex items-center gap-5 text-[11.5px] text-slate-600">
                  {profile.address    && <span className="flex items-center gap-2 px-3 py-2 bg-slate-100/60 rounded-lg"><FaMapMarkerAlt size={11} className="text-teal-600" /> {profile.address}</span>}
                  {profile.email      && <span className="flex items-center gap-2 px-3 py-2 bg-blue-100/60 rounded-lg"><FaEnvelope size={11} className="text-blue-600" /> {profile.email}</span>}
                  {profile.phoneNumber && <span className="flex items-center gap-2 px-3 py-2 bg-orange-100/60 rounded-lg"><FaPhone size={11} className="text-orange-600" /> {profile.phoneNumber}</span>}
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

              {/* REQUESTS TAB */}
              {activeTab === "requests" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-2">Requests</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={requestFilter}
                          onChange={(e) => setRequestFilter(e.target.value)}
                          className="h-11 w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400"
                        >
                          <option value="all">All requests</option>
                          <option value="interest">Interest requests</option>
                          <option value="booking">Booking requests</option>
                        </select>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={requestSearch}
                            onChange={(e) => setRequestSearch(e.target.value)}
                            placeholder="Search by name"
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400"
                          />
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Search</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                      Showing <span className="font-semibold text-slate-900">{visibleRequests.length}</span> of <span className="font-semibold text-slate-900">{filteredRequests.length}</span> request{filteredRequests.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {requestFetchError && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                      <strong>Request fetch issue:</strong> {requestFetchError}
                    </div>
                  )}

                  {allRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 border-2 border-blue-200/50 flex items-center justify-center">
                        <FaFileAlt size={24} className="text-teal-600" />
                      </div>
                      <p className="text-[14.5px] font-semibold text-slate-900">No requests yet</p>
                      <p className="text-[13px] text-slate-500 text-center max-w-xs">
                        Care receivers will send interest or booking requests here once they reach out.
                      </p>
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                      <p className="text-[14px] font-semibold text-slate-900">No matching requests</p>
                      <p className="text-sm text-slate-500 text-center max-w-md">
                        Try a different filter or search term to find the request by name.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {visibleRequests.map((request, i) => (
                        <div
                          key={request.id || i}
                          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-2">
                                {request.type === "interest" ? "Interest request" : "Booking request"}
                              </p>
                              <h3 className="text-lg font-bold text-slate-900">{request.title}</h3>
                              <p className="text-sm text-slate-500 mt-1">{request.subtitle}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${request.type === "interest" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {request.type === "interest" ? "Interest" : "Booking"}
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 mb-4 text-sm text-slate-600">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Name</p>
                              <p className="mt-2 font-semibold text-slate-900">{request.title}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Status</p>
                              <p className="mt-2 font-semibold text-slate-900">{request.statusLabel}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 mb-5 text-sm text-slate-600">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Requested service</p>
                              <p className="mt-2 font-semibold text-slate-900">{request.subtitle}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Requested date</p>
                              <p className="mt-2 font-semibold text-slate-900">{request.date ? new Date(request.date).toLocaleDateString() : "Not specified"}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/profileReciever/${request.profileId}`)}
                            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${request.type === "interest" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                          >
                            View {request.type === "interest" ? "Interest" : "Booking"} profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md">
                      <FaBell size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Notifications</h3>
                      <p className="text-[11px] text-slate-500">System notifications and updates</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-[13px] text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id || notif.message}
                          className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50/50 to-blue-100/50 border border-blue-200/50 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md text-white group-hover:scale-110 transition-transform">
                            <FaBell size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] text-slate-800 font-semibold leading-snug">{notif.message}</p>
                            {notif.type && (
                              <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 uppercase tracking-wide bg-blue-100/60 px-2.5 py-1 rounded-md">
                                {notif.type}
                              </span>
                            )}
                          </div>
                          {isInterestNotification(notif.type) && (notif.senderId || notif.userId) && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleNotificationClick(notif);
                              }}
                              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 text-[12px] font-bold rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                            >
                              View Profile <FaChevronRight size={9} />
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
        </main>
      </div>
    </div>
  );
};

export default CareGiverDash;