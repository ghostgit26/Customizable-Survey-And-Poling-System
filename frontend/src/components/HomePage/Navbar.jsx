import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ setShowLogin, isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar-material">
      <div className="navbar-material-inner">
        <a href="/" className="navbar-material-brand">
          <div className="navbar-material-logo">
            <svg viewBox="0 0 100 100" width="36" height="36">
              <rect x="10" y="10" width="80" height="80" rx="18" fill="#8f5eff" />
              <path
                d="M25,50 Q40,25 60,50 T90,50"
                stroke="#fff"
                strokeWidth="7"
                fill="none"
              />
            </svg>
          </div>
          <span>SurveySphere</span>
        </a>

        {/* Hamburger Toggle */}
        {!isLoggedIn && (
          <button
            className={`navbar-material-toggle ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {/* Desktop Links */}
        {!isLoggedIn && (
          <ul className="navbar-material-links">
            <li>
              <a href="#about" className="navbar-material-link">About</a>
            </li>
            <li>
              <a href="#contact" className="navbar-material-link">Contact</a>
            </li>
            <li>
              <button className="navbar-material-login" onClick={() => setShowLogin(true)}>
                Login
              </button>
            </li>
          </ul>
        )}

        {/* Logged-in Actions */}
        {isLoggedIn && (
          <div className="navbar-material-actions">
            <Link to="/userprofile" title="Profile">
              <User className="navbar-material-icon" size={30} />
            </Link>
            <button
              className="navbar-material-icon-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="navbar-material-icon" size={30} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {!isLoggedIn && (
        <div className={`navbar-material-mobile-menu ${menuOpen ? "show" : ""}`}>
          <a href="#about" className="navbar-material-link" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#contact" className="navbar-material-link" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
          <button className="navbar-material-login" onClick={() => {
            setShowLogin(true);
            setMenuOpen(false);
          }}>
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
