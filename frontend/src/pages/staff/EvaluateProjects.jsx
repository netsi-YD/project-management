import { useState, useEffect } from "react";
import api from "../../api/axios";

const EvaluateProjects = () => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdvisor = roles.includes("Advisor");
  const isExaminer = roles.includes("Examiner");

  // If user has both roles, let them pick; otherwise use the only one
  const [evaluatorType, setEvaluatorType] = useState(
    isAdvisor ? "advisor" : "examiner",
  );

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [detailedMarks, setDetailedMarks] = useState({});
  const [studentComments, setStudentComments] = useState("");
  const [coordinatorRemarks, setCoordinatorRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load projects according to selected evaluator type
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        let res;
        if (evaluatorType === "advisor") {
          res = await api.get("/advisor/projects");
        } else {
          res = await api.get("/examiner/projects");
        }
        setProjects(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [evaluatorType]);

  // Reset form when project or evaluator type changes
  useEffect(() => {
    setDetailedMarks({});
    setStudentComments("");
    setCoordinatorRemarks("");
    setMessage("");
  }, [selectedProject, evaluatorType]);

  const handleSubmit = async (isSubmit) => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      await api.post("/evaluation/submit", {
        project_id: selectedProject,
        evaluator_type: evaluatorType,
        detailed_marks: detailedMarks,
        student_comments: studentComments,
        coordinator_remarks: coordinatorRemarks,
        submit: isSubmit,
      });
      setMessage(
        isSubmit ? "Evaluation submitted successfully!" : "Draft saved.",
      );
    } catch (err) {
      setMessage("Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  // Advisor criteria (30%)
  const advisorFields = [
    { key: "attendance", label: "Attendance (5%)", max: 5 },
    {
      key: "document_preparation",
      label: "Document Preparation (10%)",
      max: 10,
    },
    { key: "team_coordination", label: "Team Coordination (5%)", max: 5 },
    { key: "progress_report", label: "Progress Report (10%)", max: 10 },
  ];

  // Examiner criteria (70%)
  const examinerFields = [
    { key: "ppt_preparation", label: "PPT Preparation (5%)", max: 5 },
    {
      key: "problem_statement",
      label: "Statement of the Problem (5%)",
      max: 5,
    },
    { key: "objectives", label: "Objectives (4%)", max: 4 },
    { key: "scope_limitation", label: "Scope & Limitation (4%)", max: 4 },
    { key: "methodology", label: "Methodology (5%)", max: 5 },
    { key: "significance", label: "Significance (5%)", max: 5 },
    {
      key: "requirement_analysis",
      label: "Requirement Analysis (10%)",
      max: 10,
    },
    {
      key: "system_model_design",
      label: "System Model & Design (15%)",
      max: 15,
    },
    { key: "document_formatting", label: "Document Formatting (5%)", max: 5 },
    {
      key: "defense",
      label: "Confidence, Communication, Defense (12%)",
      max: 12,
    },
  ];

  const fields = evaluatorType === "advisor" ? advisorFields : examinerFields;
  const percentage = evaluatorType === "advisor" ? "30%" : "70%";

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        {evaluatorType === "advisor" ? "Advisor" : "Examiner"} Evaluation (
        {percentage})
      </h2>

      {/* Role selector for users with both roles */}
      {isAdvisor && isExaminer && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evaluate as
          </label>
          <select
            value={evaluatorType}
            onChange={(e) => setEvaluatorType(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="advisor">Advisor (30%)</option>
            <option value="examiner">Examiner (70%)</option>
          </select>
        </div>
      )}

      {/* Project selector */}
      <div className="bg-white rounded border p-4 shadow-sm mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        {loadingProjects ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choose a project --</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grading form */}
      {selectedProject && (
        <div className="bg-white rounded border p-4 shadow-sm space-y-4">
          <h3 className="font-semibold">Marks Breakdown</h3>
          {fields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{field.label}</label>
              <input
                type="number"
                min="0"
                max={field.max}
                value={detailedMarks[field.key] || ""}
                onChange={(e) =>
                  setDetailedMarks({
                    ...detailedMarks,
                    [field.key]: Number(e.target.value),
                  })
                }
                className="border rounded px-2 py-1 w-20 text-center"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">
              Comments for Student
            </label>
            <textarea
              value={studentComments}
              onChange={(e) => setStudentComments(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              General Remarks for Coordinator
            </label>
            <textarea
              value={coordinatorRemarks}
              onChange={(e) => setCoordinatorRemarks(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>
          {message && (
            <div
              className={`p-2 rounded text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {message}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="border border-[#1f67a8] text-[#1f67a8] px-4 py-2 rounded hover:bg-blue-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Evaluation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluateProjects;
