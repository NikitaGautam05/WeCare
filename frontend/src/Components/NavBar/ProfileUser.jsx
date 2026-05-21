import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera, FaLock, FaEnvelope, FaUser, FaUserEdit,
  FaCheckCircle, FaShieldAlt
} from "react-icons/fa";
import axios from "axios";
import Layout from "../Layout/Layout";
import Chat from "../Chat/Chat";

const ProfileUser = () => {
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);

  const userId      = localStorage.getItem("userId");
  const role        = localStorage.getItem("role") || "User";
  const token       = localStorage.getItem("jwtToken");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [activeChat, setActiveChat] = useState(null);

  const [profileData, setProfileData] = useState({
    userName: "", email: "", photo: "", address: "", serviceType: "",
    additionalInfo: "", receiverType: "self", recipientRelation: "Myself", recipientAge: "", recipientPhone: "", accountType: "INDIVIDUAL",
    organizationName: "", foundationDate: "", capacity: "", city: "",
    phoneNumber: "", website: "", servicesOffered: [], aboutOrganization: "",
    licenseNumber: "", registrationNumber: "", logo: "", bannerImage: "",
    contactPersonName: "", contactPersonTitle: "", contactPersonPhone: "",
  });

  const [careEditMode, setCareEditMode] = useState(false);
  const [careSaving,   setCareSaving]   = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const [passwordMsg, setPasswordMsg]           = useState({ text: "", isError: false });
  const [uploading,   setUploading]             = useState(false);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [loadingConnections,  setLoadingConnections]  = useState(false);

  const fetchAcceptedConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/accepted-for-receiver/${userId}`, axiosConfig);
      setAcceptedConnections(response.data || []);
    } catch (err) {
      console.error("Error fetching accepted connections:", err);
      setAcceptedConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    if (!userId || !token) { navigate("/login"); return; }
    axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, axiosConfig)
      .then(res => {
        const data = res.data;
        if (!data.accountType) data.accountType = data.organizationName ? "ORGANIZATION" : "INDIVIDUAL";
        setProfileData({
          ...data,
          receiverType: data.receiverType || "self",
          recipientRelation: data.recipientRelation || (data.receiverType === "other" ? "" : "Myself"),
          recipientAge: data.recipientAge || "",
          recipientPhone: data.recipientPhone || "",
        });
      })
      .catch(err => console.error(err));
    fetchAcceptedConnections();
  }, [userId, token, navigate]);

  const handlePhotoClick  = () => fileInputRef.current.click();

  const handleFileChange  = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/change-photo`, formData, {
        ...axiosConfig, headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
      });
      setProfileData({ ...profileData, photo: res.data.photoUrl });
    } catch { alert("Upload failed."); }
    finally { setUploading(false); }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match", isError: true }); return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/change-password`, null, {
        ...axiosConfig, params: { username: profileData.userName, currentPassword, newPassword },
      });
      setPasswordMsg({ text: "Password updated!", isError: false });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch { setPasswordMsg({ text: "Current password incorrect", isError: true }); }
  };

  const serviceTypes = [
    "Elderly Care", "Post-Surgery Care", "Disability Care",
    "Mental Health Support", "Physical Therapy", "Daily Living Assistance", "Other",
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
      formData.append("recipientRelation", profileData.recipientRelation);
      formData.append("recipientAge", profileData.recipientAge);
      formData.append("recipientPhone", profileData.recipientPhone);
      formData.append("accountType", profileData.accountType);
      if (profileData.accountType === "ORGANIZATION") {
        ["organizationName","foundationDate","capacity","city","phoneNumber","website",
         "aboutOrganization","licenseNumber","registrationNumber",
         "contactPersonName","contactPersonTitle","contactPersonPhone"].forEach(k =>
          formData.append(k, profileData[k])
        );
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/update/${userId}`, formData, {
        headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
      });
      setProfileData(res.data);
      setCareEditMode(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally { setCareSaving(false); }
  };

  const profileImg = profileData.photo
    ? (profileData.photo.startsWith("http") ? profileData.photo : `${import.meta.env.VITE_API_URL}/uploads/${profileData.photo}`)
    : `https://ui-avatars.com/api/?name=${profileData.userName}&background=1e293b&color=60a5fa&bold=true`;

  const isOrg = profileData.accountType === "ORGANIZATION";

  return (
    <Layout>

      {/* ── HERO — identical to Dashboard / Caregivers / History / Favourites ── */}
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-5xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <FaUserEdit size={9} />
              Account Settings
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Profile<br />
              <span className="text-blue-500">Settings</span>
            </h2>
            <p className="text-slate-400 text-base max-w-sm font-medium opacity-80">
              Update your photo, security, and care preferences.
            </p>
          </div>

          {/* Avatar preview in hero */}
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            onClick={handlePhotoClick}
          >
            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 border-slate-700 shadow-2xl ring-4 ring-slate-900 group-hover:ring-blue-500/30 transition-all">
              <img src={profileImg} alt={profileData.userName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
              <FaCamera size={18} className="text-white" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <FaCamera size={10} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-8 py-10 pb-20 space-y-6">

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Details</h2>
        </div>

        {/* ── IDENTITY ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</p>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500">
              <FaUser className="opacity-40" size={13} />
              <span className="font-semibold text-sm">{profileData.userName || "Loading..."}</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Email</p>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500">
              <FaEnvelope className="opacity-40" size={13} />
              <span className="font-semibold text-sm">{profileData.email || "Loading..."}</span>
            </div>
          </div>
        </div>

        {/* ── PHOTO + PASSWORD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Photo card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="relative mb-5 group cursor-pointer" onClick={handlePhotoClick}>
              <div className="w-28 h-28 rounded-[1.5rem] overflow-hidden ring-4 ring-white shadow-xl">
                <img src={profileImg} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Avatar" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                <FaCamera size={22} className="text-white" />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-base">{profileData.userName}</h3>
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-5">{role}</p>
            <div
              onClick={handlePhotoClick}
              className="px-5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all"
            >
              {uploading ? "Uploading…" : "Update Photo"}
            </div>
          </div>

          {/* Password card */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <FaLock size={12} className="text-blue-400" />
              </div>
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">Change Password</h4>
            </div>
            <div className="space-y-3">
              {[
                { key: "currentPassword", placeholder: "Current Password" },
                { key: "newPassword",     placeholder: "New Password" },
                { key: "confirmPassword", placeholder: "Confirm New Password" },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  type="password"
                  placeholder={placeholder}
                  value={passwordData[key]}
                  onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              ))}
              {passwordMsg.text && (
                <p className={`text-xs font-bold px-4 py-2 rounded-xl ${passwordMsg.isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}>
                  {passwordMsg.text}
                </p>
              )}
              <button
                onClick={handlePasswordChange}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>

        {/* ── CARE / ORGANIZATION PROFILE ── */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className={`px-8 py-6 flex items-center justify-between ${isOrg ? "bg-slate-900" : "bg-slate-900"}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <FaShieldAlt size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  {isOrg ? "Organization" : "Individual"}
                </p>
                <h2 className="text-lg font-black text-white tracking-tight">
                  {isOrg ? "Organization Profile" : "Care Profile"}
                </h2>
              </div>
            </div>
            <div
              onClick={() => setCareEditMode(!careEditMode)}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all"
            >
              {careEditMode ? "Cancel" : "✏ Edit"}
            </div>
          </div>

          <div className="p-8">

            {/* INDIVIDUAL — VIEW */}
            {!isOrg && !careEditMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Care Recipient", val: profileData.receiverType === "other" ? profileData.recipientRelation || "Someone else" : "Myself" },
                    { label: "Age",          val: profileData.recipientAge ? `${profileData.recipientAge} yrs` : "Not specified" },
                    { label: "Contact",      val: profileData.recipientPhone || "Not specified" },
                    { label: "Service Type",   val: profileData.serviceType   || "Not specified" },
                    { label: "Location",       val: profileData.address       || "Not specified" },
                    { label: "Details",        val: profileData.additionalInfo ? "Added" : "Not added" },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-sm font-black text-slate-900 truncate">{s.val}</p>
                    </div>
                  ))}
                </div>
                {profileData.additionalInfo && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Additional Information</p>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{profileData.additionalInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* INDIVIDUAL — EDIT */}
            {!isOrg && careEditMode && (
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Who needs care?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["self", "other"].map((v) => (
                      <div
                        key={v}
                        onClick={() => setProfileData({ ...profileData, receiverType: v, recipientRelation: v === "self" ? "Myself" : "" })}
                        className={`py-3.5 px-4 rounded-2xl font-black text-sm text-center cursor-pointer transition-all border ${
                          profileData.receiverType === v
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {v === "self" ? "👤 Myself" : "👨‍👩‍👧 Someone Else"}
                      </div>
                    ))}
                  </div>
                </div>
                {profileData.receiverType === "other" && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Who are you hiring for?</label>
                    <select
                      value={profileData.recipientRelation}
                      onChange={(e) => setProfileData({ ...profileData, recipientRelation: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                    >
                      <option value="">Select relation</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Age</label>
                    <input
                      type="text"
                      value={profileData.recipientAge}
                      onChange={(e) => setProfileData({ ...profileData, recipientAge: e.target.value.replace(/[^0-9]/g, "") })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                      placeholder="Eg. 72"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Contact Number</label>
                    <input
                      type="text"
                      value={profileData.recipientPhone}
                      onChange={(e) => setProfileData({ ...profileData, recipientPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                      placeholder="Eg. 9841234567"
                      maxLength="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Type of Care Needed</label>
                  <select
                    value={profileData.serviceType}
                    onChange={(e) => setProfileData({ ...profileData, serviceType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                  >
                    <option value="">Select service type...</option>
                    {serviceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Location</label>
                  <input type="text" placeholder="Eg. Kathmandu, Ward 5" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Additional Care Information</label>
                  <textarea placeholder="Describe condition..." value={profileData.additionalInfo} onChange={(e) => setProfileData({ ...profileData, additionalInfo: e.target.value })} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all resize-none" />
                </div>
                <button onClick={handleCareSave} disabled={careSaving} className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm disabled:opacity-50">
                  {careSaving ? "Saving…" : "Save Care Profile"}
                </button>
              </div>
            )}

            {/* ORGANIZATION — VIEW */}
            {isOrg && !careEditMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Organization",  val: profileData.organizationName  || "Not specified" },
                    { label: "Founded",        val: profileData.foundationDate    || "Not specified" },
                    { label: "Capacity",       val: profileData.capacity ? `${profileData.capacity} beds` : "N/A" },
                    { label: "Location",       val: profileData.address || profileData.city || "Not specified" },
                    { label: "License",        val: profileData.licenseNumber     || "Not specified" },
                    { label: "Registration",   val: profileData.registrationNumber || "Not specified" },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-sm font-black text-slate-900 truncate">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORGANIZATION — EDIT */}
            {isOrg && careEditMode && (
              <div className="space-y-5">
                {[
                  { label: "Organization Name",     key: "organizationName",    type: "text",   placeholder: "Your Organization" },
                  { label: "Foundation Date",        key: "foundationDate",      type: "date",   placeholder: "" },
                  { label: "Capacity (beds)",        key: "capacity",            type: "number", placeholder: "50" },
                  { label: "License Number",         key: "licenseNumber",       type: "text",   placeholder: "LIC-2020-001" },
                  { label: "Registration Number",    key: "registrationNumber",  type: "text",   placeholder: "REG-2015-001" },
                  { label: "City / District",        key: "city",                type: "text",   placeholder: "Kathmandu" },
                  { label: "Address",                key: "address",             type: "text",   placeholder: "123 Care Street" },
                  { label: "Phone Number",           key: "phoneNumber",         type: "tel",    placeholder: "+977-1-4234567" },
                  { label: "Website",                key: "website",             type: "url",    placeholder: "www.organization.com" },
                  { label: "Contact Person Name",    key: "contactPersonName",   type: "text",   placeholder: "Name" },
                  { label: "Contact Person Title",   key: "contactPersonTitle",  type: "text",   placeholder: "Director" },
                  { label: "Contact Person Phone",   key: "contactPersonPhone",  type: "tel",    placeholder: "+977-9841234567" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
                    <input type={type} value={profileData[key]} onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })} placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">About Organization</label>
                  <textarea value={profileData.aboutOrganization} onChange={(e) => setProfileData({ ...profileData, aboutOrganization: e.target.value })} placeholder="Tell caregivers about your organization..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all resize-none" />
                </div>
                <button onClick={handleCareSave} disabled={careSaving} className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm disabled:opacity-50">
                  {careSaving ? "Saving…" : "Save Organization Profile"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── ACCEPTED CAREGIVERS ── */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-8 py-6 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <FaCheckCircle size={14} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">Connected</p>
                <h2 className="text-lg font-black text-white tracking-tight">Accepted Caregivers</h2>
              </div>
            </div>
            <div
              onClick={() => !loadingConnections && fetchAcceptedConnections()}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all"
            >
              {loadingConnections ? "Refreshing…" : "↻ Refresh"}
            </div>
          </div>

          <div className="p-8">
            {loadingConnections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
              </div>
            ) : acceptedConnections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                <FaCheckCircle size={24} className="text-slate-200 mb-3" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No accepted caregivers yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acceptedConnections.map((connection) => {
                  const photoUrl = connection.caregiver?.photo
                    ? `${import.meta.env.VITE_API_URL}/uploads/${connection.caregiver.photo.replace(/\s+/g, "_").trim()}`
                    : `https://ui-avatars.com/api/?name=${connection.caregiver?.userName || "Unknown"}&background=1e293b&color=60a5fa&bold=true`;

                  return (
                    <div
                      key={connection.id}
                      className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 p-4"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={photoUrl}
                          alt={connection.caregiver?.userName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                          onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${connection.caregiver?.userName || "C"}&background=1e293b&color=60a5fa&bold=true`)}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {connection.caregiver?.userName || "Unknown"}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Accepted
                        </span>
                        {connection.caregiver?.experience && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate mt-1">
                            {connection.caregiver.experience} yrs experience
                          </p>
                        )}
                      </div>

                      {/* Chat button */}
                      <button
                        onClick={() => setActiveChat({
                          conversationId: connection.conversationId,
                          ...connection.caregiver,
                          photo: photoUrl,
                        })}
                        className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                      >
                        Chat
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CHAT OVERLAY ── */}
      {activeChat && (
        <Chat
          conversationId={activeChat.conversationId}
          conversationWith={activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}

    </Layout>
  );
};

export default ProfileUser;