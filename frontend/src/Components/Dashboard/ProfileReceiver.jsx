import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AcceptedConnections from '../Chat/AcceptedConnections';

const ProfileReceiver = () => {
  const { userId } = useParams(); // The ID of the Care Receiver
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [caregiver, setCaregiver] = useState(null);
  const [profileAccepted, setProfileAccepted] = useState(false);

  const token = localStorage.getItem("jwtToken");
  const caregiverUserId = localStorage.getItem("userId");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token || !userId || !caregiverUserId) {
      navigate("/login");
      return;
    }

    const initializePage = async () => {
      try {
        setLoading(true);

        // 1. Get User Profile Data
        const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig);
        console.log("👤 User Profile Data:", userRes.data);
        setUserProfile(userRes.data);

        // 2. Get Caregiver Profile Data (to get the internal caregiver.id)
        const cgRes = await axios.get(`http://localhost:8080/api/caregivers/user/${caregiverUserId}`, axiosConfig);
        setCaregiver(cgRes.data);

        // 3. PERSISTENCE CHECK: Verify if this user is already in your accepted list
        if (cgRes.data && cgRes.data.id) {
          const connectionsRes = await axios.get(
            `http://localhost:8080/api/chat/accepted-for-caregiver/${cgRes.data.id}`,
            axiosConfig
          );
          
          // If the current userId exists in the accepted connections, skip the buttons
          const isAlreadyConnected = (connectionsRes.data || []).some(
            conn => conn.user?.id === userId || conn.userId === userId
          );

          if (isAlreadyConnected) {
            setProfileAccepted(true);
          }
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
    if (!caregiver) return;
    setActionLoading(true);
    try {
      // Endpoint that updates connection status to ACCEPTED
      await axios.post(
        `http://localhost:8080/api/caregivers/${caregiver.id}/accept-request`, 
        { userId }, 
        axiosConfig
      );
      setProfileAccepted(true);
    } catch (err) {
      console.error("Accept Error:", err);
      alert("Could not accept request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!caregiver) return;
    setActionLoading(true);
    try {
      // Use the same decline endpoint for both pending and accepted requests
      await axios.post(
        `http://localhost:8080/api/caregivers/${caregiver.id}/decline-request`, 
        { userId }, 
        axiosConfig
      );
      // Go back to dashboard after declining
      navigate(-1);
    } catch (err) {
      console.error("Decline Error:", err);
      alert("Failed to decline request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!caregiver) {
      alert("Caregiver information not loaded. Please refresh the page.");
      return;
    }
    if (!window.confirm('Remove this connection?')) return;
    
    setActionLoading(true);
    try {
      console.log('Removing connection...', { caregiverId: caregiver.id, userId });
      
      // Remove the accepted connection
      const response = await axios.post(
        `http://localhost:8080/api/caregivers/${caregiver.id}/remove-connection`, 
        { userId }, 
        axiosConfig
      );
      
      console.log('Connection removed:', response.data);
      // Navigate back to dashboard after removing connection
      navigate(-1);
    } catch (err) {
      console.error("Remove Connection Error Details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert("Failed to remove connection. Please try again.");
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
      : `http://localhost:8080/uploads/${userProfile.photo.replace(/\s+/g, "_")}`  // Just a filename
    : `https://ui-avatars.com/api/?name=${userProfile?.userName}&background=random`;

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </button>

        {profileAccepted ? (
          /* ACCEPTED VIEW: Show Profile with chat and Remove option */
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            {/* Header with Remove button */}
            <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">Connected</p>
                <p className="text-xs text-slate-500">You can message and view profile below</p>
              </div>
              <button
                onClick={handleRemoveConnection}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {actionLoading ? "..." : "Remove"}
              </button>
            </div>

            {/* Profile Section */}
            <div className="h-72 bg-slate-200 relative">
              <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <h1 className="text-4xl font-black tracking-tight">{userProfile?.userName}</h1>
                <p className="text-white/80 font-medium">{userProfile?.address}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-10 border-b border-slate-200">
              {userProfile?.accountType === 'ORGANIZATION' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Organization Name</p>
                      <p className="font-bold text-slate-800">{userProfile.organizationName || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Foundation Date</p>
                      <p className="font-bold text-slate-800">{userProfile.foundationDate || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                      <p className="font-bold text-slate-800">{userProfile.capacity ? `${userProfile.capacity} beds` : "N/A"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="font-bold text-slate-800">{userProfile.city || userProfile.address || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License</p>
                      <p className="font-bold text-slate-800">{userProfile.licenseNumber || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registration</p>
                      <p className="font-bold text-slate-800">{userProfile.registrationNumber || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Person</p>
                      <p className="font-bold text-slate-800">{userProfile.contactPersonName || "Not specified"}</p>
                      <p className="text-sm text-slate-500 mt-1">{userProfile.contactPersonTitle || "Title not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                      <p className="font-bold text-slate-800">{userProfile.contactPersonPhone || "Not specified"}</p>
                    </div>
                  </div>
                  {(userProfile.website || userProfile.aboutOrganization) && (
                    <div className="space-y-4">
                      {userProfile.website && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website</p>
                          <a href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                            {userProfile.website}
                          </a>
                        </div>
                      )}
                      {userProfile.aboutOrganization && (
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-600 leading-relaxed">
                          <h3 className="font-bold text-slate-900 mb-2">About Organization</h3>
                          <p>{userProfile.aboutOrganization}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Requested</p>
                      <p className="font-bold text-slate-800">{userProfile?.serviceType || "General Care"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Care For</p>
                      <p className="font-bold text-slate-800">{userProfile?.receiverType === 'other' ? "Family Member" : "Self"}</p>
                    </div>
                  </div>
                  {userProfile?.additionalInfo && (
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3">Additional Information</h3>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-600 leading-relaxed">
                        {userProfile.additionalInfo}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat Section */}
            <div className="p-8">
              <h2 className="font-bold text-slate-900 mb-4">Messages</h2>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <AcceptedConnections userType="caregiver" caregiverId={caregiver?.id} />
              </div>
            </div>
          </div>
        ) : (
          /* PENDING VIEW: Show Profile and Action Buttons */
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-72 bg-slate-200 relative">
              <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <h1 className="text-4xl font-black tracking-tight">{userProfile?.userName}</h1>
                <p className="text-white/80 font-medium">{userProfile?.address}</p>
              </div>
            </div>

            <div className="p-10">
              {userProfile?.accountType === 'ORGANIZATION' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Organization Name</p>
                      <p className="font-bold text-slate-800">{userProfile.organizationName || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Founded</p>
                      <p className="font-bold text-slate-800">{userProfile.foundationDate || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                      <p className="font-bold text-slate-800">{userProfile.capacity ? `${userProfile.capacity} beds` : "N/A"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="font-bold text-slate-800">{userProfile.city || userProfile.address || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License</p>
                      <p className="font-bold text-slate-800">{userProfile.licenseNumber || "Not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registration</p>
                      <p className="font-bold text-slate-800">{userProfile.registrationNumber || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Person</p>
                      <p className="font-bold text-slate-800">{userProfile.contactPersonName || "Not specified"}</p>
                      <p className="text-sm text-slate-500 mt-1">{userProfile.contactPersonTitle || "Title not specified"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                      <p className="font-bold text-slate-800">{userProfile.contactPersonPhone || "Not specified"}</p>
                    </div>
                  </div>
                  {(userProfile.website || userProfile.aboutOrganization) && (
                    <div className="space-y-4">
                      {userProfile.website && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website</p>
                          <a href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                            {userProfile.website}
                          </a>
                        </div>
                      )}
                      {userProfile.aboutOrganization && (
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-600 leading-relaxed">
                          <h3 className="font-bold text-slate-900 mb-2">About Organization</h3>
                          <p>{userProfile.aboutOrganization}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Requested</p>
                      <p className="font-bold text-slate-800">{userProfile?.serviceType || "General Care"}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Care For</p>
                      <p className="font-bold text-slate-800">{userProfile?.receiverType === 'other' ? "Family Member" : "Self"}</p>
                    </div>
                  </div>
                  {userProfile?.additionalInfo && (
                    <div className="mb-10">
                      <h3 className="font-bold text-slate-900 mb-3">Additional Information</h3>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-600 leading-relaxed">
                        {userProfile.additionalInfo}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-1 bg-black text-white h-16 rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-black/10"
                >
                  {actionLoading ? "Processing..." : "Accept & Start Chat"}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 border border-slate-200 h-16 rounded-2xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileReceiver;