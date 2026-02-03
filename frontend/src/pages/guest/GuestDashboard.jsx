import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const GuestDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/guest/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setStatus(data.status); // pending | approved | rejected | null
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const requestAccess = async (role) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/guest/access-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requested_role: role }),
        },
      );

      const data = await res.json();
      setStatus(data.status);
    } catch (err) {
      console.error("Request failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Guest Dashboard" role="Guest" />

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome 👋</h1>
          <p className="text-gray-600 mt-1">
            Request access to continue using the system.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-6 max-w-xl">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Access Request
          </h2>

          <div className="mb-4">
            <span className="text-sm text-gray-500">Current status:</span>

            {status ? (
              <span
                className={`ml-2 text-sm font-medium px-3 py-1 rounded-full ${
                  status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {status}
              </span>
            ) : (
              <span className="ml-2 text-sm text-gray-400">No request yet</span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => requestAccess("employee")}
              disabled={status === "pending"}
              className="flex-1 bg-[#0b2c4d] disabled:bg-gray-300 text-white py-2 rounded-lg font-medium"
            >
              Request Employee Access
            </button>

            <button
              onClick={() => requestAccess("member")}
              disabled={status === "pending"}
              className="flex-1 border border-[#0b2c4d] text-[#0b2c4d] disabled:border-gray-300 disabled:text-gray-400 py-2 rounded-lg font-medium"
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
