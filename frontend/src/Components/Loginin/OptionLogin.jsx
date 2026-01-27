import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OptionLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || "LOGIN"; // default to LOGIN

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-80 text-center">
        <h2 className="text-xl font-semibold mb-6">
          {mode === "LOGIN" ? "Choose Login Type" : "Choose Registration Type"}
        </h2>

        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600"
          onClick={() =>
            navigate(
              mode === "LOGIN" ? "/login" : "/signup",
              { state: { role: "CAREGIVER" } }
            )
          }
        >
          I am a Caregiver
        </button>

        <button
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() =>
            navigate(
              mode === "LOGIN" ? "/login" : "/signup",
              { state: { role: "USER" } }
            )
          }
        >
          I am a Care Receiver
        </button>
      </div>
    </div>
  );
};

export default OptionLogin;
