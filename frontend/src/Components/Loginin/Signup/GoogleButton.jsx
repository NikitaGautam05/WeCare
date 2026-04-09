import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;

    // Call the backend
    const res = await axios.post("http://localhost:8080/api/google-signup", {
      token: token,
      mode: "LOGIN" // This tells the backend we want to log in, not create a new user
    });

    if (res.data.error) {
      setMessage(res.data.error);
      return;
    }

    if (res.data.token) {
      // 1. Get the actual role the BACKEND found in the database
      const actualRole = (res.data.role || "USER").toUpperCase();

      // 2. Save all details to localStorage
      localStorage.setItem("jwtToken", res.data.token);
      localStorage.setItem("userId", res.data.userId); 
      localStorage.setItem("userName", res.data.userName); 
      localStorage.setItem("role", actualRole);
      localStorage.setItem("email", res.data.email);

      // 3. Navigate based on the REAL role from the database
      if (actualRole.includes("CAREGIVER")) {
        // Redirect to caregiver dashboard or welcome page
        navigate("/welcome"); 
      } else {
        // Redirect to standard user dashboard
        navigate("/dash");
      }
    }
  } catch (err) {
    console.error("Google Login Error:", err);
    setMessage(err.response?.data?.error || "Google login failed");
  }
};

  return <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Google login failed")} />;
};

export default GoogleButton;
