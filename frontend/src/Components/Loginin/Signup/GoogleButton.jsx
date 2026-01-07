import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        "http://localhost:8080/api/google-signup",
        token,
        { headers: { "Content-Type": "text/plain" } } // backend expects raw string
      );

      if (res.data.token) {
        localStorage.setItem("jwtToken", res.data.token);
        const role = res.data.role.toLowerCase();

        alert("Google login successful!");
        if (role === "caregiver") navigate("/CareGiverDash");
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
