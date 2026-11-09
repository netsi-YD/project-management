import { useState, useEffect } from "react";
import api from "../../api/axios";

import Footer from "../../components/shared/Footer";
import { Link } from "react-router-dom";

export default function PublicGuestHome() {
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    api
      .get("/public-projects")
      .then((res) => {
        const projects = res.data || [];
        const safe = Array.isArray(projects) ? projects.slice(0, 3) : [];
        setRecentProjects(safe);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <section className="bg-blue-400 text-white py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              Final Year Project Management System
            </h1>
            <p className="mt-4 text-lg opacity-90">
              Explore published research, view student projects, and request
              access for advanced features.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md shadow hover:bg-gray-100"
              >
                Sign In
              </Link>

              <Link
                to="/guest/projects"
                className="px-6 py-3 bg-blue-600 font-medium rounded-md shadow hover:bg-indigo-900"
              >
                View Public Projects
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-center mb-10 text-gray-800">
              What You Can Do as a Guest
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Browse Public Projects
                </h3>
                <p className="text-gray-600 mt-2">
                  View approved and published final-year research projects.
                </p>

                <Link
                  to="/guest/projects"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-indigo-700"
                >
                  Browse Now
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Learn About the System
                </h3>
                <p className="text-gray-600 mt-2">
                  Understand how the FYP system works & what features you can
                  access.
                </p>

                <a
                  href="#about-fyp"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-indigo-700"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {recentProjects.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
                Recently Archived Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentProjects.map((p) => (
                  <div
                    key={p.project_id}
                    className="border rounded-xl p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-[#1f67a8]">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">By {p.student}</p>
                    {p.file_url && (
                      <a
                        href={p.file_url}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline mt-3 inline-block"
                      >
                        Download Report
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="about-fyp" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              About the FYP Portal
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This system supports students, advisors, examiners, and guests in
              managing the entire final-year project workflow — from proposal
              submission to evaluation and publication.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
