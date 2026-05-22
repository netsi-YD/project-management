import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const ProjectReport = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get(`/staff/projects?search=${projectId}`);
        const proj = projRes.data?.data?.[0] || projRes.data?.[0];
        setProject(proj);
        if (proj) {
          const evalRes = await api.get(
            `/dept-head/evaluations?project_id=${proj.project_id}`,
          );
          setEvaluations(evalRes.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [projectId]);

  const handlePrint = () => window.print();

  if (!project) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto print:max-w-full">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-xl font-semibold text-[#1f67a8]">Project Report</h2>
        <button
          onClick={handlePrint}
          className="bg-[#1f67a8] text-white px-4 py-2 rounded"
        >
          Print
        </button>
      </div>

      <div className="bg-white rounded border p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-gray-600">{project.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Student:</strong> {project.student?.full_name}
          </div>
          <div>
            <strong>Status:</strong> {project.status}
          </div>
          <div>
            <strong>Department:</strong> {project.student?.department || "N/A"}
          </div>
          <div>
            <strong>Submission Date:</strong> {project.submission_date}
          </div>
        </div>

        {evaluations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mt-4">Evaluations</h3>
            {evaluations.map((ev) => (
              <div key={ev.id} className="border-t pt-2 mt-2">
                <p>
                  <strong>Evaluator:</strong> {ev.evaluator_type} |{" "}
                  <strong>Marks:</strong> {ev.total_marks ?? "—"}
                </p>
                {ev.student_comments && (
                  <p>
                    <strong>Student Comments:</strong> {ev.student_comments}
                  </p>
                )}
                {ev.coordinator_remarks && (
                  <p>
                    <strong>Coordinator Remarks:</strong>{" "}
                    {ev.coordinator_remarks}
                  </p>
                )}
              </div>
            ))}
            <p className="mt-3 font-bold">
              Combined Score:{" "}
              {evaluations
                .reduce((sum, ev) => sum + (ev.total_marks || 0), 0)
                .toFixed(2)}{" "}
              / 100
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectReport;
