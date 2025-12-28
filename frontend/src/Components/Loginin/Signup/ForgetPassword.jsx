import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgetPassword =()=>{
  return (
    <div className="flex items-center justify-center h-screen w-screen  bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
        <p className="mb-4 text-black font-bold">Your code will be sent via email</p>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Send Code
        </button>
      </div>
    </div>
  );
};

export default ForgetPassword