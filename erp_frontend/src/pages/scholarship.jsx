import React, { useState, useEffect } from "react";
import "../styles/scholarship.css";

export default function ScholarshipPage() {
  const [scholarships, setScholarships] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const dummyScholarships = [
      {
        id: 1,
        name: "Merit Scholarship",
        description: "Awarded to students scoring above 85% in final exams.",
        eligibility: "Class 9–12 students with >85% marks.",
        applyProcess: "Submit online form with marksheet and ID proof.",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        syllabus: "General aptitude + subject knowledge test."
      },
      {
        id: 2,
        name: "Sports Scholarship",
        description: "For students excelling in district/state level sports.",
        eligibility: "Class 6–12 students with sports certificates.",
        applyProcess: "Upload sports achievement certificates.",
        startDate: "2026-03-01",
        endDate: "2026-03-20",
        syllabus: "No exam, selection based on sports performance."
      }
    ];
    setScholarships(dummyScholarships);
  }, []);

  const handleApply = (scholarship) => {
    setSelectedScholarship(scholarship);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmitForm = () => {
    // For now, just log the form data
    console.log("Form submitted:", formData);
    setSelectedScholarship(null);
    setFormData({});
  };

  return (
    <div className="scholarship-fullscreen">
      <h1>Scholarship Opportunities</h1>

      {/* Scholarship Cards */}
      {!selectedScholarship && (
        <>
          {scholarships.map((item) => (
            <div className="scholarship-card" key={item.id}>
              <h2>{item.name}</h2>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Eligibility:</strong> {item.eligibility}</p>
              <p><strong>How to Apply:</strong> {item.applyProcess}</p>
              <p><strong>Application Dates:</strong> {item.startDate} – {item.endDate}</p>
              <p><strong>Syllabus/Exam Info:</strong> {item.syllabus}</p>
              <button className="apply-btn" onClick={() => handleApply(item)}>Apply Now</button>
            </div>
          ))}

          {/* Government Scholarships */}
          <div className="gov-scholarships">
            <h2>Government Scholarships</h2>
            <div className="gov-scholarship-card">
              <h3>National Means-cum-Merit Scholarship (NMMS)</h3>
              <p>For Class 9–12 students from economically weaker sections. Selection via national-level exam.</p>
              <p><a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer">Apply Here</a></p>
            </div>
            <div className="gov-scholarship-card">
              <h3>Post-Matric Scholarship for SC/ST Students</h3>
              <p>Financial aid for SC/ST students pursuing post-matric education. Covers tuition, books, and hostel fees.</p>
              <p><a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer">Apply Here</a></p>
            </div>
          </div>
        </>
      )}

      {/* Application Form */}
      {selectedScholarship && (
        <div className="application-form">
          <h2>Scholarship Application Form – {selectedScholarship.name}</h2>

          <div className="form-row">
            <label>Student Name</label>
            <div className="form-group">
              <input type="text" name="firstName" placeholder="First Name" onChange={handleFormChange} />
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleFormChange} />
            </div>
          </div>

          <div className="form-row">
            <label>Date of Birth</label>
            <input type="date" name="dob" onChange={handleFormChange} />
          </div>

          <div className="form-row">
            <label>Gender</label>
            <div className="form-group">
              <label><input type="radio" name="gender" value="Male" onChange={handleFormChange} /> Male</label>
              <label><input type="radio" name="gender" value="Female" onChange={handleFormChange} /> Female</label>
            </div>
          </div>

          <div className="form-row">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="Enter email" onChange={handleFormChange} />
          </div>

          <div className="form-row">
            <label>Mailing Address</label>
            <input type="text" name="address1" placeholder="Street Address" onChange={handleFormChange} />
            <input type="text" name="address2" placeholder="Street Address Line 2" onChange={handleFormChange} />
            <div className="form-group">
              <input type="text" name="city" placeholder="City" onChange={handleFormChange} />
              <input type="text" name="region" placeholder="Region" onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <input type="text" name="zip" placeholder="Postal / Zip Code" onChange={handleFormChange} />
              <select name="country" onChange={handleFormChange}>
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="Romania">Romania</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Current Study Status</label>
            <select name="status" onChange={handleFormChange}>
              <option value="">Select Status</option>
              <option value="Studying">Currently Studying</option>
              <option value="Graduated">Graduated</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <label>Upload Required Documents</label>
            <input type="file" name="documents" onChange={handleFormChange} />
          </div>

          <button className="submit-btn" onClick={handleSubmitForm}>Submit Application</button>
        </div>
      )}
    </div>
  );
}
