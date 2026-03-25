import React, { useState } from "react";
import "./../styles/CertificatesPage.css";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openRequired, setOpenRequired] = useState(false);
  const [openOptional, setOpenOptional] = useState(false);

  const requiredCertificates = [
    "Leaving Certificate",
    "Migration Certificate",
    "Transfer Certificate",
    "Character Certificate",
    "Birth Certificate",
    "Caste Certificate",
    "Domicile Certificate",
    "Medical Certificate",
    "Previous Year’s Marksheets"
  ];

  const optionalCertificates = [
    "Sports Certificate",
    "Extracurricular Achievement Certificate",
    "NCC/NSS Certificate",
    "Volunteer/Community Service Certificate",
    "Other Certificates (if available)"
  ];

  const handleUpload = (e, certName) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setCertificates([
          ...certificates.filter(c => c.title !== certName), // replace if re-uploaded
          {
            title: certName,
            fileName: file.name,
            date: new Date().toLocaleDateString(),
            issuer: "Uploaded by Student",
            previewUrl: fileUrl,
            type: file.type
          }
        ]);
        setUploadProgress(0);
      }
    }, 300);
  };

  const handleDelete = (certName) => {
    setCertificates(certificates.filter(c => c.title !== certName));
  };

  const renderCertificateCard = (certName) => {
    const uploaded = certificates.find(c => c.title === certName);
    return (
      <div key={certName} className="cert-card">
        <h3>{certName}</h3>
        {uploaded ? (
          <>
            <p className="uploaded">✅ Uploaded</p>
            <p><strong>File:</strong> {uploaded.fileName}</p>
            <p><strong>Date:</strong> {uploaded.date}</p>
            <p><strong>Issuer:</strong> {uploaded.issuer}</p>
            {uploaded.type.includes("image") ? (
              <img src={uploaded.previewUrl} alt={uploaded.title} className="preview-img" />
            ) : uploaded.type.includes("pdf") ? (
              <iframe src={uploaded.previewUrl} title={uploaded.title} className="preview-pdf"></iframe>
            ) : (
              <p className="file-note">File uploaded (no preview available).</p>
            )}
            <div className="card-actions">
              <button className="delete-btn" onClick={() => handleDelete(certName)}>Delete</button>
              <label className="upload-btn">
                Re‑Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={(e) => handleUpload(e, certName)}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <p className="not-uploaded">❌ Not Uploaded</p>
            <div className="card-actions">
              <label className="upload-btn">
                Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={(e) => handleUpload(e, certName)}
                />
              </label>
              <button className="delete-btn" onClick={() => handleDelete(certName)}>Delete</button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="certificates-container">
      <h1>Certificates</h1>

      {/* Required Certificates Toggle */}
      <div className="toggle-panel">
        <button className="toggle-btn" onClick={() => setOpenRequired(!openRequired)}>
          {openRequired ? "Hide Required Certificates ▲" : "Show Required Certificates ▼"}
        </button>

        {openRequired && (
          <div className="required-list">
            <ul>
              {requiredCertificates.map((cert, idx) => (
                <li key={idx}>
                  <span>{cert}</span>
                  <label className="upload-btn">
                    Upload
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={(e) => handleUpload(e, cert)}
                    />
                  </label>
                </li>
              ))}
            </ul>

            {uploadProgress > 0 && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Certificates Toggle */}
      <div className="toggle-panel">
        <button className="toggle-btn" onClick={() => setOpenOptional(!openOptional)}>
          {openOptional ? "Hide Optional Certificates ▲" : "Show Optional Certificates ▼"}
        </button>

        {openOptional && (
          <div className="required-list">
            <ul>
              {optionalCertificates.map((cert, idx) => (
                <li key={idx}>
                  <span>{cert}</span>
                  <label className="upload-btn">
                    Upload
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={(e) => handleUpload(e, cert)}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Uploaded Certificates Grid */}
      <div className="cert-grid">
        {requiredCertificates.map(renderCertificateCard)}
        {optionalCertificates.map(renderCertificateCard)}
      </div>
    </div>
  );
}