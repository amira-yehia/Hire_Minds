import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing or invalid.");
      return;
    }
    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your account has been verified! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "The link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div
      className="overlay fullpage"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="auth-mini-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div className="auth-spinner" />
            <p style={{ marginTop: "1rem" }}>جاري تفعيل حسابك…</p>
          </>
        )}

        {status === "success" && (
          <>
            <i
              className="bx bx-check-circle"
              style={{ fontSize: "3rem", color: "#22c55e" }}
            ></i>
            <h2 style={{ marginTop: "0.5rem" }}>تم التفعيل!</h2>
            <p>{message}</p>
            <Link
              to="/login"
              className="btn"
              style={{ marginTop: "1rem", display: "inline-block" }}
            >
              تسجيل الدخول
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <i
              className="bx bx-x-circle"
              style={{ fontSize: "3rem", color: "#ef4444" }}
            ></i>
            <h2 style={{ marginTop: "0.5rem" }}>فشل التفعيل</h2>
            <p>{message}</p>
            <ResendVerification />
          </>
        )}
      </div>
    </div>
  );
}

function ResendVerification() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await authAPI.resendVerification({ email });
      setSent(true);
    } catch (error) {
      setErr(error.message || "حدث خطأ.");
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <p style={{ color: "#22c55e", marginTop: "1rem" }}>
        ✓ تم إعادة إرسال رابط التفعيل!
      </p>
    );

  return (
    <form onSubmit={handleResend} style={{ marginTop: "1rem" }}>
      <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.5rem" }}>
        إعادة إرسال رابط التفعيل:
      </p>
      {err && <p style={{ color: "red", fontSize: "0.8rem" }}>{err}</p>}
      <div className="input-box">
        <input
          type="email"
          placeholder="أدخل إيميلك"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "جاري الإرسال…" : "إعادة إرسال"}
      </button>
    </form>
  );
}
