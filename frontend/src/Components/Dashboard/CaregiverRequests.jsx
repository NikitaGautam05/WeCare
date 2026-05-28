import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheck, FaTimes, FaSync } from 'react-icons/fa';

const CaregiverRequests = ({ caregiverId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const token = localStorage.getItem('jwtToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const resolvedCaregiverId = caregiverId || localStorage.getItem('userId');
      console.log('📥 Fetching pending requests for caregiver:', resolvedCaregiverId);
      if (!resolvedCaregiverId) {
        throw new Error('No caregiver ID available to fetch interest requests.');
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/interest/pending-requests/${resolvedCaregiverId}`,
        axiosConfig
      );
      console.log('✅ Requests fetched:', response.data);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caregiverId) {
      fetchRequests();
    }
  }, [caregiverId]);

  useEffect(() => {
    const handler = () => {
      console.log('🔄 CaregiverRequests refetching due to external event');
      fetchRequests();
    };
    window.addEventListener('acceptedConnectionsChanged', handler);
    window.addEventListener('requestsChanged', handler);
    return () => {
      window.removeEventListener('acceptedConnectionsChanged', handler);
      window.removeEventListener('requestsChanged', handler);
    };
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setActingOn(requestId);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/interest/accept/${requestId}`,
        {},
        axiosConfig
      );
      try { window.dispatchEvent(new Event('acceptedConnectionsChanged')); } catch(e) { console.warn(e); }
      try { window.dispatchEvent(new Event('requestsChanged')); } catch(e) { console.warn(e); }
      alert('✅ Interest accepted! You can now chat with this care receiver.');
      // Refresh to ensure we have the latest data only after the action succeeds
      fetchRequests();
    } catch (err) {
      console.error('❌ Error accepting request:', err);
      alert('Failed to accept request');
      fetchRequests();
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActingOn(requestId);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/interest/reject/${requestId}`,
        {},
        axiosConfig
      );
      try { window.dispatchEvent(new Event('acceptedConnectionsChanged')); } catch(e) { console.warn(e); }
      try { window.dispatchEvent(new Event('requestsChanged')); } catch(e) { console.warn(e); }
      alert('Request declined');
      // Refresh to ensure we have the latest data only after the action succeeds
      fetchRequests();
    } catch (err) {
      console.error('❌ Error rejecting request:', err);
      alert('Failed to reject request');
      fetchRequests();
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FaBell className="text-blue-600" />
            Care Receiver Requests
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FaSync size={10} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
            <FaBell size={18} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">No pending requests</p>
          <p className="text-xs text-slate-400 text-center max-w-[200px]">
            Care receivers will send you interest requests to connect
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const photoUrl = request.user?.photo
              ? `${import.meta.env.VITE_API_URL}/uploads/${request.user.photo.replace(/\s+/g, '_').trim()}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user?.userName || 'Unknown')}&background=e8e8e8&color=333&bold=true`;

            return (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 flex items-start gap-3">
                    <img
                      src={photoUrl}
                      alt={request.user?.userName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{request.user?.userName || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sent: {new Date(request.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    PENDING
                  </span>
                </div>

                {/* Care details */}
                <div className="mb-4 bg-slate-50 rounded-lg p-3 space-y-2">
                  {request.user?.serviceType && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Care Type:</span>{' '}
                      <span className="text-slate-700">{request.user.serviceType}</span>
                    </p>
                  )}
                  {request.user?.address && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Location:</span>{' '}
                      <span className="text-slate-700">{request.user.address}</span>
                    </p>
                  )}
                  {request.user?.accountType === 'ORGANIZATION' && (
                    <p className="text-xs">
                      <span className="font-bold text-slate-600">Type:</span>{' '}
                      <span className="text-slate-700">🏢 Organization</span>
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={actingOn === request.id}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    <FaTimes size={14} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={actingOn === request.id}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-200"
                  >
                    <FaCheck size={14} />
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaregiverRequests;
