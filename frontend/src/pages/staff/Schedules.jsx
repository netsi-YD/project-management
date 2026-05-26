import { useState, useEffect } from "react";
import api from "../../api/axios";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/admin/schedules?all=1");
      setSchedules(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      setError("Title and deadline are required.");
      return;
    }
    try {
      await api.post("/admin/schedules", { title, deadline });
      setMessage("Schedule created successfully!");
      setTitle("");
      setDeadline("");
      setError("");
      fetchSchedules();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create schedule.";
      setError(msg);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/schedules/${id}/toggle`);
      fetchSchedules();
    } catch (err) {
      alert("Failed to toggle schedule.");
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">
        Schedule Programs
      </h2>

      {/* Create Form */}
      <div className="bg-white rounded-lg border p-6 shadow-sm mb-6 max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. Proposal Submission Deadline"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline (must be within current academic year)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
              {message}
            </div>
          )}
          <button
            type="submit"
            className="bg-[#1f67a8] text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Schedule
          </button>
        </form>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Existing Schedules
        </h3>
        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedules yet.</p>
        ) : (
          <ul className="divide-y">
            {schedules.map((s) => (
              <li key={s.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">{s.title}</p>
                  <p className="text-sm text-gray-500">
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(s.id)}
                  className={`px-3 py-1 rounded text-xs text-white ${
                    s.is_active
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {s.is_active ? "Deactivate" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Schedules;
