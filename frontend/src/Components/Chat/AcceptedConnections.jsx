import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';
import { FaComments, FaSync, FaSearch } from 'react-icons/fa';

const AcceptedConnections = ({ userType = 'user', caregiverId: providedCaregiverId = null }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedChat, setSelectedChat]   = useState(null);
  const [search, setSearch]               = useState('');
  const [caregiverId, setCaregiverId]     = useState(providedCaregiverId);

  const userId      = localStorage.getItem('userId');
  const token       = localStorage.getItem('jwtToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (userType === 'caregiver') {
      if (providedCaregiverId) fetchConversations(providedCaregiverId);
      else fetchCaregiverIdThenConversations();
    } else {
      fetchConversations(userId);
    }
  }, [userType, providedCaregiverId]);

  const fetchCaregiverIdThenConversations = async () => {
    try {
      const cgRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers/user/${userId}`, axiosConfig);
      if (cgRes.data && cgRes.data.id) {
        setCaregiverId(cgRes.data.id);
        fetchConversations(cgRes.data.id);
      } else { setConversations([]); setLoading(false); }
    } catch (err) {
      console.error('Failed to fetch caregiver ID:', err);
      setConversations([]); setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userType === 'caregiver') {
      caregiverId ? fetchConversations(caregiverId) : fetchCaregiverIdThenConversations();
    } else {
      fetchConversations(userId);
    }
  };

  const fetchConversations = async (idToUse) => {
    try {
      setLoading(true);
      const endpoint = userType === 'caregiver'
        ? `${import.meta.env.VITE_API_URL}/api/chat/accepted-for-caregiver/${idToUse}`
        : `${import.meta.env.VITE_API_URL}/api/chat/accepted-for-receiver/${idToUse}`;
      const res = await axios.get(endpoint, axiosConfig);
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setConversations([]);
    } finally { setLoading(false); }
  };

  const getDisplayName = (conv) =>
    userType === 'caregiver'
      ? conv.user?.userName || 'Unknown User'
      : conv.caregiver?.userName || 'Unknown Caregiver';

  const getPhoto = (conv) => {
    const f = userType === 'caregiver' ? conv.user?.photo : conv.caregiver?.photo;
    if (!f) return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(conv))}&background=e2e8f0&color=64748b&bold=true&size=128`;
    if (f.startsWith('http')) return f;
    return `${import.meta.env.VITE_API_URL}/uploads/${f.replace(/\s+/g, '_').trim()}`;
  };

  const getDetails = (conv) => {
    if (userType === 'caregiver') {
      return { sub: conv.user?.serviceType || conv.user?.address || 'Care Receiver' };
    }
    return { sub: conv.caregiver?.speciality || 'Caregiver', experience: conv.caregiver?.experience };
  };

  const filtered = conversations.filter(conv =>
    getDisplayName(conv).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-gray-100 border-t-gray-400 animate-spin" />
        <p className="text-sm text-gray-400">Loading conversations…</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-200 border border-gray-300 rounded-3xl p-5 shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conversations.length} active connection{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 transition-all shadow-sm"
        >
          <FaSync size={9} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={12} />
        <input
          type="text"
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
      </div>

      {/* ── Empty state ── */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
            <FaComments size={18} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No conversations yet</p>
          <p className="text-xs text-gray-400 text-center max-w-[200px] leading-relaxed">
            {userType === 'caregiver'
              ? 'Connections appear once care receivers accept your profile.'
              : 'Accept a caregiver to start chatting.'}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all shadow-sm"
          >
            <FaSync size={9} /> Refresh
          </button>
        </div>

      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">
          No results for <span className="font-semibold text-gray-600">"{search}"</span>
        </p>

      ) : (
        <>
          {/* Section label */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
            Active &middot; {filtered.length}
          </p>

          {/* ── Unified list container ── */}
          <div className="bg-gray-200 border border-gray-300 rounded-3xl overflow-hidden shadow-sm">
            {filtered.map((conv, index) => {
              const displayName = getDisplayName(conv);
              const photo       = getPhoto(conv);
              const details     = getDetails(conv);
              const isActive    = selectedChat?.id === conv.id;

              return (
                <React.Fragment key={conv.id}>
                  <button
                    onClick={() => setSelectedChat(isActive ? null : conv)}
                    className="w-full relative flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={photo}
                        alt={displayName}
                        className="w-11 h-11 rounded-full object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e2e8f0&color=64748b&bold=true&size=128`;
                        }}
                      />
                    </div>

                    {/* Name & subtitle */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate leading-snug">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {details.sub || '—'}
                        {details.experience
                          ? <span className="text-gray-300"> &middot; {details.experience} yrs</span>
                          : null}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex-shrink-0 ml-2">
                      <span className="text-[11px] text-gray-400 tabular-nums">
                        {new Date(conv.acceptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}

      {/* ── Floating chat ── */}
      {selectedChat && (
        <Chat
          conversationId={selectedChat.conversationId}
          userType={userType}
          conversationWith={{
            ...selectedChat,
            userId:      selectedChat.user?.id,
            caregiverId: selectedChat.caregiver?.id,
            userName:    userType === 'caregiver' ? selectedChat.user?.userName : selectedChat.caregiver?.userName,
            photo:       userType === 'caregiver' ? selectedChat.user?.photo    : selectedChat.caregiver?.photo,
          }}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default AcceptedConnections;