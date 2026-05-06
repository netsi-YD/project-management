import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/StatCard";
import api from "../../api/axios";

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advisor data
  const [advisorProjects, setAdvisorProjects] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);

  // Examiner data
  const [examinerProjects, setExaminerProjects] = useState([]);

  // Coordinator data
  const [pendingProposals, setPendingProposals] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [examiners, setExaminers] = useState([]);

  // AI similarity
  const [similarityResult, setSimilarityResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // ---------- REVISION COMMENT STATE ----------
  const [revisionComment, setRevisionComment] = useState({}); // per project id
  const [activeRevision, setActiveRevision] = useState(null); // project id currently editing

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/student/profile");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to load profile", err);
      return null;
    }
  }, []);

  const loadRoleData = useCallback(async (roleList) => {
    const lowered = roleList.map((r) => r.toLowerCase());
    try {
      if (lowered.includes("advisor")) {
        await Promise.all([
          api.get("/advisor/projects").then((r) => setAdvisorProjects(r.data)),
          api
            .get("/advisor/pending-assignments")
            .then((r) => setPendingAssignments(r.data)),
        ]);
      }
      if (lowered.includes("examiner")) {
        await api
          .get("/examiner/projects")
          .then((r) => setExaminerProjects(r.data));
      }
      if (lowered.includes("project_coordinator")) {
        await Promise.all([
          api
            .get("/coordinator/proposals")
            .then((r) => setPendingProposals(r.data)),
          api.get("/advisors").then((r) => setAdvisors(r.data)),
          api.get("/coordinator/examiners").then((r) => setExaminers(r.data)),
        ]);
      }
    } catch (err) {
      console.error("Error loading role data:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      setRoles(storedRoles);
      const profile = await fetchProfile();
      if (profile) {
        await loadRoleData(storedRoles);
      }
      setLoading(false);
    };
    init();
  }, [fetchProfile, loadRoleData]);

  // ---------- handlers ----------
  const handleAdvisorResponse = async (projectId, status) => {
    try {
      await api.put(`/advisor/respond-assignment/${projectId}`, { status });
      const res = await api.get("/advisor/pending-assignments");
      setPendingAssignments(res.data);
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleCoordinatorApproval = async (projectId, status) => {
    try {
      await api.put(`/coordinator/approve-proposal/${projectId}`, { status });
      const res = await api.get("/coordinator/proposals");
      setPendingProposals(res.data);
    } catch (err) {
      alert("Failed to update proposal");
    }
  };

  const handleRequestRevision = async (projectId) => {
    const comment = revisionComment[projectId]?.trim();
    try {
      await api.put(`/coordinator/request-revision/${projectId}`, { comment });
      setRevisionComment({ ...revisionComment, [projectId]: "" });
      setActiveRevision(null);
      const res = await api.get("/coordinator/proposals");
      setPendingProposals(res.data);
    } catch (err) {
      alert("Failed to request revision");
    }
  };

  const handleAssignAdvisor = async (projectId, advisorId) => {
    try {
      await api.post("/staff/assign-advisor", {
        project_id: projectId,
        advisor_id: advisorId,
      });
      alert("Advisor assigned");
    } catch (err) {
      alert("Failed to assign advisor");
    }
  };

  const handleAssignExaminer = async (projectId, examinerId) => {
    try {
      await api.post("/coordinator/assign-examiner", {
        project_id: projectId,
        examiner_id: examinerId,
      });
      alert("Examiner assigned");
    } catch (err) {
      alert("Failed to assign examiner");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploading(true);
    setSimilarityResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/ai/similarity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSimilarityResult(res.data);
    } catch (err) {
      alert("Similarity check failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  const advisorGroupsCount = advisorProjects.length;
  const advisorRequestsCount = pendingAssignments.length;

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#1f67a8]">
        Welcome, {user?.full_name}
      </h1>

      {roles.some((r) => r.toLowerCase() === "project_coordinator") && (
        <div className="bg-blue-50 border border-[#1f67a8] text-[#1f67a8] p-4 rounded mt-4">
          🔔 You have{" "}
          {pendingProposals.filter((p) => p.status === "pending").length}{" "}
          pending proposals
        </div>
      )}

      {/* AI Similarity Test */}
      <div className="bg-white p-6 rounded shadow border-2 border-[#1f67a8] mt-6">
        <h2 className="text-xl font-semibold text-[#1f67a8] mb-3">
          🤖 AI Similarity Test
        </h2>
        <p className="text-gray-600 mb-4">
          Upload a document to check similarity
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.pptx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1f67a8] file:text-white hover:file:bg-blue-700"
          />
          {uploading && (
            <div className="mt-4">
              <p className="text-blue-600">
                🤖 AI is analyzing your document...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#1f67a8] h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}
          {similarityResult && !uploading && (
            <div
              className={`mt-4 p-4 rounded ${similarityResult.similarity_percentage > 30 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
            >
              <p className="font-semibold">📊 Similarity Score:</p>
              <p
                className={`text-3xl font-bold ${similarityResult.similarity_percentage > 30 ? "text-red-600" : "text-green-600"}`}
              >
                {similarityResult.similarity_percentage}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                File: {uploadedFileName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advisor Panel */}
      {roles.some((r) => r.toLowerCase() === "advisor") && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#1f67a8]">
            Advisor Panel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Groups" value={advisorGroupsCount} />
            <StatCard title="Requests" value={advisorRequestsCount} />
            <StatCard title="Submissions" value="—" />
            <StatCard title="Messages" value="—" />
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3">Advisor Requests</h3>
            {pendingAssignments.length === 0 && (
              <p className="text-gray-500">No pending requests</p>
            )}
            {pendingAssignments.map((p) => (
              <div
                key={p.project_id}
                className="flex justify-between border p-3 rounded mb-2"
              >
                <div>
                  <p>{p.title}</p>
                  <p className="text-sm text-gray-500">
                    {p.student?.full_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAdvisorResponse(p.project_id, "accepted")
                    }
                    className="bg-[#1f67a8] text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleAdvisorResponse(p.project_id, "rejected")
                    }
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3">Project Review</h3>
            {advisorProjects.length === 0 && (
              <p className="text-gray-500">No assigned projects</p>
            )}
            {advisorProjects.map((p) => (
              <div key={p.project_id} className="border p-3 rounded mb-2">
                <p>{p.title}</p>
                <p className="text-sm text-gray-500">
                  Student: {p.student?.full_name}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-[#1f67a8] text-white px-3 py-1 rounded"
                    onClick={() => alert("Open review form")}
                  >
                    Review
                  </button>
                  <button
                    className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded"
                    onClick={() => alert("Request revision")}
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examiner Panel */}
      {roles.some((r) => r.toLowerCase() === "examiner") && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#1f67a8]">
            Examiner Panel
          </h2>
          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3">Evaluate Project</h3>
            {examinerProjects.length === 0 && (
              <p className="text-gray-500">No projects assigned</p>
            )}
            {examinerProjects.map((p) => (
              <div key={p.project_id} className="border p-3 rounded mb-2">
                <p>{p.title}</p>
                <p className="text-sm text-gray-500">
                  Student: {p.student?.full_name}
                </p>
                <input
                  type="number"
                  placeholder="Marks"
                  className="border px-2 py-1 mt-2 w-24"
                />
                <button
                  className="ml-2 bg-[#1f67a8] text-white px-3 py-1 rounded"
                  onClick={() => alert("Submit grade")}
                >
                  Submit Grade
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coordinator Panel */}
      {roles.some((r) => r.toLowerCase() === "project_coordinator") && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#1f67a8]">
            Coordinator Panel
          </h2>
          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3">📋 Pending Proposals</h3>
            {pendingProposals.length === 0 && (
              <p className="text-gray-500">No pending proposals</p>
            )}
            {pendingProposals.map((prop) => (
              <div key={prop.project_id} className="border p-4 rounded mb-3">
                <p className="font-medium">{prop.title}</p>
                <p className="text-sm text-gray-500">
                  By: {prop.student?.full_name}
                </p>

                {/* View Proposal Document */}
                {prop.submissions?.[0]?.file_path && (
                  <a
                    href={`http://localhost:8000/api/storage/${prop.submissions[0].file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 text-sm underline mt-1 inline-block"
                  >
                    View Proposal Document
                  </a>
                )}

                {/* Preferred advisors */}
                {prop.preferred_advisor_names && (
                  <p className="text-sm text-gray-500 mt-1">
                    Preferred advisors: {prop.preferred_advisor_names}
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      handleCoordinatorApproval(prop.project_id, "approved")
                    }
                    className="bg-[#1f67a8] text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleCoordinatorApproval(prop.project_id, "rejected")
                    }
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      setActiveRevision(
                        activeRevision === prop.project_id
                          ? null
                          : prop.project_id,
                      )
                    }
                    className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded"
                  >
                    {activeRevision === prop.project_id
                      ? "Cancel"
                      : "Request Revision"}
                  </button>
                </div>

                {/* Revision comment box */}
                {activeRevision === prop.project_id && (
                  <div className="mt-2 flex gap-2 items-start">
                    <textarea
                      value={revisionComment[prop.project_id] || ""}
                      onChange={(e) =>
                        setRevisionComment({
                          ...revisionComment,
                          [prop.project_id]: e.target.value,
                        })
                      }
                      placeholder="Specify what needs to be revised..."
                      className="flex-1 border rounded px-3 py-1 text-sm"
                      rows={2}
                    />
                    <button
                      onClick={() => handleRequestRevision(prop.project_id)}
                      className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {roles.some((r) => r.toLowerCase() === "super_admin") && (
        <div className="mt-8 bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold text-[#1f67a8]">
            Super Admin Panel
          </h2>
          <p className="text-gray-500">(To be connected later)</p>
        </div>
      )}
    </>
  );
};

export default StaffDashboard;
