import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, Mail, Lock, Calendar, MapPin, Briefcase } from "lucide-react";
import "../styles/overviewpage.css";
import backgroundImage from "../assets/overviewimage.png";

export default function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("overview");

  useEffect(() => {
    if (location.pathname.includes("login")) setMode("login");
    else if (location.pathname.includes("teacher-signup")) setMode("teacher");
    else if (location.pathname.includes("signup")) setMode("signup");
    else setMode("overview");
  }, [location.pathname]);

  const API_BASE = import.meta.env.VITE_API_BASE; // e.g. http://localhost:8000

  // -----------------------------
  // Login
  // -----------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      alert("Login successful!");
      navigate("/student"); // ✅ redirect to student.jsx page
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  // -----------------------------
  // Student Signup
  // -----------------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    class_level: "",
    birthYear: "",
    address: "",
    role: "student",
  });
  const classOptions = Array.from({ length: 10 }, (_, i) => {
    const grade = i + 1;
    return ["A", "B", "C", "D"].map((section) => ({
      value: `${grade} ${section}`,
      label: `Class ${grade} ${section}`,
    }));
  }).flat();
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, birthYear: Number(formData.birthYear) };
      const res = await fetch(`${API_BASE}/auth/signup-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
      }
      const data = await res.json();
      alert("Student signup successful!");
      console.log(data);
      navigate("/login");
    } catch (err) {
      alert(`Signup failed: ${err.message}`);
    }
  };

  // -----------------------------
  // Teacher Signup
  // -----------------------------
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    department: "",
    address: "",
  });
  const handleTeacherChange = (field, value) => {
    setTeacherData({ ...teacherData, [field]: value });
  };
  const handleTeacherSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/signup-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Teacher signup failed");
      }
      const data = await res.json();
      alert("Teacher signup successful!");
      console.log(data);
      navigate("/login");
    } catch (err) {
      alert(`Teacher signup failed: ${err.message}`);
    }
  };

  return (
    <div
      className="overview-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="background-overlay">
        <div className="school-banner-block">
          <span className="school-name">New Saroj English Medium School</span>
          <span className="school-location">, Latur</span>
        </div>

        {/* Login Section */}
        {mode === "login" && (
          <div className="login-box">
            <h2 className="login-title">LOGIN</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <label>Username (Name)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
              />
              <label className="password-label">
                Password
                <span
                  className="forgot-password"
                  onClick={() => alert("Forgot password flow here")}
                >
                  Forgot password?
                </span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="submit" className="login-button">
                LOGIN →
              </button>
              <button
                type="button"
                className="overview-button"
                onClick={() => navigate("/")}
              >
                GO TO OVERVIEW →
              </button>
            </form>
          </div>
        )}

        {/* Student Signup Section */}
        {mode === "signup" && (
          <div className="signup-box">
            <h2 className="login-title">STUDENT SIGNUP</h2>
            <form className="signup-form" onSubmit={handleSignup}>
              <label><User size={18} /> Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <label><Mail size={18} /> Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
              <label><Lock size={18} /> Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
              <label>Class Level</label>
              <select
                value={formData.class_level}
                onChange={(e) => handleChange("class_level", e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label><Calendar size={18} /> Birth Year</label>
              <input
                type="number"
                value={formData.birthYear}
                onChange={(e) => handleChange("birthYear", e.target.value)}
                required
              />
              <label><MapPin size={18} /> Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
              <button type="submit" className="primary">Sign Up</button>
              <button
                type="button"
                className="overview-button"
                onClick={() => navigate("/")}
              >
                GO TO OVERVIEW →
              </button>
            </form>
          </div>
        )}

        {/* Teacher Signup Section */}
        {mode === "teacher" && (
          <div className="teacher-box">
            <h2 className="login-title">TEACHER SIGNUP</h2>
            <form className="signup-form" onSubmit={handleTeacherSignup}>
              <label><User size={18} /> Name</label>
              <input
                type="text"
                value={teacherData.name}
                onChange={(e) => handleTeacherChange("name", e.target.value)}
                required
              />
              <label><Mail size={18} /> Email</label>
              <input
                type="email"
                value={teacherData.email}
                              onChange={(e) => handleTeacherChange("password", e.target.value)}
              required
            />
              <label><Briefcase size={18} /> Subject</label>
              <input
                type="text"
                value={teacherData.subject}
                onChange={(e) => handleTeacherChange("subject", e.target.value)}
                required
              />
              <label>Department</label>
              <input
                type="text"
                value={teacherData.department}
                onChange={(e) => handleTeacherChange("department", e.target.value)}
                required
              />
              <label><MapPin size={18} /> Address</label>
              <input
                type="text"
                value={teacherData.address}
                onChange={(e) => handleTeacherChange("address", e.target.value)}
                required
              />
              <button type="submit" className="primary">
                Sign Up as Teacher
              </button>
              <button
                type="button"
                className="overview-button"
                onClick={() => navigate("/")}
              >
                GO TO OVERVIEW →
              </button>
            </form>
          </div>
        )}

        {/* ✅ Overview Section */}
        {mode === "overview" && (
          <div className="overview-content">
            <h2>Welcome to the Overview Page</h2>
            <div className="overview-buttons">
              <button onClick={() => navigate("/login")}>Go to Login →</button>
              <button onClick={() => navigate("/signup")}>Student Signup →</button>
              <button onClick={() => navigate("/teacher-signup")}>Teacher Signup →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}