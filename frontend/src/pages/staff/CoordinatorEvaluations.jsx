import { useState, useEffect } from "react";
import api from "../../api/axios";

const CoordinatorEvaluations = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all projects (coordinator can see all)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/staff/projects");
        setProjects(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const loadEvaluations = async (projectId) => {
    setLoading(true);
    try {
      const res = await api.get(`/coordinator/evaluations/${projectId}`);
      setEvaluations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (evaluationId) => {
    try {
      await api.put(`/coordinator/forward-evaluation/${evaluationId}`);
      loadEvaluations(selectedProject); // refresh
    } catch (err) {
      alert("Failed to forward");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Evaluation Review (Coordinator)
      </h2>
      <div className="bg-white rounded border p-4 shadow-sm mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            if (e.target.value) loadEvaluations(e.target.value);
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Choose a project --</option>
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading evaluations…</p>}

      {!loading && evaluations.length === 0 && selectedProject && (
        <p className="text-gray-500">
          No evaluations submitted yet for this project.
        </p>
      )}

      <div className="space-y-4">
        {evaluations.map((ev) => (
          <div key={ev.id} className="bg-white rounded border p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {ev.evaluator_type === "advisor" ? "Advisor" : "Examiner"}{" "}
                  Evaluation
                </p>
                <p className="text-sm text-gray-500">
                  Total Marks: {ev.total_marks}
                </p>
                {ev.student_comments && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Student Comments:</strong> {ev.student_comments}
                  </p>
                )}
                {ev.coordinator_remarks && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Coordinator Remarks:</strong>{" "}
                    {ev.coordinator_remarks}
                  </p>
                )}
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    ev.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : ev.status === "submitted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {ev.status}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer text-sm text-blue-800">
                  View Detailed Marks
                </summary>
                <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">
                  {JSON.stringify(ev.detailed_marks, null, 2)}
                </pre>
              </details>
            </div>
            {ev.status === "submitted" && (
              <button
                onClick={() => handleForward(ev.id)}
                className="mt-3 bg-[#1f67a8] text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Forward to Department Head
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoordinatorEvaluations;
