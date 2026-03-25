import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ReviewPage from "./pages/review";       // 👈 Landing page
import Overview from "./pages/overviewpage";   
import StudentDashboard from "./pages/dashboards/student";
import GradesPage from "./pages/grades";
import FeesPage from "./pages/fee";
import AssignmentsPage from "./pages/assignments";
import TimetablePage from "./pages/timetable";
import ScholarshipPage from "./pages/scholarship";
import Setting from "./pages/setting";


import "./App.css";

function App() {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    const backendURL = import.meta.env.VITE_API_BASE;
    console.log("✅ Backend URL:", backendURL);

    fetch(`${backendURL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch((err) => {
        console.error("❌ Backend fetch failed:", err);
        setBackendMessage("Failed to connect to backend");
      });
  }, []);

  return (
    <Router>
      <div className="app-container">
        {backendMessage && (
          <div className="backend-status">
            <small>{backendMessage}</small>
          </div>
        )}

        <Routes>
          {/* 🔹 Root path now shows ReviewPage */}
          <Route path="/" element={<ReviewPage />} />
         

          {/* Overview and forms */}
        <Route path="/" element={<Overview />} />
        <Route path="/login" element={<Overview />} />
        <Route path="/signup" element={<Overview />} />
        <Route path="/teacher-signup" element={<Overview />} />
        <Route path="/student" element={<StudentDashboard />} />
        
        
          {/* Student dashboard */}
          <Route path="/dashboard" element={<StudentDashboard />} />

          {/* Section routes */}
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/fee" element={<FeesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/scholarship" element={<ScholarshipPage />} />
          <Route path="/setting" element={<Setting />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;