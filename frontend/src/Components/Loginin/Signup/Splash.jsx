import React from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen text-gray-800 scroll-smooth">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
          <h1
            className="text-2xl font-bold text-white-400 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Elder Ease
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/optionLogin")}
              className="px-4 py-2 rounded hover:bg-white/20"
            >
              Login
            </button>
            <button
              onClick={() =>
                navigate("/optionLogin", { state: { mode: "SIGNUP" } })
              }
              className="px-5 py-2 bg-green-500 rounded-full font-semibold hover:bg-green-600"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen w-full">
        <img
          src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
          alt="Home Care"
          className="absolute w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Compassionate Care, <br /> Right at Your Home
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-200">
            Connecting families with trusted caregivers to ensure comfort,
            dignity, and quality care for your loved ones.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate("/optionLogin")}
              className="px-8 py-3 bg-green-500 rounded-full font-semibold hover:bg-green-600"
            >
              Find a Caregiver
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">About Us</h2>
          <p className="text-lg text-gray-600 mb-12">
            We connect families with compassionate, verified caregivers who
            provide safe, reliable, and personalized home care.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Trusted Caregivers",
                img: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80",
                desc: "Background-checked and professionally trained caregivers.",
              },
              {
                title: "Personalized Care",
                img: "https://images.unsplash.com/photo-1600959907703-125ba1374a12?auto=format&fit=crop&w=600&q=80",
                desc: "Customized care plans tailored to individual needs.",
              },
              {
                title: "Reliable Service",
                img: "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=600&q=80",
                desc: "Consistent, dependable, and high-quality care at home.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden transition"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "Sign Up",
                img: "https://img.icons8.com/color/96/add-user-male.png",
              },
              {
                step: "Choose Care",
                img: "https://img.icons8.com/color/96/medical-doctor.png",
              },
              {
                step: "Get Matched",
                img: "https://img.icons8.com/color/96/handshake.png",
              },
              {
                step: "Start Care",
                img: "https://img.icons8.com/color/96/home-care.png",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <img
                  src={item.img}
                  alt={item.step}
                  className="mx-auto mb-4 h-20"
                />
                <h3 className="font-semibold text-xl">{item.step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Our Services</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Elderly Care",
              img: "data:image/webp;base64,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",
            },
            {
              title: "Disability Support",
              img: "https://th.bing.com/th/id/OIP.oPb7J6M_Frto7AfPFVxEjQHaE8?w=232&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
            },
            {
              title: "Home Nursing",
              img: "https://www.bing.com/th/id/OIP.pGDt1C0OZndhmPGdlSyn7wHaE7?w=258&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
            },
          ].map((service, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden transition"
            >
              <img
                src={service.img}
                alt={service.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{service.title}</h3>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What Families Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Amazing service and caring staff.",
                img: "https://randomuser.me/api/portraits/women/65.jpg",
              },
              {
                text: "My father felt safe and respected.",
                img: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                text: "Highly professional caregivers.",
                img: "https://randomuser.me/api/portraits/women/44.jpg",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 p-8 rounded-xl shadow"
              >
                <img
                  src={t.img}
                  alt="User"
                  className="h-16 w-16 rounded-full mx-auto mb-4 object-cover"
                />
                <p className="text-gray-600 mb-4">“{t.text}”</p>
                <div className="text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-500 text-white text-center px-6">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Get Trusted Care?
        </h2>
        <p className="mb-8">
          Join thousands of families using Elder Ease
        </p>
        <button
          onClick={() => navigate("/optionLogin")}
          className="px-10 py-4 bg-white text-white-600 rounded-full font-semibold hover:bg-gray-100"
        >
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-6 bg-gray-900 text-gray-400 text-center text-sm">
        © {new Date().getFullYear()} Elder Ease. All rights reserved.
      </footer>

    </div>
  );
};

export default Splash;
