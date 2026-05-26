import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AcceptedConnections from '../Chat/AcceptedConnections';

const ProfileReceiver = () => {
  const { userId } = useParams(); // The ID of the Care Receiver
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [caregiver, setCaregiver] = useState(null);
  const [profileAccepted, setProfileAccepted] = useState(false);
  const [interestRequests, setInterestRequests] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("jwtToken");
  const caregiverUserId = localStorage.getItem("userId");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const queryParams = new URLSearchParams(location.search);
  const requestSource = queryParams.get("source");
  const bookingId = queryParams.get("bookingId");

  useEffect(() => {
    if (!token || !userId || !caregiverUserId) {
      navigate("/login");
      return;
    }

    const initializePage = async () => {
      try {
        setLoading(true);

        // 1. Get User Profile Data
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, axiosConfig);
        console.log("👤 User Profile Data:", userRes.data);
        setUserProfile(userRes.data);

        // 2. Get Caregiver Profile Data (to get the internal caregiver.id)
        const cgRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers/user/${caregiverUserId}`, axiosConfig);
        setCaregiver(cgRes.data);

        // 3. PERSISTENCE CHECK: Verify if this user is already in your accepted list
        if (cgRes.data && cgRes.data.id) {
          const connectionsRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/chat/accepted-for-caregiver/${cgRes.data.id}`,
            axiosConfig
          );
          
          // If the current userId exists in the accepted connections, skip the buttons
          const isAlreadyConnected = (connectionsRes.data || []).some(
            conn => conn.user?.id === userId || conn.userId === userId
          );

          if (isAlreadyConnected) {
            setProfileAccepted(true);
          }

          // Fetch caregiver-related request context for blurred background
          axios.get(`${import.meta.env.VITE_API_URL}/api/interest/pending-requests/${cgRes.data.id}`, axiosConfig)
            .then((reqRes) => setInterestRequests(Array.isArray(reqRes.data) ? reqRes.data : []))
            .catch((err) => console.error("Background interest fetch error:", err.message));

          axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/caregiver/${cgRes.data.id}`, axiosConfig)
            .then((bookRes) => setBookingRequests(Array.isArray(bookRes.data) ? bookRes.data : []))
            .catch((err) => console.error("Background booking fetch error:", err.message));
        }

      } catch (err) {
        console.error("Initialization Error:", err);
        setError("Failed to load care profile data.");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [userId, caregiverUserId, navigate, token]);

  const handleAccept = async () => {
    if (!caregiver) {
      setErrorMessage("Caregiver information not loaded. Please refresh the page.");
      setShowErrorModal(true);
      return;
    }
    setActionLoading(true);
    try {
      // Endpoint that updates connection status to ACCEPTED
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/caregivers/${caregiver.id}/accept-request`, 
        { userId }, 
        axiosConfig
      );
      setProfileAccepted(true);
    } catch (err) {
      console.error("Accept Error:", err);
      setErrorMessage("Could not accept request. Please try again.");
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!caregiver) {
      setErrorMessage("Caregiver information not loaded. Please refresh the page.");
      setShowErrorModal(true);
      return;
    }
    setActionLoading(true);
    try {
      if (requestSource === "booking" && bookingId) {
        // Cancel the actual booking request when declined from booking profile
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`,
          {},
          axiosConfig
        );
      } else {
        // Use the same decline endpoint for interest requests
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/caregivers/${caregiver.id}/decline-request`,
          { userId },
          axiosConfig
        );
      }
      try { window.dispatchEvent(new Event('acceptedConnectionsChanged')); } catch(e) { console.warn(e); }
      try { window.dispatchEvent(new Event('requestsChanged')); } catch(e) { console.warn(e); }
      // Go back to dashboard after declining
      navigate(-1);
    } catch (err) {
      console.error("Decline Error:", err);
      setErrorMessage("Failed to decline request. Please try again.");
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConnection = () => {
    if (!caregiver) {
      setErrorMessage("Caregiver information not loaded. Please refresh the page.");
      setShowErrorModal(true);
      return;
    }
    setShowRemoveConfirm(true);
  };

  const confirmRemoveConnection = async () => {
    if (!caregiver) {
      setErrorMessage("Caregiver information not loaded. Please refresh the page.");
      setShowErrorModal(true);
      setShowRemoveConfirm(false);
      return;
    }

    setActionLoading(true);
    try {
      console.log('Removing connection...', { caregiverId: caregiver.id, userId });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/caregivers/${caregiver.id}/remove-connection`, 
        { userId }, 
        axiosConfig
      );
      
      console.log('Connection removed:', response.data);

      setInterestRequests((current) => current.filter(
        (request) => request.user?.id !== userId && request.userId !== userId
      ));

      window.dispatchEvent(new Event('acceptedConnectionsChanged'));
      setShowRemoveConfirm(false);
      setSuccessMessage("Connection removed successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Remove Connection Error Details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setErrorMessage("Failed to remove connection. Please try again.");
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-red-500 font-bold">{error}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-200 rounded-lg">Go Back</button>
    </div>
  );

  // Handle both full URLs and filenames
  const photoUrl = userProfile?.photo 
    ? userProfile.photo.startsWith('http') 
      ? userProfile.photo  // Already a full URL
      : `${import.meta.env.VITE_API_URL}/uploads/${userProfile.photo.replace(/\s+/g, "_")}`  // Just a filename
    : `https://ui-avatars.com/api/?name=${userProfile?.userName}&background=random`;

  // Check if profile is organization
  const isOrganization = userProfile?.accountType === "ORGANIZATION";

  // Get organization photos
  const getOrgPhotoUrl = (photo) => {
    if (!photo) return null;
    if (typeof photo === 'string') {
      return photo.startsWith('http') 
        ? photo 
        : `${import.meta.env.VITE_API_URL}/uploads/${photo.replace(/\s+/g, "_")}`;
    }
    return null;
  };

  const orgPhotos = userProfile?.organizationPhotos 
    ? (Array.isArray(userProfile.organizationPhotos) 
      ? userProfile.organizationPhotos.map(getOrgPhotoUrl).filter(url => url !== null)
      : [])
    : [];

  return (
    <div className="min-h-screen w-screen relative bg-slate-950 text-slate-200 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-3xl" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-[56px] bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
          {interestRequests.slice(0, 2).map((request) => (
            <div
              key={request.id}
              className="w-72 h-40 rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 mb-3">Interest</p>
              <p className="text-xl font-semibold text-white">{request.user?.userName || 'Care Receiver'}</p>
              <p className="text-sm text-slate-300 mt-2">{request.user?.serviceType || 'Care interest request'}</p>
              <p className="mt-4 text-[11px] text-slate-400">{request.sentAt ? new Date(request.sentAt).toLocaleDateString() : 'Just now'}</p>
            </div>
          ))}
          {bookingRequests.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className="w-72 h-40 rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 mb-3">Booking</p>
              <p className="text-xl font-semibold text-white">{booking.userName || booking.user?.userName || 'Care Receiver'}</p>
              <p className="text-sm text-slate-300 mt-2">{booking.serviceType || 'Booking request'}</p>
              <p className="mt-4 text-[11px] text-slate-400">{booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'No date yet'}</p>
            </div>
          ))}
        </div>
      </div>

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Confirm remove</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Remove connection</h2>
              </div>
              <button
                className="text-slate-500 transition hover:text-slate-800"
                onClick={() => setShowRemoveConfirm(false)}
                aria-label="Close confirmation dialog"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Remove the connection with <span className="font-semibold text-slate-900">{userProfile?.userName}</span>? This action can be reversed later.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveConnection}
                disabled={actionLoading}
                className="w-full rounded-3xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
              >
                {actionLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-[32px] border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Error</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Something went wrong</h2>
              </div>
              <button
                className="text-slate-500 hover:text-slate-800"
                onClick={() => setShowErrorModal(false)}
                aria-label="Close error dialog"
              >
               
              </button>
            </div>
            <p className="mt-4 text-slate-600">{errorMessage}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-[32px] border border-emerald-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">Success</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Connection removed</h2>
              </div>
              <button
                className="text-slate-500 hover:text-slate-800"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(-1);
                }}
                aria-label="Close success dialog"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-slate-600">{successMessage}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(-1);
                }}
                className="rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-900/90 via-slate-900/25 to-transparent" />
            <div className="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-slate-600">{isOrganization ? 'Organization Profile' : 'Care Receiver Profile'}</p>
                <h1 className="text-2xl font-bold text-slate-900">{isOrganization ? 'Organization details' : 'Request details'}</h1>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 transition"
              >
                ×
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900/95 shadow-xl">
                  <div className="relative h-80 overflow-hidden">
                    <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-3xl font-black tracking-tight">
                        {isOrganization ? userProfile?.organizationName : userProfile?.userName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-200/90">
                        {isOrganization ? userProfile?.city : userProfile?.address || 'Location unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 p-6 bg-slate-950/95">
                    <div className="rounded-3xl bg-slate-900/90 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Status</p>
                      <p className="mt-2 text-sm font-semibold text-white">{profileAccepted ? 'Connected' : 'Pending'}</p>
                    </div>
                    <div className="grid gap-3">
                      {isOrganization ? (
                        <>
                          <div className="rounded-3xl bg-slate-900/90 p-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Organization</p>
                            <p className="mt-2 font-semibold text-white">{userProfile?.organizationName || 'N/A'}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-900/90 p-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Capacity</p>
                            <p className="mt-2 font-semibold text-white">{userProfile?.capacity ? `${userProfile.capacity} beds` : 'N/A'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-3xl bg-slate-900/90 p-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Service Requested</p>
                            <p className="mt-2 font-semibold text-white">{userProfile?.serviceType || 'General Care'}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-900/90 p-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Care For</p>
                            <p className="mt-2 font-semibold text-white">{userProfile?.receiverType === 'other' ? 'Someone Else' : 'Myself'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Individual Profile Display */}
                  {!isOrganization && (
                    <>
                      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-wrap items-center gap-4">
                          <div className="rounded-3xl bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                            {userProfile?.receiverType === 'other' ? 'Someone Else' : 'Self'}
                          </div>
                          <div className={`rounded-3xl px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${profileAccepted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {profileAccepted ? 'Connected' : 'Pending'}
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Location</p>
                            <p className="font-semibold text-slate-900">{userProfile?.address || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Phone</p>
                            <p className="font-semibold text-slate-900">{userProfile?.phoneNumber || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Gender</p>
                            <p className="font-semibold text-slate-900">{userProfile?.gender || 'Not specified'}</p>
                          </div>
                          {userProfile?.receiverType === 'other' && (
                            <>
                              <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Relation</p>
                                <p className="font-semibold text-slate-900">{userProfile?.recipientRelation || 'Not specified'}</p>
                              </div>
                              <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Recipient Age</p>
                                <p className="font-semibold text-slate-900">{userProfile?.recipientAge ? `${userProfile.recipientAge} years` : 'Not specified'}</p>
                              </div>
                              <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Contact</p>
                                <p className="font-semibold text-slate-900">{userProfile?.recipientPhone || 'Not specified'}</p>
                              </div>
                              <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Recipient Gender</p>
                                <p className="font-semibold text-slate-900">{userProfile?.recipientGender || 'Not specified'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {userProfile?.additionalInfo && (
                        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">Additional Information</h3>
                          <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{userProfile.additionalInfo}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Organization Profile Display */}
                  {isOrganization && (
                    <>
                      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-5">Organization Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Organization Name</p>
                            <p className="font-semibold text-slate-900">{userProfile?.organizationName || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Founded</p>
                            <p className="font-semibold text-slate-900">{userProfile?.foundationDate ? new Date(userProfile.foundationDate).toLocaleDateString() : 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Capacity (Beds)</p>
                            <p className="font-semibold text-slate-900">{userProfile?.capacity || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">City/District</p>
                            <p className="font-semibold text-slate-900">{userProfile?.city || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">License Number</p>
                            <p className="font-semibold text-slate-900">{userProfile?.licenseNumber || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Registration Number</p>
                            <p className="font-semibold text-slate-900">{userProfile?.registrationNumber || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4 md:col-span-2">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Address</p>
                            <p className="font-semibold text-slate-900">{userProfile?.address || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Phone Number</p>
                            <p className="font-semibold text-slate-900">{userProfile?.phoneNumber || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Website</p>
                            <p className="font-semibold text-slate-900">
                              {userProfile?.website ? (
                                <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {userProfile.website}
                                </a>
                              ) : 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-5">Contact Person</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Name</p>
                            <p className="font-semibold text-slate-900">{userProfile?.contactPersonName || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Title</p>
                            <p className="font-semibold text-slate-900">{userProfile?.contactPersonTitle || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1 rounded-3xl bg-slate-50 p-4 md:col-span-2">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Phone</p>
                            <p className="font-semibold text-slate-900">{userProfile?.contactPersonPhone || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      {userProfile?.aboutOrganization && (
                        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">About Organization</h3>
                          <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{userProfile.aboutOrganization}</p>
                        </div>
                      )}

                      {orgPhotos.length > 0 && (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                          <h3 className="text-lg font-bold text-slate-900 mb-5">🏢 Organization Photos</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {orgPhotos.map((photoUrl, index) => (
                              <div key={index} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition">
                                <img
                                  src={photoUrl}
                                  alt={`Organization ${index + 1}`}
                                  className="w-full h-32 object-cover hover:scale-105 transition"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  {/* Action Buttons */}
                  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-slate-900">Action</h3>
                      {profileAccepted ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-[0.2em]">Connected</span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 uppercase tracking-[0.2em]">Pending</span>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {profileAccepted ? (
                        <button
                          onClick={handleRemoveConnection}
                          disabled={actionLoading}
                          className="w-full rounded-3xl bg-red-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionLoading ? 'Removing...' : 'Remove Connection'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleAccept}
                            disabled={actionLoading}
                            className="w-full rounded-3xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                          >
                            {actionLoading ? 'Processing...' : 'Accept & Start Chat'}
                          </button>
                          <button
                            onClick={handleDecline}
                            disabled={actionLoading}
                            className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            Decline Request
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileReceiver;