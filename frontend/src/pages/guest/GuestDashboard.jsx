import React from "react";

const GuestDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Guest Dashboard</h1>

      <p className="text-gray-700 mb-6">
        Welcome! You are logged in as a guest.
      </p>

      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <h2 className="text-xl font-semibold mb-2">Access Request</h2>

        <p className="text-sm text-gray-600 mb-4">
          You can request access to become a member or employee.
        </p>

        <button className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition">
          Request Access
        </button>
      </div>
    </div>
  );
};

export default GuestDashboard;
