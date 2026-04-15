import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#1f67a8] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <img
            src="/image/logo.png"
            alt="University Logo"
            className="w-16 h-16 object-contain mb-3"
          />

          <div className="flex gap-4 text-2xl">
            <span>🌐</span>
            <span>🐦</span>
            <span>💼</span>
            <span>▶️</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Important Links</h3>
          <ul className="space-y-2">
            <li>Student Information System</li>
            <li>UoG Mail</li>
            <li>Online Registration</li>
            <li>Library</li>
            <li>Registrar</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>Student Information System (Intranet)</li>
            <li>Research & Ethics System</li>
            <li>UoG Journals</li>
            <li>Student Registration System</li>
            <li>Research & Community Portal</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 text-center py-4 text-sm">
        © 2026 University of Gondar | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
