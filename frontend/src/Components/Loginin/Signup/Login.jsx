import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const normalizeRole = (role) => (role || "").toUpperCase().replace(/\s+/g, "");

  const resetStaleSession = (newRole, newUserId, newCaregiverId) => {
    const existingRole = normalizeRole(localStorage.getItem("role"));
    const existingUserId = localStorage.getItem("userId");
    const existingCaregiverId = localStorage.getItem("caregiverId");
    const normalizedRole = normalizeRole(newRole);

    const sameSession =
      existingRole === normalizedRole &&
      existingUserId === newUserId &&
      (normalizedRole !== "CAREGIVER" || existingCaregiverId === newCaregiverId);

    if (!sameSession && (existingRole || existingUserId || existingCaregiverId)) {
      localStorage.clear();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("🔐 Attempting login to:", `${import.meta.env.VITE_API_URL}/api/users/login`);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        userName: userName.trim(),
        password: password.trim()
      });

      console.log("📦 Login response received:", response.data);
      console.log("🔑 Token field:", response.data.token);

      if (response.data.token) {
        // Get the selected role from localStorage (from OptionLogin component)
        const selectedRole = localStorage.getItem("selectedRole");
        const actualRole = (response.data.role || "USER").toUpperCase();
        const selectedRoleNormalized = (selectedRole || "").toUpperCase();

        // Validate that selected role matches actual role in database
        if (selectedRole && selectedRoleNormalized !== actualRole) {
          // Role mismatch - show error message
          const roleDisplayName = actualRole.includes("CAREGIVER") ? "Caregiver" : "Care Receiver";
          setMessage(`This account is registered as a ${roleDisplayName}. Please select the correct role to login.`);
          
          console.warn("Role mismatch detected:", {
            selectedRole: selectedRoleNormalized,
            actualRole: actualRole,
            userName: response.data.userName
          });
          
          return; // Don't proceed with login
        }

        // Clear any stale session if the current login differs from the previous session
        resetStaleSession(actualRole, response.data.userId, response.data.caregiverId);

        // Save everything needed
        localStorage.setItem("jwtToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);      
        localStorage.setItem("userName", response.data.userName);   
        localStorage.setItem("role", actualRole);       
        localStorage.setItem("email", response.data.email);    
        
        // If user is a caregiver, also store caregiverId
        if (response.data.caregiverId) {
          localStorage.setItem("caregiverId", response.data.caregiverId);
        }
        localStorage.removeItem("selectedRole");
        
        // DEBUG: Log what was saved
        console.log("Login successful:", {
          userId: response.data.userId,
          caregiverId: response.data.caregiverId,
          role: actualRole,
          userName: response.data.userName
        });

        const normalizedRole = actualRole.toLowerCase().replace(/\s/g,'');
        if (normalizedRole.includes("caregiver")) navigate("/welcome");
        else navigate("/dash");

      } else if (response.data.error) {
        setMessage(response.data.error);
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("📡 Response status:", error.response?.status);
      console.error("📦 Response data:", error.response?.data);
      setMessage(error.response?.data || "Login failed");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      
      // We tell the backend we are trying to login
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/google-signup`, {
        token: token,
        mode: "LOGIN" 
      });

      if (res.data.error) {
        setMessage(res.data.error);
        return;
      }

      if (res.data.token) {
        // 1. Get the actual role from database
        const actualRole = (res.data.role || "USER").toUpperCase();
        
        // 2. Get the selected role from localStorage (from OptionLogin component)
        const selectedRole = localStorage.getItem("selectedRole");
        const selectedRoleNormalized = (selectedRole || "").toUpperCase();

        // Validate that selected role matches actual role in database
        if (selectedRole && selectedRoleNormalized !== actualRole) {
          // Role mismatch - show error message
          const roleDisplayName = actualRole.includes("CAREGIVER") ? "Caregiver" : "Care Receiver";
          setMessage(`This account is registered as a ${roleDisplayName}. Please select the correct role to login.`);
          
          console.warn("Role mismatch detected in Google login:", {
            selectedRole: selectedRoleNormalized,
            actualRole: actualRole,
            userName: res.data.userName
          });
          
          return; // Don't proceed with login
        }

        // Clear any stale session if the current login differs from the previous session
        resetStaleSession(actualRole, res.data.userId, res.data.caregiverId);

        // 3. Save all details to localStorage
        localStorage.setItem("jwtToken", res.data.token);
        localStorage.setItem("userId", res.data.userId); 
        localStorage.setItem("userName", res.data.userName); 
        localStorage.setItem("role", actualRole);
        localStorage.setItem("email", res.data.email);
        
        // If user is a caregiver, also store caregiverId
        if (res.data.caregiverId) {
          localStorage.setItem("caregiverId", res.data.caregiverId);
        }
        localStorage.removeItem("selectedRole");

        // 4. Redirect based on the REAL role
        if (actualRole.includes("CAREGIVER")) {
          navigate("/welcome"); 
        } else {
          navigate("/dash");
        }
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setMessage(err.response?.data?.error || "Google login failed");
    }
  };
    
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* ─── BLURRY BACKGROUND IMAGE ─── */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          opacity: '0.6'
        }}
      ></div>

      {/* ─── ANIMATED OVERLAY SHAPES ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-emerald-100/40 rounded-full blur-3xl animate-pulse opacity-60" style={{animation: 'float 25s infinite ease-in-out'}}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl animate-pulse opacity-50" style={{animation: 'float 30s infinite ease-in-out 2s'}}></div>
      </div>

      {/* ─── HOME BUTTON ─── */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 group px-6 py-2.5 rounded-full font-semibold text-sm text-slate-700 hover:text-slate-900 transition-all duration-300 hover:bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md"
      >
        ← Home
      </button>

      {/* ─── MAIN LOGIN CARD ─── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Card Background */}
          <div className="bg-slate-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 relative overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* Decorative top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* ─── HEADER ─── */}
              <div className="text-center space-y-1 mb-5">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200">
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 uppercase tracking-widest">
                    Welcome Back
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-700 tracking-tight mt-2">Log In</h1>
                <p className="text-sm text-slate-900 font-medium mt-1">Access your ElderEase account</p>
              </div>

              {/* ─── USERNAME INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="john_doe"
                    value={userName} 
                    onChange={e => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-300"
                    required
                  />
                  {userName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── PASSWORD INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-300 pr-10"
                    required
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowPassword(!showPassword)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </span>
                </div>
              </div>

              {/* ─── FORGOT PASSWORD ─── */}
              <div className="flex justify-end pt-1">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/forgetPassword')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate('/forgetPassword');
                  }}
                  className="text-sm font-semibold text-slate-900 hover:text-blue-700 underline underline-offset-2 transition-colors duration-200 cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>

              {/* ─── ERROR MESSAGE ─── */}
              {message && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-bold text-red-700">⚠ {message}</p>
                </div>
              )}

              {/* ─── LOGIN BUTTON ─── */}
              <button
                type="submit"
                className="w-full mt-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </button>

              {/* ─── DIVIDER ─── */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/80 text-slate-500 font-semibold">OR CONTINUE WITH</span>
                </div>
              </div>

              {/* ─── GOOGLE LOGIN ─── */}
              <div className="flex justify-center scale-95 origin-center">
                <GoogleLogin 
                  onSuccess={handleGoogleLogin} 
                  onError={() => setMessage("Google login failed")}
                />
              </div>

              {/* ─── FOOTER LINK ─── */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600 font-medium">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup", { state: { mode: "SIGNUP" } })}
                    className="text-slate-100 font-semibold hover:text-blue-700 hover:underline underline-offset-2 transition-all duration-200"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ─── CUSTOM ANIMATIONS ─── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(0px); }
          75% { transform: translateY(-20px) translateX(-10px); }
        }
        
        input::placeholder {
          color: rgba(71, 85, 105, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Login;