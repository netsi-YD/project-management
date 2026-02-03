import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ title = "Dashboard", role = "Guest" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header className="bg-[#0b2c4d] text-white px-8 py-4 flex items-center justify-between">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold">University of Gondar</h1>
        <p className="text-sm opacity-90">Project Management System</p>
      </div>

      {/* Center */}
      <h2 className="hidden md:block text-base font-medium">{title}</h2>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-sm bg-white/15 px-3 py-1 rounded-full">
          {role}
        </span>

        <button
          onClick={handleLogout}
          className="bg-[#b11226] hover:bg-[#8f0f1f] transition px-4 py-2 rounded-lg text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
