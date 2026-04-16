import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AuthPage() {
  const navigate   = useNavigate();
  const { loginUser } = useAuth();
  const showToast  = useToast();

  const [active, setActive] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Login state ──────────────────────────────
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await login(loginData);
      loginUser(res.data.token, res.data.user);
      showToast(`Welcome back, ${res.data.user.name}! ✅`);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Signup state ─────────────────────────────
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    gender: "", country: "", terms: false,
  });

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData({ ...signupData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!signupData.gender || !signupData.terms) {
      setError("Please fill all fields and accept terms");
      return;
    }
    setLoading(true);
    try {
      const res = await signup(signupData);
      loginUser(res.data.token, res.data.user);
      showToast("Account created! Welcome to DevFlow ✅");
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => { setActive(active === "login" ? "signup" : "login"); setError(""); };

  return (
    <div className="main">
      <div className="column slide">
        <button className="back-btn" onClick={() => navigate("/")}>⬅ Back</button>

        <div className="form-container">
          {/* ── LOGIN CARD ── */}
          <div className={`card premium ${active !== "login" ? "disabled" : ""}`}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input name="email"    type="email"    placeholder="Email"    onChange={handleLoginChange} disabled={active !== "login"} />
              <input name="password" type="password" placeholder="Password" onChange={handleLoginChange} disabled={active !== "login"} />
              <label className="checkbox">
                <input type="checkbox" /> Remember Me
              </label>
              {active === "login" && error && <div className="error-msg">{error}</div>}
              <button className="primary-btn" disabled={loading || active !== "login"}>
                {loading && active === "login" ? "Logging in..." : "Login"}
              </button>
              <button type="button" className="ghost-btn" onClick={() => navigate("/password")}>
                Forgot / Change Password
              </button>
            </form>
          </div>

          {/* ── SIGNUP CARD ── */}
          <div className={`card premium ${active !== "signup" ? "disabled" : ""}`}>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
              <input name="name"            placeholder="Full Name"        onChange={handleSignupChange} disabled={active !== "signup"} />
              <input name="email"           placeholder="Email"            onChange={handleSignupChange} disabled={active !== "signup"} />
              <input name="password"        type="password" placeholder="Password"         onChange={handleSignupChange} disabled={active !== "signup"} />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleSignupChange} disabled={active !== "signup"} />
              <div className="radio-group">
                <p>Gender:</p>
                <label className="radio-item"><input type="radio" name="gender" value="Male"   onChange={handleSignupChange} disabled={active !== "signup"} /> Male</label>
                <label className="radio-item"><input type="radio" name="gender" value="Female" onChange={handleSignupChange} disabled={active !== "signup"} /> Female</label>
              </div>
              <select name="country" onChange={handleSignupChange} disabled={active !== "signup"}>
                <option value="">Select Country</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
              <label className="checkbox">
                <input type="checkbox" name="terms" onChange={handleSignupChange} disabled={active !== "signup"} />
                Accept Terms &amp; Conditions
              </label>
              {active === "signup" && error && <div className="error-msg">{error}</div>}
              <button className="primary-btn" disabled={loading || active !== "signup"}>
                {loading && active === "signup" ? "Creating account..." : "Signup"}
              </button>
            </form>
          </div>
        </div>

        {/* ── TOGGLE ── */}
        <div className="toggle-wrapper" onClick={toggle}>
          <div className={`toggle-pill ${active === "signup" ? "right" : ""}`} />
          <div className="toggle-labels">
            <div className="toggle-label">Login</div>
            <div className="toggle-label">Signup</div>
          </div>
        </div>
      </div>
    </div>
  );
}
