import React from "react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/image/logo.png"
            alt="College of Informatics"
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-[#1f67a8]">
            UoG FYP Management
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#1f67a8]">
            Home
          </a>
          <a href="#" className="hover:text-[#1f67a8]">
            About
          </a>
          <a href="#" className="hover:text-[#1f67a8]">
            Departments
          </a>
          <a href="#" className="hover:text-[#1f67a8]">
            Contact Us
          </a>
          <a href="#" className="hover:text-[#1f67a8]">
            Programs
          </a>
          <a href="#" className="hover:text-[#1f67a8]">
            Research{" "}
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;