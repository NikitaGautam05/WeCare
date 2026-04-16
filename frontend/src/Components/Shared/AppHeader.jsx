import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.jpg';

const AppHeader = ({ title, subtitle, showBackBtn = true, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'User';

  const navItems = [
    { name: "🏠 Home", link: "/dash" },
    { name: "👩‍⚕️ Caregivers", link: "/my-caregivers" },
    { name: "💬 Messages", link: "/messages" },
    { name: "📜 History", link: "/history" },
    { name: "❤️ Favourites", link: "/favourites" },
    { name: "👤 Profile", link: "/my-profile" },
  ];

  const isActive = (link) => location.pathname === link;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo / Back Button */}
            <div className="flex items-center gap-4">
              {showBackBtn && location.pathname !== '/dash' ? (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go back"
                >
                  <FaArrowLeft size={18} className="text-slate-700" />
                </button>
              ) : (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              )}
              <div>
                {title && <h1 className="text-xl font-bold text-slate-900">{title}</h1>}
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
              </div>
            </div>

            {/* Right: Chat & Menu */}
            <div className="flex items-center gap-4">
              {/* Chat Icon */}
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Messages"
              >
                <FaComments size={20} className="text-slate-700 group-hover:text-blue-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                {menuOpen ? (
                  <FaTimes size={20} className="text-slate-700" />
                ) : (
                  <FaBars size={20} className="text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-white border-b border-gray-200 lg:hidden">
          <nav className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.link);
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isActive(item.link)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default AppHeader;
