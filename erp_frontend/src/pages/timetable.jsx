import React from "react";
import "../styles/timetable.css";

export default function TimetablePage() {
  const timeSlots = [
    "8:00–8:15",
    "8:15–9:00",
    "9:00–9:45",
    "9:45–10:00 Short Break",
    "10:00–10:45",
    "10:45–11:00",
    "11:00–11:45",
    "11:45–12:00",
    "12:00–12:20 Long Break",
    "12:20–1:05",
    "1:05–1:55",
    "1:55–2:15"
  ];

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Example subject allocation
  const timetableData = {
    "8:00–8:15": { Mon: "Assembly", Tue: "Assembly", Wed: "Assembly", Thu: "Assembly", Fri: "Assembly" },
    "8:15–9:00": { Mon: "Maths", Tue: "Science", Wed: "English", Thu: "History", Fri: "Geography" },
    "9:00–9:45": { Mon: "Science", Tue: "Maths", Wed: "Computer", Thu: "English", Fri: "Physics" },
    "9:45–10:00 Short Break": { Mon: "Break", Tue: "Break", Wed: "Break", Thu: "Break", Fri: "Break" },
    "10:00–10:45": { Mon: "English", Tue: "Geography", Wed: "Maths", Thu: "Biology", Fri: "Chemistry" },
    "10:45–11:00": { Mon: "History", Tue: "Physics", Wed: "Chemistry", Thu: "Maths", Fri: "English" },
    "11:00–11:45": { Mon: "Geography", Tue: "Biology", Wed: "Science", Thu: "Computer", Fri: "History" },
    "11:45–12:00": { Mon: "Computer", Tue: "Physical Education", Wed: "Physics", Thu: "Chemistry", Fri: "Biology" },
    "12:00–12:20 Long Break": { Mon: "Break", Tue: "Break", Wed: "Break", Thu: "Break", Fri: "Break" },
    "12:20–1:05": { Mon: "Maths", Tue: "Science", Wed: "English", Thu: "History", Fri: "Geography" },
    "1:05–1:55": { Mon: "Science", Tue: "Maths", Wed: "Computer", Thu: "English", Fri: "Physics" },
    "1:55–2:15": { Mon: "Dispersal", Tue: "Dispersal", Wed: "Dispersal", Thu: "Dispersal", Fri: "Dispersal" },
  };

  const teacherMap = [
    { subject: "Maths", teacher: "Mrs. Shalini Deshmukh" },
    { subject: "Science", teacher: "Mr. Ajay Kulkarni" },
    { subject: "English", teacher: "Ms. Priya Patil" },
    { subject: "History", teacher: "Mr. Ramesh Joshi" },
    { subject: "Geography", teacher: "Mrs. Kavita Rao" },
    { subject: "Computer", teacher: "Mr. Suresh Naik" },
    { subject: "Biology", teacher: "Dr. Neha Shah" },
    { subject: "Chemistry", teacher: "Dr. Anil Mehta" },
    { subject: "Physics", teacher: "Dr. Rakesh Verma" },
    { subject: "Physical Education", teacher: "Coach Anil Sharma" },
  ];

  return (
    <div className="timetable-fullscreen">
      <h1>School Timetable</h1>
      <table className="timetable-grid">
        <thead>
          <tr>
            <th>Time</th>
            {weekdays.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot} className={slot.includes("Break") || slot.includes("Assembly") || slot.includes("Dispersal") ? "break-row" : ""}>
              <td>{slot}</td>
              {weekdays.map((day) => (
                <td key={day}>
                  {timetableData[slot]?.[day] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="teacher-map">
        <h2>Subject–Teacher Mapping</h2>
        <table className="teacher-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {teacherMap.map((row, index) => (
              <tr key={index}>
                <td>{row.subject}</td>
                <td>{row.teacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
