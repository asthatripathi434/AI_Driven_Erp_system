import React, { useState } from "react";
import "../styles/grades.css";

export default function GradesPage() {
  const [selectedExam, setSelectedExam] = useState(null);

  const student = {
    name: "Apurva Patil",
    prn: "123456",
    standard: "10th Standard",
  };

  const exams = {
    "Unit Test 1": [
      { name: "Maths", outOf: 50, marks: 42, grade: "A+" },
      { name: "Science", outOf: 50, marks: 38, grade: "A" },
      { name: "English", outOf: 50, marks: 40, grade: "A+" },
    ],
    "Mid Term": [
      { name: "Maths", outOf: 100, marks: 85, grade: "A+" },
      { name: "Science", outOf: 100, marks: 78, grade: "A" },
      { name: "English", outOf: 100, marks: 80, grade: "A+" },
    ],
    "Unit Test 2": [
      { name: "Maths", outOf: 50, marks: 36, grade: "B+" },
      { name: "Science", outOf: 50, marks: 40, grade: "A+" },
      { name: "English", outOf: 50, marks: 42, grade: "A+" },
    ],
    "Final Exam": [
      { name: "Maths", outOf: 100, marks: 90, grade: "O" },
      { name: "Science", outOf: 100, marks: 85, grade: "A+" },
      { name: "English", outOf: 100, marks: 88, grade: "A+" },
    ],
  };

  const renderGradeCard = (examName) => {
    const subjects = exams[examName];
    const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
    const maxMarks = subjects.reduce((sum, s) => sum + s.outOf, 0);
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const result = percentage >= 35 ? "PASS" : "FAIL";

    return (
      <div className="grade-card">
        <button className="back-btn" onClick={() => setSelectedExam(null)}>← Back</button>
        <h2>{examName} – Grade Card</h2>

        <div className="student-info">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>PRN:</strong> {student.prn}</p>
          <p><strong>Class:</strong> {student.standard}</p>
        </div>

        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Out Of</th>
              <th>Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, idx) => (
              <tr key={idx}>
                <td>{s.name}</td>
                <td>{s.outOf}</td>
                <td>{s.marks}</td>
                <td>{s.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <p><strong>Total:</strong> {totalMarks} / {maxMarks}</p>
          <p><strong>Percentage:</strong> {percentage}%</p>
          <p><strong>Result:</strong> {result}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      {!selectedExam ? (
        <>
          <div className="welcome-banner">
            <div>
              <h1>Grades Overview</h1>
              <p>Select an exam to view your grade card.</p>
            </div>
          </div>

          <section className="info-hub">
            {Object.keys(exams).map((exam, index) => (
              <div
                key={index}
                className="info-card clickable"
                onClick={() => setSelectedExam(exam)}
              >
                <h3>{exam}</h3>
                <p>Total Subjects: {exams[exam].length}</p>
              </div>
            ))}
          </section>
        </>
      ) : (
        renderGradeCard(selectedExam)
      )}
    </div>
  );
}
