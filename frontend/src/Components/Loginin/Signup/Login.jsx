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

    // Trim inputs to avoid extra spaces
    const dataToSend = {
      userName: userName.trim(),
      password: password.trim()
    };

    console.log("Sending:", dataToSend);

    try {
      // Use /api/login to leverage Vite proxy
      const response = await axios.post("http://localhost:8080/api/login", dataToSend);

      console.log("Response:", response.data);
      setMessage(response.data);

      if (response.data === "Login Success") {
        navigate("/dash"); // only navigate on success
      }

    } catch (error) {
      setMessage(error.response?.data || "Login failed");
    }
  };

  return (
    <div className='w-screen h-screen relative overflow-hidden bg-grey-400'>
      <img 
        src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
        className='absolute opacity-40 w-full h-full object-cover'
      />

      <button 
        className='absolute bg-grey-200 top-8 left-5 z-10'
        onClick={() => navigate('/')}
      > Home </button>

      <div className="relative bg-gray-100 rounded-lg shadow-lg z-10 top-60 p-8 max-w-sm mx-auto">
        <form className="text-center" onSubmit={handleLogin}>
          <h2 className="text-3xl italic font-semibold mb-6 text-gray-800">Elder Ease</h2>

          <input
            type="text"
            placeholder="Type your username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            placeholder="Type your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition-colors duration-300"
          >
            Login
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
