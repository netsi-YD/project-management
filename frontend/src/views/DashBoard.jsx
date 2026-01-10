import React, { useState, useEffect, useRef } from "react";

export default function DashBoard() {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg border-r">
        <div className="px-6 py-5 border-b">
          <div className="px-6 py-8 border-b flex flex-col items-center">
            <img
              src="/public/image/logo.png"
              alt="University Logo"
              className="w-16 h-16 object-contain mb-3"
            />

            <h1 className="text-xl font-bold text-indigo-700 text-center">
              Student Portal
            </h1>

            <p className="text-sm text-gray-500 text-center">
              University Dashboard
            </p>
          </div>
        </div>

        <nav className="px-6 py-4 space-y-3">
          {[
            "Overview",
            "Submissions",
            "Advisors",
            "Repository",
            "Notifications",
            "Settings",
          ].map((item) => (
            <button
              key={item}
              className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition font-medium"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="bg-white h-16 shadow flex items-center justify-between px-8 relative">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome Back 👋
          </h2>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="flex items-center gap-3"
            >
              <span className="text-gray-600 font-medium">Student</span>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow">
                S
              </div>
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg border py-2 animate-fadeIn z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer border">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Submissions
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                View proposal, reports, and submission history.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer border">
              <h3 className="text-lg font-semibold text-gray-800">
                Advisor Requests
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Check approval status or send new advisor requests.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer border">
              <h3 className="text-lg font-semibold text-gray-800">
                Repository Access
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Explore approved and archived university projects.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800">
              Announcements
            </h3>

            <div className="bg-white mt-4 p-6 rounded-xl shadow border">
              <p className="text-gray-600 text-sm">
                No recent announcements. Check again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
