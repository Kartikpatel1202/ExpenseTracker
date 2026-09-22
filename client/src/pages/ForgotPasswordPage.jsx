import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    // Backend reset-password API will be connected later.
    setMessage(
      "If an account exists with this email, a password reset link will be sent."
    );
  };

  return (
    <main className="etl-page">
      {/* LEFT SIDE */}
      <section className="etl-brand">
        <div className="etl-brand-top">
          <p className="etl-logo">Expense Tracker</p>

          <p className="etl-tagline">
            A smarter way to track expenses, understand spending,
            and take control of your finances.
          </p>

          <ul className="etl-features">
            <li className="etl-feature">
              Track income and expenses
            </li>

            <li className="etl-feature">
              Understand spending patterns
            </li>

            <li className="etl-feature">
              Manage finances securely
            </li>
          </ul>
        </div>

        <p className="etl-brand-foot">
          &copy; {new Date().getFullYear()} Expense Tracker
        </p>
      </section>

      {/* RIGHT SIDE */}
      <section className="etl-form-panel">
        <div className="etl-form-card">
          <h1 className="etl-heading">
            Forgot your password?
          </h1>

          <p className="etl-subtitle">
            Enter your email address and we'll help you reset
            your password.
          </p>

          <form
            className="etl-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && (
              <span className="etl-error-text" role="alert">
                {error}
              </span>
            )}

            {message && (
              <span
                role="status"
                style={{
                  color: "#1F6D4C",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                }}
              >
                {message}
              </span>
            )}

            <div className="etl-field">
              <label
                className="etl-label"
                htmlFor="forgot-email"
              >
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                className="etl-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setMessage("");
                }}
              />
            </div>

            <button
              type="submit"
              className="etl-submit"
            >
              Send Reset Link
            </button>
          </form>

          <p className="etl-foot">
            <Link
              className="etl-link"
              to="/login"
            >
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}