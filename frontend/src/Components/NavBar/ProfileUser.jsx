import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaCamera, FaLock, FaEnvelope, FaUser, FaSignOutAlt, 
  FaHome, FaUserMd, FaHistory, FaStar, FaHeart, FaBars 
} from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/logo.jpg";
import Chat from "../Chat/Chat"; // Ensure this import matches your folder structure

const ProfileUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "User";
  const token = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const [profileData, setProfileData] = useState({
    userName: "",
    email: "",
    photo: "",
    address: "",
    serviceType: "",
    additionalInfo: "",
    receiverType: "self",
    // Organization fields (NEW)
    accountType: "INDIVIDUAL",
    organizationName: "",
    foundationDate: "",
    capacity: "",
    city: "",
    phoneNumber: "",
    website: "",
    servicesOffered: [],
    aboutOrganization: "",
    licenseNumber: "",
    registrationNumber: "",
    logo: "",
    bannerImage: "",
    contactPersonName: "",
    contactPersonTitle: "",
    contactPersonPhone: ""
  });

  const [careEditMode, setCareEditMode] = useState(false);
  const [careSaving, setCareSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMsg, setPasswordMsg] = useState({ text: "", isError: false });
  const [uploading, setUploading] = useState(false);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  const fetchAcceptedConnections = async () => {
    setLoadingConnections(true);
    try {
      console.log("📥 Fetching accepted connections for user:", userId);
      const response = await axios.get(`http://localhost:8080/api/chat/accepted-for-receiver/${userId}`, axiosConfig);
      console.log("✅ Accepted connections fetched:", response.data);
      setAcceptedConnections(response.data || []);
    } catch (err) {
      console.error("❌ Error fetching accepted connections:", err);
      setAcceptedConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }
    axios.get(`http://localhost:8080/api/users/${userId}`, axiosConfig)
      .then(res => {
        const data = res.data;
        // If accountType is missing, default to INDIVIDUAL (for care receivers)
        // This handles existing users in the database
        if (!data.accountType) {
          data.accountType = data.organizationName ? "ORGANIZATION" : "INDIVIDUAL";
        }
        setProfileData(data);
      })
      .catch(err => console.error(err));

    fetchAcceptedConnections();
  }, [userId, token, navigate]);

  const navItems = [
    { name: "Dashboard", icon: <FaHome />, link: "/dash" },
    { name: "Caregivers", icon: <FaUserMd />, link: "/my-caregivers" },
    { name: "History", icon: <FaHistory />, link: "/history" },
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

  const serviceTypes = [
    "Elderly Care", "Child Care", "Post-Surgery Care", 
    "Disability Care", "Mental Health Support", "Physical Therapy", 
    "Daily Living Assistance", "Other"
  ];

  const handleCareSave = async () => {
    setCareSaving(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("address", profileData.address);
      formData.append("serviceType", profileData.serviceType);
      formData.append("additionalInfo", profileData.additionalInfo);
      formData.append("receiverType", profileData.receiverType);
      formData.append("accountType", profileData.accountType);

      // Add organization fields if organization account
      if (profileData.accountType === "ORGANIZATION") {
        formData.append("organizationName", profileData.organizationName);
        formData.append("foundationDate", profileData.foundationDate);
        formData.append("capacity", profileData.capacity);
        formData.append("city", profileData.city);
        formData.append("phoneNumber", profileData.phoneNumber);
        formData.append("website", profileData.website);
        formData.append("aboutOrganization", profileData.aboutOrganization);
        formData.append("licenseNumber", profileData.licenseNumber);
        formData.append("registrationNumber", profileData.registrationNumber);
        formData.append("contactPersonName", profileData.contactPersonName);
        formData.append("contactPersonTitle", profileData.contactPersonTitle);
        formData.append("contactPersonPhone", profileData.contactPersonPhone);
      }

      const res = await axios.post(`http://localhost:8080/api/users/update/${userId}`, formData, {
        headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" }
      });
      setProfileData(res.data);
      setCareEditMode(false);
      alert("✅ " + (profileData.accountType === "ORGANIZATION" ? "Organization" : "Care") + " profile updated successfully!");
    } catch (err) {
      console.error("Error saving care profile:", err);
      alert("Failed to save profile.");
    } finally {
      setCareSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-[#f1f5f9] text-slate-900 overflow-x-hidden">
      
      {/* SIDEBAR */}
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
                  location.pathname === item.link ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-600">
            <FaBars size={20} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase leading-none">{role}</p>
              <p className="text-sm font-bold text-slate-700">{profileData.userName}</p>
            </div>
            <img src={profileData.photo || "https://ui-avatars.com/api/?name=" + profileData.userName} className="h-9 w-9 rounded-full border border-slate-200 object-cover" alt="User" />
          </div>
        </header>

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
                    <img src={profileData.photo || "https://ui-avatars.com/api/?name=" + profileData.userName} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Avatar" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <FaCamera size={24} />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{profileData.userName}</h3>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-tighter mb-4">{role}</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={handlePhotoClick} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-full transition">
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
                    <input key={key} type="password" placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={passwordData[key]} onChange={(e) => setPasswordData({...passwordData, [key]: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none transition" />
                  ))}
                  {passwordMsg.text && (
                    <p className={`text-xs font-bold px-4 py-2 rounded-lg ${passwordMsg.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <button onClick={handlePasswordChange} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg transition active:scale-95">
                    Save Changes
                  </button>
                </div>
              </section>
            </div>

            {/* CARE/ORGANIZATION PROFILE SECTION - FOR BOTH INDIVIDUAL AND ORGANIZATION */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-r ${profileData.accountType === "ORGANIZATION" ? "from-slate-800 via-slate-700 to-slate-800" : "from-blue-600 to-indigo-600"} text-white p-8 flex items-center justify-between`}>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {profileData.accountType === "ORGANIZATION" ? "Organization Profile" : "Care Profile Summary"}
                  </h2>
                  <p className="text-blue-100">
                    {profileData.accountType === "ORGANIZATION" 
                      ? "Manage your facility information and services"
                      : "This information helps caregivers understand your care needs"}
                  </p>
                </div>
                <button onClick={() => setCareEditMode(!careEditMode)} className={`px-6 py-3 bg-white font-bold rounded-xl hover:bg-opacity-90 transition ${profileData.accountType === "ORGANIZATION" ? "text-slate-800" : "text-blue-600"}`}>
                  {careEditMode ? "Cancel" : "✏️ Edit"}
                </button>
              </div>

              <div className="p-8">
                {/* INDIVIDUAL ACCOUNT - DISPLAY MODE */}
                {profileData.accountType === "INDIVIDUAL" && !careEditMode && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">👤 Care Recipient</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.receiverType === "other" ? "Someone else" : "Myself"}</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">🏥 Service Type</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.serviceType || "Not specified"}</p>
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">📍 Location</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.address || "Not specified"}</p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">📋 Details</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.additionalInfo ? "Added" : "Not added"}</p>
                      </div>
                    </div>
                    {profileData.additionalInfo && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mt-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Additional Information</p>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{profileData.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* INDIVIDUAL ACCOUNT - EDIT MODE */}
                {profileData.accountType === "INDIVIDUAL" && careEditMode && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Who needs care?</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setProfileData({...profileData, receiverType: "self"})} className={`py-4 px-4 rounded-xl font-bold text-sm transition-all ${profileData.receiverType === "self" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>👤 Myself</button>
                        <button onClick={() => setProfileData({...profileData, receiverType: "other"})} className={`py-4 px-4 rounded-xl font-bold text-sm transition-all ${profileData.receiverType === "other" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>👨‍👩‍👧 Someone Else</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Type of Care Needed</label>
                      <select value={profileData.serviceType} onChange={(e) => setProfileData({...profileData, serviceType: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition">
                        <option value="">Select service type...</option>
                        {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Location</label>
                      <input type="text" placeholder="Eg. Kathmandu, Ward 5" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Additional Care Information</label>
                      <textarea placeholder="Describe condition..." value={profileData.additionalInfo} onChange={(e) => setProfileData({...profileData, additionalInfo: e.target.value})} rows={5} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition resize-none" />
                    </div>
                    <button onClick={handleCareSave} disabled={careSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg transition active:scale-95 disabled:opacity-60">
                      {careSaving ? "Saving..." : "Save Care Profile"}
                    </button>
                  </div>
                )}

                {/* ORGANIZATION ACCOUNT - DISPLAY MODE */}
                {profileData.accountType === "ORGANIZATION" && !careEditMode && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">🏢 Organization Name</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.organizationName || "Not specified"}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📅 Founded</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.foundationDate || "Not specified"}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">🛏️ Capacity</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.capacity || "N/A"} beds</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📍 Location</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.address || profileData.city || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📜 License</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.licenseNumber || "Not specified"}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">✓ Registration</p>
                        <p className="text-lg font-bold text-slate-900">{profileData.registrationNumber || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ORGANIZATION ACCOUNT - EDIT MODE */}
                {profileData.accountType === "ORGANIZATION" && careEditMode && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Organization Name</label>
                      <input type="text" value={profileData.organizationName} onChange={(e) => setProfileData({...profileData, organizationName: e.target.value})} placeholder="Your Organization" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Foundation Date</label>
                        <input type="date" value={profileData.foundationDate} onChange={(e) => setProfileData({...profileData, foundationDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Capacity (beds)</label>
                        <input type="number" value={profileData.capacity} onChange={(e) => setProfileData({...profileData, capacity: e.target.value})} placeholder="50" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">License Number</label>
                        <input type="text" value={profileData.licenseNumber} onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})} placeholder="LIC-2020-001" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Registration Number</label>
                        <input type="text" value={profileData.registrationNumber} onChange={(e) => setProfileData({...profileData, registrationNumber: e.target.value})} placeholder="REG-2015-001" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">City/District</label>
                        <input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} placeholder="Kathmandu" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Address</label>
                        <input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="123 Care Street" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Phone Number</label>
                        <input type="tel" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} placeholder="+977-1-4234567" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Website</label>
                        <input type="url" value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})} placeholder="www.organization.com" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">About Organization</label>
                      <textarea value={profileData.aboutOrganization} onChange={(e) => setProfileData({...profileData, aboutOrganization: e.target.value})} placeholder="Tell caregivers about your organization..." rows={4} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Contact Person Name</label>
                      <input type="text" value={profileData.contactPersonName} onChange={(e) => setProfileData({...profileData, contactPersonName: e.target.value})} placeholder="Name" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Contact Person Title</label>
                        <input type="text" value={profileData.contactPersonTitle} onChange={(e) => setProfileData({...profileData, contactPersonTitle: e.target.value})} placeholder="Director" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-3">Contact Person Phone</label>
                        <input type="tel" value={profileData.contactPersonPhone} onChange={(e) => setProfileData({...profileData, contactPersonPhone: e.target.value})} placeholder="+977-9841234567" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500 transition" />
                      </div>
                    </div>
                    <button onClick={handleCareSave} disabled={careSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg transition active:scale-95 disabled:opacity-60">
                      {careSaving ? "Saving..." : "Save Organization Profile"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Accepted Connections Section */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">✅ Accepted Caregivers</h2>
                  <p className="text-green-100">Caregivers who have accepted to care for you</p>
                </div>
                <button onClick={() => fetchAcceptedConnections()} disabled={loadingConnections} className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition">
                  {loadingConnections ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>

              <div className="p-8">
                {loadingConnections ? (
                  <p className="text-center py-8 text-slate-500 italic">Loading connections...</p>
                ) : acceptedConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">😢</div>
                    <p className="text-slate-500 font-semibold">No accepted caregivers yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptedConnections.map((connection) => {
                      const photoUrl = connection.caregiver?.photo 
                        ? `http://localhost:8080/uploads/${connection.caregiver.photo.replace(/\s+/g, "_").trim()}`
                        : `https://ui-avatars.com/api/?name=${connection.caregiver?.userName || "Unknown"}`;
                      
                      return (
                        <div key={connection.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg">{connection.caregiver?.userName || "Unknown"}</h3>
                              <p className="text-xs text-green-600 font-bold uppercase tracking-tight">✓ Accepted</p>
                            </div>
                            <img src={photoUrl} alt={connection.caregiver?.userName} className="w-12 h-12 rounded-full object-cover border-2 border-green-200" />
                          </div>
                          
                          {connection.caregiver?.experience && (
                            <div className="mb-4">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Experience</p>
                              <p className="text-sm text-slate-700 line-clamp-2">{connection.caregiver.experience}</p>
                            </div>
                          )}

                          <button
                            onClick={() => setActiveChat({
                              conversationId: connection.conversationId,
                              ...connection.caregiver,
                              photo: photoUrl // Use the processed photo URL
                            })}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 transition active:scale-95"
                          >
                            💬 Chat Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* CHAT OVERLAY */}
      {activeChat && (
        <Chat
          conversationId={activeChat.conversationId}
          conversationWith={activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default ProfileUser;