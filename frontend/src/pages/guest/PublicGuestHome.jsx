// src/pages/guest/PublicGuestHome.jsx
import React from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import { Link } from "react-router-dom";

export default function PublicGuestHome() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Request System Access
                </h3>
                <p className="text-gray-600 mt-2">
                  Need more features? Submit an access request.
                </p>

                <Link
                  to="/guest/access-request"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-indigo-700"
                >
                  Request Access
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
