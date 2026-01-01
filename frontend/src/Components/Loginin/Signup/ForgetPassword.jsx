import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080/api";

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
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
        {step === "username" && (
          <>
            <p className="mb-4 font-bold">Enter your username</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="border p-2 mb-4 w-full rounded bg-gray-200"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mb-4 font-bold">Enter OTP sent to your email</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              className="border p-2 mb-4 w-full rounded bg-gray-200"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === "resetPassword" && (
          <>
            <p className="mb-4 font-bold">Enter your new password</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="border p-2 mb-4 w-full rounded bg-gray-200"
            />
            <button
              onClick={resetPassword}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Reset Password
            </button>
          </>
        )}

        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgetPassword;
