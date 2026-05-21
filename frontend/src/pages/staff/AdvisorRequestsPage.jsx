import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdvisorRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/advisor/requests");
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

  const handleRespond = async (requestId, status) => {
    try {
      await api.put(`/advisor/request/${requestId}/respond`, { status });
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Direct Student Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded border p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Student: {req.student?.full_name}</p>
                {req.message && (
                  <p className="text-sm text-gray-500">
                    Message: {req.message}
                  </p>
                )}
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(req.id, "accepted")}
                    className="bg-[#1f67a8] text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
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

export default AdvisorRequestsPage;
