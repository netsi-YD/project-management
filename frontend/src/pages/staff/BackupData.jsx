import { useState } from "react";
import api from "../../api/axios";

const BackupData = () => {
  const [message, setMessage] = useState("");

  const handleBackup = async () => {
    try {
      await api.post("/admin/backup");
      setMessage("Backup initiated successfully");
    } catch (err) {
      setMessage("Backup failed");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">Data Backup</h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm text-center">
        <p className="text-gray-600 mb-4">
          Click below to back up all files to the cloud or external storage.
        </p>
        <button
          onClick={handleBackup}
          className="bg-[#1f67a8] text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Backup Files
        </button>
        {message && <p className="mt-4 text-green-700">{message}</p>}
      </div>
    </div>
  );
};

export default BackupData;
