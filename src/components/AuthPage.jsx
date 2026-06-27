import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage({ mode = "login" }) {
  const [active, setActive] = useState(mode === "register");

  useEffect(() => {
    setActive(mode === "register");
  }, [mode]);

  return (
    <div className="overlay fullpage">
      <div className={`container ${active ? "active" : ""}`}>
        <button className="auth-global-close" type="button" onClick={() => window.history.back()}>
          &times;
        </button>

        <Login handleClose={() => window.history.back()} />
        <Register />

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <span className="toggle-kicker">New here?</span>
            <h1>Hello, Welcome!</h1>
            <p>Create your account and start your smart hiring journey.</p>
            <button className="btn toggle-btn" type="button" onClick={() => setActive(true)}>
              Register
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <span className="toggle-kicker">Already joined?</span>
            <h1>Welcome Back!</h1>
            <p>Sign in to continue where you left off.</p>
            <button className="btn toggle-btn" type="button" onClick={() => setActive(false)}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
