import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const CoordinatorGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api
      .get("/coordinator/groups")
      .then((res) => setGroups(res.data || []))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        All Project Groups
      </h2>
      {groups.length === 0 ? (
        <p className="text-gray-500">No groups formed yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div
              key={g.group_id}
              className="bg-white rounded border p-4 shadow-sm"
            >
              <h3 className="font-semibold">
                {g.project?.title || "No project"} – Group {g.group_number}
              </h3>
              <p className="text-sm text-gray-500">
                Members: {g.members?.map((m) => m.full_name).join(", ")}
              </p>
              {g.project_id && (
                <Link
                  to={`/staff/coordinator/project-evaluations/${g.project_id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Evaluations
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorGroups;
