import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ArchivedProjects = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDept, setOpenDept] = useState(null);
  const [studentDept, setStudentDept] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/student/profile");
        const dept = profileRes.data?.department || "";
        setStudentDept(dept);

        const params = dept ? { department: dept } : {};
        const projRes = await api.get("/public-projects", { params });
        const data = projRes.data || [];
        const safeArray = Array.isArray(data) ? data : [];
        const cleaned = safeArray.map((d) => ({
          ...d,
          department: d.department || "Uncategorized",
        }));
        setDepartments(cleaned);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDept = (dept) => {
    setOpenDept((prev) => (prev === dept ? null : dept));
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading…</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Archived Projects
      </h2>
      <p className="text-gray-500 mb-6">
        Projects archived by the department head in your department
        {studentDept ? ` (${studentDept})` : ""}.
      </p>
      {departments.length === 0 ? (
        <p className="text-gray-500">No archived projects available yet.</p>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div
              key={dept.department}
              className="bg-white rounded-lg border shadow-sm"
            >
              <button
                onClick={() => toggleDept(dept.department)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50"
              >
                <span className="text-lg font-semibold text-[#1f67a8]">
                  {dept.department}
                </span>
                <span className="text-gray-400 text-xl">
                  {openDept === dept.department ? "▾" : "▸"}
                </span>
              </button>
              {openDept === dept.department && (
                <div className="border-t p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dept.projects.map((p) => (
                      <div
                        key={p.project_id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-semibold text-gray-800">
                          <Link
                            to={`/student/archived-project/${p.project_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {p.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">By: {p.student}</p>
                        {p.abstract && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                            {p.abstract}
                          </p>
                        )}
                        {p.file_url && (
                          <a
                            href={p.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                          >
                            Download Final Report
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedProjects;
