import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    description: "",
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
      if (!form.phone) newErrors.phone = "Phone required";
      if (!form.email) newErrors.email = "Email required";
    }

    if (step === 3) {
      if (!form.description) newErrors.description = "Description required";
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
  formData.append("profilePhoto", form.profilePhoto);
  formData.append("citizenshipPhoto", form.citizenshipPhoto);
  formData.append("fullName", form.fullName);
  formData.append("address", form.address);
  formData.append("phoneNumber", form.phone);
  formData.append("email", form.email);
  formData.append("details", form.description);
  formData.append("experience", form.experience);
  formData.append("speciality", form.speciality);
  formData.append("chargeMin", form.chargeMin);
  formData.append("chargeMax", form.chargeMax);

  try {
    setLoading(true);
    const res = await axios.post(
      "http://localhost:8080/api/caregivers/add",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Saved:", res.data);
    alert("Caregiver profile submitted successfully!");

    // Redirect to the new profile page using the returned caregiver ID
    if (res.data?.id) {
      navigate(`/profile/${res.data.id}`);
    } else {
      // Fallback: reset form if ID not returned
      setForm({
        fullName: "",
        address: "",
        phone: "",
        email: "",
        description: "",
        experience: "",
        chargeMin: "",
        chargeMax: "",
        speciality: "",
        profilePhoto: null,
        citizenshipPhoto: null,
      });
      setStep(1);
    }

    setLoading(false);
  } catch (err) {
    console.error("Submission error:", err);
    alert("Error submitting profile. Check console.");
    setLoading(false);
  }
};
  const input = (name) =>
    `w-full rounded-lg px-4 py-3
     bg-gray-200
     border border-gray-400
     text-gray-800
     placeholder-gray-500
     focus:outline-none
     focus:border-black
     focus:bg-gray-100
     transition
     ${errors[name] ? "border-red-500" : ""}`;

  return (
    <div className="bg-white w-full border rounded-2xl shadow-md p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Caregiver Profile Setup</h2>
        <p className="text-sm text-gray-500">Complete all steps to activate your profile</p>
      </div>

      {/* STEPPER */}
      <div className="bg-gray-100 border rounded-xl p-6">
        <div className="flex justify-between">
          {["Documents", "Personal", "Professional", "Charges"].map((label, i) => {
            const active = step === i + 1;
            return (
              <div key={i} className="flex-1 text-center">
                <div
                  className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold
                  ${active ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
                >
                  {i + 1}
                </div>
                <p className={`mt-2 text-sm ${active ? "font-semibold text-black" : "text-gray-400"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Identity Verification</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Profile Photo</label>
                <input
                  type="file"
                  name="profilePhoto"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border
                  file:border-gray-400
                  file:bg-gray-300
                  file:text-gray-800"
                />
                {errors.profilePhoto && <p className="text-red-500 text-sm">{errors.profilePhoto}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Citizenship Photo</label>
                <input
                  type="file"
                  name="citizenshipPhoto"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border
                  file:border-gray-400
                  file:bg-gray-300
                  file:text-gray-800"
                />
                {errors.citizenshipPhoto && <p className="text-red-500 text-sm">{errors.citizenshipPhoto}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <input name="fullName" placeholder="Full Name" onChange={handleChange} className={input("fullName")} />
              <input name="address" placeholder="Address" onChange={handleChange} className={input("address")} />
              <input name="phone" placeholder="Phone Number" onChange={handleChange} className={input("phone")} />
              <input name="email" placeholder="Email Address" onChange={handleChange} className={input("email")} />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Professional Details</h3>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe your experience"
              onChange={handleChange}
              className={input("description")}
            />
            <div className="grid md:grid-cols-2 gap-5">
              <input name="experience" placeholder="Experience (years)" onChange={handleChange} className={input("experience")} />
              <input name="speciality" placeholder="Speciality" onChange={handleChange} className={input("speciality")} />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="bg-gray-100 border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Service Charges</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <input type="number" name="chargeMin" placeholder="Minimum Charge" onChange={handleChange} className={input("chargeMin")} />
              <input type="number" name="chargeMax" placeholder="Maximum Charge" onChange={handleChange} className={input("chargeMax")} />
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between">
  {step > 1 && (
    <button onClick={back} type="button" className="px-6 py-2 border rounded-lg">
      ← Back
    </button>
  )}

  {step < 4 ? (
    <button
      type="button"
      onClick={next}
      className="ml-auto px-8 py-2 bg-black text-white rounded-lg"
    >
      Continue →
    </button>
  ) : (
    <button
      type="submit"
      className="ml-auto px-8 py-2 bg-black text-white rounded-lg"
      disabled={loading}
    >
      {loading ? "Submitting..." : "Submit Profile"}
    </button>
  )}
</div>

      </form>
    </div>
  );
};

export default ProfileForm;
