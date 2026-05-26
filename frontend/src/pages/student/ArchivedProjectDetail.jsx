import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const ArchivedProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/student/archived-projects/${projectId}`);
        setProject(res.data.project);
      } catch (err) {
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        to="/student/archive"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Archived Projects
      </Link>

      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600">Student: {project.student?.full_name}</p>
      <p className="text-gray-600">Status: {project.status}</p>

      {project.group && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Group Members</h2>
          <ul className="list-disc list-inside">
            {project.group.members?.map((m) => (
              <li key={m.student_id}>
                {m.user?.full_name} ({m.student_campus_id ?? "N/A"})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Submissions</h2>
        {project.submissions?.length ? (
          <div className="space-y-2">
            {project.submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between border p-2 rounded"
              >
                <span>
                  {sub.type} – {new Date(sub.created_at).toLocaleDateString()}
                </span>
                {sub.file_url && (
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View File
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

export default ArchivedProjectDetail;
