import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import backgroundImage from "../assets/1768199921437.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signupMode, setSignupMode] = useState(false);
  const [signupRole, setSignupRole] = useState("student"); // default role

  // ✅ Clear any old token when user comes to login page
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Login failed");
        return;
      }

      const data = await res.json();

      // ✅ Save token + role in localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      // ✅ Navigate based on role
      if (data.role === "student") {
        navigate("/student-dashboard");
      } else if (data.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        alert("Unknown role. Please contact admin.");
      }
    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    if (password.length < 9) {
      alert("Password must be at least 9 characters long");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      alert("Password must be alphanumeric (letters and numbers)");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: signupRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Signup failed");
        return;
      }

      const data = await res.json();
      alert(`Signup successful for ${data.username} (${data.role})`);
      setSignupMode(false); // go back to login form
    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-container">
        <div className="school-banner-block">
          <span className="school-name">New Saroj English Medium School</span>
          <span className="school-location">, Latur</span>
        </div>

        <div className="login-box">
          <h2 className="login-title">{signupMode ? "SIGNUP" : "LOGIN"}</h2>

          {!signupMode ? (
            <form className="login-form" onSubmit={handleLogin}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>
                Password <span className="forgot">Forgot password?</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="remember-row">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
              </div>

              <button type="submit" className="login-button small">
                LOGIN →
              </button>

              <button
                type="button"
                className="signup-button"
                onClick={() => setSignupMode(true)}
              >
                SIGNUP →
              </button>
            </form>
          ) : (
            <form className="signup-form" onSubmit={handleSignup}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label>Role</label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <button type="submit" className="signup-button">
                CREATE ACCOUNT →
              </button>

              <button
                type="button"
                className="login-button small"
                onClick={() => setSignupMode(false)}
              >
                BACK TO LOGIN
              </button>
            </form>
          )}

          <p className="footer">Made for Jankalyan Sevabhavi Sanstha</p>
        </div>
      </div>
    </div>
  );
}