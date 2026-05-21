import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaSync, FaCheck, FaHourglass } from 'react-icons/fa';

const SentInterests = ({ userId }) => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('jwtToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchSentInterests = async () => {
    try {
      setLoading(true);
      console.log('📤 Fetching sent interests for user:', userId);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/interest/sent-interests/${userId}`,
        axiosConfig
      );
      console.log('✅ Sent interests fetched:', response.data);
      setInterests(response.data || []);
    } catch (err) {
      console.error('❌ Error fetching sent interests:', err);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSentInterests();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading interests...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FaHeart className="text-red-600" />
            Sent Interests
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {interests.length} interest{interests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchSentInterests}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FaSync size={10} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {interests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
            <FaHeart size={18} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">No interests sent yet</p>
          <p className="text-xs text-slate-400 text-center max-w-[200px]">
            Browse caregivers and send interest to connect with them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => {
            const photoUrl = interest.caregiver?.photo
              ? `${import.meta.env.VITE_API_URL}/uploads/${interest.caregiver.photo.replace(/\s+/g, '_').trim()}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(interest.caregiver?.userName || 'Unknown')}&background=e8e8e8&color=333&bold=true`;

            const statusColor =
              interest.status === 'ACCEPTED'
                ? 'bg-green-50 text-green-600'
                : interest.status === 'REJECTED'
                ? 'bg-red-50 text-red-600'
                : 'bg-yellow-50 text-yellow-600';

            const statusIcon =
              interest.status === 'ACCEPTED' ? (
                <FaCheck size={14} />
              ) : interest.status === 'REJECTED' ? (
                <span>✗</span>
              ) : (
                <FaHourglass size={14} />
              );

            return (
              <div
                key={interest.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 flex items-start gap-3">
                    <img
                      src={photoUrl}
                      alt={interest.caregiver?.userName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{interest.caregiver?.userName || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sent: {new Date(interest.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${statusColor}`}>
                    {statusIcon}
                    {interest.status}
                  </span>
                </div>

                {/* Caregiver details */}
                <div className="mb-3 bg-slate-50 rounded-lg p-3 space-y-2">
                  {interest.caregiver?.speciality && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Speciality:</span>{' '}
                      <span className="text-slate-700">{interest.caregiver.speciality}</span>
                    </p>
                  )}
                  {interest.caregiver?.experience && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Experience:</span>{' '}
                      <span className="text-slate-700">{interest.caregiver.experience}</span>
                    </p>
                  )}
                  {interest.caregiver?.chargeMin && interest.caregiver?.chargeMax && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Rate:</span>{' '}
                      <span className="text-slate-700">
                        Rs. {interest.caregiver.chargeMin} - {interest.caregiver.chargeMax}/hr
                      </span>
                    </p>
                  )}
                </div>

                {/* Response date if responded */}
                {interest.respondedAt && (
                  <p className="text-xs text-slate-500">
                    Responded: {new Date(interest.respondedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SentInterests;
