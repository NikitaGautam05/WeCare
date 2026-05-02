import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout/Layout';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaChevronDown,
} from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, accepted, rejected
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

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

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (userId && token) {
      fetchNotifications();
    }
  }, [userId, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/notifications/${userId}`, axiosConfig);

      const userNotifications = res.data || [];
      console.log('Raw notifications from API:', userNotifications);
      const parsed = userNotifications.map((notif, idx) => {
        // Handle new notification object structure from Notification collection
        if (typeof notif === 'object' && notif !== null) {
          const parsedNotif = {
            ...notif,
            id: notif.id || notif._id || idx,
            title: safeString(notif.title),
            message: safeString(notif.message) || safeString(notif.title) || 'New notification',
            type: normalizeType(notif.type),
            read: !!notif.read,
            reason: safeString(notif.reason),
            senderName: safeString(notif.senderName),
            actionId: safeString(notif.actionId),
            createdAt: safeString(notif.createdAt),
            serviceDate: extractDateFromMessage(safeString(notif.message) || safeString(notif.title))
          };
          return parsedNotif;
        }
        // Fallback for legacy string format
        try {
          const parsedLegacy = JSON.parse(notif);
          return {
            ...parsedLegacy,
            id: idx,
            type: normalizeType(parsedLegacy.type),
          };
        } catch {
          return { message: safeString(notif), type: 'general', id: idx };
        }
      });

      setNotifications(parsed);

      // Mark all notifications as read when viewing the page
      if (parsed.length > 0) {
        try {
          await axios.put(`http://localhost:8080/api/notifications/${userId}/read-all`, {}, axiosConfig);
        } catch (err) {
          console.error('Failed to mark notifications as read:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract date from notification message
  const extractDateFromMessage = (message) => {
    // Try to extract date from messages like "New booking request for ... on 2024-01-01 10:00"
    const dateMatch = message.match(/on\s+([\d\-]+\s+[\d:]+)/);
    return dateMatch ? dateMatch[1] : null;
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'booking_accepted':
        return {
          icon: FaCheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Accepted',
        };
      case 'booking_rejected':
        return {
          icon: FaTimesCircle,
          color: 'text-red-500',
          bg: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Rejected',
        };
      default:
        return {
          icon: FaBell,
          color: 'text-slate-500',
          bg: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'Notification',
        };
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (notif.type === 'booking') return false;
    if (filter === 'all') return true;
    if (filter === 'accepted') return notif.type === 'booking_accepted';
    if (filter === 'rejected') return notif.type === 'booking_rejected';
    return true;
  });

  return (
    <Layout>
      {/* ── DARK HERO SECTION MATCHING DASHBOARD THEME ── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-6xl mx-auto px-8 py-14 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Activity Hub
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Notifications
            </h1>
            <p className="text-blue-200 text-base max-w-sm font-medium opacity-80">
              Stay updated with your bookings and interactions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* ── MINIMAL FILTER DROPDOWN ── */}
        <div className="mb-8 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-0 py-2 transition-all text-sm group"
          >
            <span className="text-gray-200  text-xs font-semibold uppercase tracking-wide">Filter:</span>
            <span className="text-gray-200 font-medium group-hover:text-gray-400">
              {filter === 'all' ? 'All Notifications' : filter === 'accepted' ? 'Accepted' : 'Rejected'}
            </span>
            <FaChevronDown 
              size={10} 
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} text-gray-400 group-hover:text-gray-600`} 
            />
          </button>

          {/* ── MINIMAL DROPDOWN PANEL ── */}
          {dropdownOpen && (
            <div className="absolute bg-slate-900 top-10 left-0 bg-white border border-gray-200 rounded-lg shadow-sm z-50 min-w-[200px] overflow-hidden">
              {[
                { label: 'All Notifications', value: 'all' },
                { label: 'Accepted Only', value: 'accepted' },
                { label: 'Rejected Only', value: 'rejected' },
              ].map((option, idx) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFilter(option.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 transition-colors text-sm border-b border-gray-100 last:border-b-0 ${
                    filter === option.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-bounce">
              <FaBell className="text-slate-300" size={40} />
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <FaBell className="text-slate-200 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              {filter === 'all'
                ? "You're all caught up! There's nothing new to show right now."
                : `You don't have any ${filter} notifications at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif, idx) => {
              const { icon: Icon, color, bg, borderColor, label } = getNotificationStyle(notif.type);
              return (
                <div
                  key={notif.id || idx}
                  className={`${bg} border-2 ${borderColor} rounded-3xl p-6 transition-all hover:scale-[1.01] hover:shadow-md`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`${color} bg-white p-3 rounded-xl shadow-sm flex-shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h4 className="font-black text-xl text-slate-900 leading-tight">{notif.message}</h4>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full bg-white border ${borderColor} ${color}`}>
                          {label}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
                        {notif.serviceDate && <span>📅 {notif.serviceDate}</span>}
                        {notif.serviceTime && <span>⏰ {notif.serviceTime}</span>}
                        {notif.actionId && (
                           <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-mono">
                             ID: {notif.actionId.slice(0, 8)}
                           </span>
                        )}
                        {notif.senderName && (
                          <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                            From: {notif.senderName}
                          </span>
                        )}
                        {notif.title && (
                          <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                            {notif.title}
                          </span>
                        )}
                      </div>

                      {notif.reason && (
                        <div className="mt-3 p-3 bg-white/40 rounded-xl border border-black/5">
                          <p className="text-sm text-slate-700 italic">
                            <span className="font-black not-italic text-slate-900 mr-2">Rejection Reason:</span> 
                            {notif.reason}
                          </p>
                        </div>
                      )}

                      {/* Show notification ID and timestamps */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                          <div>
                            <span className="font-semibold">Notification ID:</span>
                            <p className="font-mono text-[10px] break-all">{notif.id}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Created:</span>
                            <p className="text-[10px]">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        {notif.actionId && (
                          <div className="mt-2">
                            <span className="font-semibold text-xs text-slate-500">Action ID:</span>
                            <p className="font-mono text-[10px] break-all">{notif.actionId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Approved</p>
              <p className="text-3xl font-black text-green-600">
                {notifications.filter((n) => n.type === 'booking_accepted').length}
              </p>
            </div>
            <div className="flex-1 min-w-[200px] bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Declined</p>
              <p className="text-3xl font-black text-red-600">
                {notifications.filter((n) => n.type === 'booking_rejected').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;