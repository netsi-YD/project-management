import { useState, useEffect } from "react";
import api from "../../api/axios";

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const colors = {
    submitted: "bg-blue-100 text-blue-700",
    draft: "bg-yellow-100 text-yellow-700",
    review: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

const EvalCell = ({ data, outOf }) => {
  if (!data)
    return (
      <td className="border px-3 py-2 text-center text-gray-400 text-xs">—</td>
    );
  return (
    <td className="border px-3 py-2 text-center">
      <p className="font-semibold">
        {data.total_marks}
        <span className="text-gray-400 text-xs">/{outOf}</span>
      </p>
      <p className="text-xs text-gray-500 truncate max-w-[120px] mx-auto">
        {data.evaluator_name}
      </p>
      <StatusBadge status={data.status} />
    </td>
  );
};

const CoordinatorEvaluations = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/staff/projects")
      .then((res) => setProjects(res.data?.data || res.data || []))
      .catch(console.error);
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
      loadEvaluations(selectedProject);
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

      {!loading && evaluations.length > 0 && (
        <div className="bg-white rounded border shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-3 py-2 text-left">Student</th>
                <th className="border px-3 py-2 text-center">
                  Advisor
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    out of 30
                  </span>
                </th>
                <th className="border px-3 py-2 text-center">
                  Examiner 1<br />
                  <span className="text-xs font-normal text-gray-500">
                    out of 70
                  </span>
                </th>
                <th className="border px-3 py-2 text-center">
                  Examiner 2<br />
                  <span className="text-xs font-normal text-gray-500">
                    out of 70
                  </span>
                </th>
                <th className="border px-3 py-2 text-center">
                  Examiner Avg
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    out of 70
                  </span>
                </th>
                <th className="border px-3 py-2 text-center">
                  Total
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    out of 100
                  </span>
                </th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.student_id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 font-medium">
                    {ev.student_name}
                  </td>

                  <EvalCell data={ev.advisor} outOf={30} />
                  <EvalCell data={ev.examiner1} outOf={70} />
                  <EvalCell data={ev.examiner2} outOf={70} />

                  <td className="border px-3 py-2 text-center">
                    {ev.examiner_avg != null ? (
                      <span className="font-semibold text-blue-700">
                        {ev.examiner_avg}
                        <span className="text-gray-400 text-xs">/70</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {ev.examiner1 && !ev.examiner2
                          ? "Waiting for 2nd"
                          : "Pending"}
                      </span>
                    )}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {ev.total != null ? (
                      <span className="font-bold text-green-700 text-base">
                        {ev.total}
                        <span className="text-gray-400 text-xs">/100</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {ev.advisor &&
                      ev.advisor.status !== "forwarded_to_dept_head" && (
                        <button
                          onClick={() =>
                            handleForward(ev.advisor.evaluation_id)
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          Forward Advisor
                        </button>
                      )}
                    {ev.examiner1 &&
                      ev.examiner1.status !== "forwarded_to_dept_head" && (
                        <button
                          onClick={() =>
                            handleForward(ev.examiner1.evaluation_id)
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          Forward Examiner 1
                        </button>
                      )}
                    {ev.examiner2 &&
                      ev.examiner2.status !== "forwarded_to_dept_head" && (
                        <button
                          onClick={() =>
                            handleForward(ev.examiner2.evaluation_id)
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          Forward Examiner 2
                        </button>
                      )}
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

export default CoordinatorEvaluations;
