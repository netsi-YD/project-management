import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";

export default function GuestProjects() {
  const departments = [
    {
      name: "Engineering",
      projects: [
        {
          id: 1,
          title: "Network Infrastructure Upgrade",
          description: "Improving campus networking and security.",
          fileUrl: "/sample-files/network-upgrade.pdf",
        },
        {
          id: 2,
          title: "AI Attendance System",
          description: "Face-recognition–based class attendance tracker.",
          fileUrl: "/sample-files/ai-attendance.pdf",
        },
      ],
    },
    {
      name: "Business",
      projects: [
        {
          id: 3,
          title: "Market Analysis Dashboard",
          description: "Interactive dashboard for business forecasting.",
          fileUrl: "/sample-files/market-dashboard.pdf",
        },
      ],
    },
    {
      name: "Health Science",
      projects: [
        {
          id: 4,
          title: "Medical Inventory Tracker",
          description: "Digitized medical supply management system.",
          fileUrl: "/sample-files/medical-inventory.pdf",
        },
      ],
    },
  ];

  return (
    <>
      <Header />

      <div className="px-6 py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Public Projects</h1>

        {departments.map((dept) => (
          <div key={dept.name} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{dept.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dept.projects.map((project) => (
                <div
                  key={project.id}
                  className="border p-4 rounded-xl shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{project.description}</p>

                  <div className="flex gap-3">
                    <a
                      href={project.fileUrl}
                      target="_blank"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Open
                    </a>

                    <a
                      href={project.fileUrl}
                      download
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
