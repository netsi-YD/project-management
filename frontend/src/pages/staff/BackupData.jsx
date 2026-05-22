import { useState, useEffect } from "react";
import api from "../../api/axios";

const BackupData = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBackups = async () => {
    try {
      const res = await api.get("/admin/backups");
      setBackups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage("");
    try {
      await api.post("/admin/backup");
      setMessage("Backup created successfully!");
      fetchBackups();
    } catch (err) {
      setMessage(
        "Backup failed: " + (err.response?.data?.message || "Unknown error"),
      );
    } finally {
      setCreating(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1f67a8]">Backup Data</h2>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className={`px-4 py-2 rounded text-white text-sm ${
            creating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {creating ? "Creating Backup…" : "Create Backup"}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">
          {message}
        </div>
      )}

      {backups.length === 0 ? (
        <p className="text-gray-500">
          No backups yet. Click "Create Backup" to generate one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Filename</th>
                <th className="border p-2">Size</th>
                <th className="border p-2">Created</th>
                <th className="border p-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.filename} className="hover:bg-gray-50">
                  <td className="border p-2 font-mono text-xs">{b.filename}</td>
                  <td className="border p-2">{formatSize(b.size)}</td>
                  <td className="border p-2 text-xs">
                    {new Date(b.created_at * 1000).toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    <a
                      href={`/api/admin/backups/${b.filename}`}
                      className="text-blue-600 hover:underline"
                      download
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BackupData;
