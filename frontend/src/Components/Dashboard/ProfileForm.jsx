import React, { useState } from "react";
import axios from "axios";

const ProfileForm = ({ onSubmitSuccess }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedProfile, setSubmittedProfile] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    email: "",
    details: "",
    experience: "",
    chargeMin: "",
    chargeMax: "",
    speciality: "",
    profilePhoto: null,
    citizenshipPhoto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!form.profilePhoto) newErrors.profilePhoto = "Profile photo required";
      if (!form.citizenshipPhoto) newErrors.citizenshipPhoto = "Citizenship photo required";
    }
    if (step === 2) {
      if (!form.fullName) newErrors.fullName = "Full name required";
      if (!form.address) newErrors.address = "Address required";
      if (!form.phoneNumber) newErrors.phoneNumber = "Phone required";
      if (!form.email) newErrors.email = "Email required";
    }
    if (step === 3) {
      if (!form.details) newErrors.details = "Description required";
      if (!form.experience) newErrors.experience = "Experience required";
      if (!form.speciality) newErrors.speciality = "Speciality required";
    }
    if (step === 4) {
      if (!form.chargeMin) newErrors.chargeMin = "Minimum charge required";
      if (!form.chargeMax) newErrors.chargeMax = "Maximum charge required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => validateStep() && setStep(step + 1);
  const back = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/caregivers/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmittedProfile(res.data);
      setLoading(false);
      onSubmitSuccess?.(res.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting profile.");
      setLoading(false);
    }
  };

  const input = (name) =>
    `w-full rounded-lg px-4 py-3 bg-gray-200 border border-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-gray-100 transition ${
      errors[name] ? "border-red-500" : ""
    }`;

  /* ================= PROFILE PREVIEW ================= */
  if (submittedProfile) {
    const photo = submittedProfile.profilePhoto?.replace(/\s+/g, "_");

    return (
      <div className="bg-white w-full border border-gray-300 rounded-2xl shadow-xl p-10 space-y-10">
        <div className="flex flex-col items-center text-center">
          <img
            src={`http://localhost:8080/uploads/${photo}`}
            alt={submittedProfile.fullName}
            className="w-36 h-36 rounded-full object-cover border-4 border-gray-400 shadow-lg"
          />
          <h1 className="mt-5 text-3xl font-bold text-black">{submittedProfile.fullName}</h1>
          <p className="text-gray-600 text-lg">{submittedProfile.speciality}</p>
          <p className="mt-2 text-sm font-semibold text-green-600">
            ✔ Profile Submitted Successfully
          </p>
        </div>

        <div className="space-y-4">
          <ProfileRow label="Phone Number" value={submittedProfile.phoneNumber} />
          <ProfileRow label="Email Address" value={submittedProfile.email} />
          <ProfileRow label="Home Address" value={submittedProfile.address} />
          <ProfileRow label="Experience" value={`${submittedProfile.experience} Years`} />
          <ProfileRow label="Service Charges" value={`Rs ${submittedProfile.chargeMin} - ${submittedProfile.chargeMax}`} />
          <ProfileRow label="About" value={submittedProfile.details} />
        </div>

        <button
          onClick={() => {
            setSubmittedProfile(null);
            setStep(1);
          }}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold shadow"
        >
          ✏ Edit Profile
        </button>
      </div>
    );
  }

  /* ================= FORM UI ================= */
  return (
    <div className="bg-white w-full border rounded-2xl shadow-md p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Caregiver Profile Setup</h2>
        <p className="text-sm text-gray-500">Complete all steps to activate your profile</p>
      </div>

      <div className="bg-gray-100 border rounded-xl p-6">
        <div className="flex justify-between">
          {["Documents", "Personal", "Professional", "Charges"].map((label, i) => {
            const active = step === i + 1;
            return (
              <div key={i} className="flex-1 text-center">
                <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold ${active ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}>
                  {i + 1}
                </div>
                <p className={`mt-2 text-sm ${active ? "font-semibold text-black" : "text-gray-400"}`}>{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Identity Verification</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {["profilePhoto", "citizenshipPhoto"].map((name) => (
                <div key={name}>
                  <label className="text-sm text-gray-700 mb-1 block">
                    {name === "profilePhoto" ? "Profile Photo" : "Citizenship Photo"}
                  </label>
                  <input type="file" name={name} onChange={handleChange} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-400 file:bg-gray-300 file:text-gray-800" />
                  {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {["fullName", "address", "phoneNumber", "email"].map((name) => (
                <input key={name} name={name} placeholder={name} onChange={handleChange} className={input(name)} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Professional Details</h3>
            <textarea name="details" rows="4" placeholder="Describe your experience" onChange={handleChange} className={input("details")} />
            <div className="grid md:grid-cols-2 gap-5">
              {["experience", "speciality"].map((name) => (
                <input key={name} name={name} placeholder={name} onChange={handleChange} className={input(name)} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Service Charges</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {["chargeMin", "chargeMax"].map((name) => (
                <input key={name} type="number" name={name} placeholder={name} onChange={handleChange} className={input(name)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 && <button type="button" onClick={back} className="px-6 py-2 border rounded-lg">← Back</button>}
          {step < 4 ? (
            <button type="button" onClick={next} className="ml-auto px-8 py-2 bg-black text-white rounded-lg">Continue →</button>
          ) : (
            <button type="submit" className="ml-auto px-8 py-2 bg-black text-white rounded-lg" disabled={loading}>
              {loading ? "Submitting..." : "Submit Profile"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-gray-900 font-semibold mt-1">{value || "—"}</p>
  </div>
);

export default ProfileForm;
