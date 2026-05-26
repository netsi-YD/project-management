import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const DeptHeadArchive = () => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get("/dept-head/archive-projects")
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleProject = (projectId) => {
    setSelected((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const toggleAll = () => {
    if (selected.length === projects.length) {
      setSelected([]);
    } else {
      setSelected(projects.map((p) => p.project_id));
    }
  };

  const handleBulkDownload = async () => {
    if (selected.length === 0) return;
    setDownloading(true);
    try {
      const res = await api.post(
        "/dept-head/projects/bulk-report",
        { project_ids: selected },
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bulk-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate bulk report.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1f67a8]">Archived Projects</h2>
        {selected.length > 0 && (
          <button
            onClick={handleBulkDownload}
            disabled={downloading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {downloading
              ? "Generating…"
              : `Generate Report (${selected.length})`}
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <p>No archived projects.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={selected.length === projects.length}
                  />
                </th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Student</th>
                <th className="border p-2">Archived</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.project_id)}
                      onChange={() => toggleProject(p.project_id)}
                    />
                  </td>
                  <td className="border p-2">{p.title}</td>
                  <td className="border p-2">{p.student?.full_name}</td>
                  <td className="border p-2">Yes</td>
                  <td className="border p-2">
                    <Link
                      to={`/staff/dept/projects/${p.project_id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeptHeadArchive;
