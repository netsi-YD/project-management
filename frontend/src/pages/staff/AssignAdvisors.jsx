import { useState, useEffect } from "react";
import api from "../../api/axios";

const AssignAdvisors = () => {
  const [projects, setProjects] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, advRes] = await Promise.all([
          api.get("/coordinator/projects-for-assignment"),
          api.get("/advisors"),
        ]);
        setProjects(projRes.data || []);
        setAdvisors(advRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (projectId, advisorId) => {
    if (!advisorId) return;
    try {
      await api.post("/staff/assign-advisor", {
        project_id: projectId,
        advisor_id: advisorId,
      });
      alert("Advisor assigned");
      // Refresh list
      const res = await api.get("/coordinator/projects-for-assignment");
      setProjects(res.data || []);
    } catch (err) {
      alert("Failed to assign advisor");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Assign Advisors
      </h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects awaiting advisor assignment.
        </p>
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
                  Select Advisor
                </option>
                {advisors.map((a) => (
                  <option key={a.advisor_id} value={a.advisor_id}>
                    {a.specialization} (ID {a.advisor_id})
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

export default AssignAdvisors;
