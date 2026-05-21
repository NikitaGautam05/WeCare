import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState("username"); // "username", "otp", "resetPassword"

  // Send OTP
  const sendOtp = async () => {
    if (!username) {
      setMessage("Please enter your username.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/forgetPassword`, { username });
      setMessage(res.data);
      if (res.data === "OTP sent to registered email!") {
        setStep("otp");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, { username, otp });
      setMessage(res.data);
      if (res.data === "OTP verified!") {
        setStep("resetPassword");
      }
    } catch (error) {
      console.error(error);
      setMessage("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password (simple, just clears fields)
  const resetPassword = () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }
    setMessage("Password reset successful! Redirecting to Dashboard");
    setStep("username");
    setUsername("");
    setOtp("");
    setNewPassword("");
    navigate("/dash");
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          opacity: '0.55'
        }}
      ></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-emerald-100/40 rounded-full blur-3xl opacity-60" style={{animation: 'float 25s infinite ease-in-out'}}></div>
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl opacity-50" style={{animation: 'float 30s infinite ease-in-out 2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          <div className="bg-slate-90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 relative overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
              <p className="text-xs text-slate-500 font-medium mt-2">Reset your account password securely</p>
            </div>

            <div className="space-y-5">
              {step === "username" && (
                <div className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              )}

              {step === "otp" && (
                <div className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {step === "resetPassword" && (
                <div className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    onClick={resetPassword}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>

            {message && <p className="mt-4 text-sm text-red-600 text-center">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
