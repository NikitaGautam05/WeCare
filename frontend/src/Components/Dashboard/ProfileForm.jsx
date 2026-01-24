import React, { useState } from "react";

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

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

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const input = (name) =>
    `w-full rounded-lg px-4 py-3 border text-gray-800 bg-gray-200 placeholder-gray-500
     focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white
     transition ${errors[name] ? "border-red-500" : "border-gray-400"}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Caregiver Profile Setup</h2>
          <p className="text-gray-500 text-sm">All fields are required</p>
        </div>

        {/* STEPPER */}
        <div className="flex justify-between mb-8">
          {["Documents", "Personal", "Professional", "Charges"].map((label, i) => {
            const current = step === i + 1;
            return (
              <div key={i} className="flex-1 text-center">
                <div
                  className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold
                  ${current ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
                >
                  {i + 1}
                </div>
                <p className={`mt-2 text-sm ${current ? "text-black font-semibold" : "text-gray-400"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        <form className="space-y-6">

          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profile Photo</label>
                <input
                  type="file"
                  name="profilePhoto"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0 file:bg-gray-800 file:text-white hover:file:bg-black"
                />
                {errors.profilePhoto && <p className="text-red-500 text-sm">{errors.profilePhoto}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Citizenship Photo</label>
                <input
                  type="file"
                  name="citizenshipPhoto"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0 file:bg-gray-800 file:text-white hover:file:bg-black"
                />
                {errors.citizenshipPhoto && <p className="text-red-500 text-sm">{errors.citizenshipPhoto}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-5 bg-gray-100 p-4 rounded-lg">
              <input name="fullName" placeholder="Full Name" onChange={handleChange} className={input("fullName")} />
              <input name="address" placeholder="Address" onChange={handleChange} className={input("address")} />
              <input name="phone" placeholder="Phone Number" onChange={handleChange} className={input("phone")} />
              <input name="email" placeholder="Email Address" onChange={handleChange} className={input("email")} />
            </div>
          )}

          {step === 3 && (
            <>
              <textarea name="description" rows={4} placeholder="Description" onChange={handleChange} className={input("description")} />
              <div className="grid md:grid-cols-2 gap-5">
                <input name="experience" placeholder="Experience (years)" onChange={handleChange} className={input("experience")} />
                <input name="speciality" placeholder="Speciality" onChange={handleChange} className={input("speciality")} />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-2 gap-5">
              <input name="chargeMin" placeholder="Minimum Charge" onChange={handleChange} className={input("chargeMin")} type="number" min="0" />
              <input name="chargeMax" placeholder="Maximum Charge" onChange={handleChange} className={input("chargeMax")} type="number" min="0" />
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={back} className="px-6 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200">
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="ml-auto px-8 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800 transition"
            >
              {step === 4 ? "Submit Profile" : "Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
