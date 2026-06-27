import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaFacebook,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { authAPI, saveSession } from "../api";
import { getRoleFromToken } from "../api";

export default function Login({ handleClose }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(form);

      console.log("LOGIN RESPONSE:", data);

      saveSession(data);

      const role = getRoleFromToken(data.accessToken)?.toLowerCase();

      console.log("ROLE:", role);

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "recruiter") {
        navigate("/hr-dashboard");
      } else {
        navigate("/candidate");
      }
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const googleToken = await openGooglePopup();

      const data = await authAPI.googleLogin({
        token: googleToken,
      });

      saveSession(data);

      const role = data.role?.toLowerCase();

      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "recruiter") navigate("/hr-dashboard");
      navigate("/candidate");
    } catch (err) {
      setError(err.message || "Google login failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="form-box login">
      <form onSubmit={handleSubmit}>
        <button className="close-btn" type="button" onClick={handleClose}>
          &times;
        </button>

        <span className="auth-kicker">Secure access</span>

        <h1>Login</h1>

        <p className="auth-subtitle">Welcome back to HireMinds</p>

        {error && (
          <p
            style={{
              color: "red",
              fontSize: "0.85rem",
              marginBottom: "8px",
            }}
          >
            {error}
          </p>
        )}

        <div className="input-box">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <i>
            <FaUser />
          </i>
        </div>

        <div className="input-box">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <i
            style={{ cursor: "pointer" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </i>
        </div>

        <div
          style={{
            textAlign: "right",
            marginBottom: "0.75rem",
          }}
        >
          <Link
            to="/forget-password"
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
              textDecoration: "underline",
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-divider">or login with social platforms</p>

        <div className="social-icons">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <FaGoogle style={{ opacity: googleLoading ? 0.4 : 1 }} />
          </button>

          <a href="##">
            <FaFacebook />
          </a>

          <a href="##">
            <FaGithub />
          </a>

          <a href="##">
            <FaLinkedin />
          </a>
        </div>
      </form>
    </div>
  );
}
