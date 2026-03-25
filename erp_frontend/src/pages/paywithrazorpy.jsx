import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PayWithRazorpay({ amount, studentId, studentName, token }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      if (!amount || isNaN(amount) || amount <= 0) {
        alert("Enter a valid amount.");
        return;
      }
      if (!studentId || !studentName) {
        alert("Student details missing.");
        return;
      }

      setLoading(true);

      const { data } = await axios.post(
        `${API_BASE}/payments/create-payment-link`,
        {
          amount: Math.floor(amount),
          student_id: studentId,
          student_name: studentName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data && data.link) {
        window.location.href = data.link;
      } else {
        alert("❌ Backend did not return a payment link");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="confirm-btn" onClick={handleClick} disabled={loading}>
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
}