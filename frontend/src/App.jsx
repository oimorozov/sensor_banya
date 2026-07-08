import { useEffect, useState } from "react";
import "./App.css";

const METRICS = [
  { key: "temp", label: "Температура в парной", unit: "°C", icon: "🔥" },
  { key: "humid", label: "Влажность", unit: "%", icon: "💧" },
  { key: "temp_out", label: "Температура на улице", unit: "°C", icon: "🌡️" },
  { key: "pressure", label: "Давление", unit: "мм рт. ст.", icon: "🧭" },
  { key: "uptime", label: "Время работы", unit: "", icon: "⏱️", format: formatUptime },
];

function formatUptime(sec) {
  sec = Math.floor(Number(sec));
  if (!Number.isFinite(sec)) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}д`);
  if (h) parts.push(`${h}ч`);
  parts.push(`${m}м`);
  return parts.join(" ");
}

function formatValue(metric, value) {
  if (value === undefined || value === null) return "—";
  if (metric.format) return metric.format(value);
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(1) : String(value);
}

export default function App() {
  const [data, setData] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/current")
      .then((r) => r.json())
      .then((snapshot) => setData((prev) => ({ ...prev, ...snapshot })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ws;
    let retry;
    let closed = false;

    const connect = () => {
      const proto = location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(`${proto}://${location.host}/api/ws`);

      ws.onopen = () => setConnected(true);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          setData((prev) => ({ ...prev, ...msg }));
        } catch {
          return;
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      ws && ws.close();
    };
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div className="header__brand">
          <span className="header__icon">🧖</span>
          <h1 className="header__title">sensor_banya</h1>
          <span className="header__icon">🌿</span>
        </div>
        <div className={`status ${connected ? "status--on" : "status--off"}`}>
          <span className="status__dot" />
          {connected ? "в эфире" : "нет связи"}
        </div>
      </header>

      <main className="content">
        <section className="cards">
          {METRICS.map((m) => (
            <article className="card" key={m.key}>
              <div className="card__icon">{m.icon}</div>
              <div className="card__label">{m.label}</div>
              <div className="card__value">
                {formatValue(m, data[m.key])}
                {m.unit && <span className="card__unit">{m.unit}</span>}
              </div>
            </article>
          ))}
        </section>

        <section className="charts">
          <div className="charts__placeholder">
            <span className="charts__icon">📈</span>
            <span>Здесь появятся графики</span>
          </div>
        </section>
      </main>

      <footer className="footer">🪵 банный мониторинг · sensor_banya</footer>
    </div>
  );
}
