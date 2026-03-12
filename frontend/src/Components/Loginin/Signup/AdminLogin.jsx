import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  // "login" | "forgot-email" | "forgot-otp" | "forgot-reset"
  const [step, setStep] = useState("login");

  // Login state
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  // Forgot password state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // Shared
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/admin/login`, {
        email: form.email.trim(),
        password: form.password.trim(),
      });
      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin/dashboard");
      } else if (res.data.error) {
        setMessage(res.data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/admin/forgetPassword`, { email });
      setMessage(res.data);
      if (res.data === "OTP sent to registered email!") {
        setStep("forgot-otp");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter the OTP.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/admin/verify-otp`, { email, otp });
      setMessage(res.data);
      if (res.data === "OTP verified!") {
        setStep("forgot-reset");
      }
    } catch (err) {
      console.error(err);
      setMessage("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const resetPassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}/admin/reset-password`, { email, newPassword });
      setMessage("Password reset successful! Redirecting to login...");
      setStep("login");
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setStep("login");
    setMessage("");
    setEmail("");
    setOtp("");
    setNewPassword("");
  };

  // ── Shared UI ─────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div className="hidden lg:flex w-5/12 bg-gray-200 flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-gray-300 opacity-40" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-gray-300 opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-gray-300 opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-gray-300 opacity-40" />
      <div className="relative z-10 flex items-center gap-3">
        <img src={logo} alt="ElderEase Logo" className="h-10 w-auto" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">ElderEase</h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase">Admin Control Panel</p>
        </div>
      </div>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mb-6">
          {step === "login" ? "🛡️" : "🔑"}
        </div>
        <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
          {step === "login" ? <>Secure<br />Admin<br />Access</> : <>Reset<br />Your<br />Password</>}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {step === "login"
            ? <>This portal is restricted to<br />authorized ElderEase administrators.<br />All activity is logged and monitored.</>
            : <>Follow the steps to securely<br />reset your admin password.<br />An OTP will be sent to your email.</>}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-gray-500 tracking-widest uppercase">System Operational</span>
      </div>
    </div>
  );

  const MobileBrand = () => (
    <div className="flex items-center gap-3 mb-8 lg:hidden">
      <img src={logo} alt="ElderEase Logo" className="h-9 w-auto" />
      <div>
        <h1 className="text-lg font-bold text-gray-800">ElderEase</h1>
        <p className="text-xs text-gray-400 tracking-widest uppercase">Admin Panel</p>
      </div>
    </div>
  );

  const Spinner = ({ label }) => (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      {label}
    </span>
  );

  return (
    <div className="min-h-screen w-screen flex bg-gray-100">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <MobileBrand />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

            {/* ── LOGIN ── */}
            {step === "login" && (
              <>
                <div className="mb-8">
                  <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Authentication Required</p>
                  <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                  <div className="w-8 h-0.5 bg-gray-300 mt-3 rounded-full" />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your admin email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-all p-1"
                    >
                      {showPass
                        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mb-6">
                  <span
                    onClick={() => { setStep("forgot-email"); setMessage(""); }}
                    className="text-sm text-gray-600 font-semibold cursor-pointer hover:underline"
                  >
                    Forgot Password?
                  </span>
                </div>

                {message && <p className="mt-1 mb-4 text-sm text-red-500 font-semibold">{message}</p>}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {loading ? <Spinner label="Verifying..." /> : "Authenticate"}
                </button>

                <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">ElderEase Admin Portal</span>
                  <button onClick={() => navigate("/")} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    ← Back to Home
                  </button>
                </div>
              </>
            )}

            {/* ── FORGOT STEP 1: Email ── */}
            {step === "forgot-email" && (
              <>
                <span
                  onClick={goBackToLogin}
                  className="text-sm text-gray-500 font-semibold cursor-pointer hover:underline mb-6 block"
                >
                  ← Back to Login
                </span>
                <div className="mb-6">
                  <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Admin Portal</p>
                  <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
                  <div className="w-8 h-0.5 bg-gray-300 mt-3 rounded-full" />
                </div>

                <p className="mb-4 text-sm text-gray-600">Enter your admin email to receive an OTP.</p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setMessage(""); }}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  placeholder="Admin Email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                />

                {message && <p className="mb-4 text-sm text-red-500 font-semibold">{message}</p>}

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-all"
                >
                  {loading ? <Spinner label="Sending..." /> : "Send OTP"}
                </button>
              </>
            )}

            {/* ── FORGOT STEP 2: OTP ── */}
            {step === "forgot-otp" && (
              <>
                <span
                  onClick={() => { setStep("forgot-email"); setMessage(""); }}
                  className="text-sm text-gray-500 font-semibold cursor-pointer hover:underline mb-6 block"
                >
                  ← Back
                </span>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Enter OTP</h2>
                  <div className="w-8 h-0.5 bg-gray-300 mt-3 rounded-full" />
                </div>

                <p className="mb-4 text-sm text-gray-600">OTP sent to <span className="font-semibold text-gray-800">{email}</span></p>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setMessage(""); }}
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all tracking-widest"
                />

                {message && <p className="mb-4 text-sm text-red-500 font-semibold">{message}</p>}

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-all"
                >
                  {loading ? <Spinner label="Verifying..." /> : "Verify OTP"}
                </button>
              </>
            )}

            {/* ── FORGOT STEP 3: New Password ── */}
            {step === "forgot-reset" && (
              <>
                <span
                  onClick={() => { setStep("forgot-otp"); setMessage(""); }}
                  className="text-sm text-gray-500 font-semibold cursor-pointer hover:underline mb-6 block"
                >
                  ← Back
                </span>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">New Password</h2>
                  <div className="w-8 h-0.5 bg-gray-300 mt-3 rounded-full" />
                </div>

                <p className="mb-4 text-sm text-gray-600">OTP verified! Enter your new admin password.</p>

                <div className="relative mb-4">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setMessage(""); }}
                    onKeyDown={(e) => e.key === "Enter" && resetPassword()}
                    placeholder="New Password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => setShowNewPass(!showNewPass)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-all p-1"
                  >
                    {showNewPass
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>

                {message && (
                  <p className={`mb-4 text-sm font-semibold ${message.includes("successful") ? "text-emerald-600" : "text-red-500"}`}>
                    {message}
                  </p>
                )}

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-all"
                >
                  {loading ? <Spinner label="Resetting..." /> : "Reset Password"}
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}