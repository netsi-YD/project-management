import React, { useState } from "react";
import { submitAccessRequest } from "../../api/guest";

export default function AccessRequestForm() {
  const [status, setStatus] = useState("none");

  const handleSubmit = async () => {
    try {
      const res = await submitAccessRequest();
      setStatus(res.status);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Request Access</h1>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
      >
        Submit Request
      </button>

      <p className="mt-3">Status: {status}</p>
    </div>
  );
}
