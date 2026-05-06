import { useState, useEffect } from "react";
import api from "../../api/axios";

const AssignExaminers = () => {
  const [projects, setProjects] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, exRes] = await Promise.all([
          api.get("/coordinator/proposals"),
          api.get("/coordinator/examiners"),
        ]);
        setProjects(projRes.data || []);
        setExaminers(exRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (projectId, examinerId) => {
    if (!examinerId) return;
    try {
      await api.post("/coordinator/assign-examiner", {
        project_id: projectId,
        examiner_id: examinerId,
      });
      alert("Examiner assigned");
    } catch (err) {
      alert("Failed");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Assign Examiners
      </h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No pending proposals.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">{p.student?.full_name}</p>
              </div>
              <select
                onChange={(e) => handleAssign(p.project_id, e.target.value)}
                className="border rounded px-3 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Examiner
                </option>
                {examiners.map((e) => (
                  <option key={e.examiner_id} value={e.examiner_id}>
                    {e.expertise_area} (ID {e.examiner_id})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignExaminers;
