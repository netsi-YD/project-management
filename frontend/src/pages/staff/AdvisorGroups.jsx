// src/pages/staff/AdvisorGroups.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const AdvisorGroups = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/advisor/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Advisor projects raw response:", res.data);

        // If your backend wraps data in a `data` field (pagination), unwrap it
        const data = res.data?.data || res.data;

        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setRawData(res.data);
          setError("Unexpected response format – see debug info below");
        }
      } catch (err) {
        console.error("Error fetching advisor projects:", err.response || err);
        setError(
          "Failed to load projects: " +
            (err.response?.data?.message || err.message),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          My Groups / Assigned Projects
        </h1>
        <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          {rawData && (
            <pre className="mt-2 text-xs whitespace-pre-wrap">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Groups / Assigned Projects</h1>
      {projects.length === 0 ? (
        <p>No projects assigned yet.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.project_id}
            className="border p-4 mb-4 rounded shadow"
          >
            <h2 className="text-lg font-semibold">
              <Link
                to={`/staff/advisor/projects/${project.project_id}`}
                className="text-blue-600 hover:underline"
              >
                {project.title}
              </Link>
            </h2>{" "}
            <p>Student: {project.student_name}</p>
            <span
              className={`inline-block px-2 py-1 text-xs rounded ${
                project.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.status}
            </span>
            {project.group ? (
              <div className="mt-3">
                <p className="font-medium">
                  Group #{project.group.group_number}
                </p>
                <ul className="list-disc list-inside">
                  {project.group.members.map((member) => (
                    <li key={member.student_id}>{member.full_name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No group linked yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdvisorGroups;
