import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadArchive = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dept-head/archive-projects")
      .then((res) => setProjects(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Archived Projects (Department)
      </h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">
          No archived projects in your department.
        </p>
      ) : (
        <table className="w-full text-sm bg-white rounded border shadow-sm">
          <thead className="border-b text-left">
            <tr>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Student</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_id} className="border-b">
                <td className="py-2 px-4">{p.title}</td>
                <td className="py-2 px-4">{p.student?.full_name}</td>
                <td className="py-2 px-4 capitalize">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeptHeadArchive;
