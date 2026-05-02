import { useState, useEffect } from "react";
import api from "../../api/axios";

const RequestAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [advisorId, setAdvisorId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [fetchingAdvisors, setFetchingAdvisors] = useState(true);

  // Load advisor list on mount
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await api.get("/advisors");
        setAdvisors(res.data || []);
      } catch (err) {
        console.error("Failed to load advisors:", err);
        setStatus({ type: "error", text: "Could not load advisor list." });
      } finally {
        setFetchingAdvisors(false);
      }
    };
    fetchAdvisors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!advisorId) {
      setStatus({ type: "error", text: "Please select an advisor." });
      return;
    }
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await api.post("/advisor/request", {
        advisor_id: advisorId,
        message: message,
      });
      setStatus({
        type: "success",
        text: "✅ Advisor request sent successfully!",
      });
      setAdvisorId("");
      setMessage("");
    } catch (err) {
      console.error("Request advisor error:", err);
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat().join(", ");
        setStatus({ type: "error", text: `❌ ${msgs}` });
      } else {
        setStatus({
          type: "error",
          text: "❌ Request failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Advisor</h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Advisor selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Advisor
            </label>
            {fetchingAdvisors ? (
              <p className="text-gray-500 text-sm">Loading advisors…</p>
            ) : (
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Choose an advisor --</option>
                {advisors.map((a) => (
                  <option key={a.advisor_id} value={a.advisor_id}>
                    {a.specialization} ({a.education_level}) – {a.office_room}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Why do you want this advisor?"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {status.text && (
            <div
              className={`text-sm p-3 rounded ${
                status.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {status.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fetchingAdvisors}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestAdvisor;
