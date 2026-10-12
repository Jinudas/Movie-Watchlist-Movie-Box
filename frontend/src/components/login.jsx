import { useState } from "react";
import "./Login.css";

export default function Login({ onSwitchPage, onLoginSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const csrfResponse = await fetch("/api/csrf/", {
        credentials: "same-origin",
      });
      const csrfData = await csrfResponse.json();

      if (!csrfResponse.ok) {
        throw new Error("Could not get the security token.");
      }

      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfData.csrfToken,
        },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            Object.values(data).flat().join(" ") ||
            "Login failed."
        );
      }

      onLoginSuccess?.(data.user, data.csrfToken);
      setMessage(data.message || "You are logged in.");
      setForm({ email: "", password: "" });
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="auth-description">FUN TIME</p>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
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