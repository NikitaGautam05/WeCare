import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        userName: userName.trim(),
        password: password.trim()
      });

      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem("jwtToken", token);
        setMessage("Login Success");

        // Debug logs
        const role = response.data.role || "USER";
        console.log("Backend role:", role);

        const normalizedRole = role.toLowerCase().replace(/\s/g,'');
        console.log("Normalized role:", normalizedRole);

        if(normalizedRole === "caregiver"){
          console.log("Navigating to CareGiverDash");
          navigate("/CareGiverDash");
        } else if(normalizedRole === "user"){
          console.log("Navigating to /dash");
          navigate("/dash");
        } else {
          console.log("Navigating to fallback /");
          navigate("/");
        }
      } else if(response.data.error){
        setMessage(response.data.error);
      }

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || "Login failed");
    }
  };

  return (
     <div className="w-screen h-screen relative overflow-hidden">
      {/* Background Image */}
      <img 
        src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
        className="absolute w-full h-full object-cover z-0"
        alt="Background"
      />

      {/* Top Navigation */}
      <div className="absolute top-5 right-10 flex gap-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition"
        >
          Home
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition"
        >
          Register
        </button>
      </div>

      {/* Login Form */}
      <div className="relative z-10 top-1/2 transform -translate-y-1/2 max-w-sm mx-auto bg-white/30 backdrop-blur-md rounded-xl shadow-xl p-10">
        <form onSubmit={handleLogin} className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">LOGIN</h2>

          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/60 placeholder-gray-700"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/60 placeholder-gray-700"
          />

          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-700 text-sm flex items-center gap-2">
              <input type="checkbox" className="accent-green-500" /> Remember Me
            </label>
            <span
              className="text-sm text-gray-700 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate('/forgetPassword')}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            Login
          </button>

          <div className="text-gray-500 mt-4 mb-2">OR</div>

          <button
            type="button"
            className="flex items-center justify-center w-full mt-2 py-3 rounded-lg bg-white/70 hover:bg-white/90 text-gray-800 font-semibold shadow-md transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              className="h-6 w-6 mr-2"
            />
            Login with Google
          </button>

          {message && (
            <p className="mt-4 text-red-500 text-sm font-semibold">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
