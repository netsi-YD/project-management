import { useState, useEffect } from "react";
import api from "../../api/axios";

const AssignExaminers = () => {
  const [projects, setProjects] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, examRes] = await Promise.all([
          api.get("/coordinator/projects-for-examiner-assignment"),
          api.get("/coordinator/examiners"),
        ]);
        setProjects(projRes.data || []);
        setExaminers(examRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (projectId) => {
    const examinerId = selected[projectId];
    if (!examinerId) {
      setError("Please select an examiner.");
      return;
    }
    setError("");
    try {
      await api.post("/coordinator/assign-examiner", {
        project_id: projectId,
        examiner_id: examinerId,
      });
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
      setSelected((prev) => ({ ...prev, [projectId]: "" }));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to assign examiner";
      setError(msg);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Assign Examiners
      </h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects awaiting examiner assignment.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm"
            >
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-gray-500">{p.student?.full_name}</p>
              <div className="flex gap-2 mt-3 items-center">
                <select
                  value={selected[p.project_id] || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, [p.project_id]: e.target.value })
                  }
                  className="border rounded px-3 py-1 flex-1"
                >
                  <option value="" disabled>
                    Select Examiner
                  </option>
                  {examiners.map((e) => (
                    <option key={e.examiner_id} value={e.examiner_id}>
                      {e.full_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(p.project_id)}
                  className="bg-[#1f67a8] text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignExaminers;
