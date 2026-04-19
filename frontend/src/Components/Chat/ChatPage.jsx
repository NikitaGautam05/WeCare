import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments, FaTimes, FaArrowRight, FaSearch } from 'react-icons/fa';
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

  const isActive = (link) => location.pathname === link;

  useEffect(() => {
    if (userType === 'caregiver' && !resolvedCaregiverId) {
      const res = axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig);
      res.then(r => {
        if (r.data?.id) {
          localStorage.setItem('caregiverId', r.data.id);
          setResolvedCaregiverId(r.data.id);
        }
      }).catch(err => console.error("Could not resolve caregiver ID", err));
    }
  }, [userType, userId, resolvedCaregiverId]);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig)
        .then(res => {
          if (res.data?.photo) setUserPhoto(res.data.photo);
        })
        .catch(err => console.error("Photo fetch failed", err));
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 font-sans text-slate-900">
      
      {/* BEAUTIFUL SIDE MENU - COPY FROM DASHBOARD */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 w-80 transform transition-all duration-500 ease-in-out border-r border-slate-100 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Header Section */}
          <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <button 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors" 
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes size={20} />
            </button>

            <div className="flex items-center gap-4 relative z-10">
              <img
                src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`}
                alt="Profile"
                className="w-14 h-14 rounded-2xl border-2 border-blue-500/30 object-cover shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userName}`; }}
              />
              <div>
                <h3 className="font-black text-lg leading-none">{userName}</h3>
                <p className="text-blue-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5">{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Main Menu</p>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.link);
                return (
                  <li key={item.name}>
                    <div
                      onClick={() => { navigate(item.link); setMenuOpen(false); }}
                      className={`group cursor-pointer flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                        active 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`text-lg transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                        {item.name.split(" ")[0]}
                      </span>
                      <span className="font-bold text-sm tracking-tight">
                        {item.name.split(" ")[1]}
                      </span>
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Section */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-3 bg-white text-red-600 border border-red-100 font-black text-xs py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
            >
              <span>Logout</span>
              <FaArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* BEAUTIFUL HEADER - DASHBOARD STYLE */}
      <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-10 w-auto hover:opacity-80 transition cursor-pointer" 
            onClick={() => navigate("/dash")} 
          />
          <button 
            onClick={() => setMenuOpen(true)} 
            className="flex items-center gap-2 font-bold text-white hover:text-sky-600 transition"
          >
            <div className="w-8 h-8 flex flex-col justify-center gap-1.5">
              <span className="h-0.5 w-6 bg-current rounded-full"></span>
              <span className="h-0.5 w-4 bg-current rounded-full"></span>
              <span className="h-0.5 w-6 bg-current rounded-full"></span>
            </div>
            Menu
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.slice(0, 4).map(item => (
            <span 
              key={item.name} 
              onClick={() => navigate(item.link)}
              className={`text-sm font-bold cursor-pointer transition-colors ${
                isActive(item.link) ? "text-sky-600" : "text-slate-500 hover:text-sky-500"
              }`}
            >
              {item.name.split(" ")[1]}
            </span>
          ))}
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate("/my-profile")}
          >
            <div className="text-right hidden sm:block">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                {userName}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {role}
              </p>
            </div>
            <img
              src={userPhoto ? (userPhoto.startsWith("http") ? userPhoto : `http://localhost:8080/uploads/${encodeURIComponent(userPhoto)}`) : `https://ui-avatars.com/api/?name=${userName}`}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ring-sky-100 transition-all object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userName}`; }}
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA - BEAUTIFUL LAYOUT */}
      <div className="flex-1 flex pt-20 overflow-hidden gap-0">
        {/* Left Sidebar - Conversations List */}
        <div className="w-96 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FaComments className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Messages</h2>
                <p className="text-xs text-slate-400 font-medium">Your conversations</p>
              </div>
            </div>
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

        {/* Right Chat Area */}
        <div className="flex-1 bg-slate-50 relative flex flex-col">
          {selectedChat ? (
            <ChatInterface selectedChat={selectedChat} userType={userType} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full">
                  <FaComments size={40} className="text-blue-500/30" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">No Conversation Selected</p>
                  <p className="text-slate-400 text-sm">Choose a contact from the list to start messaging</p>
                </div>
              </div>
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
      if (userType === 'caregiver' && !caregiverId) return;

      try {
        setLoading(true);
        const endpoint = userType === 'caregiver'
          ? `http://localhost:8080/api/chat/accepted-for-caregiver/${caregiverId}`
          : `http://localhost:8080/api/chat/accepted-for-receiver/${userId}`;
        
        const res = await axios.get(endpoint, axiosConfig);
        const data = res.data || [];
        
        // Sort conversations by most recent message first
        const sorted = [...data].sort((a, b) => {
          // Try multiple timestamp fields
          let aTime = 0;
          let bTime = 0;
          
          // Check for lastMessageTime
          if (a.lastMessageTime) aTime = new Date(a.lastMessageTime).getTime();
          // Check for messages array and get last message timestamp
          else if (a.messages && a.messages.length > 0) {
            aTime = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
          }
          // Fallback to updatedAt
          else if (a.updatedAt) aTime = new Date(a.updatedAt).getTime();
          
          // Same for b
          if (b.lastMessageTime) bTime = new Date(b.lastMessageTime).getTime();
          else if (b.messages && b.messages.length > 0) {
            bTime = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
          }
          else if (b.updatedAt) bTime = new Date(b.updatedAt).getTime();
          
          return bTime - aTime;
        });
        
        setConversations(sorted);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userType, userId, caregiverId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="p-4 rounded-2xl bg-slate-100/50 animate-pulse h-16"></div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-3">
          <FaComments className="text-slate-400" size={20} />
        </div>
        <p className="text-slate-500 font-bold text-sm">No conversations yet</p>
        <p className="text-slate-400 text-xs mt-1">Your accepted connections will appear here</p>
      </div>
    );
  }

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
            className={`w-full text-left transition-all duration-200 ${
              isSelected 
                ? 'bg-blue-600 text-white shadow-lg rounded-2xl' 
                : 'hover:bg-slate-100 rounded-xl text-slate-700'
            } p-4 flex items-center gap-3`}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={photo} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20" 
                alt={target?.userName} 
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isSelected ? 'bg-green-400' : 'bg-green-500'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {target?.userName?.toUpperCase()}
              </p>
              <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                Accepted Connection
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ChatInterface = ({ selectedChat, userType }) => {
  const target = userType === 'caregiver' ? selectedChat.user : selectedChat.caregiver;
  const photo = target?.photo ? `http://localhost:8080/uploads/${target.photo}` : `https://ui-avatars.com/api/?name=${target?.userName}`;
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Beautiful Chat Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={photo} 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20 shadow-sm" 
              alt={target?.userName} 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg">{target?.userName?.toUpperCase()}</h2>
            <p className="text-xs text-green-600 font-bold">● Online</p>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
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