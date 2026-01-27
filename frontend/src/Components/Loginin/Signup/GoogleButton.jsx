import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;

    // Assume you have the role saved from a previous selection
    const selectedRole = localStorage.getItem("selectedRole") || "USER"; 
    // CAREGIVER or USER

    const payload = {
      token: token,
      role: selectedRole.toUpperCase()
    };

    const res = await axios.post(
      "http://localhost:8080/api/google-signup",
      payload
    );

    if (res.data.token) {
      localStorage.setItem("jwtToken", res.data.token);

      const role = res.data.role.toLowerCase();
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


  return <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Google login failed")} />;
};

export default GoogleButton;
