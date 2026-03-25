import { useState } from "react";
import {
  Lock,
  Trash2,
  Mail,
  FileText,
  UserCog,
} from "lucide-react";
import "./../styles/setting.css";

export default function Setting() {
  const [activeForm, setActiveForm] = useState("");

  // ✅ Added states for inputs
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [complaint, setComplaint] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const backendURL = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  // ✅ Added backend functions
  const handleChangePassword = async () => {
    const res = await fetch(`${backendURL}/auth/change-password?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const data = await res.json();
    alert(data.message || data.detail || "Password change attempted");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    const res = await fetch(`${backendURL}/auth/delete-account?token=${token}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message || data.detail || "Delete attempted");
    if (res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/";
    }
  };

  const handleEmailPrincipal = async () => {
    const res = await fetch(`${backendURL}/school/email-principal?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    alert(data.message || data.detail || "Email attempted");
  };

  const handleSubmitComplaint = async () => {
    const res = await fetch(`${backendURL}/school/complaint?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint }),
    });
    const data = await res.json();
    alert(data.message || data.detail || "Complaint attempted");
  };

  const handleUpdateProfile = async () => {
    const res = await fetch(`${backendURL}/auth/update-profile?token=${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    alert(data.message || data.detail || "Profile update attempted");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, security, and communication with school administration</p>
      </div>

      <div className="settings-actions">
        <button onClick={() => setActiveForm("changePassword")}>
          <Lock size={18} className="icon" /> Change Password
        </button>
        <button onClick={() => setActiveForm("deleteAccount")}>
          <Trash2 size={18} className="icon" /> Delete Account
        </button>
        <button onClick={() => setActiveForm("emailPrincipal")}>
          <Mail size={18} className="icon" /> Email Principal
        </button>
        <button onClick={() => setActiveForm("submitComplaint")}>
          <FileText size={18} className="icon" /> Submit Complaint
        </button>
        <button onClick={() => setActiveForm("updateProfile")}>
          <UserCog size={18} className="icon" /> Update Profile
        </button>
      </div>

      <div className="settings-form-area">
        {activeForm === "changePassword" && (
          <div className="form-box active-form">
            <h2>Change Password</h2>
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <label>New Password</label>
            <input type="password" placeholder="Enter new password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button className="primary" onClick={handleChangePassword}>Submit</button>
          </div>
        )}

        {activeForm === "deleteAccount" && (
          <div className="form-box active-form">
            <h2>Delete Account</h2>
            <p>This action is irreversible. Please confirm to proceed.</p>
            <button className="danger" onClick={handleDeleteAccount}>Confirm Delete</button>
          </div>
        )}

        {activeForm === "emailPrincipal" && (
          <div className="form-box active-form">
            <h2>Email to Principal</h2>
            <label>Subject</label>
            <input type="text" placeholder="Subject line"
              value={subject} onChange={(e) => setSubject(e.target.value)} />
            <label>Message</label>
            <textarea placeholder="Write your message..." rows="5"
              value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="primary" onClick={handleEmailPrincipal}>Send Email</button>
          </div>
        )}

        {activeForm === "submitComplaint" && (
          <div className="form-box active-form">
            <h2>Submit a Complaint</h2>
            <label>Complaint</label>
            <textarea placeholder="Describe your issue..." rows="5"
              value={complaint} onChange={(e) => setComplaint(e.target.value)} />
            <button className="primary" onClick={handleSubmitComplaint}>Submit Complaint</button>
          </div>
        )}

        {activeForm === "updateProfile" && (
          <div className="form-box active-form">
            <h2>Update Profile</h2>
            <label>Name</label>
            <input type="text" placeholder="Your name"
              value={name} onChange={(e) => setName(e.target.value)} />
            <label>Email</label>
            <input type="email" placeholder="Your email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="primary" onClick={handleUpdateProfile}>Update Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}