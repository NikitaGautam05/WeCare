import React, { useState } from "react";
import axios from "axios";

const ForgetPassword = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const sendCode = async () => {
    if (!username) {
      setMessage("Enter your username.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/forgetPassword", {
        username,
      });
      setMessage(res.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
        <p className="mb-4 text-black font-bold">Enter your username to receive OTP</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2 mb-4 w-full rounded bg-gray-300"
        />
        <button
          onClick={sendCode}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Send Code
        </button>
        {message && <p className="mt-3">{message}</p>}
      </div>
    </div>
  );
};

export default ForgetPassword;
