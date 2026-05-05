import React, { useState } from "react";
import Header from "../../components/shared/Header.jsx";
import Footer from "../../components/shared/Footer";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";

const Dashboard = () => {
  const user = {
    name: "Dr. Kebede",
    roles: ["advisor", "examiner", "coordinator", "super_admin"],
  };

  const [message, setMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  
  // ========== AI SIMILARITY TEST ==========
  const [uploading, setUploading] = useState(false);
  const [similarityResult, setSimilarityResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  
  // Mock AI similarity check
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    setUploading(true);
    setSimilarityResult(null);
    
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 100);
      setSimilarityResult(mockScore);
      setUploading(false);
    }, 2000);
  };
  
  // ========== PROPOSALS ==========
  const [proposals, setProposals] = useState([
    { id: 1, group: "Group G-03", title: "AI Grading System", similarity: null, status: "pending", message: "" },
    { id: 2, group: "Group G-04", title: "Blockchain Voting", similarity: null, status: "pending", message: "" },
    { id: 3, group: "Group G-05", title: "E-Learning Platform", similarity: null, status: "pending", message: "" },
  ]);

  const [revisionMessage, setRevisionMessage] = useState({});
  const [checkingProposal, setCheckingProposal] = useState(null);

  const handleCheckSimilarity = (id) => {
    setCheckingProposal(id);
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 100);
      setProposals(proposals.map(p => 
        p.id === id ? { ...p, similarity: mockScore } : p
      ));
      setCheckingProposal(null);
    }, 1500);
  };

  const handleAccept = (id) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "accepted" } : p));
  };

  const handleReject = (id) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "rejected" } : p));
  };

  const handleRequestChanges = (id) => {
    const msg = revisionMessage[id];
    if (!msg) {
      alert("Please enter revision comments");
      return;
    }
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "revision_requested", message: msg } : p));
    setRevisionMessage({ ...revisionMessage, [id]: "" });
  };

  const approvedProjects = [
    { id: 1, title: "Blockchain System" },
    { id: 2, title: "Mobile App" },
  ];

  const loginHistory = [
    { user: "Abebe Kebede", time: "2026-02-07 09:15 AM" },
    { user: "Sara Alemu", time: "2026-02-07 10:30 AM" },
    { user: "Yonas Tesfaye", time: "2026-02-07 01:45 PM" },
  ];

  const scheduledPrograms = [
    { name: "AI Grading System", deadline: "2026-02-15" },
    { name: "Blockchain Voting App", deadline: "2026-02-20" },
  ];

  const [projectStatuses, setProjectStatuses] = useState([
    { title: "AI Grading System", deadline: 10, adjustDays: 0 },
    { title: "Blockchain Voting App", deadline: 15, adjustDays: 0 },
  ]);

  const handleReduceDeadline = (index) => {
    const newStatuses = [...projectStatuses];
    const adjust = newStatuses[index].adjustDays;
    if (adjust > 0 && adjust <= newStatuses[index].deadline) {
      newStatuses[index].deadline -= adjust;
      newStatuses[index].adjustDays = 0;
      setProjectStatuses(newStatuses);
    } else {
      alert("Invalid adjustment days");
    }
  };

  const updateAdjustDays = (index, value) => {
    const newStatuses = [...projectStatuses];
    newStatuses[index].adjustDays = parseInt(value) || 0;
    setProjectStatuses(newStatuses);
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} />
        <main className="flex-1 p-8 space-y-8">
          
          <h1 className="text-2xl font-semibold text-[#1f67a8]">Welcome, {user.name}</h1>

          {/* Notification Banner */}
          <div className="bg-blue-50 border border-[#1f67a8] text-[#1f67a8] p-4 rounded">
            🔔 You have {proposals.filter(p => p.status === "pending").length} pending proposals
          </div>

          {/* ========== AI SIMILARITY TEST SECTION (BLUE BOX) ========== */}
          <div className="bg-white p-6 rounded shadow border-2 border-[#1f67a8]">
            <h2 className="text-xl font-semibold text-[#1f67a8] mb-3">🤖 AI Similarity Test</h2>
            <p className="text-gray-600 mb-4">Upload a document to check if it's similar to existing projects</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1f67a8] file:text-white hover:file:bg-blue-700"
              />
              
              {uploading && (
                <div className="mt-4">
                  <p className="text-blue-600">🤖 AI is analyzing your document...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-[#1f67a8] h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              )}
              
              {similarityResult !== null && !uploading && (
                <div className={`mt-4 p-4 rounded ${similarityResult > 30 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className="font-semibold">📊 Similarity Score:</p>
                  <p className={`text-3xl font-bold ${similarityResult > 30 ? 'text-red-600' : 'text-green-600'}`}>
                    {similarityResult}%
                  </p>
                  {similarityResult > 30 ? (
                    <p className="text-red-600 mt-2">⚠️ HIGH SIMILARITY - Similar project exists in repository!</p>
                  ) : (
                    <p className="text-green-600 mt-2">✅ LOW SIMILARITY - Proposal appears original</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">File: {uploadedFileName}</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= ADVISOR PANEL ================= */}
          {user.roles.includes("advisor") && (
            <>
              <h2 className="text-xl font-semibold text-[#1f67a8]">Advisor Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Groups" value="5" />
                <StatCard title="Requests" value="2" />
                <StatCard title="Submissions" value="4" />
                <StatCard title="Messages" value="3" />
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Advisor Requests (UC03)</h3>
                <div className="flex justify-between border p-3 rounded">
                  <div><p>Group G-12</p><p className="text-sm text-gray-500">Abebe, Hana, Samuel</p></div>
                  <div className="flex gap-2">
                    <button className="bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Approve</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Project Review (UC07)</h3>
                <div className="border p-3 rounded">
                  <p>Group G-01</p>
                  <p className="text-sm text-gray-500">AI Attendance System</p>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Review</button>
                    <button className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded hover:bg-blue-50">Request Revision</button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Messaging (UC04)</h3>
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message..." className="border px-3 py-2 w-full rounded" />
                <button className="mt-2 bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Send</button>
              </div>
            </>
          )}

          {/* ================= EXAMINER PANEL ================= */}
          {user.roles.includes("examiner") && (
            <>
              <h2 className="text-xl font-semibold text-[#1f67a8]">Examiner Panel</h2>
              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Evaluate Project (UC13)</h3>
                <div className="border p-3 rounded">
                  <p>Group G-02</p>
                  <p className="text-sm text-gray-500">Smart Library System</p>
                  <p className="text-sm text-red-500">Similarity: 15%</p>
                  <input type="number" placeholder="Enter Grade" className="border px-2 py-1 rounded mt-2 w-32" />
                  <button className="ml-2 bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Submit Grade</button>
                </div>
              </div>
            </>
          )}

          {/* ================= COORDINATOR PANEL ================= */}
          {user.roles.includes("coordinator") && (
            <>
              <h2 className="text-xl font-semibold text-[#1f67a8]">Coordinator Panel</h2>

              {/* Pending Proposals */}
              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">📋 Pending Project Proposals</h3>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{proposal.group}</p>
                          <p className="text-sm text-gray-500">Project: {proposal.title}</p>
                          
                          {/* AI Similarity for this proposal */}
                          {proposal.similarity === null ? (
                            <button 
                              onClick={() => handleCheckSimilarity(proposal.id)}
                              disabled={checkingProposal === proposal.id}
                              className="mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                            >
                              {checkingProposal === proposal.id ? "🤖 Checking..." : "🔍 Run AI Similarity Check"}
                            </button>
                          ) : (
                            <div className={`mt-2 p-2 rounded ${proposal.similarity > 30 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                              <p className={`text-sm font-semibold ${proposal.similarity > 30 ? 'text-red-600' : 'text-green-600'}`}>
                                {proposal.similarity > 30 ? '⚠️' : '✅'} AI Similarity: {proposal.similarity}%
                              </p>
                            </div>
                          )}

                          {proposal.status !== "pending" && (
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                proposal.status === "accepted" ? "bg-green-100 text-green-700" :
                                proposal.status === "rejected" ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                Status: {proposal.status.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {proposal.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <button onClick={() => handleAccept(proposal.id)} className="bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Accept</button>
                            <button onClick={() => handleReject(proposal.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                          </div>
                        )}
                      </div>
                      
                      {proposal.status === "pending" && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex gap-2 items-center">
                            <input type="text" placeholder="Revision comments..." value={revisionMessage[proposal.id] || ""} onChange={(e) => setRevisionMessage({ ...revisionMessage, [proposal.id]: e.target.value })} className="flex-1 border px-3 py-1 rounded text-sm" />
                            <button onClick={() => handleRequestChanges(proposal.id)} className="border border-[#1f67a8] text-[#1f67a8] px-3 py-1 rounded hover:bg-blue-50">Request Changes</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Advisors */}
              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Assign Advisors (UC08)</h3>
                <div className="flex justify-between border p-3 rounded">
                  <p>Group G-05</p>
                  <select className="border px-2 py-1 rounded">
                    <option>Select Advisor</option>
                    <option>Dr. Kebede</option>
                    <option>Dr. Hana</option>
                  </select>
                </div>
              </div>

              {/* Assign Examiners */}
              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Assign Examiners (UC18)</h3>
                <div className="flex justify-between border p-3 rounded">
                  <p>Group G-05</p>
                  <select className="border px-2 py-1 rounded">
                    <option>Select Examiner</option>
                    <option>Prof. Samuel</option>
                    <option>Dr. Alem</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ================= SUPER ADMIN PANEL ================= */}
          {user.roles.includes("super_admin") && (
            <>
              <h2 className="text-xl font-semibold text-[#1f67a8]">Super Admin Panel</h2>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Login History (UC17)</h3>
                <table className="w-full text-sm">
                  <thead className="border-b"><tr><th className="text-left py-2">User</th><th className="text-left py-2">Time</th></tr></thead>
                  <tbody>{loginHistory.map((log, idx) => (<tr key={idx} className="border-b"><td className="py-2">{log.user}</td><td className="py-2">{log.time}</td></tr>))}</tbody>
                </table>
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Manage Users (UC09)</h3>
                {["Abebe Kebede", "Sara Alemu", "Yonas Tesfaye"].map((u, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b py-2">
                    <span>{u}</span>
                    <select className="border px-2 py-1 rounded">
                      <option>Select Role</option><option>Student</option><option>Advisor</option><option>Examiner</option><option>Coordinator</option><option>Super Admin</option>
                    </select>
                  </div>
                ))}
                <button className="mt-3 bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700">Save Roles</button>
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Schedule Programs</h3>
                <div className="flex gap-2"><input type="text" placeholder="Program Name" className="border px-2 py-1 rounded flex-1" /><input type="date" className="border px-2 py-1 rounded" /><button className="bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Save</button></div>
                {scheduledPrograms.map((prog, idx) => (<div key={idx} className="flex justify-between border-b py-1"><span>{prog.name}</span><span>{prog.deadline}</span></div>))}
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Project Status Management</h3>
                <table className="w-full text-sm">
                  <thead className="border-b"><tr><th className="text-left">Project</th><th>Deadline</th><th>Adjust</th><th>Action</th></tr></thead>
                  <tbody>
                    {projectStatuses.map((proj, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{proj.title}</td>
                        <td>{proj.deadline}</td>
                        <td><input type="number" placeholder="days" className="border w-20" value={proj.adjustDays || ""} onChange={(e) => updateAdjustDays(idx, e.target.value)} /></td>
                        <td><button onClick={() => handleReduceDeadline(idx)} className="bg-[#1f67a8] text-white px-2 py-1 rounded hover:bg-blue-700">Reduce</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Archive Projects (UC12)</h3>
                {approvedProjects.map((proj) => (<div key={proj.id} className="flex justify-between border-b py-2"><span>{proj.title}</span><button className="bg-[#1f67a8] text-white px-3 py-1 rounded hover:bg-blue-700">Archive</button></div>))}
              </div>

              <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-3">Data Backup (UC16)</h3>
                <button onClick={() => setBackupMessage("Backup initiated!")} className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700">Backup Files</button>
                {backupMessage && <p className="mt-2 text-green-600">{backupMessage}</p>}
              </div>
            </>
          )}

          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3 text-[#1f67a8]">Calendar (UC21)</h3>
            <p className="text-sm">📅 Submission: May 20 | Defense: May 30 | Proposal Review: June 5</p>
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;