import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.role === "guest") {
        navigate("/guest/dashboard");
      } else {
        alert("Logged in, but this dashboard is not implemented yet.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    }
  };
  return (
    <div className="login-container">
      {" "}
      <div className="login-card">
        {" "}
        {/* Logo Section */}{" "}
        <div className="logo-section">
          {" "}
          <div className="logo-container">
            {" "}
            <img
              src="/image/logo.png"
              alt="University of Gondar Logo"
              className="university-logo"
            />{" "}
          </div>{" "}
          <div className="login-header">
            {" "}
            <h2>University of Gondar</h2> <h3>Project Management System</h3>{" "}
            <p>Sign in to your account</p>{" "}
          </div>{" "}
        </div>{" "}
        {/* Form Section - NO LABELS, just inputs */}{" "}
        <form onSubmit={handleSubmit} className="login-form">
          {" "}
          <div className="form-group">
            {" "}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              autoComplete="email"
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="current-password"
            />{" "}
          </div>{" "}
          <div className="form-options">
            {" "}
            <label className="remember-me">
              {" "}
              <input type="checkbox" /> <span>Remember me</span>{" "}
            </label>{" "}
            <a href="/forgot-password" className="forgot-password">
              {" "}
              Forgot password?{" "}
            </a>{" "}
          </div>{" "}
          <button type="submit" className="login-btn">
            {" "}
            Log in{" "}
          </button>{" "}
          <div className="signup-section">
            {" "}
            <p>
              {" "}
              Don't have an account? <a href="/signup">Sign up</a>{" "}
            </p>{" "}
            <p className="terms-text">
              {" "}
              By signing up or logging in, you consent to University of Gondar's
              Terms of Use and Privacy Policy.{" "}
            </p>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
export default Login;
