import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

// ====== EVALUATION CRITERIA (30% total) ======
const CRITERIA = [
  { key: "attendance", label: "Attendance (5%)", max: 5 },
  { key: "document_preparation", label: "Document preparation (10%)", max: 10 },
  {
    key: "team_coordination",
    label: "Team coordination & Task division (5%)",
    max: 5,
  },
  { key: "progress_report", label: "Progress report (10%)", max: 10 },
];

const TOTAL_MAX = CRITERIA.reduce((sum, c) => sum + c.max, 0); // 30

const AdvisorProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Per‑student evaluation state
  const [marks, setMarks] = useState({}); // { [userId]: { [criteriaKey]: value } }
  const [comments, setComments] = useState({}); // { [userId]: string }
  const [evalMessages, setEvalMessages] = useState({});
  const [errors, setErrors] = useState({}); // { [userId]: string[] }

  const fetchProject = async () => {
    try {
      const res = await api.get(`/advisor/projects/${projectId}`);
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

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim() || !reviewStatus) {
      alert("Provide comment and status");
      return;
    }
    try {
      await api.post("/advisor/review", {
        project_id: project.project_id,
        comment: reviewComment,
        status: reviewStatus,
      });
      setReviewMessage("Review submitted!");
      setReviewComment("");
      setReviewStatus("");
      fetchProject();
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  // Generic handler for all numeric inputs
  const handleMarkChange = (studentId, criteriaKey, rawValue) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [criteriaKey]: rawValue },
    }));
  };

  const handleCommentChange = (studentId, value) => {
    setComments((prev) => ({ ...prev, [studentId]: value }));
  };

  const getTotal = (studentId) => {
    const studentMarks = marks[studentId] || {};
    let total = 0;
    CRITERIA.forEach((crit) => {
      const val = parseFloat(studentMarks[crit.key]);
      if (!isNaN(val)) total += val;
    });
    return total;
  };

  const validateStudentMarks = (studentId) => {
    const studentMarks = marks[studentId] || {};
    const newErrors = [];
    CRITERIA.forEach((crit) => {
      const raw = studentMarks[crit.key];
      if (raw === undefined || raw === "") {
        newErrors.push(`${crit.label} is required`);
        return;
      }
      const val = Number(raw);
      if (isNaN(val) || val < 0 || val > crit.max) {
        newErrors.push(`${crit.label} must be 0-${crit.max}`);
      }
    });
    return newErrors;
  };

  const handleEvalSubmit = async (studentId) => {
    const errs = validateStudentMarks(studentId);
    if (errs.length > 0) {
      setErrors((prev) => ({ ...prev, [studentId]: errs }));
      return;
    }

    const detailedMarks = {};
    CRITERIA.forEach((crit) => {
      const val = Number(marks[studentId][crit.key]);
      detailedMarks[crit.label] = val;
    });

    try {
      await api.post("/evaluation/submit", {
        project_id: project.project_id,
        student_id: studentId,
        evaluator_type: "advisor",
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
      return project.group.members.map((member) => ({
        studentIdForEval: member.user_id,
        fullName: member.user?.full_name ?? "Unknown",
        campusId: member.student_campus_id ?? "N/A",
        user_id: member.user_id,
      }));
    }
    if (project?.student) {
      return [
        {
          studentIdForEval: project.student.user_id,
          fullName: project.student.full_name,
          campusId: "N/A",
          user_id: project.student.user_id,
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
        to="/staff/advisor-groups"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to My Groups
      </Link>

      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600">Student: {project.student?.full_name}</p>
      <p className="text-gray-600">Status: {project.status}</p>

      {/* Submissions */}
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

      {/* Review */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Review & Status Change</h2>
        {reviewMessage && (
          <p className="text-green-700 bg-green-50 p-2 rounded mb-2">
            {reviewMessage}
          </p>
        )}
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Write your review comment..."
          className="w-full border rounded p-2 mb-2"
          rows={3}
        />
        <select
          value={reviewStatus}
          onChange={(e) => setReviewStatus(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        >
          <option value="">-- Select status --</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
          <option value="revision">Request Revision</option>
        </select>
        <button
          onClick={handleReviewSubmit}
          className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Review
        </button>
      </div>

      {/* Evaluation Table */}
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
                  <th className="border p-2">Campus ID</th>
                  {CRITERIA.map((crit) => (
                    <th key={crit.key} className="border p-2">
                      {crit.label}
                      <br />
                      <span className="text-xs text-gray-500">
                        (0-{crit.max} marks)
                      </span>
                    </th>
                  ))}
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Private Comment</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {evaluateStudents.map((student) => {
                  const studentId = student.studentIdForEval;
                  const currentMarks = marks[studentId] || {};
                  const total = getTotal(studentId);
                  const errList = errors[studentId] || [];
                  const msg = evalMessages[studentId];

                  return (
                    <tr key={studentId} className="hover:bg-gray-50">
                      <td className="border p-2 font-medium">
                        {student.fullName}
                      </td>
                      <td className="border p-2">{student.campusId}</td>

                      {/* All criteria inputs are now numeric */}
                      {CRITERIA.map((crit) => (
                        <td key={crit.key} className="border p-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max={crit.max}
                            step="1"
                            value={currentMarks[crit.key] || ""}
                            onChange={(e) =>
                              handleMarkChange(
                                studentId,
                                crit.key,
                                e.target.value,
                              )
                            }
                            className="w-20 border rounded p-1 text-center"
                          />
                        </td>
                      ))}

                      <td className="border p-2 text-center font-bold">
                        {total}/{TOTAL_MAX}
                      </td>
                      <td className="border p-1">
                        <textarea
                          value={comments[studentId] || ""}
                          onChange={(e) =>
                            handleCommentChange(studentId, e.target.value)
                          }
                          rows={1}
                          className="w-32 border rounded p-1 text-xs"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => handleEvalSubmit(studentId)}
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

export default AdvisorProjectDetail;
