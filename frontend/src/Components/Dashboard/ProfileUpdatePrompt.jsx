import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const ProfileUpdatePrompt = ({ onClose, userId, onProfileUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkProfileUpdatePrompt();
  }, [userId]);

  const checkProfileUpdatePrompt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/sessions/${userId}/check-prompt`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.needsPrompt) {
        setIsVisible(true);
        console.log('📋 Profile update prompt triggered at session:', response.data.completedSessions);
      }
    } catch (err) {
      console.error('Error checking profile update prompt:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Mark as prompted
      await axios.put(
        `http://localhost:8080/api/sessions/${userId}/mark-prompted`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsVisible(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      console.error('Error marking as prompted:', err);
    }
  };

  const handleDismiss = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/sessions/${userId}/mark-prompted`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsVisible(false);
    } catch (err) {
      console.error('Error dismissing prompt:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Great Progress! 🎉</h3>
              <p className="text-xs text-slate-500">You've completed 10 sessions!</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            Your profile has helped many caregivers find you. Consider updating your information to reflect your current needs and preferences.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-700 font-medium">
              💡 Tip: Updated profiles attract more quality caregivers and matches!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpdateProfile}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-lg shadow-green-200"
          >
            Update Profile
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-4">
          You'll be prompted again after 10 more sessions
        </p>
      </div>
    </div>
  );
};

export default ProfileUpdatePrompt;
