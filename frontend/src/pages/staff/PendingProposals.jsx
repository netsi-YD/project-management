import { useState, useEffect } from "react";
import api from "../../api/axios";

const PendingProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [acceptedId, setAcceptedId] = useState(null); // track which proposal was accepted

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await api.get("/coordinator/proposals");
        setProposals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleAction = async (projectId, action, chosenTitleIndex = null) => {
    try {
      const payload = { status: action };
      if (chosenTitleIndex !== null) {
        payload.chosen_title_index = chosenTitleIndex;
      }
      // 1. Perform the approve/reject/revision action
      await api.put(`/coordinator/approve-proposal/${projectId}`, payload);

      // 2. Refresh the list silently (any failure is ignored)
      try {
        const res = await api.get("/coordinator/proposals");
        setProposals(res.data);
      } catch (refreshErr) {
        console.error("Failed to refresh proposals", refreshErr);
      }
    } catch (err) {
      // Only shows alert if the main action failed
      let msg = "Unknown error";
      if (err.response) {
        const data = err.response.data;
        if (data.message) {
          msg = data.message;
        } else if (data.errors) {
          msg = Object.values(data.errors).flat().join(", ");
        } else {
          msg = JSON.stringify(data);
        }
        msg = `[${err.response.status}] ${msg}`;
      } else if (err.request) {
        msg = "No response from server. Check your connection.";
      } else {
        msg = err.message;
      }
      alert(`Failed to ${action}: ${msg}`);
    }
  };
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Pending Proposals
      </h2>
      {proposals.length === 0 ? (
        <p className="text-gray-500">No pending proposals.</p>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const isAccepted = acceptedId === proposal.project_id;
            return (
              <div
                key={proposal.project_id}
                className={`bg-white rounded-lg border p-5 shadow-sm ${
                  isAccepted ? "opacity-60" : ""
                }`}
              >
                <div>
                  <button
                    onClick={() => toggleExpand(proposal.project_id)}
                    className="text-lg font-semibold text-[#1f67a8] hover:underline text-left"
                  >
                    Proposal from:{" "}
                    {proposal.group_members.length > 0
                      ? proposal.group_members.join(", ")
                      : proposal.student_name}
                  </button>
                  {isAccepted && (
                    <span className="ml-3 text-green-700 text-sm font-medium">
                      ✓ Accepted
                    </span>
                  )}
                </div>

                {expandedId === proposal.project_id && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                    {proposal.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {proposal.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Preferred Titles
                      </h4>
                      <ul className="space-y-3">
                        {proposal.preferred_titles.map((title, index) => (
                          <li
                            key={index}
                            className="border rounded-lg p-3 bg-gray-50"
                          >
                            <p className="text-sm text-gray-800 mb-2">
                              {title}
                            </p>
                            {!isAccepted && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleAction(
                                      proposal.project_id,
                                      "approved",
                                      index,
                                    )
                                  }
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction(
                                      proposal.project_id,
                                      "rejected",
                                      index,
                                    )
                                  }
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction(
                                      proposal.project_id,
                                      "revision",
                                      index,
                                    )
                                  }
                                  className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                                >
                                  Request Revision
                                </button>
                              </div>
                            )}
                            {isAccepted && (
                              <p className="text-sm text-gray-400">
                                No further actions available
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {proposal.preferred_advisors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Preferred Advisors
                        </h4>
                        <p className="text-sm text-gray-600">
                          {proposal.preferred_advisors.join(", ")}
                        </p>
                      </div>
                    )}

                    {proposal.proposal_file && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Document
                        </h4>
                        <a
                          href={proposal.proposal_file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Proposal Document
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingProposals;
