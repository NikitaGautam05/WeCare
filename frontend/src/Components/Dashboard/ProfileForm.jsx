import React, { useState } from 'react';

const ProfileForm = ({ onFirstFocus }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
  });

  const [hasInteracted, setHasInteracted] = useState(false);

  const triggerWarningOnce = () => {
    if (!hasInteracted && onFirstFocus) {
      onFirstFocus();
      setHasInteracted(true);
    }
  };

  const handleChange = (e) => {
    triggerWarningOnce();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', form);
    alert('Profile updated successfully!');
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-4 text-green-600">
        Update Your Profile
      </h2>
      <p className="text-gray-700 mb-6">
        Keep your profile updated so care receivers can find and trust you.
      </p>

      <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          onFocus={triggerWarningOnce}
          placeholder="Full Name"
          className="bg-gray-500 text-white border rounded px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none w-full"
          required
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onFocus={triggerWarningOnce}
          placeholder="Email"
          className="bg-gray-500 text-white border rounded px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none w-full"
          required
        />

        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          onFocus={triggerWarningOnce}
          placeholder="Phone"
          className="bg-gray-500 text-white border rounded px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none w-full"
          required
        />

        <input
          type="number"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          onFocus={triggerWarningOnce}
          placeholder="Experience (years)"
          className="bg-gray-500 text-white border rounded px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none w-full"
          required
        />

        <button
          type="submit"
          className="bg-green-500 text-white py-3 px-6 rounded hover:bg-green-600 transition w-full text-lg font-semibold"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
