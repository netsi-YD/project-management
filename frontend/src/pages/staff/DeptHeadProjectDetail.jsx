import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const DeptHeadProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProject = async () => {
    try {
      const res = await api.get(`/dept-head/projects/${projectId}`);
      setProject(res.data.project);
    } catch (err) {
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Clean printable view
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${project.title}</title></head>
        <body>
          <h1>${project.title}</h1>
          <p>Student: ${project.student?.full_name}</p>
          <p>Status: ${project.status}</p>
          ${project.status_updated_by ? `<p>Status set by: ${project.status_updated_by}</p>` : ""}
          ${project.group ? `<p>Group Members: ${project.group.members.map((m) => m.user?.full_name).join(", ")}</p>` : ""}
          <h2>Submissions</h2>
          <ul>
            ${project.submissions?.map((s) => `<li>${s.type} - ${new Date(s.created_at).toLocaleDateString()} <a href="${s.file_url}">Download</a></li>`).join("") || "<li>None</li>"}
          </ul>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAll = () => {
    if (!project?.submissions) return;
    project.submissions.forEach((sub) => {
      if (sub.file_url) window.open(sub.file_url, "_blank");
    });
  };

  const handleGenerateReport = async () => {
    try {
      const res = await api.get(`/dept-head/projects/${projectId}/report`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `project-${projectId}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate report.");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        to="/staff/dept-projects"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Projects
      </Link>

      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600">Student: {project.student?.full_name}</p>
      <p className="text-gray-600">
        Status: {project.status}
        {project.status_updated_by && (
          <span className="ml-2 text-sm italic">
            (set by {project.status_updated_by})
          </span>
        )}
      </p>

      {/* Group Members */}
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

      {/* Submissions */}
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

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={handlePrint}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          🖨️ Print
        </button>
        <button
          onClick={handleDownloadAll}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
        >
          ⬇️ Download All
        </button>
        <button
          onClick={handleGenerateReport}
          className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200"
        >
          📄 Generate Report (PDF)
        </button>
      </div>
    </div>
  );
};

export default DeptHeadProjectDetail;
