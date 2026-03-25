import React, { useState, useEffect } from "react";
import "./../styles/fee.css";

import gpayLogo from "../assets/gpay.png";
import visaLogo from "../assets/visacard.png";
import mastercardLogo from "../assets/mastercard.png";
import netbankingLogo from "../assets/netbanking.png";
import QRLogo from "../assets/qr.png";

// Import reusable Razorpay component
import PayWithRazorpay from "./paywithrazorpy";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function FeesPage() {
  const [student, setStudent] = useState(null);
  const [feesData, setFeesData] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/fees/details`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { 
        console.log("✅ Fees details:", data);
        setStudent(data.student); 
        setFeesData(data.fees); 
      })
      .catch(() => {
        // fallback demo data
        setStudent({ id: "demo123", name: "Apurva Patil", standard: 10 });
        setFeesData({ total: 15000, paid: 0, remaining: 15000 });
      });
  }, []);

  const handlePayNow = () => setShowPayment(true);

  // UPI QR flow
  const payWithUPI = () => {
    if (!payAmount || Number(payAmount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }
    window.open(
      `${API_BASE}/payments/upi-qr/${student.id}?amount=${payAmount}`,
      "_blank"
    );
  };

  // Bank transfer flow
  const payWithBank = () => {
    alert("Please transfer to the account shown below. Use your Student ID in remarks.");
  };

  if (!student || !feesData) return <p>Loading fees details...</p>;

  return (
    <div className="fees-container">
      <h1>Fees Section</h1>
      <p><strong>Student:</strong> {student.name}</p>
      <p><strong>Class:</strong> {student.standard}th Standard</p>
      <p><strong>Total Fee:</strong> ₹{feesData.total}</p>
      <p><strong>Paid:</strong> ₹{feesData.paid}</p>
      <p><strong>Remaining:</strong> ₹{feesData.remaining}</p>

      {!showPayment ? (
        <button className="pay-now-btn" onClick={handlePayNow}>Pay Now</button>
      ) : (
        <div className="payment-box">
          <h2>Payment Options</h2>

          {/* Amount input */}
          <div className="gateway">
            <input
              type="number"
              placeholder="Enter amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />

            {/* ✅ Single Razorpay hosted page via reusable component */}
            <PayWithRazorpay
              amount={Number(payAmount)}
              studentId={student?.id}
              studentName={student?.name}
              token={localStorage.getItem("token")}
            />

            {/* Logos row (just visuals, not Razorpay components) */}
            <div className="payment-logos">
              <div className="logo-box" onClick={payWithUPI}>
                <img src={gpayLogo} alt="Google Pay Logo" />
              </div>
              <div className="logo-box">
                <img src={visaLogo} alt="Visa Logo" />
              </div>
              <div className="logo-box">
                <img src={mastercardLogo} alt="Mastercard Logo" />
              </div>
              <div className="logo-box">
                <img src={netbankingLogo} alt="Netbanking Logo" />
              </div>
            </div>
          </div>

          {/* UPI QR */}
          <div className="qr-section">
            <h3>Or Scan UPI QR</h3>
            <div className="logo-box" onClick={payWithUPI}>
              <img src={QRLogo} alt="QRLogo" />
            </div>
            {payAmount ? (
              <img
                src={`${API_BASE}/payments/upi-qr/${student.id}?amount=${payAmount}`}
                alt="Dynamic UPI QR Payment"
              />
            ) : (
              <p>Enter amount to generate QR.</p>
            )}
            <p>Scan with GPay/PhonePe/Paytm</p>
          </div>

          {/* Account details */}
          <div className="account-section">
            <h3>Bank Transfer (NEFT/IMPS/RTGS)</h3>
            <AccountDetails />
            <button className="confirm-btn" onClick={payWithBank}>
              I Have Transferred
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountDetails() {
  const [details, setDetails] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/fees/details`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setDetails)
      .catch(() => setDetails(null));
  }, []);
  if (!details) return <p>Loading account details…</p>;
  return (
    <div className="account-box">
      <p><strong>Student:</strong> {details.student.name}</p>
      <p><strong>Class:</strong> {details.student.standard}th Standard</p>
      <p><strong>Total Fee:</strong> ₹{details.fees.total}</p>
      <p><strong>Paid:</strong> ₹{details.fees.paid}</p>
      <p><strong>Remaining:</strong> ₹{details.fees.remaining}</p>
      <p><em>Use your Student ID in remarks when transferring via bank.</em></p>
    </div>
  );
}