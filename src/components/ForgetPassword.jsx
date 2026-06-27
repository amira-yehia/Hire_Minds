import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { authAPI } from "../api";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await authAPI.forgetPassword(email);
      setStatus("success");
      setMessage("A password reset link has been sent to your email address.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="overlay fullpage"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="auth-mini-card">
        <button
          className="auth-global-close"
          type="button"
          onClick={() => window.history.back()}
        >
          &times;
        </button>

        <span className="auth-kicker">Account Recovery</span>
        <h1>Forgot Your Password?</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {status === "success" ? (
          <div className="auth-success-box">
            <i
              className="bx bx-check-circle"
              style={{ fontSize: "2rem", color: "#22c55e" }}
            ></i>
            <p>{message}</p>

            <Link
              to="/login"
              className="btn"
              style={{ marginTop: "1rem", display: "inline-block" }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === "error" && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                {message}
              </p>
            )}

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <i>
                <FaEnvelope />
              </i>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link to="/login" style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
