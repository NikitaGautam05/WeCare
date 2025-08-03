import React from 'react';
import { useNavigate } from 'react-router-dom';

const Aboutus = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Home
        </button>
      </div>

      <h1>About Us – <span style={{ color: '#4CAF50' }}>EldERease</span></h1>
      <p><strong>Caring for the elderly, with ease and dignity.</strong></p>

      <p>
        At <strong>EldERease</strong>, our mission is to bridge the gap between compassionate caregivers and
        families looking for trusted support for their elderly loved ones. We understand that aging
        comes with unique challenges, and finding the right care shouldn't add to the burden.
      </p>

      <p>
        Founded with empathy and driven by technology, EldERease is a user-friendly platform where:
        <ul>
          <li><strong>Caregivers</strong> can register and offer services—companionship, medical assistance, or daily help.</li>
          <li><strong>Families and individuals</strong> can find reliable, verified caregivers who match their needs—full-time, part-time, or occasional support.</li>
        </ul>
      </p>

      <h2>Why Choose Us?</h2>
      <ul>
        <li><strong>✅ Verified Caretakers:</strong> Thorough background checks for peace of mind.</li>
        <li><strong>🕒 Flexible Scheduling:</strong> Choose care that fits your needs.</li>
        <li><strong>💬 Direct Communication:</strong> Talk to caregivers before hiring.</li>
        <li><strong>🔒 Secure and Private:</strong> Your data is encrypted and safe with us.</li>
      </ul>

      <h2>Join Our Mission</h2>
      <p>
        Whether you're looking to <strong>hire help</strong> or <strong>offer your skills</strong> as a caretaker,
        EldERease makes the process simple, safe, and supportive.
      </p>

      <p><strong>Together, let's make aging a journey of dignity, not difficulty.</strong></p>
    </div>
  );
};

export default Aboutus;
