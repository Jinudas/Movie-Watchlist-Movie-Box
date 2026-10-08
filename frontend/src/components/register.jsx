import { useState } from "react";
import "./Register.css";

export default function Register({ onSwitchPage }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("The registration form is ready. Account creation comes next.");
  }

  return (
    <main className="auth-page register-background">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <span className="auth-symbol">▶</span>
          <span>MOVIEBOX</span>
        </div>

        <span className="auth-eyebrow">JOIN MOVIEBOX</span>
        <h1>Create your account</h1>
        <p className="auth-description">
          Save movies and build your personal watchlist.
        </p>

        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          placeholder="Enter your Email"
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />

        <button className="auth-submit" type="submit">
          Create account
        </button>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Already registered?{" "}
          <button type="button" onClick={() => onSwitchPage("Login")}>
            Log in
          </button>
        </p>
      </form>
    </main>
  );
}