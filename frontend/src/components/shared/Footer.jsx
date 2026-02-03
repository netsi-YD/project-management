import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 text-sm text-center py-4 mt-auto">
      © {new Date().getFullYear()} University of Gondar. All rights reserved.
    </footer>
  );
};

export default Footer;
