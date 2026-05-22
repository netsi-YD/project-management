import { FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#1f67a8] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Portal Name */}
        <div className="flex flex-col items-start">
          <img
            src="/image/logo.png"
            alt="University of Gondar"
            className="w-16 h-16 object-contain mb-3"
          />
          <h3 className="font-semibold">
            UoG Final Year Project Management Portal
          </h3>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.uog.edu.et"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Official Website
              </a>
            </li>
            <li>
              <a
                href="https://sis.uog.edu.et"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Student Information System (SIS)
              </a>
            </li>
            <li>
              <a
                href="https://www.uog.edu.et/research"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Research Center
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Gondar, Ethiopia</li>
            <li>📞 +251 58 111 0000</li>
            <li>✉️ info@uog.edu.et</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4 text-xl">
            <a
              href="https://linkedin.com/school/university-of-gondar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://twitter.com/UoG_Ethiopia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <FaTwitter />
            </a>
            <a
              href="https://facebook.com/UniversityOfGondar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 text-center py-4 text-sm">
        © {new Date().getFullYear()} University of Gondar | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
