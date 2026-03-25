import React, { useState, useEffect } from "react";
import "../styles/assignments.css";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Simulated backend fetch
  useEffect(() => {
    const dummyAssignments = [
      {
        id: 1,
        subject: "Mathematics",
        title: "Algebra Worksheet",
        dueDate: "2026-01-20",
        status: "Pending",
      },
      {
        id: 2,
        subject: "Science",
        title: "Physics Lab Report",
        dueDate: "2026-01-22",
        status: "Submitted",
      },
      {
        id: 3,
        subject: "English",
        title: "Essay on Shakespeare",
        dueDate: "2026-01-25",
        status: "Graded",
        grade: "A",
        feedback: "Excellent analysis and writing style!",
      },
    ];
    setAssignments(dummyAssignments);
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (assignmentId) => {
    if (!selectedFile) {
      alert("Please upload a file before submitting.");
      return;
    }
    alert(`File "${selectedFile.name}" submitted for assignment ${assignmentId}`);
    // TODO: connect to backend API for file upload
    setSelectedFile(null);
  };

  return (
    <div className="assignments-fullscreen">
      <h1>Assignments</h1>
      {assignments.map((item) => (
        <div className="assignment-card" key={item.id}>
          <h3>{item.subject}: {item.title}</h3>
          <p><strong>Due:</strong> {item.dueDate}</p>
          <p><strong>Status:</strong> {item.status}</p>

          {item.status === "Pending" && (
            <div className="upload-section">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
              />
              <button
                className="submit-btn"
                onClick={() => handleSubmit(item.id)}
              >
                Upload & Submit
              </button>
            </div>
          )}

          {item.status === "Graded" && (
            <div className="feedback-box">
              <p><strong>Grade:</strong> {item.grade}</p>
              <p><strong>Feedback:</strong> {item.feedback}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
