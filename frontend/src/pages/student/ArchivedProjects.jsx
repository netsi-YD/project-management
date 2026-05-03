import { useState, useEffect } from "react";
import api from "../../api/axios";

const ArchivedProjects = () => {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        const res = await api.get("/projects");
        const allProjects = res.data.projects || [];
        // Keep only approved or completed projects
        const filtered = allProjects.filter((p) =>
          ["approved", "completed"].includes(p.status),
        );
        setArchived(filtered);
      } catch (err) {
        console.error("Failed to load archived projects:", err);
        setError("Could not load archived projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchArchived();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading archived projects…</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Archived Projects
      </h2>

      {error && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {archived.length === 0 ? (
        <div className="bg-white rounded-lg border p-6 text-gray-500 shadow-sm">
          No archived projects yet. Complete a project to see it here.
        </div>
      ) : (
        <div className="space-y-4">
          {archived.map((project) => (
            <div
              key={project.project_id}
              className="bg-white rounded-lg border p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-800 text-lg">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  Status:{" "}
                  <span className="capitalize font-medium text-green-700">
                    {project.status}
                  </span>
                </span>
                {project.deadline && (
                  <span>
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
                {project.submission_date && (
                  <span>
                    Submitted:{" "}
                    {new Date(project.submission_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedProjects;
