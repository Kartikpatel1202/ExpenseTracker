import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (apiError) setApiError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setApiError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setApiError("Invalid email or password.");
      } else {
        setApiError("Something went wrong. Please try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="etl-page">
      <section className="etl-brand">
        <div className="etl-brand-top">
          <p className="etl-logo">Expense Tracker</p>
          <p className="etl-tagline">
            A smarter way to track expenses, understand spending, and take control of your finances.
          </p>

          <ul className="etl-features">
            <li className="etl-feature">Track income and expenses</li>
            <li className="etl-feature">Understand spending patterns</li>
            <li className="etl-feature">Manage finances securely</li>
          </ul>

          <div className="etl-chart-wrap">
            <svg
              className="etl-chart"
              viewBox="0 0 220 120"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="110"
                x2="220"
                y2="110"
                stroke="rgba(245,247,244,0.15)"
                strokeWidth="1"
              />
              <rect x="10" y="70" width="18" height="40" fill="rgba(245,247,244,0.12)" />
              <rect x="42" y="50" width="18" height="60" fill="rgba(245,247,244,0.16)" />
              <rect x="74" y="85" width="18" height="25" fill="rgba(245,247,244,0.12)" />
              <rect x="106" y="30" width="18" height="80" fill="rgba(245,247,244,0.2)" />
              <rect x="138" y="60" width="18" height="50" fill="rgba(245,247,244,0.14)" />
              <rect x="170" y="15" width="18" height="95" fill="#C99A3A" />
            </svg>
          </div>
        </div>

        <p className="etl-brand-foot">&copy; {new Date().getFullYear()} Expense Tracker</p>
      </section>

      <section className="etl-form-panel">
        <div className="etl-form-card">
          <h1 className="etl-heading">Welcome back</h1>
          <p className="etl-subtitle">Sign in to continue tracking your expenses.</p>

          <form className="etl-form" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <span className="etl-error-text" role="alert">
                {apiError}
              </span>
            )}

            <div className="etl-field">
              <label className="etl-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="etl-input"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
              />
              {errors.email && (
                <span id="login-email-error" className="etl-error-text" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="etl-field">
              <label className="etl-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="etl-input"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
              />
              {errors.password && (
                <span id="login-password-error" className="etl-error-text" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="etl-row">
              <Link className="etl-link" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="etl-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="etl-foot">
            Don&apos;t have an account?{" "}
            <a className="etl-link" href="/signup">
              Sign up
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}