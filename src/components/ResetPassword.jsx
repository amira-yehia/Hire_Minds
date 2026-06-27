import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { authAPI } from "../api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const userId = searchParams.get("userId") || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await authAPI.resetPassword({
        userId,
        token,
        newPassword: form.newPassword,
      });
      setStatus("success");
      setMessage("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Invalid or expired reset link.");
    }
  };

  if (!token || !userId) {
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
          <p style={{ color: "red" }}>
            Invalid reset link. Please request a new one.
          </p>

          <Link
            to="/forget-password"
            className="btn"
            style={{
              marginTop: "1rem",
              display: "inline-block",
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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

        <span className="auth-kicker">RESET PASSWORD</span>

        <h1>Create New Password</h1>

        <p className="auth-subtitle">
          Choose a strong password for your account.
        </p>

        {status === "success" ? (
          <div className="auth-success-box">
            <i
              className="bx bx-check-circle"
              style={{
                fontSize: "2rem",
                color: "#22c55e",
              }}
            ></i>

            <p>{message}</p>

            <p
              style={{
                fontSize: "0.8rem",
                opacity: 0.6,
              }}
            >
              Redirecting to login...
            </p>
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
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <i>
                <FaLock />
              </i>
            </div>

            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <i>
                <FaLock />
              </i>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
