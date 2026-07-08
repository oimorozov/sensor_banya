import { useEffect, useRef, useState } from "react";
import "./App.css";

const GRID = [
  { key: "humid", label: "Влажность", unit: "%" },
  { key: "temp_out", label: "На улице", unit: "°C" },
  { key: "pressure", label: "Давление", unit: "мм рт. ст." },
  { key: "uptime", label: "Аптайм контроллера", unit: "", format: formatUptime },
];

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 5.7 + 4) % 100,
  size: 3 + (i % 3),
  duration: 6 + (i % 5),
  delay: (i % 9) * 0.8,
}));

const LEAVES = Array.from({ length: 7 }, (_, i) => ({
  left: (i * 14.3 + 6) % 100,
  width: 12 + (i % 3) * 5,
  duration: 15 + (i % 5) * 3,
  delay: i * 2.6,
}));

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

function Leaf({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 34" aria-hidden="true">
      <path className="leaf__blade" d="M12 1 C22 9 22 24 12 33 C2 24 2 9 12 1 Z" />
      <line className="leaf__vein" x1="12" y1="4" x2="12" y2="30" />
    </svg>
  );
}

function Sprig({ className }) {
  const count = 8;
  const leaves = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 200 - t * 175;
    const side = i % 2 === 0 ? 1 : -1;
    const rot = side * 50 - 90;
    const scale = 0.6 + (1 - t) * 0.6;
    leaves.push(
      <g key={i} transform={`translate(60 ${y}) rotate(${rot}) scale(${scale})`}>
        <path className="sprig__leaf" d="M0 0 C10 8 10 22 0 34 C-10 22 -10 8 0 0 Z" />
        <line className="sprig__vein" x1="0" y1="4" x2="0" y2="30" />
      </g>,
    );
  }
  return (
    <svg className={className} viewBox="0 0 120 220" aria-hidden="true">
      <path className="sprig__stem" d="M60 210 C56 160 64 90 60 20" />
      {leaves}
      <g transform="translate(60 14) scale(0.7)">
        <path className="sprig__leaf" d="M0 0 C9 8 9 20 0 30 C-9 20 -9 8 0 0 Z" />
      </g>
    </svg>
  );
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
      <div className="decor" aria-hidden="true">
        <div className="stove" />
        <div className="embers">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              style={{
                left: `${e.left}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                animationDuration: `${e.duration}s`,
                animationDelay: `${e.delay}s`,
              }}
            />
          ))}
        </div>
        <Sprig className="sprig sprig--tr" />
        <Sprig className="sprig sprig--bl" />
        {LEAVES.map((l, i) => (
          <Leaf
            key={i}
            className="leaf"
            style={{
              left: `${l.left}%`,
              width: `${l.width}px`,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </div>

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
