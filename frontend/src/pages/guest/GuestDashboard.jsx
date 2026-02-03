import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const GuestDashboard = () => {
  const requestStatus = "pending"; // pending | approved | rejected

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Guest Dashboard" role="Guest" />

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome 👋</h1>
          <p className="text-gray-600 mt-1">
            You are logged in as a guest. Request access to continue.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-6 max-w-xl">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Access Request
          </h2>

          <p className="text-gray-600 mb-4">
            Request a role to gain access to the system features.
          </p>

          <div className="mb-4">
            <span className="text-sm text-gray-500">Current status:</span>
            <span
              className={`ml-2 text-sm font-medium px-3 py-1 rounded-full ${
                requestStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : requestStatus === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {requestStatus}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              disabled={requestStatus === "pending"}
              className="flex-1 bg-[#0b2c4d] disabled:bg-gray-300 text-white py-2 rounded-lg font-medium transition"
            >
              Request Employee Access
            </button>

            <button
              disabled={requestStatus === "pending"}
              className="flex-1 border border-[#0b2c4d] text-[#0b2c4d] disabled:border-gray-300 disabled:text-gray-400 py-2 rounded-lg font-medium transition"
            >
              Request Member Access
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GuestDashboard;
