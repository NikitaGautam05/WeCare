import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaTimes, FaMinus, FaEye } from 'react-icons/fa';

const Chat = ({ conversationId, conversationWith, onClose, userType = 'user', isFullPage = false }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
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
          `http://localhost:8080/api/interest/can-chat/${checkCaregiverId}/${checkUserId}`,
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
        `http://localhost:8080/api/chat/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setLoading(false);
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
        'http://localhost:8080/api/chat/send',
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

  const displayName = conversationWith.userName || conversationWith.caregiverName || 'User';
  const theirAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e8e8e8&color=333&bold=true`;
  const myAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=111827&color=fff&bold=true`;

if (isFullPage) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50">
        {/* Messages area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
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
                  <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed">{message.text}</p>
                    </div>
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
                className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-100 active:scale-95"
              >
                <FaPaperPlane size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
    
  return (
    <div className="fixed bottom-5 right-5 z-50 w-[340px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">

     {/* ── HEADER ── */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-700 border-b border-gray-500 cursor-pointer select-none"
        onClick={() => setMinimized(!minimized)}
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-all text-xs font-medium"
            title="View Profile"
          >
            <FaEye size={10} />
            {/* <span>Profile</span> */}
          </button>

          {/* Minimize Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-all text-xs font-medium"
            title="Minimize"
          >
            <FaMinus size={10} />
            {/* <span>−</span> */}
          </button>

          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-xs font-medium"
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
          <div className="h-72 overflow-y-auto px-4 py-3 bg-white space-y-1">
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
                      <div className={`px-3.5 py-2 text-sm leading-relaxed break-words ${isMe ? 'bg-gray-900 text-white rounded-t-2xl rounded-l-2xl rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-t-2xl rounded-r-2xl rounded-bl-sm'}`}>
                        {message.text}
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
  /* 1. Changed bg-red to bg-red-600 (valid Tailwind class)
    2. Kept flex-shrink-0 to prevent the box from squishing
    3. Added text-white to the button to ensure the icon inherits white
  */
  className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shadow-md transition-all flex-shrink-0"
>
  {/* Using size 16 and a slight margin-left to perfectly center 
    the 'tip' of the plane visually inside the circle.
  */}
  <FaPaperPlane size={16} className="ml-0.5" />
</button>
  </form>
</div>
        </>
      )}
    </div>
  );
};

export default Chat;