import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaCamera, FaLock, FaEnvelope, FaUser, FaSignOutAlt, 
  FaHome, FaUserMd, FaHistory, FaStar, FaHeart, FaBars 
} from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/logo.jpg";

const ProfileUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "User";
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [profileData, setProfileData] = useState({
    userName: "",
    email: "",
    photo: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMsg, setPasswordMsg] = useState({ text: "", isError: false });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }
    axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig)
      .then(res => setProfileData(res.data))
      .catch(err => console.error(err));
  }, [userId, token, navigate]);

  const navItems = [
    { name: "Dashboard", icon: <FaHome />, link: "/dash" },
    { name: "Caregivers", icon: <FaUserMd />, link: "/my-caregivers" },
    { name: "History", icon: <FaHistory />, link: "/history" },
    // { name: "Interests", icon: <FaStar />, link: "/top-interest" },
    { name: "Favorites", icon: <FaHeart />, link: "/favourites" },
    { name: "Profile", icon: <FaUser />, link: "/my-profile" },
  ];

  const handlePhotoClick = () => fileInputRef.current.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/change-photo", formData, {
        ...axiosConfig,
        headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" }
      });
      setProfileData({ ...profileData, photo: res.data.photoUrl });
    } catch (err) {
      alert("Upload failed.");
    } finally { setUploading(false); }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match", isError: true });
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/users/change-password`, null, {
        ...axiosConfig,
        params: { username: profileData.userName, currentPassword, newPassword }
      });
      setPasswordMsg({ text: "Password updated!", isError: false });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ text: "Current password incorrect", isError: true });
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-[#f1f5f9] text-slate-900 overflow-x-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">ElderEase</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.link)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.link 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-end shadow-sm">
  
  <div className="flex items-center gap-4">
    <div className="text-right hidden sm:block">
      <p className="text-xs font-bold text-slate-400 uppercase leading-none">
        {role}
      </p>
      <p className="text-sm font-bold text-slate-700">
        {profileData.userName}
      </p>
    </div>

    <img
      src={
        profileData.photo ||
        "https://ui-avatars.com/api/?name=" + profileData.userName
      }
      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
      alt="User"
    />
  </div>

</header>

        {/* PAGE CONTENT */}
        <main className="p-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 mt-1">Update your account security and photo.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* Identity Card */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                  <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 pointer-events-none">
                    <FaUser className="opacity-50" />
                    <span className="font-semibold">{profileData.userName || "Loading..."}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Email</label>
                  <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 pointer-events-none">
                    <FaEnvelope className="opacity-50" />
                    <span className="font-semibold">{profileData.email || "Loading..."}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Photo Card */}
              <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center">
                <div className="relative mb-6 group cursor-pointer" onClick={handlePhotoClick}>
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                    <img 
                      src={profileData.photo || "https://ui-avatars.com/api/?name=" + profileData.userName} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      alt="Avatar"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <FaCamera size={24} />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{profileData.userName}</h3>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-tighter mb-4">{role}</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button 
                  onClick={handlePhotoClick}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-300 text-xs font-bold rounded-full transition"
                >
                  {uploading ? "Uploading..." : "Update Photo"}
                </button>
              </section>

              {/* Password Card */}
              <section className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <FaLock className="text-blue-500" /> Change Password
                </h4>
                <div className="space-y-4">
                  {["currentPassword", "newPassword", "confirmPassword"].map((key) => (
                    <input
                      key={key}
                      type="password"
                      placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({...passwordData, [key]: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
                    />
                  ))}
                  {passwordMsg.text && (
                    <p className={`text-xs font-bold px-4 py-2 rounded-lg ${passwordMsg.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <button 
                    onClick={handlePasswordChange}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 mt-2"
                  >
                    Save Changes
                  </button>
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileUser;