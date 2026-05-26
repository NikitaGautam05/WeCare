import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfileForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    photo: null,
    address: "",
    serviceType: "",
    additionalInfo: "",
    receiverType: "self", // "self" or "other"
    accountType: "INDIVIDUAL",
    gender: "", // Gender field for individual receivers
    recipientRelation: "",
    recipientAge: "",
    recipientPhone: "",
    recipientGender: "", // Gender for recipient when requesting care for someone else
    // Organization fields
    organizationName: "",
    foundationDate: "",
    capacity: "",
    city: "",
    phoneNumber: "",
    website: "",
    aboutOrganization: "",
    licenseNumber: "",
    registrationNumber: "",
    contactPersonName: "",
    contactPersonTitle: "",
    contactPersonPhone: "",
    organizationPhotos: [], // Array to store up to 5 photos
  });
  const [organizationPhotosPreviews, setOrganizationPhotosPreviews] = useState([]);

  const serviceTypes = [
    "Elderly Care",
    "Post-Surgery Care",
    "Disability Care",
    "Mental Health Support",
    "Physical Therapy",
    "Daily Living Assistance",
    "Other"
  ];

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let finalValue = files ? files[0] : value;
    let fieldError = "";

    // Handle organization photos (multiple files)
    if (name === "organizationPhotos" && files) {
      const newPhotos = Array.from(files);
      const totalPhotos = form.organizationPhotos.length + newPhotos.length;
      
      if (totalPhotos > 5) {
        fieldError = `You can upload a maximum of 5 photos. You already have ${form.organizationPhotos.length} photo(s).`;
        return;
      }

      const updatedPhotos = [...form.organizationPhotos, ...newPhotos];
      const previews = updatedPhotos.map(photo => URL.createObjectURL(photo));
      
      setForm({ ...form, organizationPhotos: updatedPhotos });
      setOrganizationPhotosPreviews(previews);
      return;
    }

    // Validate capacity field - numbers only
    if (name === "capacity" && value !== "") {
      if (!/^\d+$/.test(value)) {
        fieldError = "Capacity must be a number only";
        finalValue = value.replace(/[^0-9]/g, "");
      }
    }

    // Validate phone number - 10 digits only
    if ((name === "phoneNumber" || name === "contactPersonPhone" || name === "recipientPhone") && value !== "") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      if (digitsOnly.length > 10) {
        fieldError = "Phone number must be 10 digits maximum";
        finalValue = digitsOnly.slice(0, 10);
      } else if (value.length > 0 && !/^\d*$/.test(value)) {
        fieldError = "Phone number must contain only digits";
        finalValue = digitsOnly;
      }
    }

    if (name === "recipientAge" && value !== "") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      if (digitsOnly && Number(digitsOnly) < 50) {
        fieldError = "Age must be 50 or older";
      }
      finalValue = digitsOnly;
    }

    setForm({ ...form, [name]: finalValue });
    setErrors({ ...errors, [name]: fieldError });
  };

  const removeOrganizationPhoto = (index) => {
    const updatedPhotos = form.organizationPhotos.filter((_, i) => i !== index);
    const updatedPreviews = organizationPhotosPreviews.filter((_, i) => i !== index);
    
    // Revoke old preview URL
    URL.revokeObjectURL(organizationPhotosPreviews[index]);
    
    setForm({ ...form, organizationPhotos: updatedPhotos });
    setOrganizationPhotosPreviews(updatedPreviews);
  };

  const validateStep = () => {
    let errs = {};
    if (step === 1) {
      if (!form.photo) errs.photo = "Photo is required";
    }
    if (step === 2) {
      if (!form.address) errs.address = "Address is required";
      if (!form.serviceType) errs.serviceType = "Service type is required";
      if (!form.gender) errs.gender = "Gender is required";
      if (form.recipientAge && Number(form.recipientAge) < 50) errs.recipientAge = "Age must be 50 or older";
    }
    if (step === 3) {
      if (!form.additionalInfo) errs.additionalInfo = "Please tell us more about your needs";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("address", form.address);
    formData.append("serviceType", form.serviceType);
    formData.append("additionalInfo", form.additionalInfo);
    formData.append("receiverType", form.receiverType);
    formData.append("accountType", form.accountType);
    formData.append("gender", form.gender);
    if (form.recipientRelation) formData.append("recipientRelation", form.recipientRelation);
    if (form.recipientAge) formData.append("recipientAge", form.recipientAge);
    if (form.recipientPhone) formData.append("recipientPhone", form.recipientPhone);
    if (form.recipientGender) formData.append("recipientGender", form.recipientGender);
    
    // Organization fields
    if (form.accountType === "ORGANIZATION") {
      if (form.organizationName) formData.append("organizationName", form.organizationName);
      if (form.foundationDate) formData.append("foundationDate", form.foundationDate);
      if (form.capacity) formData.append("capacity", form.capacity);
      if (form.city) formData.append("city", form.city);
      if (form.phoneNumber) formData.append("phoneNumber", form.phoneNumber);
      if (form.website) formData.append("website", form.website);
      if (form.aboutOrganization) formData.append("aboutOrganization", form.aboutOrganization);
      if (form.licenseNumber) formData.append("licenseNumber", form.licenseNumber);
      if (form.registrationNumber) formData.append("registrationNumber", form.registrationNumber);
      if (form.contactPersonName) formData.append("contactPersonName", form.contactPersonName);
      if (form.contactPersonTitle) formData.append("contactPersonTitle", form.contactPersonTitle);
      if (form.contactPersonPhone) formData.append("contactPersonPhone", form.contactPersonPhone);
    }
    
    if (form.photo instanceof File) {
      formData.append("photo", form.photo);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    try {
      setLoading(true);
      const endpoint = profile
        ? `${import.meta.env.VITE_API_URL}/api/users/update/${userId}`
        : `${import.meta.env.VITE_API_URL}/api/users/profile`;
      
      // Add organization photos to formData
      if (form.accountType === "ORGANIZATION" && form.organizationPhotos.length > 0) {
        form.organizationPhotos.forEach((photo, index) => {
          if (photo instanceof File) {
            formData.append(`organizationPhotos`, photo);
          }
        });
      }
      
      console.log("📤 Sending profile to:", endpoint);
      console.log("📋 Data:", { address: form.address, serviceType: form.serviceType, additionalInfo: form.additionalInfo, accountType: form.accountType, gender: form.gender });
      
      const res = await axios.post(endpoint, formData, config);
      console.log("✅ Response:", res.data);
      setProfile(res.data);
      setEditMode(false);
      setOrganizationPhotosPreviews([]);
      alert("✅ Care profile updated successfully!");
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || "Error saving profile";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !token) return;

    axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data.address || res.data.serviceType) {
          setProfile(res.data);
          setForm({
            photo: null,
            address: res.data.address || "",
            serviceType: res.data.serviceType || "",
            additionalInfo: res.data.additionalInfo || "",
            receiverType: res.data.receiverType || "self",
            accountType: res.data.accountType || "INDIVIDUAL",
            gender: res.data.gender || "",
            recipientRelation: res.data.recipientRelation || "",
            recipientAge: res.data.recipientAge || "",
            recipientPhone: res.data.recipientPhone || "",
            recipientGender: res.data.recipientGender || "",
            organizationName: res.data.organizationName || "",
            foundationDate: res.data.foundationDate || "",
            capacity: res.data.capacity || "",
            city: res.data.city || "",
            phoneNumber: res.data.phoneNumber || "",
            website: res.data.website || "",
            aboutOrganization: res.data.aboutOrganization || "",
            licenseNumber: res.data.licenseNumber || "",
            registrationNumber: res.data.registrationNumber || "",
            contactPersonName: res.data.contactPersonName || "",
            contactPersonTitle: res.data.contactPersonTitle || "",
            contactPersonPhone: res.data.contactPersonPhone || "",
            organizationPhotos: [],
          });
          // Load existing organization photos if available
          if (res.data.organizationPhotos && Array.isArray(res.data.organizationPhotos)) {
            const previews = res.data.organizationPhotos.map(photo => 
              `${import.meta.env.VITE_API_URL}/uploads/${photo.replace(/\s+/g, "_")}`
            );
            setOrganizationPhotosPreviews(previews);
          }
        }
      })
      .catch(err => console.error("Failed to fetch profile:", err));
  }, [userId, token]);

  const next = () => validateStep() && setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const startEdit = () => {
    if (profile) {
      setForm({
        photo: null,
        address: profile.address || "",
        serviceType: profile.serviceType || "",
        additionalInfo: profile.additionalInfo || "",
        receiverType: profile.receiverType || "self",
        accountType: profile.accountType || "INDIVIDUAL",
        gender: profile.gender || "",
        recipientRelation: profile.recipientRelation || "",
        recipientAge: profile.recipientAge || "",
        recipientPhone: profile.recipientPhone || "",
        recipientGender: profile.recipientGender || "",
        organizationName: profile.organizationName || "",
        foundationDate: profile.foundationDate || "",
        capacity: profile.capacity || "",
        city: profile.city || "",
        phoneNumber: profile.phoneNumber || "",
        website: profile.website || "",
        aboutOrganization: profile.aboutOrganization || "",
        licenseNumber: profile.licenseNumber || "",
        registrationNumber: profile.registrationNumber || "",
        contactPersonName: profile.contactPersonName || "",
        contactPersonTitle: profile.contactPersonTitle || "",
        contactPersonPhone: profile.contactPersonPhone || "",
        organizationPhotos: [],
      });
      // Load existing organization photos if available
      if (profile.organizationPhotos && Array.isArray(profile.organizationPhotos)) {
        const previews = profile.organizationPhotos.map(photo => 
          `${import.meta.env.VITE_API_URL}/uploads/${photo.replace(/\s+/g, "_")}`
        );
        setOrganizationPhotosPreviews(previews);
      } else {
        setOrganizationPhotosPreviews([]);
      }
    }
    setStep(1);
    setEditMode(true);
  };

  const fs = (name) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${errors[name] ? "#ef4444" : "#e5e5e5"}`,
    borderRadius: 10,
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    color: "#111",
    background: "#fafafa",
    outline: "none",
  });

  const onFocus = e => {
    e.target.style.borderColor = "#111";
    e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.06)";
    e.target.style.background = "#fff";
  };

  const onBlur = (name) => e => {
    e.target.style.borderColor = errors[name] ? "#ef4444" : "#e5e5e5";
    e.target.style.boxShadow = "none";
  };

  // ─ Display existing profile
  if (profile && !editMode) {
    const photoPath = form.photo ? form.photo : profile.photo;
    const photoUrl = photoPath 
      ? `${import.meta.env.VITE_API_URL}/uploads/${photoPath.replace(/\s+/g, "_")}`
      : `https://ui-avatars.com/api/?name=${profile.userName}`;

    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .profile-card-in { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .info-row { display:flex; gap:16px; padding:14px 0; border-bottom:1px solid #f5f5f5; align-items:flex-start; }
          .info-row:last-child { border-bottom:none; }
          .info-label { font-size:11px; font-weight:600; color:#bbb; letter-spacing:1px; text-transform:uppercase; min-width:120px; padding-top:1px; }
          .info-value { font-size:14px; color:#222; font-weight:500; flex:1; line-height:1.5; }
        `}</style>

        <div className="profile-card-in">
          <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4caf50", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, flexShrink: 0 }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2e7d32" }}>
                Profile Complete
              </div>
              <div style={{ fontSize: 12, color: "#2e7d32", opacity: 0.7, marginTop: 2 }}>
                Caregivers can now see your full care needs.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ width: 88, height: 88, borderRadius: 16, overflow: "hidden", background: "#f5f5f5", flexShrink: 0, border: "2px solid #ebebeb" }}>
              <img
                src={photoUrl}
                alt={profile.userName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.parentNode.style.background = "#111";
                  e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700">${profile.userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>`;
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#111", margin: "0 0 4px", lineHeight: 1.1 }}>
                {profile.userName}
              </h1>
              <p style={{ fontSize: 14, color: "#888", margin: "0 0 12px" }}>
                {profile.receiverType === "other" ? "Care Requested for Others" : "Self Care"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.address && (
                  <span style={{ fontSize: 12, color: "#666", background: "#f5f5f5", padding: "4px 10px", borderRadius: 100 }}>
                    📍 {profile.address}
                  </span>
                )}
                {profile.serviceType && (
                  <span style={{ fontSize: 12, color: "#666", background: "#f5f5f5", padding: "4px 10px", borderRadius: 100 }}>
                    🏥 {profile.serviceType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#bbb", textTransform: "uppercase", marginBottom: 14 }}>
              Care Information
            </div>
            {[
              { label: "Receiver Type", value: profile.receiverType === "other" ? "Requesting care for someone else" : "Requesting care for myself", icon: "👤" },
              { label: "Service Needed", value: profile.serviceType || "—", icon: "🏥" },
              { label: "Location", value: profile.address || "—", icon: "📍" },
              { label: "Gender", value: profile.gender || "—", icon: "👨" },
            ].map((row, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{row.icon} {row.label}</span>
                <span className="info-value">{row.value}</span>
              </div>
            ))}
          </div>

          {profile.receiverType === "other" && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#bbb", textTransform: "uppercase", marginBottom: 14 }}>
                Recipient Information
              </div>
              {[
                { label: "Relation", value: profile.recipientRelation || "—", icon: "👥" },
                { label: "Age", value: profile.recipientAge ? `${profile.recipientAge} years` : "—", icon: "🎂" },
                { label: "Contact", value: profile.recipientPhone || "—", icon: "📱" },
                { label: "Gender", value: profile.recipientGender || "—", icon: "👤" },
              ].map((row, i) => (
                <div key={i} className="info-row">
                  <span className="info-label">{row.icon} {row.label}</span>
                  <span className="info-value">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {profile.additionalInfo && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#bbb", textTransform: "uppercase", marginBottom: 12 }}>
                Additional Details
              </div>
              <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, background: "#fafafa", padding: "16px", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                {profile.additionalInfo}
              </p>
            </div>
          )}

          <button
            onClick={startEdit}
            style={{ width: "100%", padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            onMouseOver={e => e.currentTarget.style.background = "#333"}
            onMouseOut={e => e.currentTarget.style.background = "#111"}
          >
            ✏ Edit Profile
          </button>
        </div>
      </div>
    );
  }

  // ─ Multi-step form
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .step-section { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .upload-zone { border:1.5px dashed #ddd; border-radius:12px; padding:22px; text-align:center; cursor:pointer; transition:all 0.2s; background:#fafafa; position:relative; }
        .upload-zone:hover { border-color:#999; background:#f5f5f5; }
        .upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .action-btn { padding:11px 26px; border-radius:10px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; border:none; }
        .action-btn.primary { background:#111; color:#fff; }
        .action-btn.primary:hover { background:#333; }
        .action-btn.primary:disabled { background:#ccc; cursor:not-allowed; }
        .action-btn.ghost { background:transparent; color:#666; border:1.5px solid #e0e0e0; }
        .action-btn.ghost:hover { border-color:#999; color:#111; }
        .radio-group { display:flex; gap:12px; }
        .radio-option { flex:1; position:relative; }
        .radio-option input[type="radio"] { position:absolute; opacity:0; cursor:pointer; width:100%; height:100%; }
        .radio-label { display:block; padding:14px; border:1.5px solid #ddd; border-radius:10px; text-align:center; cursor:pointer; transition:all 0.2s; }
        .radio-option input[type="radio"]:checked + .radio-label { border-color:#111; background:#f5f5f5; font-weight:600; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: "#111", margin: "0 0 4px" }}>
          {editMode ? "Edit Your Care Profile" : "Create Your Care Profile"}
        </h2>
        <p style={{ fontSize: 13, color: "#aaa" }}>Help caregivers understand your care needs better.</p>
      </div>

      {/* Account Type Selector (Individual/Organization) */}
      {!editMode && (
        <div style={{ marginBottom: 24, padding: "14px", background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 10 }}>Account Type</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="individual"
                name="accountType"
                value="INDIVIDUAL"
                checked={form.accountType === "INDIVIDUAL"}
                onChange={handleChange}
              />
              <label htmlFor="individual" className="radio-label" style={{ cursor: "pointer" }}>
                👤 Individual
              </label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="organization"
                name="accountType"
                value="ORGANIZATION"
                checked={form.accountType === "ORGANIZATION"}
                onChange={handleChange}
              />
              <label htmlFor="organization" className="radio-label" style={{ cursor: "pointer" }}>
                🏢 Organization
              </label>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {(form.accountType === "INDIVIDUAL" 
          ? ["Photo", "Care Needs", "Details"] 
          : ["Photo", "Care Needs", "Details", "Organization"]
        ).map((label, i) => {
          const totalSteps = form.accountType === "INDIVIDUAL" ? 3 : 4;
          const isActive = step === i + 1;
          const isDone = step > i + 1;
          return (
            <React.Fragment key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, background: isDone ? "#22c55e" : isActive ? "#111" : "#ebebeb", color: isDone || isActive ? "#fff" : "#bbb", transition: "all 0.3s" }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? "#111" : "#bbb", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < totalSteps - 1 && (
                <div style={{ flex: 1, height: 2, background: step > i + 1 ? "#22c55e" : "#ebebeb", margin: "0 6px 16px", transition: "background 0.4s" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>

        {/* Step 1 – Photo */}
        {step === 1 && (
          <div className="step-section">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#111", margin: "0 0 3px" }}>Your Photo</h3>
              <p style={{ fontSize: 13, color: "#aaa" }}>Upload a clear photo to help caregivers recognize you.</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Profile Photo</label>
              <div className="upload-zone" style={{ borderColor: errors.photo ? "#ef4444" : "#ddd" }}>
                <input type="file" name="photo" onChange={handleChange} accept="image/*" />
                <div style={{ fontSize: 26, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{form.photo ? form.photo.name : "Click to upload"}</div>
                <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>Clear, well-lit photo</div>
              </div>
              {errors.photo && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.photo}</p>}
            </div>
          </div>
        )}

        {/* Step 2 – Care Needs */}
        {step === 2 && (
          <div className="step-section">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#111", margin: "0 0 3px" }}>Your Care Needs</h3>
              <p style={{ fontSize: 13, color: "#aaa" }}>Tell caregivers what kind of care you're looking for.</p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 10 }}>Who needs care?</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="self"
                    name="receiverType"
                    value="self"
                    checked={form.receiverType === "self"}
                    onChange={handleChange}
                  />
                  <label htmlFor="self" className="radio-label" style={{ cursor: "pointer" }}>
                    👤 Myself
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="other"
                    name="receiverType"
                    value="other"
                    checked={form.receiverType === "other"}
                    onChange={handleChange}
                  />
                  <label htmlFor="other" className="radio-label" style={{ cursor: "pointer" }}>
                    👨‍👩‍👧 Someone Else
                  </label>
                </div>
              </div>
            </div>

            {/* Recipient Information (shown when "Someone Else" is selected) */}
            {form.receiverType === "other" && (
              <div style={{ marginBottom: 18, padding: "14px", background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: "#0369a1", margin: 0, fontWeight: 600 }}>👨‍👩‍👧 Who are you hiring for?</p>
              </div>
            )}

            {form.receiverType === "other" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Relation</label>
                  <input
                    type="text"
                    name="recipientRelation"
                    placeholder="Eg. Grandfather, Mother, Father"
                    value={form.recipientRelation}
                    onChange={handleChange}
                    style={fs("recipientRelation")}
                    onFocus={onFocus}
                    onBlur={onBlur("recipientRelation")}
                  />
                  {errors.recipientRelation && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.recipientRelation}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Age</label>
                  <input
                    type="number"
                    min="50"
                    name="recipientAge"
                    placeholder="Eg. 50"
                    value={form.recipientAge}
                    onChange={handleChange}
                    style={fs("recipientAge")}
                    onFocus={onFocus}
                    onBlur={onBlur("recipientAge")}
                  />
                  {errors.recipientAge && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.recipientAge}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Contact Number</label>
                  <input
                    type="text"
                    name="recipientPhone"
                    placeholder="Eg. 9876389191"
                    value={form.recipientPhone}
                    onChange={handleChange}
                    style={fs("recipientPhone")}
                    onFocus={onFocus}
                    onBlur={onBlur("recipientPhone")}
                    maxLength="10"
                  />
                  {errors.recipientPhone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.recipientPhone}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Gender</label>
                  <select
                    name="recipientGender"
                    value={form.recipientGender}
                    onChange={handleChange}
                    style={{ ...fs("recipientGender"), cursor: "pointer" }}
                    onFocus={onFocus}
                    onBlur={onBlur("recipientGender")}
                  >
                    <option value="">Select gender ...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.recipientGender && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.recipientGender}</p>}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Type of Care Need</label>
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                style={{ ...fs("serviceType"), cursor: "pointer" }}
                onFocus={onFocus}
                onBlur={onBlur("serviceType")}
              >
                <option value="">Select service type ...</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.serviceType && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.serviceType}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Location</label>
              <input
                type="text"
                name="address"
                placeholder="Eg. Kathmandu, Ward 5"
                value={form.address}
                onChange={handleChange}
                style={fs("address")}
                onFocus={onFocus}
                onBlur={onBlur("address")}
              />
              {errors.address && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.address}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ ...fs("gender"), cursor: "pointer" }}
                onFocus={onFocus}
                onBlur={onBlur("gender")}
              >
                <option value="">Select gender ...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.gender}</p>}
            </div>
          </div>
        )}

        {/* Step 3 – Additional Details */}
        {step === 3 && (
          <div className="step-section">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#111", margin: "0 0 3px" }}>Additional Details</h3>
              <p style={{ fontSize: 13, color: "#aaa" }}>Help caregivers understand your specific needs and preferences.</p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Tell us more</label>
              <textarea
                name="additionalInfo"
                rows={5}
                placeholder="Describe your health condition, preferences, schedule, or any special requirements. For example: 'I need help with daily living, medications at 9am and 6pm, and prefer morning shifts.'"
                value={form.additionalInfo}
                onChange={handleChange}
                style={{ ...fs("additionalInfo"), resize: "vertical", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}
                onFocus={onFocus}
                onBlur={onBlur("additionalInfo")}
              />
              {errors.additionalInfo && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.additionalInfo}</p>}
            </div>
          </div>
        )}

        {/* Step 4 – Organization Details (only for organizations) */}
        {form.accountType === "ORGANIZATION" && step === 4 && (
          <div className="step-section">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#111", margin: "0 0 3px" }}>Organization Details</h3>
              <p style={{ fontSize: 13, color: "#aaa" }}>Tell caregivers about your organization.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Eg. Happy Care Center"
                  value={form.organizationName}
                  onChange={handleChange}
                  style={fs("organizationName")}
                  onFocus={onFocus}
                  onBlur={onBlur("organizationName")}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Foundation Date</label>
                <input
                  type="date"
                  name="foundationDate"
                  value={form.foundationDate}
                  onChange={handleChange}
                  style={fs("foundationDate")}
                  onFocus={onFocus}
                  onBlur={onBlur("foundationDate")}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Capacity (beds)</label>
                <input
                  type="text"
                  name="capacity"
                  placeholder="Eg. 10"
                  value={form.capacity}
                  onChange={handleChange}
                  style={fs("capacity")}
                  onFocus={onFocus}
                  onBlur={onBlur("capacity")}
                />
                {errors.capacity && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.capacity}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Eg. Kathmandu"
                  value={form.city}
                  onChange={handleChange}
                  style={fs("city")}
                  onFocus={onFocus}
                  onBlur={onBlur("city")}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Eg. 9841234567"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  style={fs("phoneNumber")}
                  onFocus={onFocus}
                  onBlur={onBlur("phoneNumber")}
                  maxLength="10"
                />
                {errors.phoneNumber && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.phoneNumber}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="Eg. https://example.com"
                  value={form.website}
                  onChange={handleChange}
                  style={fs("website")}
                  onFocus={onFocus}
                  onBlur={onBlur("website")}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                placeholder="Eg. LIC-2024-001"
                value={form.licenseNumber}
                onChange={handleChange}
                style={fs("licenseNumber")}
                onFocus={onFocus}
                onBlur={onBlur("licenseNumber")}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="Eg. REG-2024-001"
                value={form.registrationNumber}
                onChange={handleChange}
                style={fs("registrationNumber")}
                onFocus={onFocus}
                onBlur={onBlur("registrationNumber")}
              />
            </div>

            <div style={{ marginBottom: 14, padding: "12px", background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: "#0369a1", margin: 0, fontWeight: 500 }}>Contact Person Information</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Contact Person Name</label>
                <input
                  type="text"
                  name="contactPersonName"
                  placeholder="Eg. John Doe"
                  value={form.contactPersonName}
                  onChange={handleChange}
                  style={fs("contactPersonName")}
                  onFocus={onFocus}
                  onBlur={onBlur("contactPersonName")}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Title</label>
                <input
                  type="text"
                  name="contactPersonTitle"
                  placeholder="Eg. Director"
                  value={form.contactPersonTitle}
                  onChange={handleChange}
                  style={fs("contactPersonTitle")}
                  onFocus={onFocus}
                  onBlur={onBlur("contactPersonTitle")}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Contact Phone</label>
              <input
                type="text"
                name="contactPersonPhone"
                placeholder="Eg. 9841234567"
                value={form.contactPersonPhone}
                onChange={handleChange}
                style={fs("contactPersonPhone")}
                onFocus={onFocus}
                onBlur={onBlur("contactPersonPhone")}
                maxLength="10"
              />
              {errors.contactPersonPhone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.contactPersonPhone}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>About Your Organization</label>
              <textarea
                name="aboutOrganization"
                rows={4}
                placeholder="Describe your organization, mission, services offered, and specialty areas..."
                value={form.aboutOrganization}
                onChange={handleChange}
                style={{ ...fs("aboutOrganization"), resize: "vertical", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}
                onFocus={onFocus}
                onBlur={onBlur("aboutOrganization")}
              />
            </div>

            <div style={{ marginBottom: 18, padding: "14px", background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: "#0369a1", margin: 0, fontWeight: 600 }}>🏢 Organization Photos</p>
              <p style={{ fontSize: 11, color: "#0369a1", margin: "4px 0 0 0", opacity: 0.8 }}>Upload up to 5 photos of your organization (facilities, team, etc.)</p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
                Organization Photos ({form.organizationPhotos.length}/5)
              </label>
              <div className="upload-zone" style={{ borderColor: errors.organizationPhotos ? "#ef4444" : "#ddd" }}>
                <input 
                  type="file" 
                  name="organizationPhotos" 
                  onChange={handleChange} 
                  accept="image/*" 
                  multiple
                  disabled={form.organizationPhotos.length >= 5}
                />
                <div style={{ fontSize: 24, marginBottom: 6 }}>📸</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Click to upload photos</div>
                <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>You can upload up to 5 photos</div>
              </div>
              {errors.organizationPhotos && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.organizationPhotos}</p>}
            </div>

            {organizationPhotosPreviews.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 10 }}>Uploaded Photos</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                  {organizationPhotosPreviews.map((preview, index) => (
                    <div key={index} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e0e0e0" }}>
                      <img
                        src={preview}
                        alt={`Organization ${index + 1}`}
                        style={{ width: "100%", height: "100px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeOrganizationPhoto(index)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 OLD (keeping for individual users) – Additional Details */}
        {form.accountType === "INDIVIDUAL" && step === 3 && (
          <div className="step-section">
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#111", margin: "0 0 3px" }}>Additional Details</h3>
              <p style={{ fontSize: 13, color: "#aaa" }}>Help caregivers understand your specific needs and preferences.</p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>Tell us more</label>
              <textarea
                name="additionalInfo"
                rows={5}
                placeholder="Describe your health condition, preferences, schedule, or any special requirements. For example: 'I need help with daily living, medications at 9am and 6pm, and prefer morning shifts.'"
                value={form.additionalInfo}
                onChange={handleChange}
                style={{ ...fs("additionalInfo"), resize: "vertical", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}
                onFocus={onFocus}
                onBlur={onBlur("additionalInfo")}
              />
              {errors.additionalInfo && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.additionalInfo}</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 22, borderTop: "1px solid #f0f0f0" }}>
          <div>
            {step > 1 && <button type="button" className="action-btn ghost" onClick={back}>← Back</button>}
            {editMode && step === 1 && <button type="button" className="action-btn ghost" onClick={() => { setEditMode(false); setStep(1); }}>Cancel</button>}
          </div>
          <div>
            {(() => {
              const maxSteps = form.accountType === "INDIVIDUAL" ? 3 : 4;
              return step < maxSteps
                ? <button type="button" className="action-btn primary" onClick={next}>Continue →</button>
                : (
                  <button type="submit" className="action-btn primary" disabled={loading}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                          Saving...
                        </span>
                      : editMode ? "Save Changes ✓" : "Complete Profile ✓"
                    }
                  </button>
                );
            })()}
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
