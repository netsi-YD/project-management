import { useState, useEffect } from "react";
import api from "../../api/axios";

const AssignExaminers = () => {
  const [projects, setProjects] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [messages, setMessages] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, examRes] = await Promise.all([
          api.get("/coordinator/projects-for-examiner-assignment"),
          api.get("/coordinator/examiners"),
        ]);
        const projects = projRes.data || [];
        setProjects(projects);
        setExaminers(examRes.data || []);

        // Pre-fill selects with already assigned examiners
        const preSelected = {};
        projects.forEach((p) => {
          preSelected[p.project_id] = {
            examiner1: p.assigned_examiners?.[0]?.examiner_id?.toString() || "",
            examiner2: p.assigned_examiners?.[1]?.examiner_id?.toString() || "",
          };
        });
        setSelected(preSelected);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (projectId, slot, value) => {
    setSelected((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], [slot]: value },
    }));
  };

  const handleAssign = async (projectId) => {
    const sel = selected[projectId] || {};
    const e1 = sel.examiner1;
    const e2 = sel.examiner2;

    if (!e1 || !e2) {
      setErrors((prev) => ({
        ...prev,
        [projectId]: "Please select both examiners.",
      }));
      return;
    }
    if (e1 === e2) {
      setErrors((prev) => ({
        ...prev,
        [projectId]: "The two examiners must be different.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [projectId]: "" }));

    try {
      await api.post("/coordinator/assign-examiner", {
        project_id: projectId,
        examiner_ids: [parseInt(e1), parseInt(e2)],
      });
      setMessages((prev) => ({
        ...prev,
        [projectId]: "✓ Two examiners assigned successfully",
      }));
      // Mark project as fully assigned in UI
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === projectId ? { ...p, fully_assigned: true } : p,
        ),
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to assign examiners";
      setErrors((prev) => ({ ...prev, [projectId]: msg }));
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Assign Examiners
      </h2>

      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects awaiting examiner assignment.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const sel = selected[p.project_id] || {};
            return (
              <div
                key={p.project_id}
                className="bg-white rounded border p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{p.title}</p>
                  {p.fully_assigned && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      2 Assigned
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {p.student?.full_name}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-600 font-medium block mb-1">
                      Examiner 1
                    </label>
                    <select
                      value={sel.examiner1 || ""}
                      onChange={(e) =>
                        handleChange(p.project_id, "examiner1", e.target.value)
                      }
                      className="border rounded px-3 py-1 w-full text-sm"
                    >
                      <option value="" disabled>
                        Select Examiner 1
                      </option>
                      {examiners.map((ex) => (
                        <option
                          key={ex.examiner_id}
                          value={ex.examiner_id}
                          disabled={
                            sel.examiner2 === ex.examiner_id?.toString()
                          }
                        >
                          {ex.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium block mb-1">
                      Examiner 2
                    </label>
                    <select
                      value={sel.examiner2 || ""}
                      onChange={(e) =>
                        handleChange(p.project_id, "examiner2", e.target.value)
                      }
                      className="border rounded px-3 py-1 w-full text-sm"
                    >
                      <option value="" disabled>
                        Select Examiner 2
                      </option>
                      {examiners.map((ex) => (
                        <option
                          key={ex.examiner_id}
                          value={ex.examiner_id}
                          disabled={
                            sel.examiner1 === ex.examiner_id?.toString()
                          }
                        >
                          {ex.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {errors[p.project_id] && (
                  <p className="text-red-600 text-sm mb-2">
                    {errors[p.project_id]}
                  </p>
                )}
                {messages[p.project_id] && (
                  <p className="text-green-700 text-sm mb-2">
                    {messages[p.project_id]}
                  </p>
                )}

                <button
                  onClick={() => handleAssign(p.project_id)}
                  className="bg-[#1f67a8] text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm"
                >
                  {p.fully_assigned
                    ? "Reassign Examiners"
                    : "Assign Both Examiners"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignExaminers;
