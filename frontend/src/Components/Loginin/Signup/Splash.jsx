import React from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen text-gray-800">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
  <img
    src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
    alt="Caregiver"
    className="absolute w-full h-full object-cover brightness-75 contrast-110"
  />

  {/* Overlay (FIXED) */}
  <div className="absolute inset-0 bg-black/40 pointer-events-none" />

  {/* Login / Signup (UNCHANGED LOGIC) */}
  <div className="absolute z-20 top-5 right-5 flex gap-4">
    <button
      className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600"
      onClick={() => navigate("/optionLogin")}
    >
      Login
    </button>
    <button
      className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600"
      onClick={() =>
        navigate("/optionLogin", { state: { mode: "SIGNUP" } })
      }
    >
      Signup
    </button>
  </div>

  {/* Hero Content */}
  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 text-white">
    <h1 className="text-4xl md:text-6xl font-bold mb-6">
      Compassionate Care, <br /> Right at Your Home
    </h1>

    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
      Connecting families with trusted caregivers to ensure comfort,
      dignity, and quality care for your loved ones.
    </p>
  </div>
</section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-20 px-6 md:px-20 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Us</h2>

          <p className="text-lg text-gray-600 mb-12">
            We are a home-care platform dedicated to connecting families with
            compassionate, verified caregivers who provide safe, reliable, and
            personalized care.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80"
                alt="Trusted caregivers"
                className="h-40 w-full object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">
                Trusted Caregivers
              </h3>
              <p className="text-gray-600">
                All caregivers are verified and trained to meet professional standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <img
                src="https://img.freepik.com/premium-photo/help-talking-carer-with-disabled-woman-house-consultation-support-service-happy-disability-african-male-nurse-helping-senior-woman-from-wheelchair-nursing-home_590464-230227.jpg?w=740&q=80"
                alt="Personalized support"
                className="h-40 w-full object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">
                Personalized Support
              </h3>
              <p className="text-gray-600">
                Care plans are customized to individual needs and preferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <img
                src="https://images.unsplash.com/photo-1600959907703-125ba1374a12?auto=format&fit=crop&w=400&q=80"
                alt="Reliable service"
                className="h-40 w-full object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">
                Reliable Service
              </h3>
              <p className="text-gray-600">
                We ensure consistent, high-quality care you can depend on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact" className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h2>

          <p className="text-lg text-gray-600 mb-12">
            Have questions or need assistance? We’re here to help.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-gray-600">support@homecaredemo.com</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Phone</h4>
              <p className="text-gray-600">+977 9765826344</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Address</h4>
              <p className="text-gray-600">
                Kathmandu, <br /> Nepal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 bg-gray-900 text-gray-400 text-center text-sm">
        © {new Date().getFullYear()} Elder Ease. All rights reserved.
      </footer>
    </div>
  );
};

export default Splash;
