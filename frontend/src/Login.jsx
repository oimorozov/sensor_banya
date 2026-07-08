import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      onLogin(d.username);
    } catch {
      setError("Неверный логин или пароль");
      setBusy(false);
    }
  };

  return (
    <div className="authwrap">
      <div className="decor" aria-hidden="true">
        <div className="stove" />
      </div>
      <form className="auth" onSubmit={submit}>
        <div className="brand auth__brand">
          sensor<span className="brand__mark">_banya</span>
        </div>
        <label className="auth__field">
          <span>Логин</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className="auth__field">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <div className="auth__error">{error}</div>}
        <button className="auth__btn" type="submit" disabled={busy}>
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
