import { useState, useEffect } from "react";
import api from "../../api/axios";

const PendingProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.put(`/coordinator/request-revision/${projectId}`);
      fetchProposals();
    } catch (err) {
      alert("Failed");
    }
  };

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
          {proposals.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm"
            >
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500">
                Student: {p.student?.full_name}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction(p.project_id, "approved")}
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(p.project_id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleRequestRevision(p.project_id)}
                  className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded text-sm"
                >
                  Request Revision
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingProposals;
