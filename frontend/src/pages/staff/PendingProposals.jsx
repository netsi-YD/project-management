import { useState, useEffect } from "react";
import api from "../../api/axios";

const PendingProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revisionComment, setRevisionComment] = useState({}); // per project id

  const fetchProposals = async () => {
    try {
      const res = await api.get("/coordinator/proposals");
      setProposals(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAction = async (projectId, action) => {
    try {
      await api.put(`/coordinator/approve-proposal/${projectId}`, {
        status: action,
      });
      fetchProposals();
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleRequestRevision = async (projectId) => {
    const comment = revisionComment[projectId]?.trim();
    try {
      await api.put(`/coordinator/request-revision/${projectId}`, { comment });
      setRevisionComment({ ...revisionComment, [projectId]: "" });
      fetchProposals();
    } catch (err) {
      alert("Failed to request revision");
    }
  };

  const [activeRevision, setActiveRevision] = useState(null); // project id currently editing

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Pending Proposals
      </h2>
      {proposals.length === 0 ? (
        <p className="text-gray-500">No pending proposals.</p>
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
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

              <div className="flex gap-2 mt-2 items-center">
                <button
                  onClick={() => handleAction(prop.project_id, "approved")}
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(prop.project_id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
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
                  className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded text-sm"
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
      )}
    </div>
  );
};

export default PendingProposals;
