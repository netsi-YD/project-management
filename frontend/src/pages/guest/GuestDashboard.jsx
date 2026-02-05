import React, { useState } from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";

const GuestDashboard = () => {
  // STEP 1: frontend state only
  const [requestStatus, setRequestStatus] = useState("idle");
  // idle | loading | sent | error

  const handleRequestAccess = () => {
    console.log("✅ BUTTON CLICKED"); // DEBUG 1

    setRequestStatus("loading");
    console.log("⏳ STATUS SET TO LOADING"); // DEBUG 2

    // simulate backend call (TEMP)
    setTimeout(() => {
      console.log("📨 STATUS SET TO SENT"); // DEBUG 3
      setRequestStatus("sent");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r flex flex-col">
          <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
            {["Overview", "Access Request", "System Info", "Help"].map(
              (item) => (
                <button
                  key={item}
                  className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  {item}
                </button>
              ),
            )}
          </nav>

          <div className="px-4 py-4 border-t text-xs text-gray-500">
            Logged in as <span className="font-medium">Guest</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Guest Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              Limited access — request approval to continue
            </p>
          </div>

          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
            You are currently logged in as a guest. Some features are disabled
            until your access request is approved.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Access Request */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-800">Access Request</h3>
              <p className="text-sm text-gray-500 mt-1">
                Submit a request to gain full system access.
              </p>

              <button
                onClick={handleRequestAccess}
                disabled={
                  requestStatus === "loading" || requestStatus === "sent"
                }
                className={`mt-4 px-4 py-2 text-sm rounded text-white transition
                  ${
                    requestStatus === "sent"
                      ? "bg-green-600"
                      : requestStatus === "loading"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                {requestStatus === "sent"
                  ? "Request Sent"
                  : requestStatus === "loading"
                    ? "Sending..."
                    : "Request Access"}
              </button>
            </div>

            <div className="bg-white rounded-lg border p-5 opacity-60">
              <h3 className="font-semibold text-gray-800">
                Project Submissions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Available after access approval.
              </p>
            </div>

            <div className="bg-white rounded-lg border p-5 opacity-60">
              <h3 className="font-semibold text-gray-800">Repository Access</h3>
              <p className="text-sm text-gray-500 mt-1">
                Restricted for guest users.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default GuestDashboard;
