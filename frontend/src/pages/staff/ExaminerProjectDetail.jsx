import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const CRITERIA = [
  { key: "ppt_preparation", label: "PPT preparation (5%)", max: 5 },
  { key: "problem_statement", label: "Statement of the problem (5%)", max: 5 },
  { key: "objectives", label: "Objectives (4%)", max: 4 },
  { key: "scope_limitation", label: "Scope and limitation (4%)", max: 4 },
  { key: "methodology", label: "Methodology (5%)", max: 5 },
  { key: "significance", label: "Significance (5%)", max: 5 },
  { key: "requirement_analysis", label: "Requirement Analysis (10%)", max: 10 },
  { key: "system_model_design", label: "System model & Design (15%)", max: 15 },
  { key: "document_formatting", label: "Document formatting (5%)", max: 5 },
  {
    key: "defense_performance",
    label: "Confidence, Communication Skill and Defense performance (12%)",
    max: 12,
  },
];

const TOTAL_MAX = CRITERIA.reduce((sum, c) => sum + c.max, 0);

const ExaminerProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [marks, setMarks] = useState({});
  const [comments, setComments] = useState({});
  const [evalMessages, setEvalMessages] = useState({});
  const [errors, setErrors] = useState({});

  const fetchProject = async () => {
    try {
      const res = await api.get(`/examiner/projects/${projectId}`);
      setProject(res.data.project);
    } catch (err) {
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleMarkChange = (studentId, key, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [key]: value },
    }));
  };

  const handleCommentChange = (studentId, value) => {
    setComments((prev) => ({ ...prev, [studentId]: value }));
  };

  const getTotal = (studentId) => {
    const m = marks[studentId] || {};
    let total = 0;
    CRITERIA.forEach((c) => {
      const v = parseFloat(m[c.key]);
      if (!isNaN(v)) total += v;
    });
    return total;
  };

  const validate = (studentId) => {
    const m = marks[studentId] || {};
    const errs = [];
    CRITERIA.forEach((c) => {
      const raw = m[c.key];
      if (raw === undefined || raw === "") {
        errs.push(`${c.label} is required`);
        return;
      }
      const val = Number(raw);
      if (isNaN(val) || val < 0 || val > c.max) {
        errs.push(`${c.label} must be 0-${c.max}`);
      }
    });
    return errs;
  };

  const handleSubmit = async (studentId) => {
    const errs = validate(studentId);
    if (errs.length > 0) {
      setErrors((prev) => ({ ...prev, [studentId]: errs }));
      return;
    }
    const detailedMarks = {};
    CRITERIA.forEach((c) => {
      detailedMarks[c.label] = Number(marks[studentId][c.key]);
    });

    try {
      await api.post("/evaluation/submit", {
        project_id: project.project_id,
        student_id: studentId,
        evaluator_type: "examiner",
        detailed_marks: detailedMarks,
        student_comments: comments[studentId] || "",
        submit: true,
      });
      setEvalMessages((prev) => ({
        ...prev,
        [studentId]: "✓ Evaluation submitted",
      }));
      setErrors((prev) => ({ ...prev, [studentId]: [] }));
    } catch (err) {
      alert("Failed to submit evaluation");
    }
  };

  const evaluateStudents = useMemo(() => {
    if (project?.group?.members?.length) {
      return project.group.members.map((m) => ({
        studentIdForEval: m.user_id,
        fullName: m.user?.full_name ?? "Unknown",
        campusId: m.student_campus_id ?? "N/A",
      }));
    }
    if (project?.student) {
      return [
        {
          studentIdForEval: project.student.user_id,
          fullName: project.student.full_name,
          campusId: "N/A",
        },
      ];
    }
    return [];
  }, [project]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-6 max-w-full mx-auto">
      <Link
        to="/staff/evaluate"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Projects
      </Link>
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600">Student: {project.student?.full_name}</p>
      <p className="text-gray-600">Status: {project.status}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Submissions</h2>
        {project.submissions?.length ? (
          project.submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between border p-2 rounded mb-1"
            >
              <span>
                {sub.type} – {new Date(sub.created_at).toLocaleDateString()}
              </span>
              {sub.file_url && (
                <a
                  href={sub.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View File
                </a>
              )}
            </div>
          ))
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">
          Evaluate Students (Total: {TOTAL_MAX} marks)
        </h2>
        {evaluateStudents.length === 0 ? (
          <p>No students to evaluate.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">S.ID</th>
                  {CRITERIA.map((c) => (
                    <th key={c.key} className="border p-2">
                      {c.label}
                      <br />
                      <span className="text-xs text-gray-500">(0-{c.max})</span>
                    </th>
                  ))}
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Private Comment</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {evaluateStudents.map((s) => {
                  const sid = s.studentIdForEval;
                  const curMarks = marks[sid] || {};
                  const total = getTotal(sid);
                  const errList = errors[sid] || [];
                  const msg = evalMessages[sid];
                  return (
                    <tr key={sid} className="hover:bg-gray-50">
                      <td className="border p-2 font-medium">{s.fullName}</td>
                      <td className="border p-2">{s.campusId}</td>
                      {CRITERIA.map((c) => (
                        <td key={c.key} className="border p-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max={c.max}
                            step="1"
                            value={curMarks[c.key] || ""}
                            onChange={(e) =>
                              handleMarkChange(sid, c.key, e.target.value)
                            }
                            className="w-16 border rounded p-1 text-center"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center font-bold">
                        {total}/{TOTAL_MAX}
                      </td>
                      <td className="border p-1">
                        <textarea
                          value={comments[sid] || ""}
                          onChange={(e) =>
                            handleCommentChange(sid, e.target.value)
                          }
                          rows={1}
                          className="w-32 border rounded p-1 text-xs"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => handleSubmit(sid)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                        >
                          Submit
                        </button>
                        {msg && (
                          <p className="text-green-700 text-xs mt-1">{msg}</p>
                        )}
                        {errList.length > 0 && (
                          <ul className="text-red-600 text-xs mt-1 list-disc list-inside">
                            {errList.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminerProjectDetail;
