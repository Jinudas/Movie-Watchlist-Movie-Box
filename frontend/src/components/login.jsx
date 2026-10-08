import { useState } from "react";
import "./Login.css";

export default function Login({ onSwitchPage }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("The login form is ready. Account login comes next.");
  }

  return (
    <main className="auth-page login-background">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <span className="auth-symbol">▶</span>
          <span>MOVIEBOX</span>
        </div>

        <span className="auth-eyebrow">WELCOME BACK</span>
        <h1>MOVIE BOX</h1>
       <p className="auth-description">
          FUN  TIME
        </p>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="Enter your Email"
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        <button className="auth-submit" type="submit">
          Log in
        </button>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Don’t have an account?{" "}
          <button type="button" onClick={() => onSwitchPage("Register")}>
            Register
          </button>
        </p>
      </form>
    </main>
  );
}