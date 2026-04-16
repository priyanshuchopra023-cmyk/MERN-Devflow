import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword, forgotPassword } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function PasswordPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const showToast = useToast();

  const [active, setActive] = useState("change");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // ── Change Password ──────────────────────────
  const [cpData, setCpData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const handleCpChange = (e) => setCpData({ ...cpData, [e.target.name]: e.target.value });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!user) { setError("You must be logged in to change your password"); return; }
    if (cpData.newPassword !== cpData.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await changePassword({ oldPassword: cpData.oldPassword, newPassword: cpData.newPassword });
      setSuccess("Password changed successfully ✅");
      showToast("Password changed ✅");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ──────────────────────────
  const [fpEmail, setFpEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!fpEmail) { setError("Enter your email"); return; }
    setLoading(true);
    try {
      const res = await forgotPassword({ email: fpEmail });
      setSuccess(res.data.message);
      showToast("Reset link sent ✅");
    } catch (err) {
      setError(err.response?.data?.error || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => { setActive(active === "change" ? "forgot" : "change"); setError(""); setSuccess(""); };

  return (
    <div className="main">
      <div className="column slide">
        <button className="back-btn" onClick={() => navigate("/auth")}>⬅ Back</button>

        <div className="form-container">
          {/* ── CHANGE PASSWORD CARD ── */}
          <div className={`card premium ${active !== "change" ? "disabled" : ""}`}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <input name="oldPassword"     type="password" placeholder="Old Password"      onChange={handleCpChange} disabled={active !== "change"} />
              <input name="newPassword"     type="password" placeholder="New Password"      onChange={handleCpChange} disabled={active !== "change"} />
              <input name="confirmPassword" type="password" placeholder="Confirm Password"  onChange={handleCpChange} disabled={active !== "change"} />
              {active === "change" && error   && <div className="error-msg">{error}</div>}
              {active === "change" && success && <div className="success-msg">{success}</div>}
              <button className="primary-btn" disabled={loading || active !== "change"}>
                {loading && active === "change" ? "Changing..." : "Change"}
              </button>
            </form>
          </div>

          {/* ── FORGOT PASSWORD CARD ── */}
          <div className={`card premium ${active !== "forgot" ? "disabled" : ""}`}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email" placeholder="Enter your Email"
                value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
                disabled={active !== "forgot"}
              />
              {active === "forgot" && error   && <div className="error-msg">{error}</div>}
              {active === "forgot" && success && <div className="success-msg">{success}</div>}
              <button className="primary-btn" disabled={loading || active !== "forgot"}>
                {loading && active === "forgot" ? "Sending..." : "Send Link"}
              </button>
            </form>
          </div>
        </div>

        {/* ── TOGGLE ── */}
        <div className="toggle-wrapper" onClick={toggle}>
          <div className={`toggle-pill ${active === "forgot" ? "right" : ""}`} />
          <div className="toggle-labels">
            <div className="toggle-label">Change</div>
            <div className="toggle-label">Forgot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
