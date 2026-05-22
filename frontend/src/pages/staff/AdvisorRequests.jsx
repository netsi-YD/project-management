import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdvisorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/advisor/pending-assignments");
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (projectId, status) => {
    await api.put(`/advisor/respond-assignment/${projectId}`, { status });
    fetchRequests(); // refresh list
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Advisor Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">
                  Student: {p.student?.full_name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResponse(p.project_id, "accepted")}
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(p.project_id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvisorRequests;
