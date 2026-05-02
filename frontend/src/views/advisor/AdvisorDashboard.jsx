import React, { useState } from "react";
import Header from "../../components/shared/Header.jsx";
import Footer from "../../components/shared/Footer";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";

const AdvisorDashboard = () => {
  const [role, setRole] = useState("advisor");

  return (
    <>
      <Header />

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 p-8">
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-4">
            Project Management Dashboard
          </h1>

          {/* ROLE SWITCH */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setRole("advisor")}
              className={
                role === "advisor"
                  ? "px-4 py-2 bg-blue-600 text-white rounded"
                  : "px-4 py-2 bg-gray-200 rounded"
              }
            >
              Advisor
            </button>

            <button
              onClick={() => setRole("examiner")}
              className={
                role === "examiner"
                  ? "px-4 py-2 bg-green-600 text-white rounded"
                  : "px-4 py-2 bg-gray-200 rounded"
              }
            >
              Examiner
            </button>
          </div>

          {/* ================= ADVISOR ================= */}
          {role === "advisor" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatCard title="Assigned Groups" value="5" />
                <StatCard title="Pending Requests" value="2" />
                <StatCard title="Submissions" value="4" />
                <StatCard title="Messages" value="3" />
              </div>

              {/* Advisor Requests */}
              <section className="bg-white p-5 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">
                  Advisor Requests (UC03)
                </h2>

                <div className="flex justify-between border p-3 rounded">
                  <div>
                    <p>Group: G-12</p>
                    <p className="text-sm text-gray-500">
                      Members: Abebe, Hana, Samuel
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded">
                      Approve
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">
                      Reject
                    </button>
                  </div>
                </div>
              </section>

              {/* Assigned Groups */}
              <section className="bg-white p-5 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">
                  Assigned Groups (UC07)
                </h2>

                <div className="border p-3 rounded mb-2">
                  <p>Group G-01</p>
                  <p className="text-sm text-gray-500">
                    Project: AI Attendance System
                  </p>
                  <button className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded">
                    Request Revision
                  </button>
                </div>
              </section>

              {/* Submissions */}
              <section className="bg-white p-5 rounded shadow">
                <h2 className="font-semibold mb-3">
                  Project Submissions (UC05, UC07)
                </h2>

                <div className="border p-3 rounded">
                  <p>Group G-01</p>
                  <p className="text-sm text-gray-500">
                    Status: Pending Review
                  </p>
                  <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">
                    Review
                  </button>
                </div>
              </section>
            </>
          )}
          {/* ================= EXAMINER ================= */}
          {role === "examiner" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Assigned Groups" value="3" />
                <StatCard title="Evaluated" value="1" />
                <StatCard title="Pending" value="2" />
              </div>

              {/* Evaluation Section */}
              <section className="bg-white p-5 rounded shadow">
                <h2 className="font-semibold mb-4">
                  Evaluate Projects (UC13)
                </h2>

                <div className="border p-4 rounded mb-4">
                  <p className="font-medium">Group G-02</p>
                  <p className="text-sm text-gray-500">
                    Project: Smart Library System
                  </p>
                  <p className="text-sm text-gray-500">
                    Similarity: 15% (UC06)
                  </p>

                  <div className="flex gap-2 mt-3">
                    <input
                      type="number"
                      placeholder="Enter Grade"
                      className="border px-2 py-1 rounded"
                    />
                    <button className="bg-green-600 text-white px-3 py-1 rounded">
                      Submit Grade
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default AdvisorDashboard;