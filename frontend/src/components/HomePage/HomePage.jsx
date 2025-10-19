import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; 
import Swal from 'sweetalert2';

const HomePage = ({ setShowLogin, isLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [btnState, setBtnState] = useState("");
  const [msgBtnState, setMsgBtnState] = useState("");
  const [inputFocus, setInputFocus] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFormErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
      } else {
        setFormErrors((prev) => ({ ...prev, email: "" }));
      }
    } else {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputFocus = (name, focus) => {
    setInputFocus((prev) => ({ ...prev, [name]: focus }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Enter a valid email address.";
      }
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    Swal.fire({
      icon: 'success',
      title: 'Message sent!',
      text: "We'll get back to you soon.",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
    setFormData({ name: "", email: "", message: "" });
    setFormErrors({});
  };

  const getBtnClass = (state) => {
    if (state === "hover") return "expressive-btn expressive-btn-hover";
    if (state === "active") return "expressive-btn expressive-btn-active";
    return "expressive-btn";
  };

  const getInputClass = (field) => {
    return inputFocus[field]
      ? "expressive-input expressive-input-focus"
      : "expressive-input";
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="py-5 expressive-surface">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-md-6">
              <div className="expressive-chip mb-2 d-inline-block px-3 py-1 rounded-pill">
                EXPRESSIVE SURVEYS AND FORMS
              </div>
              <h1 className="mb-4 expressive-headline">
                Build and Explore Surveys <br />
                with <span className="expressive-gradient-text">SurveySphere</span>
              </h1>
              <p className="fs-5 mb-4 expressive-muted">
                Get better insights faster—with expressive templates, easy-to-use
                forms, and beautiful real-time analytics.
              </p>
              <button
                className={getBtnClass(btnState)}
                onClick={() =>
                  isLoggedIn ? navigate("/dashboard") : setShowLogin(true)
                }
                onMouseEnter={() => setBtnState("hover")}
                onMouseLeave={() => setBtnState("")}
                onMouseDown={() => setBtnState("active")}
                onMouseUp={() => setBtnState("hover")}
              >
                {isLoggedIn ? "Go to Dashboard" : "Get started"}
              </button>
            </div>
            <div className="col-md-6">
              <div className="expressive-hero-img rounded-4 overflow-hidden">
                <img
                  src="/images/hero.png"
                  alt="SurveySphere interface"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5 expressive-surface-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="mb-3 expressive-section-title">
              About SurveySphere
            </h2>
            <p className="fs-4 mx-auto expressive-muted">
              We're transforming how businesses gather data through expressive surveys
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 expressive-card">
                <div className="card-body p-4">
                  <h3 className="h5 expressive-card-title">
                    Easy Survey Creation
                  </h3>
                  <p className="expressive-card-body">
                    Design surveys quickly with beautiful, user-friendly tools built for every device.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 expressive-card">
                <div className="card-body p-4">
                  <h3 className="h5 expressive-card-title">
                    Real-Time Results
                  </h3>
                  <p className="expressive-card-body">
                    Track feedback instantly with expressive, live dashboards and insights.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 expressive-card">
                <div className="card-body p-4">
                  <h3 className="h5 expressive-card-title">
                    Give Your Opinions
                  </h3>
                  <p className="expressive-card-body">
                    Participate in a variety of interactive surveys and polls, and make your voice count.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Contact Section */}
       <section id="contact" className="py-5 expressive-contact-surface">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="mb-3 expressive-section-title">Get in Touch</h2>
            <p className="fs-4 mx-auto expressive-muted">
              Have questions? Contact our team and we'll be happy to help.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card expressive-card h-100">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 expressive-card-title">Send us a message</h3>
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="mb-3">
                      <label htmlFor="name" className="expressive-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className={getInputClass("name")}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus("name", true)}
                        onBlur={() => handleInputFocus("name", false)}
                        autoComplete="off"
                      />
                      {formErrors.name && (
                        <span className="text-danger small">{formErrors.name}</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="expressive-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className={getInputClass("email")}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus("email", true)}
                        onBlur={() => handleInputFocus("email", false)}
                        autoComplete="off"
                      />
                      {formErrors.email && (
                        <span className="text-danger small">{formErrors.email}</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="message" className="expressive-label">
                        Message *
                      </label>
                      <textarea
                        className={getInputClass("message")}
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        onFocus={() => handleInputFocus("message", true)}
                        onBlur={() => handleInputFocus("message", false)}
                        autoComplete="off"
                      ></textarea>
                      {formErrors.message && (
                        <span className="text-danger small">{formErrors.message}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className={getBtnClass(msgBtnState)}
                      onMouseEnter={() => setMsgBtnState("hover")}
                      onMouseLeave={() => setMsgBtnState("")}
                      onMouseDown={() => setMsgBtnState("active")}
                      onMouseUp={() => setMsgBtnState("hover")}
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card expressive-card h-100">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 expressive-card-title">Contact Information</h3>
                  <div className="mb-4">
                    <h4 className="expressive-contact-info-title">Email</h4>
                    <p className="expressive-contact-info-text">support@surveysphere.com</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="expressive-contact-info-title">Phone</h4>
                    <p className="expressive-contact-info-text">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h4 className="expressive-contact-info-title">Office</h4>
                    <p className="expressive-contact-info-text mb-0">
                      123 Survey Street
                      <br />
                      San Francisco, CA 94107
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;