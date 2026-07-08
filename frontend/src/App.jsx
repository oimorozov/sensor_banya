import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

export default function App() {
  const [auth, setAuth] = useState("loading");
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setUsername(d.username);
        setAuth("in");
      })
      .catch(() => setAuth("out"));
  }, []);

  const onLogin = (name) => {
    setUsername(name);
    setAuth("in");
  };

  const onLogout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    setUsername("");
    setAuth("out");
  };

  if (auth === "loading") return <div className="boot" />;
  if (auth === "out") return <Login onLogin={onLogin} />;
  return <Dashboard username={username} onLogout={onLogout} />;
}
