import { useNavigate } from "react-router-dom";

const GoogleButton = () => {
  const navigate = useNavigate();

  // const handleLogin = () => {
    const handleLogin = () => {
  window.location.replace(
    "https://elderease-1-u3gn.onrender.com/oauth2/authorization/google"
  );
};
  // };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
};

export default GoogleButton;