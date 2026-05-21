import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || "USER";

  const [showPassword, setShowPassword] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [setupError, setSetupError] = useState("");

  const [user, setUser] = useState({
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
    accountType: "INDIVIDUAL",
  });
  const [userErrors, setUserErrors] = useState({
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupForm, setSetupForm] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    accountType: "INDIVIDUAL",
  });
  const [setupErrors, setSetupErrors] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
  });

  // Validation functions
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return "Password must include special characters (e.g., !@#$%^&*)";
    }
    return "";
  };

  const validateUsername = (username) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, underscore, and hyphen";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Clear errors on change
    if (name === "email") {
      setUserErrors({ ...userErrors, email: "" });
    }
    
    // Validate password
    if (name === "password") {
      setUserErrors({ ...userErrors, password: validatePassword(value) });
    }
    
    // Validate username
    if (name === "userName") {
      setUserErrors({ ...userErrors, userName: validateUsername(value) });
    }
    
    // Check confirm password match
    if (name === "confirmPassword") {
      const error = value !== user.password ? "Passwords do not match" : "";
      setUserErrors({ ...userErrors, confirmPassword: error });
    }
  };

  const handleSetupChange = (e) => {
    const { name, value } = e.target;
    setSetupForm({ ...setupForm, [name]: value });
    
    // Validate password
    if (name === "password") {
      setSetupErrors({ ...setupErrors, password: validatePassword(value) });
    }
    
    // Validate username
    if (name === "userName") {
      setSetupErrors({ ...setupErrors, userName: validateUsername(value) });
    }
    
    // Check confirm password match
    if (name === "confirmPassword") {
      const error = value !== setupForm.password ? "Passwords do not match" : "";
      setSetupErrors({ ...setupErrors, confirmPassword: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const passwordError = validatePassword(user.password);
    const usernameError = validateUsername(user.userName);
    const confirmError = user.password !== user.confirmPassword ? "Passwords do not match" : "";
    
    if (passwordError || usernameError || confirmError) {
      setUserErrors({ password: passwordError, userName: usernameError, confirmPassword: confirmError });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: user.email,
        userName: user.userName,
        password: user.password,
        role: selectedRole,
      };

      if (selectedRole.toUpperCase() === "USER") {
        payload.accountType = user.accountType;
      }

      const res = await axios.post("${import.meta.env.VITE_API_URL}/api/users/register", payload);
      alert(res.data.message || "Registration successful");
      navigate("/login", { state: { role: selectedRole, registeredUser: user } });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Signup failed";
      if (errorMessage.toLowerCase().includes("email")) {
        setUserErrors({ ...userErrors, email: errorMessage });
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLoginButton = useMemo(
    () => (
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const googleToken = credentialResponse.credential;
            const res = await axios.post("${import.meta.env.VITE_API_URL}/api/google-signup", {
              token: googleToken,
              role: selectedRole,
              mode: "SIGNUP",
            });

            if (res.data.error) {
              alert(res.data.error);
              return;
            }

            if (res.data.token) {
              localStorage.setItem("jwtToken", res.data.token);
              localStorage.setItem("tempGoogleUserId", res.data.userId);

              if (res.data.needsSetup === "true" || res.data.needsSetup === true) {
                setShowSetupModal(true);
              } else {
                localStorage.setItem("userName", res.data.userName);
                localStorage.setItem("role", res.data.role);
                localStorage.setItem("userId", res.data.userId);
                const userRole = res.data.role.toLowerCase();
                alert("Google login successful!");
                navigate(userRole.includes("caregiver") ? "/welcome" : "/dash");
              }
            }
          } catch (err) {
            alert("Google login failed");
          }
        }}
        onError={() => alert("Google login failed")}
      />
    ),
    [selectedRole, navigate]
  );

  const handleQuickSetup = async () => {
    setSetupError("");
    
    // Validate all fields
    const passwordError = validatePassword(setupForm.password);
    const usernameError = validateUsername(setupForm.userName);
    const confirmError = setupForm.password !== setupForm.confirmPassword ? "Passwords do not match" : "";
    
    if (!setupForm.userName || !setupForm.password) {
      return setSetupError("All fields are required");
    }
    
    if (passwordError || usernameError || confirmError) {
      setSetupErrors({ password: passwordError, userName: usernameError, confirmPassword: confirmError });
      return;
    }

    const userId = localStorage.getItem("tempGoogleUserId");
    if (!userId) return setSetupError("Session missing. Please try Google Sign-in again.");

    try {
      const payload = {
        userId: userId,
        userName: setupForm.userName.trim(),
        password: setupForm.password,
      };

      if (selectedRole.toUpperCase() === "USER") {
        payload.accountType = setupForm.accountType;
      }

      const response = await axios.post("${import.meta.env.VITE_API_URL}/api/users/complete-google-profile", payload);

      localStorage.setItem("userName", setupForm.userName.trim());
      localStorage.setItem("role", selectedRole);
      localStorage.setItem("userId", response.data.userId || userId);
      localStorage.removeItem("tempGoogleUserId");

      alert("Profile setup complete!");
      setShowSetupModal(false);
      const targetPath = selectedRole.toLowerCase().includes("caregiver") ? "/welcome" : "/dash";
      navigate(targetPath);
    } catch (err) {
      setSetupError(err.response?.data?.error || "Setup failed.");
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-slate-90 via-blue-50 to-emerald-50">
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

      {/* ─── ANIMATED BACKGROUND GRADIENT ─── */}
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

      {/* ─── MAIN FORM CARD ─── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Card Background */}
          <div className="bg-slate-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 relative overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* Decorative top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ─── HEADER ─── */}
              <div className="text-center space-y-1 mb-5">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200">
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 uppercase tracking-widest">
                    Create Account
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-700 tracking-tight mt-2">Welcome</h1>
                <p className="text-sm text-slate-900 font-medium mt-1">Join our community of trusted care providers</p>
              </div>

              {/* ─── EMAIL INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg ${
                    userErrors.email 
                      ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                      : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                  }`}
                  required
                />
                {userErrors.email && (
                  <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {userErrors.email}
                  </p>
                )}
              </div>

              {/* ─── ACCOUNT TYPE DROPDOWN ─── */}
              {selectedRole.toUpperCase() === "USER" && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account Type</label>
                  <select
                    name="accountType"
                    value={user.accountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-base text-slate-900 rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-300 appearance-none cursor-pointer font-medium"
                    required
                  >
                    <option value="INDIVIDUAL">👤 Individual</option>
                    <option value="ORGANIZATION">🏢 Organization</option>
                  </select>
                </div>
              )}

              {/* ─── USERNAME INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  {user.accountType === "ORGANIZATION" ? "Org Name" : "Username"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="userName"
                    value={user.userName}
                    onChange={handleChange}
                    placeholder={user.accountType === "ORGANIZATION" ? "ElderCare" : "john_doe"}
                    className={`w-full px-4 py-2.5 text-base text-slate-700 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg ${
                      userErrors.userName 
                        ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                        : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                    }`}
                    required
                  />
                  {!userErrors.userName && user.userName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-sm">✓</span>
                    </div>
                  )}
                </div>
                {userErrors.userName && (
                  <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {userErrors.userName}
                  </p>
                )}
              </div>

              {/* ─── PASSWORD INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    placeholder="8+ chars + special"
                    className={`w-full px-4 py-2.5 text-base text-slate-700 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg pr-10 ${
                      userErrors.password 
                        ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                        : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                    }`}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={14} /> : <AiOutlineEye size={14} />}
                  </span>
                </div>
                {userErrors.password && (
                  <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {userErrors.password}
                  </p>
                )}
              </div>

              {/* ─── CONFIRM PASSWORD INPUT ─── */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Confirm</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg ${
                      userErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                        : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                    }`}
                    required
                  />
                  {!userErrors.confirmPassword && user.confirmPassword && user.password === user.confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-sm">✓</span>
                    </div>
                  )}
                </div>
                {userErrors.confirmPassword && (
                  <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {userErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* ─── SUBMIT BUTTON ─── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </>
                  )}
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
                {googleLoginButton}
              </div>

              {/* ─── FOOTER LINK ─── */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-600 font-medium">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-white font-semibold hover:text-blue-600 hover:underline underline-offset-2 transition-all duration-200"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ─── SETUP MODAL ─── */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="w-full max-w-sm my-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 relative overflow-hidden">
              <div className="space-y-4">
                {/* ─── MODAL HEADER ─── */}
                <div className="text-center space-y-1 mb-5">
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200">
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 uppercase tracking-widest">
                      One More Step
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Complete Profile</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Set up your credentials to get started</p>
                </div>

                {/* ─── ACCOUNT TYPE ─── */}
                {selectedRole.toUpperCase() === "USER" && (
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Account Type</label>
                    <select
                      value={setupForm.accountType}
                      onChange={(e) => setSetupForm({ ...setupForm, accountType: e.target.value })}
                      className="w-full px-4 py-2.5 text-base text-slate-900 rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-300 appearance-none cursor-pointer font-medium"
                      required
                    >
                      <option value="INDIVIDUAL">👤 Individual</option>
                      <option value="ORGANIZATION">🏢 Organization</option>
                    </select>
                  </div>
                )}

                {/* ─── USERNAME ─── */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                    {setupForm.accountType === "ORGANIZATION" ? "Org Name" : "Username"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={setupForm.accountType === "ORGANIZATION" ? "ElderCare" : "john_doe"}
                      name="userName"
                      value={setupForm.userName}
                      onChange={handleSetupChange}
                      className={`w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg ${
                        setupErrors.userName 
                          ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                          : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                      }`}
                      required
                    />
                    {!setupErrors.userName && setupForm.userName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  {setupErrors.userName && (
                    <p className="text-sm font-bold text-red-500 mt-1">⚠ {setupErrors.userName}</p>
                  )}
                </div>

                {/* ─── PASSWORD ─── */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showSetupPassword ? "text" : "password"}
                      placeholder="8+ chars + special"
                      name="password"
                      value={setupForm.password}
                      onChange={handleSetupChange}
                      className={`w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg pr-10 ${
                        setupErrors.password 
                          ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                          : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                      }`}
                      required
                    />
                    <span
                      onClick={() => setShowSetupPassword(!showSetupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showSetupPassword ? <AiOutlineEyeInvisible size={14} /> : <AiOutlineEye size={14} />}
                    </span>
                  </div>
                  {setupErrors.password && (
                    <p className="text-sm font-bold text-red-500 mt-1">⚠ {setupErrors.password}</p>
                  )}
                </div>

                {/* ─── CONFIRM PASSWORD ─── */}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Confirm</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    name="confirmPassword"
                    value={setupForm.confirmPassword}
                    onChange={handleSetupChange}
                    className={`w-full px-4 py-2.5 text-base text-slate-900 placeholder-slate-400 rounded-lg border transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-lg ${
                      setupErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-400 focus:shadow-red-400/20' 
                        : 'border-slate-200 focus:ring-blue-400 focus:shadow-blue-400/20'
                    }`}
                    required
                  />
                  {setupErrors.confirmPassword && (
                    <p className="text-sm font-bold text-red-500 mt-1">⚠ {setupErrors.confirmPassword}</p>
                  )}
                </div>

                {/* ─── ERROR MESSAGE ─── */}
                {setupError && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-bold text-red-700">⚠ {setupError}</p>
                  </div>
                )}

                {/* ─── SUBMIT BUTTON ─── */}
                <button
                  onClick={handleQuickSetup}
                  className="w-full mt-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Finish Setup
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        select::placeholder {
          color: rgba(71, 85, 105, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Signup;