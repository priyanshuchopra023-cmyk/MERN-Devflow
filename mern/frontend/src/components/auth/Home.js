import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  // Already logged in → go straight to app
  if (user) {
    navigate("/app/dashboard");
    return null;
  }

  return (
    <div className="main">
      <div className="center-card fade">
        <div style={{ fontSize: 38, marginBottom: 8 }}>⚡</div>
        <h1 className="logo">DevFlow</h1>
        <p style={{ fontSize: 12, opacity: 0.65, marginBottom: 4 }}>A-J Solutions</p>
        <p>Inspiring Tech Solutions for a Brighter Future</p>
        <button className="primary-btn" style={{ marginTop: 28 }} onClick={() => navigate("/auth")}>
          Get Started
        </button>
      </div>
    </div>
  );
}
