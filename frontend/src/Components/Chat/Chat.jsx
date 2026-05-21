import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaTimes, FaExpand, FaCompress, FaEye, FaEllipsisV } from 'react-icons/fa';

const Chat = ({ conversationId, conversationWith, onClose, userType = 'user', isFullPage = false }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState(null);
  const [userIdReady, setUserIdReady] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [canChat, setCanChat] = useState(true); // NEW: Check if interest is accepted
  const [checkingPermission, setCheckingPermission] = useState(true); // NEW: Loading state for permission check
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isUserAtBottom = useRef(true);

  const userId = localStorage.getItem('userId')?.trim() || '';
  const userName = (localStorage.getItem('userName') || 'You')?.trim();
  const getToken = () => localStorage.getItem('jwtToken');

  useEffect(() => {
    const initializeUserId = () => {
      const storedUserId = localStorage.getItem('userId')?.trim();
      if (storedUserId) {
        setUserIdReady(true);
      } else {
        const pollTimer = setInterval(() => {
          const updated = localStorage.getItem('userId')?.trim();
          if (updated) { setUserIdReady(true); clearInterval(pollTimer); }
        }, 500);
        return () => clearInterval(pollTimer);
      }
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    const initializeToken = () => {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        setTokenReady(true);
      } else {
        const pollTimer = setInterval(() => {
          const updated = localStorage.getItem('jwtToken');
          if (updated) { setTokenReady(true); clearInterval(pollTimer); }
        }, 500);
        return () => clearInterval(pollTimer);
      }
    };
    initializeToken();
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    isUserAtBottom.current = isAtBottom;
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkIfAtBottom);
    return () => container.removeEventListener('scroll', checkIfAtBottom);
  }, []);

  useEffect(() => { 
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages]);

  // NEW: Check if chat is allowed (interest accepted or old AcceptedRequest)
  useEffect(() => {
    const checkChatPermission = async () => {
      try {
        setCheckingPermission(true);
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId')?.trim() || '';
        const caregiverId = localStorage.getItem('caregiverId')?.trim() || '';
        const token = getToken();

        if (!token) {
          setCheckingPermission(false);
          return;
        }

        // Determine IDs based on role
        let checkCaregiverId = '';
        let checkUserId = '';

        if (role === 'CAREGIVER') {
          checkCaregiverId = caregiverId;
          checkUserId = conversationWith?.userId || conversationWith?.user?.id || userId;
        } else {
          checkCaregiverId = conversationWith?.caregiverId || conversationWith?.caregiver?.id || '';
          checkUserId = userId;
        }

        // If ids are missing, skip the permission check and allow the chat UI
        if (!checkCaregiverId || !checkUserId) {
          setCanChat(true);
          setCheckingPermission(false);
          return;
        }

        // Check if interest is accepted or if AcceptedRequest exists
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/interest/can-chat/${checkCaregiverId}/${checkUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCanChat(response.data === true);
        console.log('💬 Chat permission check:', response.data);
      } catch (err) {
        // If endpoint doesn't exist or error, allow chat (backward compatibility)
        console.log('📝 Chat permission check skipped, allowing chat');
        setCanChat(true);
      } finally {
        setCheckingPermission(false);
      }
    };

    if (conversationId) {
      checkChatPermission();
    }
  }, [
    conversationId,
    conversationWith?.userId,
    conversationWith?.caregiverId,
    conversationWith?.user?.id,
    conversationWith?.caregiver?.id,
  ]);

  useEffect(() => {
    fetchMessages();
    isUserAtBottom.current = true;
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          isUserAtBottom.current = true;
        }
      }, 50);
    }
  }, [loading]);

  const fetchMessages = async () => {
    try {
      const freshToken = getToken();
      if (!freshToken) { setLoading(false); return; }
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chat/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      const updatedMessages = res.data || [];
      setMessages(updatedMessages);
      setLoading(false);
      await markConversationRead(updatedMessages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setLoading(false);
    }
  };

  const markConversationRead = async (messagesToCheck) => {
    try {
      const freshToken = getToken();
      const role = localStorage.getItem('role');
      const recipientId = role === 'CAREGIVER'
        ? localStorage.getItem('caregiverId')?.trim() || ''
        : localStorage.getItem('userId')?.trim() || '';
      if (!freshToken || !recipientId || !conversationId) return;

      const unread = (messagesToCheck || []).filter(
        (message) => !message.isRead && message.recipientId === recipientId
      );

      if (unread.length === 0) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/chat/read/conversation/${conversationId}/${recipientId}`,
        null,
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
    } catch (err) {
      console.error('Failed to mark conversation messages read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const role = localStorage.getItem('role');
    const freshUserId = localStorage.getItem('userId')?.trim() || '';
    const freshCaregiverId = localStorage.getItem('caregiverId')?.trim() || '';
    const freshUserName = localStorage.getItem('userName') || 'You';
    const freshToken = getToken();
    
    // Determine which ID to send as senderId based on role
    const senderId = role === 'CAREGIVER' ? freshCaregiverId : freshUserId;
    
    // DEBUG: Log information for troubleshooting
    console.log('Send Message Debug:', {
      role,
      freshUserId,
      freshCaregiverId,
      senderId,
      hasToken: !!freshToken
    });
    
    if (!senderId) {
      const errorMsg = role === 'CAREGIVER' 
        ? 'Caregiver ID not found. Please log out and log back in as a caregiver.' 
        : 'User ID not found. Please log in again.';
      alert(errorMsg);
      return;
    }
    
    if (!freshToken) {
      alert('Session missing. Please log in again.');
      return;
    }
    
    setSending(true);
    try {
      const recipientId = conversationWith.userId || conversationWith.caregiverId || conversationWith.id;
      const params = new URLSearchParams();
      params.append('conversationId', conversationId);
      params.append('senderId', senderId);
      params.append('senderName', freshUserName);
      params.append('recipientId', recipientId);
      params.append('text', newMessage);
      const res = await axios.post(
        '${import.meta.env.VITE_API_URL}/api/chat/send',
        params,
        { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      setMessages([...messages, res.data]);
      setNewMessage('');
      isUserAtBottom.current = true;
      setTimeout(fetchMessages, 500);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;

    try {
      const freshToken = getToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/chat/message/${messageId}`,
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
      setOpenMenuMessageId(null);
      setPendingDeleteMessageId(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Unable to delete message.');
    }
  };

  const handleRequestDelete = (messageId) => {
    setPendingDeleteMessageId(messageId);
    setOpenMenuMessageId(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteMessageId(null);
  };


  const displayName = conversationWith.userName || conversationWith.caregiverName || 'User';
  const theirAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e8e8e8&color=333&bold=true`;
  const myAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=111827&color=fff&bold=true`;

if (isFullPage) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50">
        {/* Messages area */}
        <div ref={messagesContainerRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 space-y-4 custom-scrollbar">
          {pendingDeleteMessageId && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/20 p-4">
              <div className="w-full max-w-sm rounded-[28px] bg-white border border-slate-200 p-5 shadow-2xl">
                <p className="text-sm font-semibold text-slate-900">Delete this message?</p>
                <p className="mt-2 text-xs text-slate-500">This cannot be undone.</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(pendingDeleteMessageId)}
                    className="flex-1 rounded-2xl border border-red-200 bg-transparent py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <FaPaperPlane size={40} className="mb-4 text-slate-300" />
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, idx) => {
              // Get the correct ID to compare based on user role
              const role = localStorage.getItem('role');
              const freshUserId = localStorage.getItem('userId')?.trim() || '';
              const freshCaregiverId = localStorage.getItem('caregiverId')?.trim() || '';
              
              // For caregivers, compare with caregiverId; for users, compare with userId
              const myId = role === 'CAREGIVER' ? freshCaregiverId : freshUserId;
              const normalizedSender = String(message.senderId || '').trim();
              
              // If normalizedSender matches myId, it's MY message (Right)
              const isMe = normalizedSender === myId && myId !== '';

              return (
                <div key={message.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}>
                      <p className="leading-relaxed break-words">{message.text}</p>
                    </div>

                    {isMe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuMessageId((prev) => prev === message.id ? null : message.id);
                        }}
                        className="absolute -right-9 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        title="Message options"
                      >
                        <FaEllipsisV size={14} />
                      </button>
                    )}

                    {isMe && openMenuMessageId === message.id && (
                      <div className="absolute right-0 top-full mt-2 w-28 rounded-2xl border border-slate-200 bg-white shadow-lg z-20">
                        {!pendingDeleteMessageId ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRequestDelete(message.id); }}
                            className="w-full px-2 py-1 text-left text-xs font-semibold text-red-700 hover:bg-slate-50"
                          >
                            Delete
                          </button>
                        ) : (
                          <div className="p-3 text-sm text-slate-700">
                            <p className="mb-2 font-semibold">Delete this message?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCancelDelete(); }}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteMessage(message.id); }}
                                className="flex-1 rounded-xl border border-red-200 bg-transparent py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${isMe ? 'text-blue-400' : 'text-slate-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-slate-100 p-4">
          {checkingPermission ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-5 h-5 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mr-2" />
              <p className="text-xs text-slate-500">Checking permissions...</p>
            </div>
          ) : !canChat ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-yellow-800 mb-2">💭 Chat Not Available</p>
              <p className="text-xs text-yellow-700">
                The caregiver needs to accept your interest request before you can chat.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message..."
                className="flex-1 px-6 py-3 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-900 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim() || !userIdReady || !tokenReady}
                style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', opacity: 1 }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl border hover:bg-slate-800 disabled:bg-slate-900 disabled:opacity-70 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-slate-200/50 active:scale-95"
              >
                <FaPaperPlane size={18} style={{ color: '#ffffff' }} />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
    
  return (
    <div className={`fixed z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white ${maximized ? 'bottom-4 right-4 w-[min(92vw,820px)] h-[calc(100vh-3rem)]' : 'bottom-5 right-5 w-[340px]'}`}>

     {/* ── HEADER ── */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-700 border-b border-gray-500 cursor-pointer select-none"
        onClick={() => {
          if (maximized) {
            setMaximized(false);
          } else {
            setMinimized((prev) => !prev);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={theirAvatar} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-gray-700" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111827] rounded-full" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{displayName}</p>
            <p className="text-[11px] text-green-400 font-medium">Active now</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Profile Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const profileId = userType === 'caregiver' ? conversationWith.userId : conversationWith.caregiverId;
              const route = userType === 'caregiver' ? `/profileReciever/${profileId}` : `/profile/${profileId}`;
              navigate(route);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-600 hover:bg-slate-600 text-slate-100 hover:text-slate-300  rounded-lg transition-all text-xs font-medium"
            title="View Profile"
          >
            <FaEye size={10} />
            {/* <span>Profile</span> */}
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(false);
              setMaximized((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-600 hover:bg-slate-600 text-slate-100 hover:text-slate-300 rounded-lg transition-all text-xs font-medium"
            title={maximized ? 'Restore' : 'Maximize'}
          >
            {maximized ? <FaCompress size={10} /> : <FaExpand size={10} />}
          </button>

          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-600 hover:bg-red-700 text-slate-100 hover:text-slate-300  rounded-lg transition-all text-xs font-medium"
            title="Close"
          >
            <FaTimes size={12} />
            {/* <span>Close</span> */}
          </button>
        </div>
      </div>
      {/* ── BODY ── */}
      {!minimized && (
        <>
          <div className={`relative overflow-y-auto overflow-x-hidden px-4 py-3 bg-white space-y-1 ${maximized ? 'flex-1 min-h-0' : 'h-72'}`}>
            {pendingDeleteMessageId && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/20 p-4">
                <div className="w-full max-w-sm rounded-[28px] bg-white border border-slate-200 p-5 shadow-2xl">
                  <p className="text-sm font-semibold text-slate-900">Delete this message?</p>
                  <p className="mt-2 text-xs text-slate-500">This cannot be undone.</p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(pendingDeleteMessageId)}
                      className="flex-1 rounded-2xl border border-red-200 bg-transparent py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <FaPaperPlane size={16} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No messages yet</p>
              </div>
            ) : (
              messages.map((message, idx) => {
                const role = localStorage.getItem('role');
                const freshUserId = localStorage.getItem('userId')?.trim() || '';
                const freshCaregiverId = localStorage.getItem('caregiverId')?.trim() || '';
                
                // For caregivers, compare with caregiverId; for users, compare with userId
                const myId = role === 'CAREGIVER' ? freshCaregiverId : freshUserId;
                const normalizedSender = String(message.senderId || '').trim();
                const isMe = normalizedSender === myId && myId !== '';

                const nextMsg = messages[idx + 1];
                const isLast = !nextMsg || String(nextMsg.senderId || '').trim() !== normalizedSender;
                const prevMsg = messages[idx - 1];
                const isFirst = !prevMsg || String(prevMsg.senderId || '').trim() !== normalizedSender;

                return (
                  <div
                    key={message.id || idx}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}
                  >
                    {!isMe && (
                      <div className="w-6 flex-shrink-0 self-end mb-0.5">
                        {isLast ? <img src={theirAvatar} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6" />}
                      </div>
                    )}
                    <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="relative">
                        <div className={`px-3.5 py-2 text-sm leading-relaxed break-words ${isMe ? 'bg-gray-900 text-white rounded-t-2xl rounded-l-2xl rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-t-2xl rounded-r-2xl rounded-bl-sm'}`}>
                          <span>{message.text}</span>
                        </div>

                        {isMe && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuMessageId((prev) => prev === message.id ? null : message.id);
                            }}
                            className="absolute -right-10 top-2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            title="Message options"
                          >
                            <FaEllipsisV size={14} />
                          </button>
                        )}

                        {isMe && openMenuMessageId === message.id && (
                          <div className="absolute right-0 top-full mt-2 w-28 rounded-2xl border border-slate-200 bg-white shadow-lg z-20">
                            {!pendingDeleteMessageId ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRequestDelete(message.id); }}
                                className="w-full px-2 py-1 text-left text-xs font-semibold text-red-700 hover:bg-slate-50"
                              >
                                Delete
                              </button>
                            ) : (
                              <div className="p-3 text-sm text-slate-700">
                                <p className="mb-2 font-semibold">Delete this message?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCancelDelete(); }}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMessage(message.id); }}
                                    className="flex-1 rounded-xl border border-red-200 bg-transparent py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isLast && (
                        <p className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {isMe && (
                      <div className="w-6 flex-shrink-0 self-end mb-0.5">
                        {isLast ? <img src={myAvatar} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT ── */}
          {/* ── INPUT ── */}
<div className="px-3 py-2.5 bg-white border-t border-gray-100">
  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Type a message..."
      /* text-gray-900 ensures the words you type are solid black/dark gray */
      className="flex-1 px-4 py-2 text-sm text-gray-900 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder-gray-500"
    />
 <button
  type="submit"
  disabled={sending || !newMessage.trim()}
  style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', opacity: 1 }}
  className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-slate-800 disabled:bg-slate-900 disabled:opacity-70 disabled:cursor-not-allowed text-white active:scale-95 shadow-md shadow-slate-200/50 transition-all flex-shrink-0"
>
  <FaPaperPlane size={16} style={{ color: '#ffffff' }} className="ml-0.5" />
</button>
  </form>
</div>
        </>
      )}
    </div>
  );
};

export default Chat;