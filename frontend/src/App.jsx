import { useEffect, useRef, useState } from "react";
import "./App.css";

const GRID = [
  { key: "humid", label: "Влажность", unit: "%" },
  { key: "temp_out", label: "На улице", unit: "°C" },
  { key: "pressure", label: "Давление", unit: "мм рт. ст." },
  { key: "uptime", label: "Аптайм контроллера", unit: "", format: formatUptime },
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

function formatValue(item, value) {
  if (value === undefined || value === null) return "—";
  if (item.format) return item.format(value);
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num % 1 === 0 ? String(num) : num.toFixed(1);
}

function heatPercent(temp) {
  const num = Number(temp);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, (num / 120) * 100));
}

export default function App() {
  const [data, setData] = useState({});
  const [connected, setConnected] = useState(false);
  const [fresh, setFresh] = useState(new Set());
  const prev = useRef({});

  useEffect(() => {
    fetch("/api/current")
      .then((r) => r.json())
      .then((snapshot) => setData((p) => ({ ...p, ...snapshot })))
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
          setData((p) => ({ ...p, ...JSON.parse(e.data) }));
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

  useEffect(() => {
    const changed = [];
    for (const k in data) {
      if (prev.current[k] !== data[k]) changed.push(k);
    }
    prev.current = { ...data };
    if (!changed.length) return;
    setFresh(new Set(changed));
    const t = setTimeout(() => setFresh(new Set()), 900);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div className="page">
      <div className="stove" aria-hidden="true" />

      <header className="top">
        <div className="brand">
          sensor<span className="brand__mark">_banya</span>
        </div>
        <span
          className={`live ${connected ? "live--on" : ""}`}
          role="status"
          title={connected ? "Данные идут" : "Нет связи"}
          aria-label={connected ? "данные идут" : "нет связи"}
        />
      </header>

      <main className="board">
        <section className={`hero ${fresh.has("temp") ? "is-fresh" : ""}`}>
          <span className="hero__eyebrow">Парная · сейчас</span>
          <div className="hero__readout">
            <span className="hero__value">{formatValue({ key: "temp" }, data.temp)}</span>
            <span className="hero__unit">°C</span>
          </div>
          <span className="hero__label">Температура в парной</span>
          <div className="hero__bar">
            <span style={{ width: `${heatPercent(data.temp)}%` }} />
          </div>
        </section>

        <section className="grid">
          {GRID.map((item) => (
            <article key={item.key} className={`tile ${fresh.has(item.key) ? "is-fresh" : ""}`}>
              <span className="tile__label">{item.label}</span>
              <span className="tile__value">
                {formatValue(item, data[item.key])}
                {item.unit && <span className="tile__unit">{item.unit}</span>}
              </span>
            </article>
          ))}
        </section>

        <section className="trend">
          <span className="trend__title">Динамика за сутки</span>
          <div className="trend__panel" aria-hidden="true" />
        </section>
      </main>
    </div>
  );
}
