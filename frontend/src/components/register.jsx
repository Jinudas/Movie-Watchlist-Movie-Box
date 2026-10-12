import { useState } from "react";
import "./register.css";

export default function Register({ onSwitchPage }) {
  const [form, setForm] = useState({
    name: "",
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
      const response = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Object.values(data).flat().join(" ") || "Registration failed."
        );
      }

      setMessage(data.message || "Account created successfully.");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page register-background">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <span className="auth-symbol">▶</span>
          <span>MOVIEBOX</span>
        </div>

        <span className="auth-eyebrow">JOIN MOVIEBOX</span>
        <h1>Create your Account</h1>
        <p className="auth-description">
          Save movies and build your personal watchlist.
        </p>

        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
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