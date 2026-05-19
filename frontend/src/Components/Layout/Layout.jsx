import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import { FaTimes, FaSignOutAlt, FaComments, FaBell, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import logo from "../../assets/logo.jpg";



const Layout = ({ children }) => {

const [menuOpen, setMenuOpen] = useState(false);

const [userPhoto, setUserPhoto] = useState(null);

const [notifications, setNotifications] = useState([]);

const [showNotifications, setShowNotifications] = useState(false);

const [unreadCount, setUnreadCount] = useState(0);

const [chatUnreadCount, setChatUnreadCount] = useState(0);

const safeString = (value) => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const normalizeType = (type) => {
  const raw = safeString(type).trim();
  if (!raw) return 'general';
  const upper = raw.toUpperCase();
  switch (upper) {
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_ACCEPTED':
      return 'booking_accepted';
    case 'BOOKING_DECLINED':
    case 'BOOKING_REJECTED':
      return 'booking_rejected';
    case 'BOOKING_REQUEST':
      return 'booking';
    default:
      return raw.toLowerCase();
  }
};

const navigate = useNavigate();

const location = useLocation();



const userName = localStorage.getItem("userName") || "User";

const role = localStorage.getItem("role") || "User";

const userId = localStorage.getItem("userId");

const token = localStorage.getItem("jwtToken");



const isActive = (link) => location.pathname === link;



useEffect(() => {

if (userId && token) {

axios.get(`http://localhost:8080/api/users/${userId}`, {

headers: { Authorization: `Bearer ${token}` }

})

.then(res => {

const rawPhoto = res.data?.photo || res.data?.profilePhoto || null;

if (rawPhoto) setUserPhoto(rawPhoto.toString().trim());

})

.catch(err => console.error("Photo fetch failed", err));

}

}, [userId, token]);



// Fetch notifications from backend

useEffect(() => {

if (userId && token) {

const fetchDashboardCounts = async () => {

try {

const chatRecipientId = role === 'CAREGIVER' ? localStorage.getItem('caregiverId') : userId;
const requests = [
  axios.get(`http://localhost:8080/api/notifications/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
];

if (chatRecipientId) {
  requests.push(
    axios.get(`http://localhost:8080/api/chat/unread-count/${chatRecipientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );
}

const [notificationsRes, chatCountRes] = await Promise.all(requests);

const userNotifications = notificationsRes.data || [];

setNotifications(userNotifications);

const unread = userNotifications.filter(notif => !notif.read).length;

setUnreadCount(unread);

const unreadChat = chatCountRes?.data?.unreadCount ?? 0;

setChatUnreadCount(Number(unreadChat));

} catch (err) {

console.error("Failed to fetch notifications:", err);

}

};



fetchDashboardCounts();


// Refresh notifications and chat counts every 5 seconds

const interval = setInterval(fetchDashboardCounts, 5000);

return () => clearInterval(interval);

}

}, [userId, token]);



const handleLogout = () => {

localStorage.clear();

navigate("/");

};



// Parse notification object

const parseNotification = (notif) => {

try {
  // If it's already an object (from Notification collection)
  if (typeof notif === 'object' && notif !== null) {
    return {
      message: safeString(notif.message) || safeString(notif.title) || 'New notification',
    };
  }
  // If it's a string (legacy format)
  return typeof notif === 'string' ? JSON.parse(notif) : { message: safeString(notif), type: 'general' };
} catch {

return { message: safeString(notif), type: 'general' };

}

};

// Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
};


// Get notification icon and color based on type

const getNotificationStyle = (type) => {

switch(type) {

case 'booking_accepted':

return { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-50' };

case 'booking_rejected':

return { icon: FaTimesCircle, color: 'text-red-500', bg: 'bg-red-50' };

case 'booking':

return { icon: FaBell, color: 'text-blue-500', bg: 'bg-blue-50' };

default:

return { icon: FaBell, color: 'text-slate-500', bg: 'bg-slate-50' };

}

};



const navItems = [

{ name: "○ Home", link: "/dash" },

{ name: "◈ Caregivers", link: "/my-caregivers" },

{ name: "☍ Connections", link: "/connections" },

{ name: "✉ Messages", link: "/messages" },

{ name: "◷ History", link: "/history" },

{ name: "♥ Favourites", link: "/favourites" },

{ name: "🔔 Notifications", link: "/notifications" },

{ name: "👤 Profile", link: "/my-profile" },

];



// Helper to pick specific items for the top header

// Currently showing: Home, Caregivers, History, Favourites

const headerIndices = [0, 1, 2, 4, 5];



const profileImg = userPhoto

? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`)

: `https://ui-avatars.com/api/?name=${userName}`;



return (

<div className="min-h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">


{/* SIDEBAR NAVIGATION */}

<aside className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-[60] w-80 transform transition-all duration-500 ease-in-out border-r border-slate-100 flex flex-col ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>

<div className="p-8 bg-slate-900 text-white relative shrink-0">

<button className="absolute top-6 right-6 text-slate-400 hover:text-white" onClick={() => setMenuOpen(false)}>

<FaTimes size={20} />

</button>

<div className="flex items-center gap-3">

<img src={logo} alt="Logo" className="h-8 w-auto brightness-200" />

<h2 className="text-xl font-black tracking-tighter">ElderEASE</h2>

</div>

</div>



<nav className="flex-1 px-4 py-8 overflow-y-auto">

<p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>

<ul className="flex flex-col gap-1.5">

{navItems.map((item) => (

<li key={item.name}>

<div onClick={() => { navigate(item.link); setMenuOpen(false); }}

className={`cursor-pointer flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${isActive(item.link) ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>

<span className="font-bold text-sm tracking-tight">{item.name}</span>

</div>

</li>

))}

</ul>



{/* Notifications Section in Sidebar */}

{notifications.length > 0 && (

<div className="mt-8 pt-8 border-t border-slate-200">

<p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Notifications</p>

<div className="flex flex-col gap-2">

{notifications.slice(0, 3).map((notif, idx) => {

const parsed = parseNotification(notif);

const { icon: Icon, color, bg } = getNotificationStyle(parsed.type);


return (

<div key={idx} 
     className={`p-3 rounded-xl ${bg} border-l-4 ${color === 'text-green-500' ? 'border-green-500' : color === 'text-red-500' ? 'border-red-500' : 'border-blue-500'} cursor-pointer hover:opacity-80 transition-opacity`}
     onClick={() => {
       if (notif.id && !notif.read) {
         markNotificationAsRead(notif.id);
       }
       // Navigate to notifications page
       navigate('/notifications');
     }}>

<p className="text-xs font-bold text-slate-900 line-clamp-2">{parsed.message}</p>

{parsed.serviceDate && (

<p className="text-[10px] text-slate-600 mt-1">📅 {parsed.serviceDate}</p>

)}

</div>

);

})}

</div>

</div>

)}

</nav>



<div className="p-4 border-t border-slate-100 shrink-0">

<div className="bg-slate-50 rounded-3xl p-4">

<div className="flex items-center gap-3 mb-4">

<img src={profileImg} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" alt="User" />

<div className="min-w-0">

<h4 className="font-black text-slate-900 text-sm truncate">{userName}</h4>

<p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">{role}</p>

</div>

</div>

<button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">

<FaSignOutAlt size={12} /> Logout Account

</button>

</div>

</div>

</aside>



{/* TOP HEADER */}

<header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8">

<div className="flex items-center gap-6">

<img src={logo} alt="Logo" className="h-10 w-auto cursor-pointer" onClick={() => navigate("/dash")} />

<div onClick={() => setMenuOpen(true)} className="flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">

<div className="w-8 h-8 flex flex-col justify-center gap-1.5">

<span className="h-0.5 w-6 bg-current rounded-full"></span>

<span className="h-0.5 w-4 bg-current rounded-full"></span>

<span className="h-0.5 w-6 bg-current rounded-full"></span>

</div>

<span className="text-sm">Menu</span>

</div>

</div>


<div className="hidden md:flex items-center gap-8">

{/* Updated this map to use headerIndices to ensure Favourites is visible */}

{headerIndices.map(index => {

const item = navItems[index];

return (

<span key={item.name} onClick={() => navigate(item.link)} className={`text-sm font-bold cursor-pointer transition-colors ${isActive(item.link) ? "text-sky-600" : "text-slate-500 hover:text-sky-500"}`}>

{item.name.split(" ")[1]}

</span>

);

})}

<div className="h-8 w-px bg-slate-200"></div>



{/* Notification Bell */}

<div className="relative">

<div

onClick={() => setShowNotifications(!showNotifications)}

className="relative cursor-pointer text-slate-600 hover:text-slate-900 transition-colors"

>

<FaBell size={20} />

{unreadCount > 0 && (

<span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">

{unreadCount > 9 ? '9+' : unreadCount}

</span>

)}

</div>



{/* Notification Dropdown */}

{showNotifications && (

<div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-96 overflow-y-auto">

<div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-2xl">

<h3 className="font-bold text-sm">Notifications ({notifications.length})</h3>

</div>



{notifications.length === 0 ? (

<div className="px-6 py-8 text-center text-slate-500">

<p className="text-sm">No notifications yet</p>

</div>

) : (

<div className="divide-y divide-slate-100">

{notifications.map((notif, idx) => {

const parsed = parseNotification(notif);

const { icon: Icon, color, bg } = getNotificationStyle(parsed.type);


return (

<div key={idx} className={`p-4 ${bg} hover:bg-opacity-75 transition-all cursor-pointer`}>

<div className="flex items-start gap-3">

<Icon className={`${color} mt-1 flex-shrink-0`} size={18} />

<div className="flex-1 min-w-0">

<p className="font-bold text-sm text-slate-900">{parsed.message}</p>

{parsed.reason && (

<p className="text-xs text-slate-600 mt-1">Reason: {parsed.reason}</p>

)}

{parsed.serviceDate && (

<p className="text-xs text-slate-600 mt-1">📅 {parsed.serviceDate}</p>

)}

{parsed.serviceTime && (

<p className="text-xs text-slate-600">⏰ {parsed.serviceTime}</p>

)}

<p className="text-[10px] text-slate-400 mt-2 capitalize">

{parsed.type === 'booking_accepted' ? '✅ Accepted' :

parsed.type === 'booking_rejected' ? '❌ Declined' :

'📬 New'}

</p>

</div>

</div>

</div>

);

})}

</div>

)}

</div>

)}

</div>



<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/my-profile")}>

<div className="text-right">

<h3 className="font-bold text-sm text-slate-900">{userName}</h3>

<p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{role}</p>

</div>

<img src={profileImg} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="Profile" />

</div>

</div>

</header>



{/* PAGE CONTENT */}

<main className="pt-20 min-h-screen">

{children}

</main>



{/* CHAT BUTTON */}

<button

onClick={() => navigate("/messages")}

className="fixed bottom-8 right-8 w-16 h-16 bg-sky-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-sky-700 transition-all z-40 active:scale-95"

>

<FaComments size={24} />

{chatUnreadCount > 0 && (
  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1.5 bg-red-500 text-[11px] font-bold text-white rounded-full flex items-center justify-center">
    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
  </span>
)}

</button>

</div>

);

};



export default Layout;