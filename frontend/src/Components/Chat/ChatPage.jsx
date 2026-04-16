import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments, FaTimes, FaArrowRight } from 'react-icons/fa';
import Chat from './Chat';
import logo from '../../assets/logo.jpg';
import axios from 'axios';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [resolvedCaregiverId, setResolvedCaregiverId] = useState(localStorage.getItem('caregiverId'));

  const userType = localStorage.getItem('role') === 'CAREGIVER' ? 'caregiver' : 'user';
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('role') || 'User';
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "💬 Messages", link: "/messages" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  // Header items - No Messages here per your request
  const topNavItems = [
    { name: "Home", link: "/dash" },
    { name: "Caregivers", link: "/my-caregivers" },
    { name: "History", link: "/history" },
  ];

  const isActive = (link) => location.pathname === link;

  // DEBUG: Log localStorage state when component loads
  useEffect(() => {
    console.log('ChatPage localStorage state:', {
      userId: localStorage.getItem('userId'),
      caregiverId: localStorage.getItem('caregiverId'),
      role: localStorage.getItem('role'),
      userName: localStorage.getItem('userName'),
      userType
    });
  }, []);

  // 1. Fix for Caregivers: If caregiverId is null, fetch it from the backend using the userId
  useEffect(() => {
    const resolveId = async () => {
      if (userType === 'caregiver' && !resolvedCaregiverId) {
        try {
          console.log('Attempting to resolve caregiverId for userId:', userId);
          const res = await axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig);
          if (res.data && res.data.id) {
            console.log('Successfully resolved caregiverId:', res.data.id);
            localStorage.setItem('caregiverId', res.data.id);
            setResolvedCaregiverId(res.data.id);
          } else {
            console.warn('API returned null caregiver for userId:', userId);
          }
        } catch (err) {
          console.error("Could not resolve caregiver ID", err);
        }
      }
    };
    resolveId();
  }, [userType, userId, resolvedCaregiverId]);

  // 2. Fetch Profile Photo
  useEffect(() => {
    const fetchUserPhoto = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig);
        if (res.data?.photo) setUserPhoto(res.data.photo);
      } catch (err) { console.error("Photo fetch failed", err); }
    };
    if (userId) fetchUserPhoto();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      
      {/* SIDE MENU (Dashboard Match) */}
      <aside className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 w-80 transform transition-all duration-500 border-r border-slate-100 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 bg-slate-900 text-white relative">
            <button className="absolute top-6 right-6 text-slate-400 hover:text-white" onClick={() => setMenuOpen(false)}>
              <FaTimes size={20} />
            </button>
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={userPhoto ? `http://localhost:8080/uploads/${userPhoto}` : `https://ui-avatars.com/api/?name=${userName}`}
                className="w-14 h-14 rounded-2xl border-2 border-blue-500/30 object-cover"
                alt="Profile"
              />
              <div>
                <h3 className="font-black text-lg leading-none">{userName}</h3>
                <p className="text-blue-400 text-[10px] uppercase font-bold mt-1.5">{role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.name} onClick={() => { navigate(item.link); setMenuOpen(false); }}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${isActive(item.link) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-white text-red-600 border border-red-100 font-black text-xs py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
              Logout <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* HEADER (No Messages in Header) */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <img src={logo} alt="Logo" className="h-10 w-auto cursor-pointer" onClick={() => navigate("/dash")} />
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 font-black text-slate-900 uppercase text-sm">
            <div className="w-6 h-4 flex flex-col justify-between">
              <span className="h-0.5 w-full bg-slate-900 rounded-full"></span>
              <span className="h-0.5 w-full bg-slate-900 rounded-full"></span>
              <span className="h-0.5 w-full bg-slate-900 rounded-full"></span>
            </div>
            Menu
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {topNavItems.map(item => (
            <span key={item.name} onClick={() => navigate(item.link)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900 cursor-pointer">{item.name}</span>
          ))}
          <div className="h-8 w-px bg-slate-200"></div>
          <img 
            src={userPhoto ? `http://localhost:8080/uploads/${userPhoto}` : `https://ui-avatars.com/api/?name=${userName}`} 
            className="w-10 h-10 rounded-full border shadow-sm cursor-pointer" 
            onClick={() => navigate("/my-profile")} 
            alt="" 
          />
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex pt-20 overflow-hidden">
        {/* Left List of Accepted Connections */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ChatConversationsList 
              userType={userType} 
              userId={userId}
              caregiverId={resolvedCaregiverId}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              axiosConfig={axiosConfig}
            />
          </div>
        </div>

        {/* Right Chat Message Box */}
        <div className="flex-1 bg-slate-50 relative">
          {selectedChat ? (
            <ChatInterface selectedChat={selectedChat} userType={userType} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FaComments size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-sm">Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatConversationsList = ({ userType, userId, caregiverId, selectedChat, onSelectChat, axiosConfig }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      // Don't fetch if we don't have the ID yet (wait for resolver)
      if (userType === 'caregiver' && !caregiverId) return;

      try {
        setLoading(true);
        const endpoint = userType === 'caregiver'
          ? `http://localhost:8080/api/chat/accepted-for-caregiver/${caregiverId}`
          : `http://localhost:8080/api/chat/accepted-for-receiver/${userId}`;
        
        const res = await axios.get(endpoint, axiosConfig);
        setConversations(res.data || []);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userType, userId, caregiverId]);

  if (loading) return <div className="p-10 text-center text-xs font-bold text-slate-400 animate-pulse">LOADING...</div>;

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const target = userType === 'caregiver' ? conv.user : conv.caregiver;
        const isSelected = selectedChat?.id === conv.id;
        const photo = target?.photo ? `http://localhost:8080/uploads/${target.photo}` : `https://ui-avatars.com/api/?name=${target?.userName}`;

        return (
          <button 
            key={conv.id} 
            onClick={() => onSelectChat(conv)} 
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            <img src={photo} className="w-10 h-10 rounded-full object-cover border border-white/20" alt="" />
            <div className="text-left truncate">
              <p className="font-bold text-sm truncate uppercase tracking-tighter">{target?.userName}</p>
              <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>Accepted Connection</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ChatInterface = ({ selectedChat, userType }) => {
  const target = userType === 'caregiver' ? selectedChat.user : selectedChat.caregiver;
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <img src={target?.photo ? `http://localhost:8080/uploads/${target.photo}` : `https://ui-avatars.com/api/?name=${target?.userName}`} className="w-10 h-10 rounded-full" alt="" />
        <h2 className="font-black text-slate-900 uppercase tracking-tighter">{target?.userName}</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <Chat
          conversationId={selectedChat.conversationId}
          userType={userType}
          conversationWith={{
            ...selectedChat,
            userId: selectedChat.user?.id,
            caregiverId: selectedChat.caregiver?.id,
            userName: target?.userName,
            photo: target?.photo,
          }}
          isFullPage={true}
          onClose={() => {}}
        />
      </div>
    </div>
  );
};

export default ChatPage;