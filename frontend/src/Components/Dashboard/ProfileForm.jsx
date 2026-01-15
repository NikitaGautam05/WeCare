import React, { useState } from "react";

const ProfileForm = () => {
  const [step, setStep] = useState(1);

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
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Caregiver Profile
        </h2>
        <p className="text-gray-500 mb-6">
          Step {step} of 4 · Fill all details carefully
        </p>

        {/* Progress */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <form className="flex flex-col gap-5">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3 className="section-title">Upload Documents</h3>

              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="file-input"
                required
              />

              <input
                type="file"
                name="citizenshipPhoto"
                accept="image/*"
                onChange={handleChange}
                className="file-input"
                required
              />

              <button onClick={next} type="button" className="btn-primary">
                Next →
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h3 className="section-title">Personal Information</h3>

              <input name="fullName" placeholder="Full Name" onChange={handleChange} className="input" />
              <input name="address" placeholder="Address" onChange={handleChange} className="input" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="phone" placeholder="Phone Number" onChange={handleChange} className="input" />
                <input name="email" placeholder="Email Address" onChange={handleChange} className="input" />
              </div>

              <div className="flex justify-between">
                <button onClick={back} type="button" className="btn-secondary">← Back</button>
                <button onClick={next} type="button" className="btn-primary">Next →</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h3 className="section-title">Professional Details</h3>

              <textarea
                name="description"
                placeholder="Short description about yourself"
                rows={4}
                onChange={handleChange}
                className="input resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="experience" placeholder="Experience (years)" onChange={handleChange} className="input" />
                <input name="speciality" placeholder="Speciality" onChange={handleChange} className="input" />
              </div>

              <div className="flex justify-between">
                <button onClick={back} type="button" className="btn-secondary">← Back</button>
                <button onClick={next} type="button" className="btn-primary">Next →</button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h3 className="section-title">Charges</h3>

              <div className="grid grid-cols-2 gap-4">
                <input name="chargeMin" placeholder="Min Charge" onChange={handleChange} className="input" />
                <input name="chargeMax" placeholder="Max Charge" onChange={handleChange} className="input" />
              </div>

              <div className="flex justify-between">
                <button onClick={back} type="button" className="btn-secondary">← Back</button>
                <button type="submit" className="btn-primary">
                  Submit Profile
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
