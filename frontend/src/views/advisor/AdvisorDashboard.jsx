import React from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";

const AdvisorDashboard = () => {
  return (
    <>
      <Header />

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Advisor Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Overview of your students, requests, and project activities
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Assigned Students" value="12" />
            <StatCard title="Pending Requests" value="3" />
            <StatCard title="Submissions to Review" value="5" />
            <StatCard title="Messages" value="2" />
          </div>

          {/* Pending Advisor Requests */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Pending Advisor Requests
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center border p-3 rounded">
                <div>
                  <p className="font-medium">Student: Abebe Kebede</p>
                  <p className="text-sm text-gray-500">
                    Department: Computer Science
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1 text-sm bg-green-600 text-white rounded">
                    Approve
                  </button>
                  <button className="px-4 py-1 text-sm bg-red-600 text-white rounded">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Submissions */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Recent Project Submissions
            </h2>

            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Project Title</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Sara Alemu</td>
                  <td className="py-3">AI-Based Attendance System</td>
                  <td className="py-3 text-yellow-600">Pending Review</td>
                </tr>
                <tr>
                  <td className="py-3">Daniel Tesfaye</td>
                  <td className="py-3">Student Project Repository</td>
                  <td className="py-3 text-green-600">Approved</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default AdvisorDashboard;