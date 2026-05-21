import React, { useEffect, useState } from "react";
import axios from "axios";

const STEPS = ["Documents", "Personal", "Professional", "Charges"];

const ProfileForm = ({ onSubmitSuccess, userId }) => {
  const [step,             setStep]             = useState(1);
  const [errors,           setErrors]           = useState({});
  const [loading,          setLoading]          = useState(false);
  const [submittedProfile, setSubmittedProfile] = useState(null);
  const [editMode,         setEditMode]         = useState(false);

  const [form, setForm] = useState({
    fullName: "", address: "", phoneNumber: "", email: "",
    details: "", certification: "", experience: "", chargeMin: "", chargeMax: "",
    speciality: "", profilePhoto: null, citizenshipPhoto: null, certificatePhoto: null,
  });
  const [filePreviews, setFilePreviews] = useState({ profilePhoto: "", citizenshipPhoto: "", certificatePhoto: "" });

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

  // ── VALIDATION HELPERS ──
  const validatePhoneNumber = (phone) => {
    if (phone === "") return "";
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (digitsOnly.length > 10) return "Phone must be 10 digits maximum";
    if (phone.length > 0 && !/^\d*$/.test(phone)) return "Phone must contain only digits";
    return "";
  };

  const validateExperience = (exp) => {
    if (exp === "") return "";
    if (!/^\d+$/.test(exp)) return "Experience must be a number only";
    return "";
  };

  const validateCharge = (charge) => {
    if (charge === "") return "";
    if (!/^\d+$/.test(charge)) return "Charge must be a number only";
    return "";
  };

  const validateCharges = () => {
    if (form.chargeMin && form.chargeMax) {
      const min = parseInt(form.chargeMin);
      const max = parseInt(form.chargeMax);
      if (max <= min) return "Maximum charge must be more than minimum charge";
    }
    return "";
  };

  // ── INPUT CHANGES ──
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let finalValue = value;
    let fieldError = "";

    if (files && files.length > 0) {
      finalValue = files[0];
      if (filePreviews[name]) {
        URL.revokeObjectURL(filePreviews[name]);
      }
      setFilePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
    }

    // Validate phone number - 10 digits only
    if (name === "phoneNumber") {
      fieldError = validatePhoneNumber(value);
      const digitsOnly = value.replace(/[^0-9]/g, "");
      finalValue = digitsOnly.slice(0, 10);
    }

    // Validate experience - numbers only
    if (name === "experience") {
      fieldError = validateExperience(value);
      finalValue = value.replace(/[^0-9]/g, "");
    }

    // Validate charges - numbers only
    if (name === "chargeMin" || name === "chargeMax") {
      fieldError = validateCharge(value);
      finalValue = value.replace(/[^0-9]/g, "");
      // Check if max > min
      if (name === "chargeMax" && form.chargeMin) {
        const chargesError = validateCharges();
        if (chargesError) fieldError = chargesError;
      }
      if (name === "chargeMin" && form.chargeMax) {
        const chargesError = validateCharges();
        if (chargesError) fieldError = chargesError;
      }
    }

    setForm({ ...form, [name]: finalValue });
    setErrors({ ...errors, [name]: fieldError });
  };

  // ── VALIDATION ──
  const validateStep = () => {
    let errs = {};
    if (step === 1) {
      if (!form.profilePhoto)    errs.profilePhoto    = "Profile photo required";
      if (!form.citizenshipPhoto) errs.citizenshipPhoto = "Citizenship photo required";
    }
    if (step === 2) {
      if (!form.fullName)    errs.fullName    = "Full name required";
      if (!form.address)     errs.address     = "Address required";
      if (!form.phoneNumber) errs.phoneNumber = "Phone required";
      else if (form.phoneNumber.replace(/[^0-9]/g, "").length < 10) errs.phoneNumber = "Phone must be 10 digits";
      // if (!form.email)       errs.email       = "Email required";
    }
    if (step === 3) {
      if (!form.details)    errs.details    = "Description required";
      if (!form.experience) errs.experience = "Experience required";
      if (!form.speciality) errs.speciality = "Speciality required";
    }
    if (step === 4) {
      if (!form.chargeMin) errs.chargeMin = "Minimum charge required";
      if (!form.chargeMax) errs.chargeMax = "Maximum charge required";
      else if (parseInt(form.chargeMax) <= parseInt(form.chargeMin)) errs.chargeMax = "Maximum charge must be more than minimum charge";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => validateStep() && setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // ── SUBMIT / UPDATE ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") formData.append(k, v); });
    const uid = localStorage.getItem("userId");
    if (!uid) {
      alert("Please log in before submitting a caregiver profile.");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("jwtToken");
    formData.append("userId", uid);

    const config = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      setLoading(true);
      const res = submittedProfile
        ? await axios.put(`${import.meta.env.VITE_API_URL}/api/caregivers/update/${uid}`, formData, config)
        : await axios.post("${import.meta.env.VITE_API_URL}/api/caregivers/add", formData, config);

      setSubmittedProfile(res.data);
      setEditMode(false);
      onSubmitSuccess?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Error submitting profile.";
      alert(msg);
      if (String(msg).toLowerCase().includes("already has profile")) setSubmittedProfile({ duplicate: true });
    } finally {
      setLoading(false);
    }
  };

  // ── PRE-CHECK EXISTING PROFILE ──
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    const token = localStorage.getItem("jwtToken");
    if (!uid) return;

    axios.get(`${import.meta.env.VITE_API_URL}/api/caregivers/user/${uid}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => { if (res.data) setSubmittedProfile(res.data); })
      .catch(() => {});
  }, []);

  // ── ENTER EDIT MODE: pre-fill form ──
  const startEdit = () => {
    if (submittedProfile && !submittedProfile.duplicate) {
      setForm(f => ({
        ...f,
        fullName:    submittedProfile.fullName    || "",
        address:     submittedProfile.address     || "",
        phoneNumber: submittedProfile.phoneNumber || "",
        email:       submittedProfile.email       || "",
        details:     submittedProfile.details     || "",
        certification: submittedProfile.certification || "",
        experience:  submittedProfile.experience  || "",
        speciality:  submittedProfile.speciality  || "",
        chargeMin:   submittedProfile.chargeMin   || "",
        chargeMax:   submittedProfile.chargeMax   || "",
        profilePhoto:    null,
        citizenshipPhoto: null,
        certificatePhoto: null,
      }));
    }
    setStep(1);
    setEditMode(true);
  };

  // ── FIELD STYLE ──
  const fs = (name) => ({
    width: "100%", padding: "11px 13px",
    border: `1.5px solid ${errors[name] ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: 8, fontFamily: "'Outfit', sans-serif",
    fontSize: 14, color: "#111", background: "#f8fafc",
    outline: "none", transition: "border-color 0.2s, background 0.2s",
  });

  const onFocus = e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.background = "#fff"; };
  const onBlur  = (name) => e => { e.target.style.borderColor = errors[name] ? "#ef4444" : "#e2e8f0"; };

  const getUploadUrl = (filename) => filename ? "${import.meta.env.VITE_API_URL}/uploads/" + filename : "";
  const certificatePreviewStyle = { width:120, minWidth:120, height:120, borderRadius:12, overflow:"hidden", background:"#f8fafc", border:"1.5px solid #cbd5e1" };
  const certificateWrapperStyle = { display:"flex", gap:14, flexWrap:"wrap" };

  // ══════════════════════════════════════════
  // DUPLICATE STATE
  // ══════════════════════════════════════════
  if (submittedProfile?.duplicate) {
    return (
      <div style={{ textAlign:"center", padding:40 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <h2 style={{ fontFamily:"'Instrument Serif', serif", fontSize:24, color:"#111", marginBottom:10 }}>Profile Already Exists</h2>
        <p style={{ fontSize:14, color:"#666", marginBottom:24 }}>You already have a caregiver profile registered.</p>
        <button onClick={() => window.location.reload()} style={{ padding:"12px 32px", background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", transition:"background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="#0284c7"} onMouseOut={e => e.currentTarget.style.background="#0ea5e9"}>
          Reload Page
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // PROFILE CARD (after submission)
  // ══════════════════════════════════════════
  if (submittedProfile && !editMode) {
    const photo = submittedProfile.profilePhoto;
    const statusColor = { VERIFIED:"#15803d", PENDING:"#854d0e", BLOCKED:"#b91c1c" };
    const statusBg    = { VERIFIED:"#f0fdf4", PENDING:"#fefce8", BLOCKED:"#fef2f2" };
    const statusBorder= { VERIFIED:"#bbf7d0", PENDING:"#fde68a", BLOCKED:"#fecaca" };
    const s = submittedProfile.status || "PENDING";
    const certificatePhotoUrl = submittedProfile.certificatePhoto ? getUploadUrl(submittedProfile.certificatePhoto) : "";

    return (
      <div style={{ fontFamily:"'Outfit', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .profile-card-in { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .info-row { display:flex; gap:16px; padding:14px 0; border-bottom:1px solid #e2e8f0; align-items:flex-start; }
          .info-row:last-child { border-bottom:none; }
          .info-label { font-size:11px; font-weight:700; color:#64748b; letter-spacing:1px; text-transform:uppercase; min-width:120px; padding-top:1px; }
          .info-value { font-size:14px; color:#111; font-weight:500; flex:1; line-height:1.6; }
        `}</style>

        <div className="profile-card-in">

          {/* Status banner */}
          <div style={{ background: statusBg[s], border:`1.5px solid ${statusBorder[s]}`, borderRadius:8, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background: statusColor[s], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, flexShrink:0 }}>
              {s === "VERIFIED" ? "✓" : s === "PENDING" ? "⏳" : "✕"}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color: statusColor[s] }}>
                {s === "VERIFIED" ? "Profile Verified & Live" : s === "PENDING" ? "Profile Pending Verification" : "Profile Blocked"}
              </div>
              <div style={{ fontSize:12, color: statusColor[s], opacity:0.7, marginTop:2 }}>
                {s === "VERIFIED" ? "Care receivers can now find and contact you." : s === "PENDING" ? "An admin will review your profile shortly." : "Contact support for assistance."}
              </div>
            </div>
          </div>

          {/* Hero section */}
          <div style={{ display:"flex", gap:20, alignItems:"flex-start", marginBottom:28, paddingBottom:24, borderBottom:"1px solid #e2e8f0" }}>
            <div style={{ width:88, height:88, borderRadius:8, overflow:"hidden", background:"#f8fafc", flexShrink:0, border:"1.5px solid #cbd5e1" }}>
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${photo}`}
                alt={submittedProfile.fullName}
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.parentNode.style.background = "#0ea5e9";
                  e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700">${(submittedProfile.fullName||"CG").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>`;
                }}
              />
            </div>
            <div style={{ flex:1 }}>
              <h1 style={{ fontFamily:"'Instrument Serif', serif", fontSize:24, color:"#111", margin:"0 0 4px", lineHeight:1.1 }}>
                {submittedProfile.fullName}
              </h1>
              <p style={{ fontSize:14, color:"#666", margin:"0 0 12px", fontWeight:500 }}>{submittedProfile.speciality}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {submittedProfile.address && (
                  <span style={{ fontSize:12, color:"#666", background:"#f8fafc", padding:"6px 12px", borderRadius:6, border:"1px solid #cbd5e1" }}>
                    📍 {submittedProfile.address}
                  </span>    
                )}
                {submittedProfile.experience && (
                  <span style={{ fontSize:12, color:"#666", background:"#f8fafc", padding:"6px 12px", borderRadius:6, border:"1px solid #cbd5e1" }}>
                    💼 {submittedProfile.experience} yrs experience
                  </span>
                )}
                {submittedProfile.chargeMin && submittedProfile.chargeMax && (
                  <span style={{ fontSize:12, color:"#666", background:"#f8fafc", padding:"6px 12px", borderRadius:6, border:"1px solid #cbd5e1" }}>
                    💰 Rs {submittedProfile.chargeMin}–{submittedProfile.chargeMax}/day
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#64748b", textTransform:"uppercase", marginBottom:12, paddingBottom:8, borderBottom:"1px solid #e2e8f0" }}>
              📞 Contact Information
            </div>
            {[
              { label:"Phone",   value: submittedProfile.phoneNumber, icon:"📞" },
              { label:"Email",   value: submittedProfile.email,       icon:"✉️" },
              { label:"Address", value: submittedProfile.address,     icon:"📍" },
            ].map((row,i) => (
              <div key={i} className="info-row">
                <span className="info-label">{row.icon} {row.label}</span>
                <span className="info-value">{row.value || "—"}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#64748b", textTransform:"uppercase", marginBottom:12, paddingBottom:8, borderBottom:"1px solid #e2e8f0" }}>
              💼 Professional
            </div>
            {[
              { label:"Speciality",  value: submittedProfile.speciality },
              { label:"Certification", value: submittedProfile.certification },
              { label:"Experience",  value: submittedProfile.experience ? `${submittedProfile.experience} years` : null },
              { label:"Daily Rate",  value: submittedProfile.chargeMin && submittedProfile.chargeMax ? `Rs ${submittedProfile.chargeMin} – ${submittedProfile.chargeMax}` : null },
            ].map((row,i) => (
              <div key={i} className="info-row">
                <span className="info-label">{row.label}</span>
                <span className="info-value">{row.value || "—"}</span>
              </div>
            ))}
          </div>
          {submittedProfile.certificatePhoto && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#64748b", textTransform:"uppercase", marginBottom:10, paddingBottom:8, borderBottom:"1px solid #e2e8f0" }}>
                🧾 Certification Proof
              </div>
              <div style={certificateWrapperStyle}>
                <div style={certificatePreviewStyle}>
                  <img
                    src={certificatePhotoUrl}
                    alt="Certificate proof"
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  />
                </div>
                <div style={{ flex:1, minWidth:220 }}>
                  <p style={{ fontSize:14, color:"#334155", lineHeight:1.6, margin:0 }}>
                    {submittedProfile.certification || "Uploaded training / certification proof."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {submittedProfile.details && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#64748b", textTransform:"uppercase", marginBottom:10, paddingBottom:8, borderBottom:"1px solid #e2e8f0" }}>📝 About</div>
              <p style={{ fontSize:14, color:"#444", lineHeight:1.6, background:"#f8fafc", padding:"14px", borderRadius:8, border:"1.5px solid #e2e8f0" }}>
                {submittedProfile.details}
              </p>
            </div>
          )}

          <button
            onClick={startEdit}
            style={{ width:"100%", padding:"12px", background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, fontFamily:"'Outfit', sans-serif", fontWeight:600, fontSize:14, cursor:"pointer", transition:"background 0.2s" }}
            onMouseOver={e => e.currentTarget.style.background="#0284c7"}
            onMouseOut={e  => e.currentTarget.style.background="#0ea5e9"}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MULTI-STEP FORM
  // ══════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .step-section { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .field-group input:focus, .field-group textarea:focus { border-color:#111!important; box-shadow:0 0 0 3px rgba(0,0,0,0.06); background:#fff!important; }
        .upload-zone { border:2px dashed #cbd5e1; border-radius:8px; padding:24px; text-align:center; cursor:pointer; transition:all 0.2s; background:#f8fafc; position:relative; }
        .upload-zone:hover { border-color:#0ea5e9; background:#f0f9ff; }
        .upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .action-btn { padding:12px 26px; border-radius:8px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s ease; border:none; }
        .action-btn.primary { background:#0ea5e9; color:#fff; }
        .action-btn.primary:hover { background:#0284c7; }
        .action-btn.primary:disabled { background:#cbd5e1; cursor:not-allowed; }
        .action-btn.ghost { background:transparent; color:#0ea5e9; border:2px solid #0ea5e9; }
        .action-btn.ghost:hover { background:#f0f9ff; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Instrument Serif', serif", fontSize:24, color:"#111", margin:"0 0 4px" }}>
          {editMode ? "✏️ Edit Your Profile" : "🎯 Set Up Your Profile"}
        </h2>
        <p style={{ fontSize:13, color:"#666" }}>Complete all 4 steps to activate your profile.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
        {STEPS.map((label, i) => {
          const isActive = step === i+1;
          const isDone   = step > i+1;
          return (
            <React.Fragment key={i}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, background: isDone?"#10b981": isActive?"#0ea5e9":"#e2e8f0", color: isDone||isActive?"#fff":"#94a3b8", transition:"all 0.3s" }}>
                  {isDone ? "✓" : i+1}
                </div>
                <span style={{ fontSize:11, fontWeight: isActive?700:400, color: isActive?"#0ea5e9":"#cbd5e1", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:2, background: step>i+1?"#10b981":"#e2e8f0", margin:"0 6px 16px", transition:"background 0.4s" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>

        {/* Step 1 — Documents */}
        {step===1 && (
          <div className="step-section">
            <div style={{ marginBottom:18 }}>
              <h3 style={{ fontFamily:"'Instrument Serif', serif", fontSize:20, color:"#111", margin:"0 0 3px" }}>📷 Identity Verification</h3>
              <p style={{ fontSize:13, color:"#666" }}>Upload your photo and citizenship document.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { name:"profilePhoto",    label:"Profile Photo",        icon:"📷", hint:"Clear face photo" },
                { name:"citizenshipPhoto",label:"Citizenship Document",  icon:"🪪", hint:"Front side" },
                { name:"certificatePhoto",label:"Certification Proof",   icon:"🧾", hint:"Training certificate or any experience proof" },
              ].map(({ name, label, icon, hint }) => (
                <div key={name} className="field-group">
                  <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>{label}</label>
                  <div className="upload-zone" style={{ borderColor: errors[name]?"#ef4444":"#cbd5e1" }}>
                    <input type="file" name={name} onChange={handleChange} accept="image/*" />
                    {filePreviews[name] ? (
                      <img src={filePreviews[name]} alt={label} style={{ width:"100%", maxHeight:160, objectFit:"cover", marginBottom:10, borderRadius:8 }} />
                    ) : (
                      <>
                        <div style={{ fontSize:26, marginBottom:6 }}>{icon}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#555" }}>{form[name] ? form[name].name : "Click to upload"}</div>
                        <div style={{ fontSize:11, color:"#bbb", marginTop:3 }}>{hint}</div>
                      </>
                    )}
                  </div>
                  {errors[name] && <p style={{ color:"#ef4444", fontSize:12, marginTop:5 }}>{errors[name]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Personal */}
        {step===2 && (
          <div className="step-section">
            <div style={{ marginBottom:18 }}>
              <h3 style={{ fontFamily:"'Instrument Serif', serif", fontSize:20, color:"#111", margin:"0 0 3px" }}>👤 Personal Information</h3>
              <p style={{ fontSize:13, color:"#666" }}>Tell families who you are and how to reach you.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { name:"fullName",    label:"Full Name",        placeholder:"Eg. Sita Gurung",           type:"text" },
                { name:"phoneNumber", label:"Phone Number",     placeholder:"Eg. 9841234567",             type:"text" },
                // { name:"email",       label:"Email Address",    placeholder:"Eg. sita@example.com",       type:"email" },
                { name:"address",     label:"Location",         placeholder:"Eg. Kathmandu, Ward 5",      type:"text" },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name} className="field-group">
                  <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>{label}</label>
                  <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange}
                    style={fs(name)} onFocus={onFocus} onBlur={onBlur(name)} maxLength={name === "phoneNumber" ? 10 : undefined} />
                  {errors[name] && <p style={{ color:"#ef4444", fontSize:12, marginTop:5 }}>{errors[name]}</p>}
                  {!errors[name] && form[name] && <p style={{ color:"#10b981", fontSize:12, marginTop:5 }}>✓ Valid</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Professional */}
        {step===3 && (
          <div className="step-section">
            <div style={{ marginBottom:18 }}>
              <h3 style={{ fontFamily:"'Instrument Serif', serif", fontSize:20, color:"#111", margin:"0 0 3px" }}>💼 Professional Details</h3>
              <p style={{ fontSize:13, color:"#666" }}>Describe your skills so families can find the right fit.</p>
            </div>
            <div className="field-group" style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>About You</label>
              <textarea name="details" rows={4} placeholder="Describe your caregiving experience and approach..." value={form.details} onChange={handleChange}
                style={{ ...fs("details"), resize:"vertical", lineHeight:1.6 }} onFocus={onFocus} onBlur={onBlur("details")} />
              {errors.details && <p style={{ color:"#ef4444", fontSize:12, marginTop:5 }}>{errors.details}</p>}
            </div>
            <div className="field-group" style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>Certification / Training</label>
              <input type="text" name="certification" placeholder="Eg. First aid, elderly care training" value={form.certification} onChange={handleChange}
                style={fs("certification")} onFocus={onFocus} onBlur={onBlur("certification")} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { name:"speciality", label:"Speciality",          placeholder:"Eg. Elderly Care",  type:"text" },
                { name:"experience", label:"Years of Experience", placeholder:"Eg. 3",             type:"text" },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name} className="field-group">
                  <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>{label}</label>
                  <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange}
                    style={fs(name)} onFocus={onFocus} onBlur={onBlur(name)} maxLength={name === "experience" ? 3 : undefined} />
                  {errors[name] && <p style={{ color:"#ef4444", fontSize:12, marginTop:5 }}>{errors[name]}</p>}
                  {!errors[name] && form[name] && <p style={{ color:"#10b981", fontSize:12, marginTop:5 }}>✓ Valid</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Charges */}
        {step===4 && (
          <div className="step-section">
            <div style={{ marginBottom:18 }}>
              <h3 style={{ fontFamily:"'Instrument Serif', serif", fontSize:20, color:"#111", margin:"0 0 3px" }}>💰 Service Charges</h3>
              <p style={{ fontSize:13, color:"#666" }}>Set your daily rate so families know what to expect.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { name:"chargeMin", label:"Minimum (Rs/day)", placeholder:"Eg. 500" },
                { name:"chargeMax", label:"Maximum (Rs/day)", placeholder:"Eg. 1500" },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className="field-group">
                  <label style={{ fontSize:12, fontWeight:600, color:"#111", display:"block", marginBottom:6 }}>{label}</label>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#666", fontWeight:600 }}>Rs</span>
                    <input type="text" name={name} placeholder={placeholder} value={form[name]} onChange={handleChange}
                      style={{ ...fs(name), paddingLeft:36 }} onFocus={onFocus} onBlur={onBlur(name)} />
                  </div>
                  {errors[name] && <p style={{ color:"#ef4444", fontSize:12, marginTop:5 }}>{errors[name]}</p>}
                  {!errors[name] && form[name] && <p style={{ color:"#10b981", fontSize:12, marginTop:5 }}>✓ Valid</p>}
                </div>
              ))}
            </div>
            {(form.chargeMin || form.chargeMax) && (
              <div style={{ marginTop:16, padding:"14px 16px", background: (form.chargeMin && form.chargeMax && parseInt(form.chargeMax) > parseInt(form.chargeMin)) ? "#f0fdf4" : "#f8fafc", border: (form.chargeMin && form.chargeMax && parseInt(form.chargeMax) > parseInt(form.chargeMin)) ? "1.5px solid #86efac" : "1.5px solid #e2e8f0", borderRadius:8 }}>
                <div style={{ fontSize:10, color:"#64748b", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>💵 Your Rate</div>
                <div style={{ fontSize:18, fontWeight:700, color: (form.chargeMin && form.chargeMax && parseInt(form.chargeMax) > parseInt(form.chargeMin)) ? "#10b981" : "#0ea5e9" }}>
                  Rs {form.chargeMin||"—"} – {form.chargeMax||"—"} <span style={{ fontSize:12, color:"#666", fontWeight:400 }}>per day</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:18, borderTop:"1px solid #e2e8f0" }}>
          <div>
            {step > 1 && <button type="button" className="action-btn ghost" onClick={back}>← Back</button>}
            {editMode && step === 1 && <button type="button" className="action-btn ghost" onClick={() => { setEditMode(false); setStep(1); }}>Cancel</button>}
          </div>
          <div>
            {step < 4
              ? <button type="button" className="action-btn primary" onClick={next}>Continue →</button>
              : (
                <button type="submit" className="action-btn primary" disabled={loading}>
                  {loading
                    ? <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                        Saving...
                      </span>
                    : editMode ? "Save Changes ✓" : "Submit Profile ✓"
                  }
                </button>
              )
            }
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;