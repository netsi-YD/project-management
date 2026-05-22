import { useState, useEffect } from "react";
import api from "../../api/axios";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/admin/schedules");
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/schedules", { title, deadline });
      setTitle("");
      setDeadline("");
      fetchSchedules();
    } catch (err) {
      alert("Failed to save schedule");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Schedule Programs
      </h2>

      {/* Add form */}
      <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
        <form onSubmit={handleSave} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Schedule
          </button>
        </form>
      </div>

      {/* Existing schedules */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedules yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">Program</th>
                <th className="py-2">Deadline</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.title}</td>
                  <td className="py-2">{s.deadline}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Schedules;
