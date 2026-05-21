import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheck, FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');

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
      default:
        return raw.toLowerCase();
    }
  };

  const isRelevantNotification = (type) => {
    const normalized = normalizeType(type);
    return normalized === 'booking_accepted' || normalized === 'booking_rejected';
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const relevant = (response.data || []).filter(n => isRelevantNotification(n.type));
      setNotifications(relevant);
      
      // Count unread
      const unread = relevant.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${userId}/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'INTEREST_SENT':
        return <FaBell className="text-blue-500" />;
      case 'INTEREST_ACCEPTED':
        return <FaCheckCircle className="text-green-500" />;
      case 'INTEREST_REJECTED':
        return <FaTimes className="text-red-500" />;
      case 'BOOKING_REQUEST':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_ACCEPTED':
        return <FaCheckCircle className="text-green-500" />;
      case 'BOOKING_DECLINED':
      case 'BOOKING_REJECTED':
      case 'booking_rejected':
        return <FaTimes className="text-red-500" />;
      case 'booking_accepted':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBell className="text-slate-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'INTEREST_SENT':
        return 'bg-blue-50 border-blue-200';
      case 'INTEREST_ACCEPTED':
        return 'bg-green-50 border-green-200';
      case 'INTEREST_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'BOOKING_REQUEST':
        return 'bg-yellow-50 border-yellow-200';
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_ACCEPTED':
      case 'booking_accepted':
        return 'bg-green-50 border-green-200';
      case 'BOOKING_DECLINED':
      case 'BOOKING_REJECTED':
      case 'booking_rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FaBell className="text-blue-600 text-lg" />
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <FaBell className="text-4xl text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notif.type)} ${
                !notif.read ? 'font-semibold' : 'opacity-75'
              }`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchNotifications}
        disabled={loading}
        className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>
    </div>
  );
};

export default NotificationsPanel;
