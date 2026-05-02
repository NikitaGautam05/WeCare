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
  const [loading, setLoading] = useState(false);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupForm, setSetupForm] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    accountType: "INDIVIDUAL",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) return alert("Passwords do not match");

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

      const res = await axios.post("http://localhost:8080/api/users/register", payload);
      alert(res.data.message || "Registration successful");
      navigate("/login", { state: { role: selectedRole, registeredUser: user } });
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
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
            const res = await axios.post("http://localhost:8080/api/google-signup", {
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
    if (!setupForm.userName || !setupForm.password) {
      return setSetupError("All fields are required");
    }
    if (setupForm.password !== setupForm.confirmPassword) {
      return setSetupError("Passwords do not match");
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

      const response = await axios.post("http://localhost:8080/api/users/complete-google-profile", payload);

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
    <div className="w-screen h-screen relative overflow-hidden">
      <img
        src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
        className="absolute w-full h-full object-cover opacity-40 z-0"
        alt="Background"
      />

      <button
        className="absolute top-6 left-6 bg-gray-200 px-4 py-2 rounded font-semibold z-10"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <div className="relative z-10 top-1/2 transform -translate-y-1/2 max-w-sm mx-auto bg-white/30 backdrop-blur-md rounded-xl shadow-xl p-10">
        <form onSubmit={handleSubmit} className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 uppercase tracking-tight">SIGN UP</h2>

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          {/* Account Type Dropdown - Only for Care Receivers */}
          {selectedRole.toUpperCase() === "USER" && (
            <select
              name="accountType"
              value={user.accountType}
              onChange={handleChange}
              className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none cursor-pointer"
              required
            >
              <option value="INDIVIDUAL">👤 Individual Account</option>
              <option value="ORGANIZATION">🏢 Organization Account</option>
            </select>
          )}

          <input
            type="text"
            name="userName"
            value={user.userName}
            onChange={handleChange}
            placeholder={user.accountType === "ORGANIZATION" ? "Organization Name" : "Username"}
            className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 pr-12"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          <input
            type="password"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full mb-6 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-500 text-white font-black text-xs uppercase tracking-widest hover:bg-green-600 transition shadow-lg"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-gray-500 mt-4 mb-2 text-center text-[10px] font-bold">OR</div>
        <div className="flex justify-center scale-90">{googleLoginButton}</div>

        <p className="text-xs text-gray-600 mt-4 text-center font-medium">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-bold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-sm bg-white/30 backdrop-blur-md rounded-xl shadow-xl p-10 border border-white/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 uppercase tracking-tight">Complete Profile</h2>

              {selectedRole.toUpperCase() === "USER" && (
                <select
                  value={setupForm.accountType}
                  onChange={(e) => setSetupForm({ ...setupForm, accountType: e.target.value })}
                  className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none cursor-pointer"
                  required
                >
                  <option value="INDIVIDUAL">👤 Individual Account</option>
                  <option value="ORGANIZATION">🏢 Organization Account</option>
                </select>
              )}

              <input
                type="text"
                placeholder={setupForm.accountType === "ORGANIZATION" ? "Organization Name" : "Username"}
                value={setupForm.userName}
                onChange={(e) => setSetupForm({ ...setupForm, userName: e.target.value })}
                className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />

              <div className="relative mb-4">
                <input
                  type={showSetupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={setupForm.password}
                  onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                  className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 pr-12"
                  required
                />
                <span
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                >
                  {showSetupPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
              </div>

              <input
                type="password"
                placeholder="Confirm Password"
                value={setupForm.confirmPassword}
                onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                className="w-full mb-6 p-3 text-black rounded-lg border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />

              {setupError && <p className="text-red-600 text-[10px] font-black mb-4 bg-red-100/50 py-2 rounded uppercase">{setupError}</p>}

              <button
                onClick={handleQuickSetup}
                className="w-full py-3 rounded-lg bg-green-500 text-white font-black text-xs uppercase tracking-widest hover:bg-green-600 transition shadow-lg active:scale-95"
              >
                Finish Signup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;