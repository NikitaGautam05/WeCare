import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments, FaArrowRight, FaSearch, FaCircle, FaTrash } from 'react-icons/fa';
import Chat from './Chat';
import axios from 'axios';
import Layout from '../Layout/Layout';

const getConversationActivityTime = (conversation) => {
  if (!conversation) return 0;
  if (conversation.lastMessageTime) return new Date(conversation.lastMessageTime).getTime();
  if (conversation.messages?.length) return new Date(conversation.messages[conversation.messages.length - 1].timestamp).getTime();
  if (conversation.updatedAt) return new Date(conversation.updatedAt).getTime();
  return 0;
};

// ─── CONVERSATIONS LIST ───────────────────────────────────────────────────────
const ChatConversationsList = ({ userType, userId, caregiverId, selectedChat, onSelectChat, onRequestHideConversation, hiddenConversations = {}, onRestoreHiddenConversations, axiosConfig, initialConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (userType === 'caregiver' && !caregiverId) return;
      try {
        setLoading(true);
        const endpoint = userType === 'caregiver'
          ? `${import.meta.env.VITE_API_URL}/api/chat/accepted-for-caregiver/${caregiverId}`
          : `${import.meta.env.VITE_API_URL}/api/chat/accepted-for-receiver/${userId}`;

        const res = await axios.get(endpoint, axiosConfig);
        const data = res.data || [];

        // Sort by most recent message first — all original logic preserved
        const sorted = [...data].sort((a, b) => {
          let aTime = 0, bTime = 0;
          if (a.lastMessageTime) aTime = new Date(a.lastMessageTime).getTime();
          else if (a.messages && a.messages.length > 0) aTime = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
          else if (a.updatedAt) aTime = new Date(a.updatedAt).getTime();
          if (b.lastMessageTime) bTime = new Date(b.lastMessageTime).getTime();
          else if (b.messages && b.messages.length > 0) bTime = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
          else if (b.updatedAt) bTime = new Date(b.updatedAt).getTime();
          return bTime - aTime;
        });

        if (onRestoreHiddenConversations && Object.keys(hiddenConversations).length > 0) {
          const hiddenIdsToRestore = [];
          Object.entries(hiddenConversations).forEach(([convId, hiddenAt]) => {
            const found = sorted.find((conv) => String(conv.conversationId || conv.id) === String(convId));
            if (found) {
              const latest = getConversationActivityTime(found);
              if (latest > hiddenAt) {
                hiddenIdsToRestore.push(convId);
              }
            }
          });
          if (hiddenIdsToRestore.length > 0) {
            onRestoreHiddenConversations(hiddenIdsToRestore);
          }
        }

        setConversations(sorted);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [userType, userId, caregiverId, axiosConfig, hiddenConversations, onRestoreHiddenConversations]);

  useEffect(() => {
    if (!loading && initialConversationId && !selectedChat && conversations.length > 0) {
      const found = conversations.find((conv) => {
        const convId = String(conv.conversationId || conv.id || '');
        return convId === String(initialConversationId);
      });
      if (found) {
        onSelectChat(found);
      }
    }
  }, [loading, initialConversationId, selectedChat, conversations, onSelectChat]);

  const handleDeleteConversation = (conversation) => {
    if (!conversation?.conversationId) return;
    if (onRequestHideConversation) onRequestHideConversation(conversation);
  };

  const filtered = conversations
    .filter(conv => !Object.prototype.hasOwnProperty.call(hiddenConversations, String(conv.conversationId || conv.id)))
    .filter(conv => {
      const target = userType === 'caregiver' ? conv.user : conv.caregiver;
      return !search || target?.userName?.toLowerCase().includes(search.toLowerCase());
    });

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-200 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/4"></div>
              <div className="h-2 bg-slate-100 rounded-full animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
          />
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <FaComments className="text-slate-300" size={20} />
            </div>
            <p className="text-slate-500 font-bold text-sm">
              {search ? "No results" : "No conversations yet"}
            </p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {search ? "Try a different name" : "Accepted connections appear here"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const target = userType === 'caregiver' ? conv.user : conv.caregiver;
            const isSelected = selectedChat?.id === conv.id;
            const photo = target?.photo
              ? `${import.meta.env.VITE_API_URL}/uploads/${target.photo}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.userName || "U")}&background=e0f2fe&color=0369a1`;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                role="button"
                tabIndex={0}
                className={`w-full text-left rounded-3xl px-3 py-3 flex items-center gap-3 transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={photo}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm"
                    alt={target?.userName}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.userName || "U")}&background=e0f2fe&color=0369a1`; }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-900'}`}>
                    {target?.userName || "Unknown"}
                  </p>
                  <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-slate-500' : 'text-slate-500'}`}>
                    Accepted · Tap to chat
                  </p>
                </div>

                <FaArrowRight size={10} className={`flex-shrink-0 transition-colors ${isSelected ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv); }}
                  className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all"
                  title="Hide conversation"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── CHAT INTERFACE (right panel) ─────────────────────────────────────────────
const ChatInterface = ({ selectedChat, userType, onClose, onDeleteConversation }) => {
  const target = userType === 'caregiver' ? selectedChat.user : selectedChat.caregiver;
  const photo = target?.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/${target.photo}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.userName || "U")}&background=e0f2fe&color=0369a1`;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat header strip */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 flex-shrink-0 bg-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={photo}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
              alt={target?.userName}
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.userName || "U")}&background=e0f2fe&color=0369a1`; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-50"></span>
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-none">{target?.userName || "Unknown"}</p>
            <p className="text-emerald-500 text-[10px] font-bold mt-0.5 flex items-center gap-1">
              <FaCircle size={5} /> Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDeleteConversation(selectedChat)}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl px-3 py-2 transition-all"
            title="Hide conversation"
          >
            <FaTrash size={12} />
            Hide
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors md:hidden"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Chat messages — all original logic untouched */}
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

// ─── EMPTY / PLACEHOLDER STATE ────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-slate-200 shadow-sm">
    <div className="text-center max-w-xs px-6">
      {/* Layered card decoration */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 bg-sky-100 rounded-3xl rotate-6 opacity-70"></div>
        <div className="absolute inset-0 bg-slate-100 rounded-3xl -rotate-3 opacity-80"></div>
        <div className="relative w-full h-full bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-200">
          <FaComments className="text-sky-400" size={28} />
        </div>
      </div>

      <h3 className="text-base font-black text-slate-700 mb-2">Select a Conversation</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        Pick a contact from your inbox on the left to open the chat
      </p>

      {/* Subtle animated dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
      </div>
    </div>
  </div>
);

// ─── CHAT PAGE (main export) ──────────────────────────────────────────────────
const ChatPage = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [resolvedCaregiverId, setResolvedCaregiverId] = useState(localStorage.getItem('caregiverId'));
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const userType = localStorage.getItem('role') === 'CAREGIVER' ? 'caregiver' : 'user';
  const userId = localStorage.getItem('userId');
  const initialConversationId = location.state?.conversationId || localStorage.getItem('chatConversationId');
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = useMemo(() => token ? { headers: { Authorization: `Bearer ${token}` } } : {}, [token]);

  // Resolve caregiver ID — original logic untouched
  useEffect(() => {
    if (userType === 'caregiver' && !resolvedCaregiverId) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers/user/${userId}`, axiosConfig)
        .then(r => {
          if (r.data?.id) {
            localStorage.setItem('caregiverId', r.data.id);
            setResolvedCaregiverId(r.data.id);
          }
        }).catch(err => console.error("Could not resolve caregiver ID", err));
    }
  }, [userType, userId, resolvedCaregiverId]);

  const handleSelectChat = (conv) => {
    setSelectedChat(conv);
    setMobileView('chat');
  };

  useEffect(() => {
    if (initialConversationId) {
      localStorage.removeItem('chatConversationId');
    }
  }, [initialConversationId]);

  const [hiddenConversations, setHiddenConversations] = useState({});
  const [pendingHideConversation, setPendingHideConversation] = useState(null);
  const [showHideConfirm, setShowHideConfirm] = useState(false);

  const handleDeleteConversation = (conversation) => {
    if (!conversation?.conversationId) return;
    setPendingHideConversation(conversation);
    setShowHideConfirm(true);
  };

  const handleRestoreHiddenConversations = (conversationIds) => {
    setHiddenConversations((prev) => {
      const next = { ...prev };
      conversationIds.forEach((id) => delete next[id]);
      return next;
    });
  };

  const confirmHideConversation = () => {
    if (!pendingHideConversation?.conversationId) {
      setPendingHideConversation(null);
      setShowHideConfirm(false);
      return;
    }

    const convId = String(pendingHideConversation.conversationId);
    const hiddenAt = getConversationActivityTime(pendingHideConversation) || Date.now();
    setHiddenConversations((prev) => ({ ...prev, [convId]: hiddenAt }));
    if (selectedChat?.conversationId === convId) {
      setSelectedChat(null);
      setMobileView('list');
    }
    setPendingHideConversation(null);
    setShowHideConfirm(false);
  };

  const cancelHideConversation = () => {
    setPendingHideConversation(null);
    setShowHideConfirm(false);
  };

  const handleBack = () => {
    setSelectedChat(null);
    setMobileView('list');
  };

  return (
    // Layout provides the header, sidebar, notification bell, chat FAB (auto-hidden on this page via CSS override), and pt-20 wrapper
    <Layout>
      <div className="max-w-7xl mx-auto px-6 pb-8">

        {/* PAGE TITLE ROW */}
        <div className="flex items-center justify-between mb-5 pt-2">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-1 h-6 bg-sky-500 rounded-full"></div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Messages</h1>
            </div>
            <p className="text-slate-400 text-sm pl-3.5">Chat with your accepted caregivers</p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500">Connections Active</span>
          </div>
        </div>

        {/* ── CHAT LAYOUT ──────────────────────────────────────────────── */}
        {/*
          Height = viewport minus: header (80px) + page title row (~80px) + padding (~32px)
          We clamp it so it never collapses on short screens.
        */}
        <div
          className="flex gap-4"
          style={{ height: "calc(100vh - 220px)", minHeight: "520px" }}
        >
          {/* LEFT — Inbox list */}
          <div className={`
            flex-shrink-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden
            ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
          `}>
            {/* Panel top bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex-shrink-0">
              <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center">
                <FaComments className="text-sky-600" size={13} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-700 leading-none">Inbox</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your conversations</p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatConversationsList
                userType={userType}
                userId={userId}
                caregiverId={resolvedCaregiverId}
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                onRequestHideConversation={(conversation) => {
                  setPendingHideConversation(conversation);
                  setShowHideConfirm(true);
                }}
                hiddenConversations={hiddenConversations}
                onRestoreHiddenConversations={handleRestoreHiddenConversations}
                axiosConfig={axiosConfig}
                initialConversationId={initialConversationId}
              />
            </div>
          </div>

          {/* RIGHT — Chat area */}
          <div className={`
            flex-1 min-w-0 overflow-hidden flex flex-col
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          `}>
            {selectedChat ? (
              <ChatInterface
                selectedChat={selectedChat}
                userType={userType}
                onClose={handleBack}
                onDeleteConversation={handleDeleteConversation}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {showHideConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-4">
              <h2 className="text-lg font-black text-white">Hide Conversation</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                This will hide the selected chat from your inbox for now. It will return once new activity arrives.
              </p>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-2">Conversation</p>
                <p className="font-semibold text-slate-900 truncate">{pendingHideConversation?.caregiver?.userName || pendingHideConversation?.user?.userName || 'Unknown'}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelHideConversation}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmHideConversation}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
                >
                  Hide Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hide the Layout's default floating chat button on this page */}
      <style>{`
        .fixed.bottom-8.right-8.bg-sky-600 { display: none !important; }
      `}</style>
    </Layout>
  );
};

export default ChatPage;