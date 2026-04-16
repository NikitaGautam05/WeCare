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
      if (providedCaregiverId) {
        fetchConversations(providedCaregiverId);
      } else {
        fetchCaregiverIdThenConversations();
      }
    } else {
      fetchConversations(userId);
    }
  }, [userType, providedCaregiverId]);

  const fetchCaregiverIdThenConversations = async () => {
    try {
      const cgRes = await axios.get(`http://localhost:8080/api/caregivers/user/${userId}`, axiosConfig);
      if (cgRes.data && cgRes.data.id) {
        setCaregiverId(cgRes.data.id);
        fetchConversations(cgRes.data.id);
      } else {
        setConversations([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch caregiver ID:', err);
      setConversations([]);
      setLoading(false);
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
        ? `http://localhost:8080/api/chat/accepted-for-caregiver/${idToUse}`
        : `http://localhost:8080/api/chat/accepted-for-receiver/${idToUse}`;
      const res = await axios.get(endpoint, axiosConfig);
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (conv) => {
    if (userType === 'caregiver') return conv.user?.userName || 'Unknown User';
    return conv.caregiver?.userName || 'Unknown Caregiver';
  };

  const getPhoto = (conv) => {
    const f = userType === 'caregiver' ? conv.user?.photo : conv.caregiver?.photo;
    if (!f) return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(conv))}&background=e8e8e8&color=333&bold=true`;
    if (f.startsWith('http')) return f;
    return `http://localhost:8080/uploads/${f.replace(/\s+/g, '_').trim()}`;
  };

  const getDetails = (conv) => {
    if (userType === 'caregiver') {
      return { sub: conv.user?.serviceType || conv.user?.address || 'Care Receiver' };
    }
    return {
      sub:        conv.caregiver?.speciality || 'Caregiver',
      experience: conv.caregiver?.experience,
    };
  };

  const filtered = conversations.filter(conv =>
    getDisplayName(conv).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conversations.length} active connection{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-300 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FaSync size={10} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
        <input
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all placeholder-gray-300"
        />
      </div>

      {/* Empty state */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
            <FaComments size={18} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No conversations yet</p>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            {userType === 'caregiver'
              ? 'Connections appear once care receivers accept your profile.'
              : 'Accept a caregiver to start chatting.'}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaSync size={10} /> Refresh
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-sm text-gray-400">No conversations match your search.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((conv) => {
            const displayName = getDisplayName(conv);
            const photo       = getPhoto(conv);
            const details     = getDetails(conv);
            const isActive    = selectedChat?.id === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(isActive ? null : conv)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive ? 'bg-gray-200' : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={photo}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e8e8e8&color=333&bold=true`;
                    }}
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-green-400 ${isActive ? 'border-gray-200' : 'border-white'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-gray-300' : 'text-gray-300'}`}>
                      {displayName}
                    </p>
                    <span className={`text-xs flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                      {new Date(conv.acceptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                    {details.sub}{details.experience ? ` · ${details.experience} yrs` : ''}
                  </p>
                </div>

                {/* Badge */}
                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-600'
                }`}>
                  Active
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating chat */}
      {selectedChat && (
        <Chat
          conversationId={selectedChat.conversationId}
          userType={userType}
          conversationWith={{
            ...selectedChat,
            userId:       selectedChat.user?.id,
            caregiverId:  selectedChat.caregiver?.id,
            userName:     userType === 'caregiver' ? selectedChat.user?.userName : selectedChat.caregiver?.userName,
            photo:        userType === 'caregiver' ? selectedChat.user?.photo    : selectedChat.caregiver?.photo,
          }}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default AcceptedConnections;