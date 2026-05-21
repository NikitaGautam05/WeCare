import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSync, FaComments, FaCheck, FaUserMd } from 'react-icons/fa';
import Layout from '../Layout/Layout';

const Connections = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    if (!userId || !token) { navigate('/login'); return; }
    fetchConnections();
  }, [userId, token, navigate]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/accepted-for-receiver/${userId}`, axiosConfig);
      setConnections(res.data || []);
    } catch (err) {
      console.error('Failed to fetch connected caregivers:', err);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!userId || !token) return;
    setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/accepted-for-receiver/${userId}`, axiosConfig);
      setConnections(res.data || []);
    } catch (err) {
      console.error('Failed to refresh connections:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const caregiver = connection?.caregiver;
    const terms = [caregiver?.fullName || caregiver?.userName, caregiver?.speciality, caregiver?.address, caregiver?.experience, caregiver?.phone || caregiver?.phoneNumber]
      .filter(Boolean).join(' ').toLowerCase();
    return terms.includes(search.toLowerCase());
  });

  return (
    <Layout>

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em]">Accepted Connections</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Your Care <br /><span className="text-emerald-400">Network</span>
            </h1>
            <p className="text-slate-400 text-base max-w-sm leading-relaxed">
              Caregivers who accepted your request and are ready to support you.
            </p>
          </div>

          {/* Search */}
          <div className="w-full max-w-md">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search by name, speciality, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-800 text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/30 transition"
                />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 pl-1">
              {filteredConnections.length} of {connections.length} connection{connections.length !== 1 ? 's' : ''} shown
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-8 py-10">

        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Connected Caregivers</h2>
            <p className="text-slate-400 text-sm mt-0.5">People who are ready to provide care for you</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-60"
          >
            <FaSync size={11} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* ── LOADING ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-16 bg-slate-100 rounded-xl"></div>
                  <div className="h-16 bg-slate-100 rounded-xl"></div>
                </div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>

        /* ── EMPTY STATE ────────────────────────────────────────── */
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FaUserMd className="text-slate-300" size={24} />
            </div>
            <h3 className="text-base font-black text-slate-500 mb-1">
              {search ? 'No matches found' : 'No connections yet'}
            </h3>
            <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
              {search
                ? 'Try a different search term'
                : 'Once a caregiver accepts your interest request, they will appear here'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 text-xs font-bold text-sky-600 border border-sky-200 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-all">
                Clear Search
              </button>
            )}
          </div>

        /* ── CARDS GRID ─────────────────────────────────────────── */
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredConnections.map((connection) => {
              const caregiver = connection.caregiver || {};
              const photo = caregiver.photo
                ? caregiver.photo.startsWith('http')
                  ? caregiver.photo
                  : `${import.meta.env.VITE_API_URL}/uploads/${caregiver.photo.replace(/\s+/g, '_').trim()}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(caregiver.userName || 'Caregiver')}&background=d1fae5&color=065f46`;

              const connectedDate = connection.acceptedAt
                ? new Date(connection.acceptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null;

              return (
                <div
                  key={connection.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/8 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* ── Card top: avatar + name + accepted badge ── */}
                  <div className="p-6 pb-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={photo}
                          alt={caregiver.userName || 'Caregiver'}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:border-emerald-200 transition-colors"
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caregiver.userName || 'C')}&background=d1fae5&color=065f46`; }}
                        />
                        {/* Accepted tick overlay */}
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md border-2 border-white">
                          <FaCheck className="text-white" size={9} />
                        </div>
                      </div>

                      {/* Name + specialty */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-black text-slate-900 text-base leading-tight truncate group-hover:text-emerald-700 transition-colors">
                          {caregiver.fullName || caregiver.userName || 'Unknown Caregiver'}
                        </h3>
                        <span className="inline-block mt-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          {caregiver.speciality || 'Caregiver'}
                        </span>
                      </div>
                    </div>

                    {/* Connected-since pill */}
                    {connectedDate && (
                      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Connected since {connectedDate}
                      </div>
                    )}
                  </div>

                  {/* ── Stats strip ── */}
                  <div className="grid grid-cols-1 gap-3 px-6 mb-5">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                      <p className="text-sm font-black text-slate-800 leading-tight">
                        {caregiver.experience ? `${caregiver.experience} yrs` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* ── Contact details ── */}
                  <div className="px-6 mb-5 space-y-2">
                    {caregiver.email && (
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <FaEnvelope className="text-slate-400 flex-shrink-0" size={11} />
                        <span className="truncate font-medium">{caregiver.email}</span>
                      </div>
                    )}
                    {caregiver.phone && (
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <FaPhone className="text-slate-400 flex-shrink-0" size={11} />
                        <span className="truncate font-medium">{caregiver.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="mt-auto px-6 pb-6 flex gap-2.5">
                    <button
                      onClick={() => navigate(`/profile/${caregiver.id}`)}
                      className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      View Profile
                    </button>
                    {connection.conversationId && (
                      <button
                        onClick={() => navigate('/messages')}
                        className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        <FaComments size={11} /> Message
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Connections;