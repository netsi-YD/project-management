import { useState } from "react";
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
      localStorage.setItem("roles", JSON.stringify(data.roles));
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a365d] to-[#2d3748] p-5">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm sm:p-8">
        <div className="text-center mb-6">
          <div className="mb-4">
            <img
              src="/image/logo.png"
              alt="University of Gondar Logo"
              className="w-36 h-auto max-h-32 object-contain mx-auto"
            />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1a365d] mb-1">
              University of Gondar
            </h2>
            <h3 className="text-base font-semibold text-black mb-2">
              Final Year Project Management Portal
            </h3>
            <p className="text-sm text-[#4a5568]">Sign in to your account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#0c3c78] focus:bg-white focus:ring-4 focus:ring-[#0c3c78]/15"
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#0c3c78] focus:bg-white focus:ring-4 focus:ring-[#0c3c78]/15"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-linear-to-br from-[#0c3c78] to-[#1a4d8c] text-white rounded-md text-base font-bold mb-6 transition-all duration-300 shadow-[0_4px_12px_rgba(12,60,120,0.25)] hover:from-[#0b366c] hover:to-[#16457f] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(12,60,120,0.35)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(12,60,120,0.25)]"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
