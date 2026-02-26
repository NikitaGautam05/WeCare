import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { GoogleLogin } from "@react-oauth/google"; 

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || null;
  
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    email: "",
    userName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...user,
        role: selectedRole
      };

      const res = await axios.post(
        "http://localhost:8080/api/users/register",
        payload
      );

      alert(res.data.message || res.data);

      navigate("/login", { 
        state: { role: selectedRole, registeredUser: user } 
      });

    } catch (error) {
      console.error("Registration failed", error);
      alert(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const role = selectedRole || "USER";

      const payload = { token, role: role.toUpperCase() };

      const res = await axios.post(
        "http://localhost:8080/api/google-signup",
        payload
      );

      if (res.data.token) {
        localStorage.setItem("jwtToken", res.data.token);
        const userRole = res.data.role.toLowerCase();
        alert("Google signup/login successful!");
        navigate(userRole === "caregiver" ? "/welcome" : "/dash");
      } else {
        alert(res.data.error || res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Google login failed");
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
        onClick={() => navigate("/optionLogin", { state: { mode: "SIGNUP" } })}
      >
        Back
      </button>

      <div className="relative z-10 top-1/2 transform -translate-y-1/2 max-w-sm mx-auto bg-white/30 backdrop-blur-md rounded-xl shadow-xl p-10">
        <form onSubmit={handleSubmit} className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">SIGN UP</h2>

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="userName"
            value={user.userName}
            onChange={handleChange}
            placeholder="Username"
            className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 bg-white/60 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white/60 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 pr-12"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-gray-500 mt-4 mb-2 text-center">OR</div>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Google login failed")} />
        </div>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-5600 cursor-pointer hover:underline"
            onClick={() => navigate("/optionLogin", { state: { mode: "LOGIN" } })}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;