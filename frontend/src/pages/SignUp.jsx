import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../components/Login.css";

const ROLES_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Advisor", label: "Advisor" },
  { value: "Examiner", label: "Examiner" },
  { value: "Department_Head", label: "Department Head" },
  { value: "Project_Coordinator", label: "Project Coordinator" },
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    institution_id: "",
    department: "",
    phone_number: "",
    gender: "male",
    requested_roles: [],
    year_of_study: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (roleValue) => {
    const current = formData.requested_roles;
    if (current.includes(roleValue)) {
      setFormData({
        ...formData,
        requested_roles: current.filter((r) => r !== roleValue),
      });
    } else {
      setFormData({ ...formData, requested_roles: [...current, roleValue] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.requested_roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/register", formData);
      setMessage("Account request submitted. Await admin approval.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
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
            <h3>Project Management System</h3>
            <p>Create your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="institution_id"
              value={formData.institution_id}
              onChange={handleChange}
              placeholder="Student / Staff ID"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department"
              required
            />
          </div>

          <div className="form-group text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Role(s)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    formData.requested_roles.includes(option.value)
                      ? "border-[#1f67a8] bg-blue-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.requested_roles.includes(option.value)}
                    onChange={() => handleRoleToggle(option.value)}
                    className="rounded border-gray-400 text-[#1f67a8] focus:ring-[#1f67a8]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formData.requested_roles.includes("Student") && (
            <div className="form-group">
              <select
                name="year_of_study"
                value={formData.year_of_study}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
                required
              >
                <option value="">-- Year of Study --</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="5th">5th Year</option>
                <option value="6th">6th Year</option>
                <option value="7th">7th Year</option>
                <option value="above 7th"> above 7th Year</option>
              </select>
            </div>
          )}

          {/* Phone Number */}
          <div className="form-group">
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
          {/* Gender */}
          <div className="form-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Submitting…" : "Sign Up"}
          </button>

          <div className="signup-section">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-[#1f67a8] hover:underline">
                Log in
              </Link>
            </p>
            <p className="terms-text">
              By signing up or logging in, you consent to University of Gondar's
              Terms of Use and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
