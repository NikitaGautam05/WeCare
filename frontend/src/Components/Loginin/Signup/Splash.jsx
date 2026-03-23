import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.jpg";

const Splash = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navScrolled = scrollY > 60;

  return (
    <div className="w-screen min-h-screen text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Georgia', serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body { margin: 0; }

        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        .hero-text-reveal {
          opacity: 0;
          transform: translateY(40px);
          animation: revealUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-text-reveal:nth-child(1) { animation-delay: 0.1s; }
        .hero-text-reveal:nth-child(2) { animation-delay: 0.3s; }
        .hero-text-reveal:nth-child(3) { animation-delay: 0.5s; }
        .hero-text-reveal:nth-child(4) { animation-delay: 0.65s; }

        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .card-hover {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 64px rgba(0,0,0,0.12);
        }

        .btn-primary {
          background: #1a1a2e;
          color: #fff;
          border: none;
          padding: 14px 36px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #c8a96e;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-outline {
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.6);
          padding: 13px 36px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 15px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.15);
          border-color: #fff;
        }

        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c8a96e;
        }

        .gold-line {
          width: 48px;
          height: 2px;
          background: #c8a96e;
          display: inline-block;
        }

        .step-number {
          font-family: 'Playfair Display', serif;
          font-size: 72px;
          font-weight: 800;
          color: #f0ebe1;
          line-height: 1;
          position: absolute;
          top: -10px;
          left: -10px;
          z-index: 0;
        }

        .parallax-bg {
          will-change: transform;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          padding: 6px 0;
          position: relative;
          transition: color 0.2s;
          background: none;
          border: none;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: #c8a96e;
          transition: width 0.3s ease;
        }
        .nav-link:hover { color: #fff; }
        .nav-link:hover::after { width: 100%; }

        .nav-scrolled .nav-link { color: rgba(26,26,46,0.75); }
        .nav-scrolled .nav-link:hover { color: #1a1a2e; }

        .testimonial-card {
          background: #fff;
          border: 1px solid #f0ebe1;
          padding: 40px 32px;
          position: relative;
        }
        .testimonial-card::before {
          content: '"';
          font-family: 'Playfair Display', serif;
          font-size: 80px;
          color: #c8a96e;
          opacity: 0.3;
          position: absolute;
          top: 10px;
          left: 24px;
          line-height: 1;
        }

        .service-img-wrap {
          overflow: hidden;
          height: 240px;
        }
        .service-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-hover:hover .service-img-wrap img {
          transform: scale(1.06);
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin: 32px 0;
        }
        .divider-ornament span {
          width: 60px;
          height: 1px;
          background: #d4c4a0;
        }
        .divider-ornament em {
          color: #c8a96e;
          font-size: 20px;
          font-style: normal;
        }

        @media (max-width: 768px) {
          .hero-headline { font-size: 40px !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          navScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm nav-scrolled"
            : "bg-transparent"
        }`}
        style={{ padding: navScrolled ? "14px 0" : "22px 0" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={logo} alt="Elder Ease" style={{ height: 38, width: "auto" }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: navScrolled ? "#1a1a2e" : "#fff", lineHeight: 1.1 }}>
                Elder Ease
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 2, color: navScrolled ? "#c8a96e" : "rgba(200,169,110,0.9)", textTransform: "uppercase", fontWeight: 500 }}>
                Care Platform
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <button className="nav-link" style={{ color: navScrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.85)" }}
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              About
            </button>
            <button className="nav-link" style={{ color: navScrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.85)" }}
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
              Services
            </button>
            <button className="nav-link" style={{ color: navScrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.85)" }}
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
              How it Works
            </button>
            <div style={{ width: 1, height: 20, background: navScrolled ? "#e0d8cc" : "rgba(255,255,255,0.2)" }} />
            <button className="nav-link" style={{ color: navScrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.85)" }}
              onClick={() => navigate("/optionLogin")}>
              Sign In
            </button>
            <button
              onClick={() => navigate("/optionLogin", { state: { mode: "SIGNUP" } })}
              style={{
                background: "#c8a96e",
                color: "#fff",
                border: "none",
                padding: "10px 26px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: "background 0.3s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#1a1a2e"}
              onMouseOut={e => e.currentTarget.style.background = "#c8a96e"}
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="hide-desktop"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: navScrolled ? "#1a1a2e" : "#fff", fontSize: 22 }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 700, overflow: "hidden" }}>

        {/* Background image with parallax-like darkening */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1800&q=80"
            alt=""
            style={{ width: "100%", height: "110%", objectFit: "cover", objectPosition: "center 30%", transform: `translateY(${scrollY * 0.25}px)` }}
          />
          {/* Multi-layer overlay for depth */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,10,30,0.80) 0%, rgba(10,10,30,0.50) 60%, rgba(30,15,5,0.65) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,30,0.7) 0%, transparent 50%)" }} />
        </div>

        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "15%", right: "8%", width: 300, height: 300, border: "1px solid rgba(200,169,110,0.15)", borderRadius: "50%", zIndex: 1 }} />
        <div style={{ position: "absolute", top: "22%", right: "11%", width: 200, height: 200, border: "1px solid rgba(200,169,110,0.1)", borderRadius: "50%", zIndex: 1 }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 680 }}>

            <div className="hero-text-reveal section-label" style={{ marginBottom: 20 }}>
              Trusted Home Care in Nepal
            </div>

            <h1
              className="hero-text-reveal hero-headline"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 68,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
                margin: "0 0 12px 0",
                letterSpacing: "-0.5px"
              }}
            >
              Care That Feels
              <br />
              <em style={{ color: "#c8a96e", fontStyle: "italic" }}>Like Family</em>
            </h1>

            <p
              className="hero-text-reveal font-body"
              style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "24px 0 40px", maxWidth: 520, fontWeight: 300 }}
            >
              Connecting Nepal's elderly with verified, compassionate caregivers.
              Because every family deserves peace of mind.
            </p>

            <div className="hero-text-reveal" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => navigate("/optionLogin")}>
                <span>Find a Caregiver</span>
              </button>
              <button
                className="btn-outline"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </button>
            </div>

          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          zIndex: 10,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "center",
          gap: 80
        }}>
          {[
            { num: "500+", label: "Verified Caregivers" },
            { num: "1,200+", label: "Families Helped" },
            { num: "4.9★", label: "Average Rating" },
            { num: "24/7", label: "Support Available" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#c8a96e" }}>{s.num}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "120px 40px", background: "#faf8f4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Left text */}
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>About ElderEase</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <span className="gold-line" />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 700, lineHeight: 1.15, color: "#1a1a2e", margin: "0 0 24px" }}>
                Bridging the Distance
                <br />
                <em style={{ fontStyle: "italic", color: "#c8a96e" }}>Between Families</em>
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.85, color: "#5a5a6e", marginBottom: 20, fontWeight: 300 }}>
                In Nepal, thousands of elderly parents are left alone as their children seek opportunities abroad.
                ElderEase was built to bridge this gap — a dedicated platform where families can find and hire
                verified caretakers with confidence and ease.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.85, color: "#5a5a6e", fontWeight: 300 }}>
                Every caregiver on our platform goes through a thorough admin verification process,
                ensuring only trustworthy, qualified individuals are visible to families who need them most.
              </p>

              <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
                {[
                  { icon: "✓", text: "Admin Verified Profiles" },
                  { icon: "✓", text: "Real-time Notifications" },
                  { icon: "✓", text: "Nepal Specific Platform" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#c8a96e", fontWeight: 700, fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#3a3a4e", fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right image grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative" }}>
              <div style={{ gridColumn: "1 / -1", height: 260, overflow: "hidden" }}>
                <img
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80"
                  alt="Care"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ height: 180, overflow: "hidden" }}>
                <img
                  src="https://images.unsplash.com/photo-1600959907703-125ba1374a12?auto=format&fit=crop&w=400&q=80"
                  alt="Care"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ height: 180, overflow: "hidden", marginTop: 0 }}>
                <img
                  src="https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=400&q=80"
                  alt="Care"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              {/* Accent box */}
              <div style={{
                position: "absolute", bottom: -20, left: -20,
                background: "#1a1a2e", color: "#c8a96e",
                padding: "20px 28px",
                fontFamily: "'Playfair Display', serif"
              }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>10+</div>
                <div style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "rgba(200,169,110,0.7)", letterSpacing: 1 }}>YEARS OF CARE</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "120px 40px", background: "#1a1a2e" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="section-label" style={{ marginBottom: 16, color: "#c8a96e" }}>Simple Process</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 700, color: "#fff", margin: 0 }}>
              How ElderEase Works
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            {[
              {
                num: "01",
                icon: "👤",
                step: "Sign Up",
                desc: "Create your account as a family or caregiver in minutes.",
                color: "#f5f0e8"
              },
              {
                num: "02",
                icon: "🔍",
                step: "Browse Profiles",
                desc: "View admin-verified caregiver profiles filtered by location and budget.",
                color: "#eee8d8"
              },
              {
                num: "03",
                icon: "🤝",
                step: "Express Interest",
                desc: "Click interested on a profile and the caregiver receives an instant notification.",
                color: "#e8e0cc"
              },
              {
                num: "04",
                icon: "💚",
                step: "Start Care",
                desc: "Connect directly and arrange care that fits your family's needs.",
                color: "#e0d8c0"
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(200,169,110,0.15)",
                  padding: "48px 36px",
                  position: "relative",
                  transition: "background 0.3s, border-color 0.3s",
                  cursor: "default"
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "rgba(200,169,110,0.08)";
                  e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)";
                }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 800, color: "rgba(200,169,110,0.1)", position: "absolute", top: 20, right: 24, lineHeight: 1 }}>
                  {item.num}
                </div>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 14px" }}>
                  {item.step}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                  {item.desc}
                </p>
                <div style={{ width: 32, height: 2, background: "#c8a96e", marginTop: 24 }} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "120px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>What We Offer</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              Our Care Services
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              {
                title: "Elderly Care",
                subtitle: "Compassionate daily support",
                img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
                desc: "Full-time or part-time care for seniors who need help with daily activities, medication, and companionship."
              },
              {
                title: "Disability Support",
                subtitle: "Professional assistance",
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
                desc: "Dedicated support workers helping people with physical and cognitive disabilities live independently."
              },
              {
                title: "Home Nursing",
                subtitle: "Medical care at home",
                img: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
                desc: "Qualified nurses providing wound care, injections, post-surgery recovery and health monitoring at home."
              },
            ].map((service, i) => (
              <div key={i} className="card-hover" style={{ border: "1px solid #f0e8d8", overflow: "hidden" }}>
                <div className="service-img-wrap">
                  <img src={service.img} alt={service.title} />
                </div>
                <div style={{ padding: "32px 28px", background: "#fff" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: "#c8a96e", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
                    {service.subtitle}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: "0 0 14px" }}>
                    {service.title}
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6a6a7e", lineHeight: 1.7, margin: "0 0 20px", fontWeight: 300 }}>
                    {service.desc}
                  </p>
                  <button
                    onClick={() => navigate("/optionLogin")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c8a96e",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      letterSpacing: 0.5,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "gap 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.gap = "14px"}
                    onMouseOut={e => e.currentTarget.style.gap = "8px"}
                  >
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "120px 40px", background: "#faf8f4" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              What Families Say
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              {
                text: "ElderEase gave me peace of mind knowing my mother has a trusted caregiver while I'm working abroad. The verification process made all the difference.",
                name: "Rajan Sharma",
                role: "Son, working in Qatar",
                img: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                text: "Finding a reliable caretaker used to take weeks. With ElderEase I found someone perfect within days. My father feels safe and respected.",
                name: "Priya Thapa",
                role: "Daughter, Kathmandu",
                img: "https://randomuser.me/api/portraits/women/65.jpg",
              },
              {
                text: "As a caregiver, this platform helped me find meaningful work and connect with families who truly value what I do. Highly recommend.",
                name: "Sita Gurung",
                role: "Certified Caregiver",
                img: "https://randomuser.me/api/portraits/women/44.jpg",
              },
            ].map((t, i) => (
              <div key={i} className="testimonial-card card-hover">
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#4a4a5e", lineHeight: 1.8, margin: "24px 0 28px", fontWeight: 300 }}>
                  {t.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, borderTop: "1px solid #f0e8d8", paddingTop: 20 }}>
                  <img src={t.img} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{t.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c8a96e", marginTop: 2 }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: "#c8a96e", fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", padding: "120px 40px", overflow: "hidden" }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1800&q=80"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,30,0.82)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 20, color: "#c8a96e" }}>Take the First Step</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1 }}>
            Your Loved Ones
            <br />
            <em style={{ color: "#c8a96e", fontStyle: "italic" }}>Deserve the Best Care</em>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 0 48px", fontWeight: 300 }}>
            Join thousands of Nepali families who trust ElderEase to find compassionate,
            verified caregivers. It starts with one click.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/optionLogin")}
              style={{
                background: "#c8a96e",
                color: "#fff",
                border: "none",
                padding: "16px 44px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: "all 0.3s"
              }}
              // onMouseOver={e => e.currentTarget.style.background = "#fff", e => e.currentTarget.style.color = "#1a1a2e"}
              // onMouseOut={e => e.currentTarget.style.background = "#c8a96e", e => e.currentTarget.style.color = "#fff"}
            >
              Find a Caregiver
            </button>
            <button
              onClick={() => navigate("/optionLogin", { state: { mode: "SIGNUP" } })}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.4)",
                padding: "16px 44px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: 15,
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: "all 0.3s"
              }}
              // onMouseOver={e => e.currentTarget.style.borderColor = "#c8a96e", e => e.currentTarget.style.color = "#c8a96e"}
              // onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)", e => e.currentTarget.style.color = "#fff"}
            >
              Register as Caregiver
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0d0d20", padding: "60px 40px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <img src={logo} alt="Elder Ease" style={{ height: 36 }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>Elder Ease</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 280, fontWeight: 300 }}>
                Nepal's first dedicated platform connecting elderly individuals with verified, compassionate caregivers.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Platform", links: ["Find Caregiver", "Register", "How it Works", "Sign In"] },
              { title: "Company", links: ["About Us", "Our Mission", "Careers", "Contact"] },
              { title: "Support", links: ["Help Center", "Safety", "Privacy Policy", "Terms"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: "#c8a96e", textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <span
                        onClick={() => navigate("/optionLogin")}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "color 0.2s", fontWeight: 300 }}
                        onMouseOver={e => e.currentTarget.style.color = "#c8a96e"}
                        onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                      >
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} Elder Ease. All rights reserved.
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Made with ❤️ for Nepal's elderly
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Splash;