import { useState, useEffect } from "react";
import api from "../../api/axios";

const UploadProposal = () => {
  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [title3, setTitle3] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [groupProjectExists, setGroupProjectExists] = useState(false);
  const [projectStatus, setProjectStatus] = useState("");
  const [fetchingGroup, setFetchingGroup] = useState(true);
  const [myGroupId, setMyGroupId] = useState(null);
  const [studentDepartment, setStudentDepartment] = useState("");

  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisors, setSelectedAdvisors] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  const ALLOWED_EXTENSIONS = [".docx", ".pptx"];
  const MAX_ADVISORS = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/student/profile");
        const dept = profileRes.data?.department || "";
        setStudentDepartment(dept);

        const groupsRes = await api.get("/groups");
        const groups = groupsRes.data || [];
        const myGroup =
          groups.find((g) => !g.project_id) || groups.find((g) => g.project_id);
        if (myGroup) {
          setMyGroupId(myGroup.group_id);
          const hasProject = !!myGroup.project_id;
          setGroupProjectExists(hasProject);
          if (hasProject) {
            const projectRes = await api.get(`/projects/${myGroup.project_id}`);
            const proj = projectRes.data.project;
            if (proj) {
              setProjectStatus(proj.status);
            }
          }
        }

        const params = dept ? { department: dept } : {};
        const advRes = await api.get("/advisors", { params });
        setAdvisors(advRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingGroup(false);
      }
    };
    fetchData();
  }, []);

  const canSubmit =
    !groupProjectExists ||
    projectStatus === "rejected" ||
    projectStatus === "revision";

  const toggleAdvisor = (advisorId) => {
    setSelectedAdvisors((prev) => {
      if (prev.includes(advisorId)) {
        return prev.filter((id) => id !== advisorId);
      }
      if (prev.length >= MAX_ADVISORS) {
        setMessage(`You can select a maximum of ${MAX_ADVISORS} advisors.`);
        return prev;
      }
      return [...prev, advisorId];
    });
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setFileError("");
      return true;
    }
    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    const hasValidType = ALLOWED_TYPES.includes(selectedFile.type);
    if (!hasValidExtension || !hasValidType) {
      setFileError(
        `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(" and ")} files are allowed.`,
      );
      return false;
    }
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setFileError(`File size must be less than ${MAX_SIZE_MB} MB.`);
      return false;
    }
    setFileError("");
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isValid = validateFile(selectedFile);
      setFile(isValid ? selectedFile : null);
    } else {
      setFile(null);
      setFileError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title1.trim() || !title2.trim() || !title3.trim()) {
      setMessage("❌ All three titles are required.");
      return;
    }
    if (!file) {
      setMessage("❌ Please attach a valid proposal file.");
      return;
    }
    if (!myGroupId) {
      setMessage("❌ You are not part of a group. Create a group first.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const projectRes = await api.post("/projects", {
        title1: title1.trim(),
        title2: title2.trim(),
        title3: title3.trim(),
        description,
        preferred_advisor_ids: selectedAdvisors,
        group_id: myGroupId,
      });
      const projectId = projectRes.data.project.project_id;
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("type", "proposal");
      formData.append("file", file);
      await api.post("/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Proposal submitted successfully! Awaiting approval.");
      setTitle1("");
      setTitle2("");
      setTitle3("");
      setDescription("");
      setFile(null);
      setSelectedAdvisors([]);
      setDropdownOpen(false);
      document.getElementById("file-upload").value = "";
      setGroupProjectExists(true);
      setProjectStatus("pending");
    } catch (err) {
      console.error("Submission error:", err);
      const backendMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})
          .flat()
          .join(", ");
      setMessage(`❌ ${backendMsg || "Submission failed. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const getAdvisorLabel = (id) => {
    const advisor = advisors.find((a) => a.advisor_id === id);
    return advisor ? advisor.full_name : id;
  };

  if (fetchingGroup) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Proposal</h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {groupProjectExists && projectStatus === "pending" && (
          <div className="text-sm p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 mb-4">
            ✅ Your proposal has been submitted and is awaiting approval.
          </div>
        )}
        {groupProjectExists && projectStatus === "approved" && (
          <div className="text-sm p-3 rounded bg-green-50 border border-green-200 text-green-800 mb-4">
            ✅ Your project has been approved. You can now upload the final
            report.
          </div>
        )}
        {groupProjectExists && projectStatus === "rejected" && (
          <div className="text-sm p-3 rounded bg-red-50 border border-red-200 text-red-800 mb-4">
            ❌ Your proposal was rejected. You can revise and resubmit.
          </div>
        )}
        {groupProjectExists && projectStatus === "revision" && (
          <div className="text-sm p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 mb-4">
            ⚠️ Revision requested. Please make changes and resubmit.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title 1 *
            </label>
            <input
              type="text"
              value={title1}
              onChange={(e) => setTitle1(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter primary project title"
              required
              disabled={!canSubmit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title 2 *
            </label>
            <input
              type="text"
              value={title2}
              onChange={(e) => setTitle2(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter second project title"
              required
              disabled={!canSubmit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title 3 *
            </label>
            <input
              type="text"
              value={title3}
              onChange={(e) => setTitle3(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter third project title"
              required
              disabled={!canSubmit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Abstract
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your project"
              disabled={!canSubmit}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Advisors (max {MAX_ADVISORS})
            </label>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span className="text-sm">
                {selectedAdvisors.length > 0
                  ? selectedAdvisors.map((id) => getAdvisorLabel(id)).join(", ")
                  : "Select advisors..."}
              </span>
              <svg
                className="w-4 h-4 ml-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {advisors.map((advisor) => (
                  <label
                    key={advisor.advisor_id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAdvisors.includes(advisor.advisor_id)}
                      onChange={() => toggleAdvisor(advisor.advisor_id)}
                      className="rounded mr-2"
                    />
                    <span className="text-sm">{advisor.full_name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selected {selectedAdvisors.length}/{MAX_ADVISORS}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposal File (DOCX or PPTX)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".docx,.pptx"
              onChange={handleFileChange}
              disabled={!canSubmit}
              className={`w-full border rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                fileError ? "border-red-400" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: DOCX, PPTX (Max {MAX_SIZE_MB} MB – ~4 pages)
            </p>
            {fileError && (
              <p className="text-xs text-red-600 mt-1">{fileError}</p>
            )}
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded ${message.startsWith("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || !!fileError || !canSubmit}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Submit Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProposal;
