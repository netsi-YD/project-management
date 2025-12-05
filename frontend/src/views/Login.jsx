import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
    alert("Login functionality will be connected to backend later!");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo Section with Real Logo */}
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
            <h3>Project Management System</h3>
            <p>Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Login As</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
              <option value="admin">Administrator</option>
              <option value="department_head">Department Head</option>
              <option value="evaluator">Evaluator</option>
            </select>
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
