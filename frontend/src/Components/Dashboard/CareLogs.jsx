import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClipboardList, FaChevronDown, FaNewspaper } from 'react-icons/fa';
import Layout from '../Layout/Layout';

const CareLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsWithLogs, setBookingsWithLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All months');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');
  const role = localStorage.getItem('role');
  const caregiverId = localStorage.getItem('caregiverId');
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const buildLogItems = (bookings = []) => {
    const logItems = [];
    bookings.forEach((booking) => {
      const dailyNotes = Array.isArray(booking.dailyNotes) ? booking.dailyNotes : [];
      if (!dailyNotes.length) return;

      dailyNotes.forEach((entry, index) => {
        const [rawTimestamp, ...rest] = (entry || '').split(' — ');
        const noteText = rest.join(' — ').trim() || entry;
        const parsedDate = rawTimestamp ? new Date(rawTimestamp) : new Date(booking.startTime || booking.confirmedAt || booking.completedAt);
        const validDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        logItems.push({
          id: `${booking.id}-${index}`,
          bookingId: booking.id,
          caregiverName: booking.caregiverName || booking.caregiver?.userName || 'Caregiver',
          userName: booking.userName || booking.user?.userName || 'Care Receiver',
          serviceType: booking.serviceType || 'Care service',
          status: booking.status,
          timestamp: validDate,
          dateLabel: validDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
          timeLabel: validDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          note: noteText,
          raw: entry,
        });
      });
    });

    return logItems.sort((a, b) => b.timestamp - a.timestamp);
  };

  const groupByMonth = (items) => {
    return items.reduce((grouped, item) => {
      const monthKey = item.timestamp.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
      return grouped;
    }, {});
  };

  const groupByDay = (items) => {
    return items.reduce((grouped, item) => {
      const dayKey = item.timestamp.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(item);
      return grouped;
    }, {});
  };

  const getMonthKey = (date) => date.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchCareLogs = async () => {
      try {
        setLoading(true);
        if (!userId || !token) {
          setError('Please login to view your care log.');
          return;
        }

        const endpoint = role === 'CAREGIVER' && caregiverId
          ? `${import.meta.env.VITE_API_URL}/api/bookings/caregiver/${caregiverId}`
          : `${import.meta.env.VITE_API_URL}/api/bookings/user/${userId}`;

        const res = await axios.get(endpoint, axiosConfig);
        const bookings = Array.isArray(res.data) ? res.data : [];
        setBookingsWithLogs(bookings.filter((booking) => Array.isArray(booking.dailyNotes) && booking.dailyNotes.length > 0));

        const parsedLogs = buildLogItems(bookings);
        setLogs(parsedLogs);
      } catch (err) {
        console.error('Failed to load care logs:', err);
        setError('Unable to load care logs. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchCareLogs();
  }, [userId, token, role, caregiverId]);

  const filteredLogs = selectedMonth === 'All months'
    ? logs
    : logs.filter((log) => getMonthKey(log.timestamp) === selectedMonth);

  const groupedLogs = groupByMonth(filteredLogs);
  const dayGroups = groupByDay(filteredLogs);
  const monthOptions = ['All months', ...Object.keys(groupByMonth(logs))];

  return (
    <Layout>
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-6xl mx-auto px-8 py-14 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-widest">
              <FaClipboardList size={10} className="text-cyan-400" />
              Care Log
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Care updates from your caregiver</h1>
            <p className="text-blue-200 text-base max-w-2xl font-medium opacity-80">
              A dedicated timeline of caregiver notes and service progress, grouped by month for easy review.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
            <p className="text-slate-600 font-semibold">Loading your caregiver log...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
            <h2 className="text-xl font-bold text-red-700">Unable to load care logs</h2>
            <p className="text-sm text-red-600 mt-3">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FaCalendarAlt className="mx-auto mb-4 text-slate-400" size={48} />
            <h2 className="text-2xl font-bold text-slate-900">No care updates yet</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Your caregiver has not posted any daily logs yet. Once they update the booking, you’ll see the notes here as a separate care log timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Updates</p>
                <p className="mt-4 text-4xl font-black text-slate-900">{logs.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Bookings with Logs</p>
                <p className="mt-4 text-4xl font-black text-slate-900">{bookingsWithLogs.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest Update</p>
                <p className="mt-4 text-2xl font-black text-slate-900">{logs[0]?.dateLabel} · {logs[0]?.timeLabel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-cyan-50 px-4 py-3 text-cyan-700">
                  <FaCalendarAlt />
                  <span className="text-sm font-semibold">Filter by month</span>
                </div>
                <div className="relative min-w-[220px]">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none rounded-3xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500"
                  >
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {selectedMonth !== 'All months' ? (
              Object.entries(dayGroups).map(([day, dayLogs]) => (
                <section key={day} className="space-y-5">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">{day}</h2>
                    <p className="text-sm text-slate-500">Daily care updates for the selected month.</p>
                  </div>
                  <div className="grid gap-5">
                    {dayLogs.map((log) => (
                      <div key={log.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400 mb-2">{log.serviceType}</p>
                            <h3 className="text-lg font-bold text-slate-900">{log.caregiverName} shared an update</h3>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-semibold text-slate-700">{log.dateLabel}</p>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{log.timeLabel}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 border border-slate-200">
                          {log.note}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Booking ID: {log.bookingId.slice(0, 8)}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Status: {log.status}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Care plan: {log.serviceType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              Object.entries(groupedLogs).map(([month, monthLogs]) => (
                <section key={month} className="space-y-5">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">{month}</h2>
                    <p className="text-sm text-slate-500">Care notes from your booked caregiver, shown as a separate monthly log.</p>
                  </div>
                  <div className="grid gap-5">
                    {monthLogs.map((log) => (
                      <div key={log.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400 mb-2">{log.serviceType}</p>
                            <h3 className="text-lg font-bold text-slate-900">{log.caregiverName} shared an update</h3>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-semibold text-slate-700">{log.dateLabel}</p>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{log.timeLabel}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 border border-slate-200">
                          {log.note}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Booking ID: {log.bookingId.slice(0, 8)}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Status: {log.status}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Care plan: {log.serviceType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CareLogs;
