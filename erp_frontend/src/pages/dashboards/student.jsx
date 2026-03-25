import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BarChart3,
  FileText,
  CalendarDays,
  DollarSign,
  Target,
  User,
  Lock,
  Settings,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";
import studentPhoto from "../../assets/photo.jpeg";
import GradesPage from "../grades";
import FeesPage from "../fee";
import AssignmentsPage from "../assignments";
import TimetablePage from "../timetable";
import ScholarshipPage from "../scholarship";
import CertificatesPage from "../CertificatesPage";


import "./../../styles/dashboard.css";
import "./../../styles/setting.css";


const API_BASE = import.meta.env.VITE_API_BASE;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [selectedSection, setSelectedSection] = useState("home");

  const [student, setStudent] = useState({
    name: "",
    prn: "",
    standard: "",
    birthYear: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    console.log("✅ Student Dashboard URL: http://localhost:5173/student-dashboard");

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/auth/profile?token=${token}`) // ✅ updated to match backend
        .then((res) => res.json())
        .then((data) => {
          if (data && data.student) {
            setStudent({
              name: data.student.name,
              prn: data.student._id,
              standard: `${data.student.class_level}th Standard`,
              birthYear: data.student.birthYear,
              address: data.student.address,
              email: data.student.email,
            });
          }
        })
        .catch(() => {
          console.log("⚠️ Backend not reachable, using static student profile");
          setStudent({
            name: "Apurva Patil",
            prn: "123456",
            standard: "10th Standard",
            birthYear: "2010",
            address: "Mulshi, Maharashtra",
            email: "apurvasarode593@gmail.com",
          });
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h4 className="sidebar-heading">
            <GraduationCap size={28} className="icon" /> Student Portal
          </h4>
          <hr className="sidebar-divider" />
          <nav>
            <ul>
              <li className={selectedSection === "home" ? "active" : ""} onClick={() => setSelectedSection("home")}>
                <Home size={20} className="icon" /> Home
              </li>
              <li className={selectedSection === "grades" ? "active" : ""} onClick={() => setSelectedSection("grades")}>
                <BarChart3 size={20} className="icon" /> Grades
              </li>
              <li className={selectedSection === "assignments" ? "active" : ""} onClick={() => setSelectedSection("assignments")}>
                <FileText size={20} className="icon" /> Assignments
              </li>
              <li className={selectedSection === "timetable" ? "active" : ""} onClick={() => setSelectedSection("timetable")}>
                <CalendarDays size={20} className="icon" /> Timetable
              </li>
              <li className={selectedSection === "CertificatesPage" ? "active" : ""} onClick={() => setSelectedSection("CertificatesPage")}>
                <GraduationCap size={20} className="icon" /> Certificates
              </li>
              <li className={selectedSection === "fees" ? "active" : ""} onClick={() => setSelectedSection("fees")}>
                <DollarSign size={20} className="icon" /> Fees
              </li>
              <li className={selectedSection === "scholarships" ? "active" : ""} onClick={() => setSelectedSection("scholarships")}>
                <Target size={20} className="icon" /> Scholarships
              </li>
            </ul>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-toggle" onClick={() => setShowProfileDetails(!showProfileDetails)}>
            <User size={20} className="icon" />
            <span>{student.name}</span>
            {showProfileDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showProfileDetails && (
            <div className="profile-details">
              <ul>
                <li><User size={18} className="icon" /> {student.email}</li>
                <li><Lock size={18} className="icon" /> ********</li>
                <li onClick={() => navigate("/setting")}>
                  <Settings size={18} className="icon" /> Settings
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        {selectedSection === "home" && (
          <>
            <div className="welcome-banner">
              <div>
                <h1>Welcome!</h1>
                <p>"The goal of education is the advancement of knowledge and the dissemination of truth."</p>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <section className="id-card">
              <img src={studentPhoto} alt="Student Photo" className="id-photo" />
              <div className="id-details">
                <h2>{student.name}</h2>
                <p>Class: {student.standard}</p>
                <p>Birth Year: {student.birthYear}</p>
                <p>Address: {student.address}</p>
                <p>PRN: {student.prn}</p>
              </div>
            </section>

            <section className="info-hub">
              <div className="info-card"><h3>Class Teacher</h3><p>Mrs. Shalini Deshmukh</p></div>
              <div className="info-card"><h3>Principal</h3><p>Dr. Ramesh Kulkarni</p></div>
              <div className="info-card"><h3>School Timings</h3><p>Mon–Fri: 8:00 AM – 2:30 PM</p></div>
              <div className="info-card"><h3>Government Scholarships</h3><p>New RTI-based scholarship available for Class 9–12</p></div>
              <div className="info-card"><h3>School Scholarships</h3><p>Merit-based scholarship for top 10% students</p></div>
              <div className="info-card"><h3>Upcoming Exams</h3><p>Maths – Jan 20, Science – Jan 25</p></div>
              <div className="info-card"><h3>Announcements</h3><p>Annual Sports Day – Feb 10</p></div>
              <div className="info-card"><h3>Achievements</h3><p>State-level Science Fair winners announced</p></div>
              <div className="info-card"><h3>Resources</h3><p>Download syllabus, circulars, and study materials</p></div>
              <div className="info-card"><h3>Emergency Contacts</h3><p>School Helpline: +91-9876543210</p></div>
            </section>
          </>
        )}

        {selectedSection === "grades" && <GradesPage />}
        {selectedSection === "assignments" && <AssignmentsPage />}
        {selectedSection === "timetable" && <TimetablePage />}
        {selectedSection === "CertificatesPage" && <CertificatesPage />}
        {selectedSection === "fees" && <FeesPage />}
        {selectedSection === "scholarships" && <ScholarshipPage />}
      </main>
    </div>
  );
}