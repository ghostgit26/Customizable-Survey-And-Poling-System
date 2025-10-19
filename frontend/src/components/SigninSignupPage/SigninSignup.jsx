import "./SigninSignup.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const validateName = (name) => {
  if (!name) return "Name is required";
  const regex = /^[A-Za-z ]+$/;
  if (!regex.test(name)) return "Name should only contain alphabets";
  return "";
};

const validateEmail = (email) => {
  if (!email) return "Email is required";
  // Basic email format check
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Please enter a valid email address";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6)
    return "Password must be at least 6 characters";
  if (password.length > 12)
    return "Password must be at most 12 characters";
  return "";
};

const SigninSignup = ({ setShowLogin, onLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    terms: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      default:
        return "";
    }
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};
    if (currState === "Sign Up") {
      newErrors.name = validateName(formData.name);
    }
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.terms = termsAccepted
      ? ""
      : "You must agree to the terms of use & privacy policy.";
    setErrors(newErrors);

    return Object.values(newErrors).every((err) => !err);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleTerms = (e) => {
    setTermsAccepted(e.target.checked);
    setTouched((prev) => ({ ...prev, terms: true }));
    setErrors((prev) => ({
      ...prev,
      terms: e.target.checked
        ? ""
        : "You must agree to the terms of use & privacy policy.",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    const endpoint =
      currState === "Login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";
    try {
      const res = await axios.post(endpoint, formData);

      // Save token and user data after successful response
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      if (currState === "Login") {
        toast.success("Logged in successfully");
      } else {
        toast.success("Account created successfully");
      }
      if (onLogin) onLogin();
      setShowLogin(false);
      navigate("/dashboard");
    } catch (err) {
      toast.error(`${err.response?.data?.message}` || "Something went wrong");
    }
  };

  // Check all validations to enable/disable button
  const isFormValid = () => {
    if (currState === "Sign Up") {
      return (
        !validateName(formData.name) &&
        !validateEmail(formData.email) &&
        !validatePassword(formData.password) &&
        termsAccepted
      );
    }
    return (
      !validateEmail(formData.email) &&
      !validatePassword(formData.password) &&
      termsAccepted
    );
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center">
      <form
        className="login-popup-container shadow-lg fade-in"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="form-box mb-3 d-flex align-items-center justify-content-between">
          <h1>{currState}</h1>
          <span
            onClick={() => setShowLogin(false)}
            className="fs-4 fw-bold text-dark"
            style={{ cursor: "pointer" }}
          >
            ×
          </span>
        </div>

        <div className="login-popup-inputs mb-3">
          {currState === "Sign Up" && (
            <>
              <input
                name="name"
                type="text"
                placeholder="Enter Your Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-control mb-0"
                required
                autoComplete="off"
              />
              {touched.name && errors.name && (
                <span className="text-danger mt-0">{errors.name}</span>
              )}
            </>
          )}
          <input
            name="email"
            type="email"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-control mb-0"
            required
            autoComplete="off"
          />
          {touched.email && errors.email && (
            <span className="text-danger mt-0">{errors.email}</span>
          )}
          <input
            name="password"
            type="password"
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-control mb-0"
            required
            autoComplete="off"
          />
          {touched.password && errors.password && (
            <span className="text-danger mt-0">{errors.password}</span>
          )}
        </div>

        <div className="login-popup-condition mb-0 d-flex align-items-start">
          <input
            type="checkbox"
            className="form-check-input mt-1"
            checked={termsAccepted}
            onChange={handleTerms}
            required
          />
          <p className="mb-0 ms-2">
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
        {touched.terms && errors.terms && (
          <span className="text-danger mb-0">{errors.terms}</span>
        )}

        <button
          type="submit"
          className="btn w-100 mb-3"
          disabled={!isFormValid()}
          style={{backgroundColor:"#3d246c"}}
        >
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {currState === "Login" ? (
          <p className="text-center">
            Create a new account?{" "}
            <span
              onClick={() => {
                setCurrState("Sign Up");
                setTouched({});
                setErrors({});
                setFormData({ name: "", email: "", password: "" });
                setTermsAccepted(false);
              }}
              className="text-decoration-underline"
              style={{ cursor: "pointer" }}
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-center">
            Already have an account?{" "}
            <span
              onClick={() => {
                setCurrState("Login");
                setTouched({});
                setErrors({});
                setFormData({ name: "", email: "", password: "" });
                setTermsAccepted(false);
              }}
              className="text-decoration-underline"
              style={{ cursor: "pointer" }}
            >
              Login
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default SigninSignup;