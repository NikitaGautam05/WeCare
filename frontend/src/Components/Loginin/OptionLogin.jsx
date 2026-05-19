import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OptionLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Logic to determine if we are in LOGIN or SIGNUP mode
  const mode = location.state?.mode || "LOGIN";
  const isLogin = mode === "LOGIN";

  const [hovered, setHovered] = useState(null);

  // Helper to handle the navigation with correct backend roles
  const handleRoleSelection = (role) => {
    const targetPath = isLogin ? "/login" : "/signup";
    localStorage.setItem("selectedRole", role);
    navigate(targetPath, { state: { role } });
  };

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundImage: "url(https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1800&q=80)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.48)", backdropFilter: "blur(10px)" }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

        .card-0 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .card-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .head-in { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .sub-in  { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

        .role-card {
          position: relative;
          border-radius: 20px;
          padding: 32px 28px 28px;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(18px);
          user-select: none;
          color: #fff;
        }
        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.28);
          border-color: rgba(255,255,255,0.28);
        }

        .card-btn {
          width: 100%;
          padding: 13px 0;
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          margin-top: 24px;
          background: rgba(255,255,255,0.18);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .card-btn:hover {
          background: rgba(255,255,255,0.26);
        }

        .back-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.65); font-family:'Outfit',sans-serif;
          font-size:13px; display:flex; align-items:center; gap:6px;
          transition:color 0.2s; padding:0;
        }
        .back-btn:hover { color:rgba(255,255,255,0.95); }

        .geo-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }
      `}</style>

      {/* Background visual elements */}
      <div className="geo-ring" style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%, -50%)", animation: "spinSlow 40s linear infinite" }} />
      <div className="geo-ring" style={{ width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%, -50%)", animation: "spinSlow 28s linear infinite reverse" }} />
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent)", pointerEvents: "none", animation: "float 8s ease-in-out infinite" }} />

      <div style={{ width: "100%", maxWidth: 480, padding: "0 24px", position: "relative", zIndex: 10 }}>
        
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to home
          </button>
        </div>

        <div className="head-in" style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, fontWeight: 600, color: "#111", fontStyle: "italic" }}>E</span>
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff" }}>
              Elder<em>Ease</em>
            </span>
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 5vw, 38px)", color: "#fff", fontWeight: 400, lineHeight: 1.1, marginBottom: 10 }}>
            {isLogin ? "Welcome back" : "Join ElderEase"}
          </h1>
        </div>

        <div className="sub-in" style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
            {isLogin ? "Choose how you'd like to sign in" : "Tell us who you are to get started"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Caregiver Option */}
          <div
            className="role-card card-0"
            onMouseEnter={() => setHovered("caregiver")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleRoleSelection("CAREGIVER")}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: hovered === "caregiver" ? "#fff" : "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, transition: "all 0.3s" }}>
              🤲
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", fontWeight: 400, lineHeight: 1.1 }}>
                I'm a<br /><em>Caregiver</em>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, fontWeight: 300 }}>
              Register & connect with families seeking care.
            </p>
            <button
              className="card-btn"
              style={{ background: hovered === "caregiver" ? "#fff" : "rgba(255,255,255,0.08)", color: hovered === "caregiver" ? "#111" : "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {isLogin ? "Log In" : "Register"} →
            </button>
          </div>

          {/* Care Receiver Option */}
          <div
            className="role-card card-1"
            onMouseEnter={() => setHovered("receiver")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleRoleSelection("USER")}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: hovered === "receiver" ? "#fff" : "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, transition: "all 0.3s" }}>
              🏠
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", fontWeight: 400, lineHeight: 1.1 }}>
                I need<br /><em>Care</em>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, fontWeight: 300 }}>
              Find trusted caregivers for your loved ones.
            </p>
            <button
              className="card-btn"
              style={{ background: hovered === "receiver" ? "#fff" : "rgba(255,255,255,0.08)", color: hovered === "receiver" ? "#111" : "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {isLogin ? "Log In" : "Register"} →
            </button>
          </div>

        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => navigate("/optionLogin", { state: { mode: isLogin ? "SIGNUP" : "LOGIN" } })}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: 0.5 }}>
            © {new Date().getFullYear()} ElderEase Nepal
          </span>
        </div>
      </div>
    </div>
  );
};

export default OptionLogin;
// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const OptionLogin = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const mode = location.state?.mode || "LOGIN"; // default to LOGIN

//   return (
//     <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
//       <div className="bg-white shadow-xl rounded-xl p-8 w-80 text-center">
//         <h2 className="text-xl font-semibold mb-6">
//           {mode === "LOGIN" ? "Choose Login Type" : "Choose Registration Type"}
//         </h2>

//         <button
//           className="w-full py-3 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600"
//           onClick={() =>
//             navigate(
//               mode === "LOGIN" ? "/login" : "/signup",
//               { state: { role: "CAREGIVER" } }
//             )
//           }
//         >
//           I am a Caregiver
//         </button>

//         <button
//           className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
//           onClick={() =>
//             navigate(
//               mode === "LOGIN" ? "/login" : "/signup",
//               { state: { role: "USER" } }
//             )
//           }
//         >
//           I am a Care Receiver
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OptionLogin;