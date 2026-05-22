import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const DeptHeadArchive = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dept-head/archive-projects")
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">
        Archived Projects
      </h2>
      {projects.length === 0 ? (
        <p>No archived projects.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Student</th>
                <th className="border p-2">Archived</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id} className="hover:bg-gray-50">
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
