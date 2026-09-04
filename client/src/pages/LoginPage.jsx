export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Sign in</h1>
        <form>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" placeholder="intern@example.com" />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </section>
    </main>
  );
}
