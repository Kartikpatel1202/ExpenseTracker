export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Sign in</h1>
        <form>
          <label>
            Email
            <input type="email" placeholder="intern@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" />
          </label>
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}

