import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-brand-content">
          <h1>Expense Tracker</h1>

          <p className="auth-brand-description">
            A smarter way to track expenses, understand spending,
            and take control of your finances.
          </p>

          <ul className="auth-features">
            <li>Track income and expenses</li>
            <li>Understand spending patterns</li>
            <li>Manage finances securely</li>
          </ul>

          <div className="auth-chart" aria-hidden="true">
            <span className="bar bar-1"></span>
            <span className="bar bar-2"></span>
            <span className="bar bar-3"></span>
            <span className="bar bar-4"></span>
            <span className="bar bar-5"></span>
            <span className="bar bar-6"></span>
            <span className="bar bar-7"></span>
          </div>
        </div>

        <p className="auth-footer">© 2026 Expense Tracker</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <h2> Create your account</h2>

          <p className="auth-subtitle">
            Start tracking your finances with Expense Tracker.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="signup-name">Full Name</label>

              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email</label>

              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-password">Password</label>

              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}