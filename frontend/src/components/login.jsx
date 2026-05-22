import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", formData);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.roles)); // ← new line
      localStorage.setItem("user_id", data.user_id);
      const roles = (data.roles || []).map((r) => r.toLowerCase());

      if (
        roles.includes("advisor") ||
        roles.includes("examiner") ||
        roles.includes("project_coordinator") ||
        roles.includes("super_admin") ||
        roles.includes("department_head")
      ) {
        navigate("/staff");
      } else if (roles.includes("guest")) {
        navigate("/guest/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        alert(error.response.data?.message || "Login failed");
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="/image/logo.png"
              alt="University of Gondar Logo"
              className="university-logo"
            />
          </div>
          <div className="login-header">
            <h2>University of Gondar</h2>
            <h3> Final Year Project Management Portal</h3>
            <p>Sign in to your account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
