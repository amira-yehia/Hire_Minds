import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { authAPI } from "../api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus("success");
      setMessage("Password changed successfully!");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Incorrect current password or an error occurred.");
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
          onClick={() => navigate(-1)}
        >
          &times;
        </button>

        <span className="auth-kicker">الأمان</span>
        <h1>تغيير كلمة المرور</h1>
        <p className="auth-subtitle">اختار كلمة مرور قوية لحماية حسابك.</p>

        {status === "success" ? (
          <div className="auth-success-box">
            <i
              className="bx bx-check-circle"
              style={{ fontSize: "2rem", color: "#22c55e" }}
            ></i>
            <p>{message}</p>
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
                name="currentPassword"
                placeholder="كلمة المرور الحالية"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
              <i>
                <FaLock />
              </i>
            </div>

            <div className="input-box">
              <input
                type="password"
                name="newPassword"
                placeholder="كلمة المرور الجديدة"
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
                placeholder="تأكيد كلمة المرور الجديدة"
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
              {status === "loading" ? "جاري الحفظ…" : "تغيير كلمة المرور"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
