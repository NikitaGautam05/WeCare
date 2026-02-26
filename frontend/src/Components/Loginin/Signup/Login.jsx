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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/users/login", {
        userName: userName.trim(),
        password: password.trim()
      });

      if (response.data.token) {
        localStorage.setItem("jwtToken", response.data.token);
        const role = response.data.role || "USER";
        const normalizedRole = role.toLowerCase().replace(/\s/g,'');

        if (normalizedRole.includes("caregiver")) navigate("/welcome");
        else navigate("/dash");
      } else if(response.data.error){
        setMessage(response.data.error);
      }

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || "Login failed");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;

    // Get the role user selected
    const selectedRole = localStorage.getItem("selectedRole") || "USER";

    const payload = {
      token: token,
      role: selectedRole.toUpperCase(), // CAREGIVER or USER
    };

    const res = await axios.post(
      "http://localhost:8080/api/google-signup",
      payload
    );

    if (res.data.token) {
      localStorage.setItem("jwtToken", res.data.token);

      const role = res.data.role.toLowerCase();

      // Navigate based on role
      if (role.includes("caregiver")) navigate("/welcome");
      else navigate("/dash");

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
        className="absolute w-full h-full object-cover z-0"
        alt="Background"
      />

      <div className="absolute top-5 right-10 flex gap-4 z-10">
        <button onClick={() => navigate('/')} className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition">Home</button>
        {/* <button onClick={() => navigate('/signup')} className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition">Register</button> */}
      </div>

      <div className="relative z-10 top-1/2 transform -translate-y-1/2 max-w-sm mx-auto bg-white/30 backdrop-blur-md rounded-xl shadow-xl p-10">
        <form onSubmit={handleLogin} className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">LOGIN</h2>
          <input 
          type="text" placeholder="Username" 
          value={userName} 
          onChange={e => setUserName(e.target.value)}
           className="w-full mb-4 p-3 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/60 placeholder-gray-700"/>
           <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/60 placeholder-gray-700 pr-12"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition "
            >
              {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-700 text-sm flex items-center gap-2">
              <input type="checkbox" className="accent-green-500"/> Remember Me
            </label>
            <span className="text-sm text-gray-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/forgetPassword')}>Forgot Password?</span>
          </div>

          <button type="submit" className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition">Login</button>
          
          <div className="text-gray-500 mt-4 mb-2 text-center">OR</div>
          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Google login failed")} />
          </div>

          {message && <p className="mt-4 text-red-500 text-sm font-semibold">{message}</p>}

          {/* NEW: Sign up link */}
          <p className="text-sm text-gray-600 mt-4 text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/signup", { state: { mode: "SIGNUP" } })}
            >
              Sign up here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
