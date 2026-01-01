import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Normal input handler
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // Normal signup handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/register", user);
      alert(res.data);
      if (res.data === "Registration complete") {
        navigate("/login");
      }
    } catch (error) {
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Google signup handler
  const handleGoogleSignup = async (response) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/google-signup",
        response.credential,
        {
          headers: { "Content-Type": "text/plain" },
        }
      );
      alert(res.data);
      if (res.data.toLowerCase().includes("success")) {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      alert("Google signup failed");
    }
  };

  // Initialize Google client once
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "666312206626-sh7vgk5h08df0l9tu3ckbm9hfg0h7slb.apps.googleusercontent.com",
        callback: handleGoogleSignup,
        ux_mode: "popup", // popup mode triggered by button
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-100">
      <img
        src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
        className="absolute opacity-40 w-full h-full object-cover"
        alt="Background"
      />

      <button
        className="absolute bg-gray-200 top-8 left-5 z-10 px-4 py-2 rounded font-semibold"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <div className="relative bg-white rounded-lg shadow-lg z-10 top-40 p-8 max-w-sm mx-auto">
        <form className="text-center" onSubmit={handleSubmit}>
          <h2 className="text-3xl italic font-semibold mb-6 text-gray-800">
            Sign Up
          </h2>

          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="userName"
            value={user.userName}
            onChange={handleChange}
            placeholder="Username"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full mb-6 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          {/* Normal signup button */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {/* Google Signup */}
          <div className="text-gray-500 my-4">OR</div>

          <button
            type="button"
            onClick={() => {
              if (window.google) {
                window.google.accounts.id.prompt(); // popup triggered
              } else {
                alert("Google API not loaded yet.");
              }
            }}
            className="flex items-center justify-center w-full border border-gray-300 rounded py-2 hover:bg-gray-100 transition-colors duration-300"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="h-6 mr-2"
              alt="Google Logo"
            />
            Sign up with Google
          </button>

          <p className="text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              className="text-green-500 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
