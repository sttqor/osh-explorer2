import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  DollarSign,
  Download,
  Globe,
  Heart,
  HelpCircle,
  LogIn,
  Map as MapIcon,
  MapPin,
  Navigation,
  Plus,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  User,
  Users,
} from "lucide-react";
import {
  ATTRACTIONS,
  CATEGORIES,
  CITY,
  EXPERIENCES,
  FACTS,
  loadLeaflet,
  makeCode,
  upcomingDates,
} from "./data";

const TABS = [
  { id: "home", label: "Ош: Гид", Icon: Compass },
  { id: "map", label: "Карта", Icon: MapIcon },
  { id: "route", label: "Маршрут", Icon: RouteIcon },
  { id: "tours", label: "Туры", Icon: Sparkles },
  { id: "profile", label: "Профиль", Icon: User },
];

function StarRow({ rating }) {
  return (
    <span className="row" style={{ gap: 4 }}>
      <Star size={14} fill="#d4a359" color="#d4a359" />
      <b style={{ fontSize: 13 }}>{rating.toFixed(1)}</b>
    </span>
  );
}

export function ExperienceCard({ exp, saved, inRoute, onOpen, onToggleSave, onToggleRoute }) {
  return (
    <article className="card exp-card">
      <div style={{ position: "relative" }}>
        <img className="cover" src={exp.image} alt="" />
        {exp.badge && <div className="badge">{exp.badge}</div>}
        <button
          className="save-btn"
          aria-label="Сохранить"
          onClick={() => onToggleSave(exp.id)}
        >
          <Heart size={18} fill={saved ? "var(--terracotta)" : "none"} color={saved ? "var(--terracotta)" : "#222"} />
        </button>
      </div>
      <div style={{ padding: 14 }}>
        <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
          {exp.type} · {exp.duration}
        </div>
        <div
          onClick={() => onOpen(exp)}
          style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 8, cursor: "pointer" }}
        >
          {exp.title}
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <StarRow rating={exp.rating} />
          <div className="price">от ${exp.price}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            className={`pill ${inRoute ? "on" : ""}`}
            style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 12 }}
            onClick={() => onToggleRoute(exp)}
          >
            {inRoute ? "✓ В маршруте" : "+ В маршрут"}
          </button>
          <button className="cta" style={{ flex: 1.2, padding: "10px 0", fontSize: 12 }} onClick={() => onOpen(exp)}>
            Подробнее
          </button>
        </div>
      </div>
    </article>
  );
}

function MiniMap({ lat, lng, label }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !ref.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindTooltip(label, { permanent: true, direction: "top" });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 80);
    }).catch(() => { });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, label]);

  return <div ref={ref} style={{ height: 180, borderRadius: 14, overflow: "hidden", background: "#e8eee8" }} />;
}

function ExploreMap({ items, selectedId, onSelect, userLocation, footer }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !ref.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(ref.current).setView([CITY.lat, CITY.lng], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      items.forEach((exp) => {
        L.marker([exp.lat, exp.lng]).addTo(map)
          .bindTooltip(exp.place, { permanent: false })
          .on("click", () => onSelect(exp.id));
      });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 120);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      userMarkerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [items, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const exp = items.find((x) => x.id === selectedId);
    if (map && exp) map.setView([exp.lat, exp.lng], 15);
  }, [selectedId, items]);

  return (
    <div className="map-wrap">
      <div ref={ref} className="map-canvas" />
      {failed && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#eef2ee" }}>
          Карта временно недоступна.
        </div>
      )}
      {footer}
    </div>
  );
}

// 1. ГЛАВНАЯ: ИСТОРИЧЕСКИЙ ГИД И СОВЕТЫ
function FactSheet({ fact, onClose, onGoTo }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fact-overlay" onClick={onClose}>
      <div className="fact-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <img src={fact.image} alt="" style={{ width: "100%", height: 170, objectFit: "cover" }} />
          <div className="fact-sheet-fade" />
          <button
            className="icon-btn"
            style={{ position: "absolute", top: 12, right: 12 }}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <ChevronDown size={20} />
          </button>
          <div style={{ position: "absolute", left: 16, right: 60, bottom: 12, color: "#fff" }}>
            <span className="fact-tag">{fact.tag}</span>
            <h2 style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.15 }}>
              {fact.emoji} {fact.title}
            </h2>
          </div>
        </div>

        <div style={{ padding: "14px 16px 20px" }}>
          {fact.body.map((p) => (
            <p key={p} style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55, color: "#333" }}>
              {p}
            </p>
          ))}

          <b style={{ fontSize: 13 }}>Коротко о главном</b>
          <ul style={{ margin: "8px 0 16px", paddingLeft: 18 }}>
            {fact.points.map((p) => (
              <li key={p} style={{ fontSize: 13, lineHeight: 1.45, marginBottom: 6, color: "#444" }}>
                {p}
              </li>
            ))}
          </ul>

          <button className="cta" onClick={() => onGoTo(fact.linkTab)}>
            {fact.linkLabel} →
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeView({ onGoToRoute, onGoTo }) {
  const [openFact, setOpenFact] = useState(null);

  return (
    <div className="gyg-scroll">
      <section style={{ position: "relative", height: 154, overflow: "hidden", color: "#fff" }}>
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85" alt="Сулайман-Тоо, Ош" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(27,22,18,.74), rgba(27,22,18,.28))" }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 13 }}>
          <span style={{ display: "inline-block", background: "var(--terracotta)", padding: "3px 7px", borderRadius: 5, fontSize: 8, fontWeight: 900, marginBottom: 5 }}>ДРЕВНИЙ ОШ · 3000 ЛЕТ</span>
          <h1 style={{ fontSize: 20, lineHeight: 1.08, margin: "0 0 4px", fontWeight: 900, letterSpacing: -0.45 }}>Ош: Сердце Шёлкового пути</h1>
          <p style={{ margin: "0 0 8px", fontSize: 9.5, lineHeight: 1.25, maxWidth: 310 }}>Священная гора Сулайман-Тоо, древнейшие базары Востока, аромат тандырной самсы и живые ремёсла.</p>
          <button className="cta home-route-cta" onClick={onGoToRoute}>Собрать маршрут →</button>
        </div>
      </section>

      <section style={{ padding: "14px 16px 0" }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, margin: "0 0 10px" }}>Интересные факты</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {FACTS.map((f) => (
            <article
              key={f.id}
              className="card fact-card"
              role="button"
              tabIndex={0}
              onClick={() => setOpenFact(f)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenFact(f);
              }}
            >
              <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <b>{f.emoji} {f.title}</b>
                  <p>{f.short}</p>
                  <span className="fact-more">Подробнее →</span>
                </div>
                <ChevronRight size={16} color="var(--terracotta)" style={{ flexShrink: 0, marginTop: 2 }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {openFact && (
        <FactSheet
          fact={openFact}
          onClose={() => setOpenFact(null)}
          onGoTo={(tab) => {
            setOpenFact(null);
            onGoTo(tab);
          }}
        />
      )}
    </div>
  );
}

// 2. МАРШРУТ: ЧИСТЫЙ ПЛАНИРОВЩИК (БЕЗ ВЫБОРА МЕСТ СНИЗУ)
function RouteView({ items, setItems, onGoToTours }) {
  const [mode, setMode] = useState("self");

  const stats = useMemo(() => {
    const count = items.length;
    if (count === 0) return { km: "0 км", time: "0 ч", timeline: "--:--" };
    return {
      km: `${(count * 1.6).toFixed(1)} км`,
      time: `~${Math.floor((count * 75) / 60)} ч ${(count * 75) % 60} мин`,
      timeline: "10:00 — 15:30",
    };
  }, [items]);

  const moveItem = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [it] = copy.splice(index, 1);
    copy.splice(target, 0, it);
    setItems(copy);
  };

  const removeItem = (id) => {
    setItems(items.filter((x) => x.id !== id));
  };

  return (
    <div className="gyg-scroll">
      <div style={{ background: "#fff", padding: "18px 16px 12px", borderBottom: "1px solid var(--line)" }}>
        <div className="muted" style={{ fontWeight: 700, fontSize: 11 }}>ПЛАНИРОВЩИК ДНЯ · ОШ</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "2px 0 10px" }}>Составьте свой маршрут</h1>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          Добавьте места во вкладке «Туры» — мы построим удобный путь на день.
        </p>
        <div className="row" style={{ background: "var(--sand-100)", borderRadius: 14, padding: 4, marginTop: 12 }}>
          <button className={`pill ${mode === "self" ? "on" : ""}`} style={{ flex: 1, textAlign: "center" }} onClick={() => setMode("self")}>
            🚶 Сами
          </button>
          <button className={`pill ${mode === "guide" ? "on" : ""}`} style={{ flex: 1, textAlign: "center" }} onClick={() => setMode("guide")}>
            🧭 С гидом
          </button>
        </div>
      </div>

      <div className="row" style={{ padding: "12px 16px", gap: 8 }}>
        <div className="card" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
          <div className="muted" style={{ fontSize: 11 }}>Дистанция</div>
          <b style={{ fontSize: 14 }}>{stats.km}</b>
        </div>
        <div className="card" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
          <div className="muted" style={{ fontSize: 11 }}>Длительность</div>
          <b style={{ fontSize: 14 }}>{stats.time}</b>
        </div>
        <div className="card" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
          <div className="muted" style={{ fontSize: 11 }}>Таймлайн</div>
          <b style={{ fontSize: 14 }}>{stats.timeline}</b>
        </div>
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <b>Точки дневного маршрута ({items.length})</b>
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              style={{ border: "none", background: "none", color: "var(--terracotta)", fontWeight: 700, cursor: "pointer" }}
            >
              Очистить все
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="card ornament-accent" style={{ padding: "36px 20px", textAlign: "center" }}>
            <Compass size={40} color="var(--terracotta)" />
            <h3 style={{ margin: "12px 0 6px" }}>Маршрут пока пуст</h3>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>
              Перейдите во вкладку «Туры», чтобы добавить Сулайман-Тоо, Базар Джайма или гончарную мастерскую.
            </p>
            <button className="cta" onClick={onGoToTours}>
              Перейти в «Туры»
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((item, idx) => (
              <div key={item.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: "var(--terracotta)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                    <div className="muted" style={{ fontSize: 11, margin: "4px 0 8px" }}>
                      ⏱️ {item.duration} · {item.place}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }} disabled={idx === 0} onClick={() => moveItem(idx, -1)}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="icon-btn" style={{ width: 28, height: 28 }} disabled={idx === items.length - 1} onClick={() => moveItem(idx, 1)}>
                      <ChevronDown size={14} />
                    </button>
                    <button className="icon-btn" style={{ width: 28, height: 28, color: "var(--terracotta)" }} onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="cta"
              style={{ marginTop: 12 }}
              onClick={() => alert(`Запуск пешеходной навигации по ${items.length} точкам Оша!`)}
            >
              🚀 Открыть навигацию ({items.length} ост.)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. ТУРЫ: ПОЛНЫЙ КАТАЛОГ С ПОИСКОМ И КНОПКАМИ «В МАРШРУТ»
function ToursView({
  query,
  setQuery,
  category,
  setCategory,
  saved,
  routeItems,
  onOpen,
  onToggleSave,
  onToggleRoute,
}) {
  const filtered = EXPERIENCES.filter((e) => {
    const byCat = category === "all" || e.category === category;
    const q = query.trim().toLowerCase();
    const byQ = !q || `${e.title} ${e.place} ${e.type}`.toLowerCase().includes(q);
    return byCat && byQ;
  });

  return (
    <div className="gyg-scroll">
      <div style={{ background: "#fff", padding: "18px 16px 12px", borderBottom: "1px solid var(--line)" }}>
        <div className="muted" style={{ fontWeight: 700, fontSize: 11 }}>КАТАЛОГ ВПЕЧАТЛЕНИЙ</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "2px 0 10px" }}>Практики и туры</h1>
        <div className="search">
          <Search size={18} color="#888" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти мастер-класс, базар или гору…" />
        </div>
      </div>

      <div className="h-scroll" style={{ paddingTop: 14 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`pill ${category === c.id ? "on" : ""}`} onClick={() => setCategory(c.id)}>
            <c.Icon size={14} /> {c.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px 20px", display: "grid", gap: 14, marginTop: 10 }}>
        {filtered.map((exp) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            saved={saved.has(exp.id)}
            inRoute={routeItems.some((r) => r.id === exp.id)}
            onOpen={onOpen}
            onToggleSave={onToggleSave}
            onToggleRoute={onToggleRoute}
          />
        ))}
      </div>
    </div>
  );
}

// 4. ПРОФИЛЬ: НАСТРОЙКИ, ЯЗЫК, ВАЛЮТА, ПОДДЕРЖКА
function ProfileView({ bookings, onOpenTicket }) {
  const [lang, setLang] = useState("RU");
  const [currency, setCurrency] = useState("USD");
  const [notifs, setNotifs] = useState(true);

  return (
    <div className="gyg-scroll" style={{ padding: 16 }}>
      <h2 style={{ margin: "8px 0 14px", fontWeight: 900 }}>Профиль</h2>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "#fff4f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={22} color="var(--terracotta)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Гостевой доступ</div>
            <div className="muted" style={{ fontSize: 11 }}>Данные сохраняются на устройстве</div>
          </div>
          <button className="pill" style={{ padding: "6px 12px", fontSize: 12 }}>
            Войти
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <Ticket size={16} color="var(--terracotta)" />
          <b>Ваши билеты ({bookings.length})</b>
        </div>
        {bookings.length === 0 ? (
          <div className="muted" style={{ fontSize: 13 }}>Пока нет активных броней.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {bookings.map((b) => (
              <div
                key={b.code}
                onClick={() => onOpenTicket(b)}
                style={{ padding: "8px 0", borderTop: "1px solid var(--line)", cursor: "pointer" }}
              >
                <div style={{ fontWeight: 800, fontSize: 13 }}>{b.exp.title}</div>
                <div className="muted" style={{ fontSize: 11 }}>{b.date} · {b.guests} гостя · {b.code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <Globe size={16} color="var(--terracotta)" />
          <b>Язык приложения</b>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {["RU", "KY", "EN"].map((l) => (
            <button
              key={l}
              className={`pill ${lang === l ? "on" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
              onClick={() => setLang(l)}
            >
              {l === "RU" ? "Русский" : l === "KY" ? "Кыргызча" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <DollarSign size={16} color="var(--terracotta)" />
          <b>Валюта</b>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {["USD", "KGS", "EUR", "RUB"].map((c) => (
            <button
              key={c}
              className={`pill ${currency === c ? "on" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
              onClick={() => setCurrency(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <Bell size={16} color="var(--terracotta)" />
            <span>Уведомления о турах</span>
          </div>
          <input
            type="checkbox"
            checked={notifs}
            onChange={(e) => setNotifs(e.target.checked)}
            style={{ accentColor: "var(--terracotta)" }}
          />
        </div>
        <div
          className="row"
          style={{ justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 12, cursor: "pointer" }}
          onClick={() => alert("Поддержка Osh Guide в Telegram: @osh_guide_help")}
        >
          <div className="row" style={{ gap: 8 }}>
            <HelpCircle size={16} color="var(--terracotta)" />
            <span>Помощь и поддержка</span>
          </div>
          <ChevronRight size={16} color="#888" />
        </div>
      </div>
    </div>
  );
}

// 5. ДЕТАЛЬНЫЙ ЭКРАН И БРОНИРОВАНИЕ
function Detail({ exp, saved, onBack, onToggleSave, onBook }) {
  return (
    <div className="gyg-scroll" style={{ background: "#fff", minHeight: "100svh" }}>
      <div style={{ position: "relative" }}>
        <img src={exp.image} alt="" style={{ height: 240, width: "100%", objectFit: "cover" }} />
        <button className="icon-btn" style={{ position: "absolute", top: 12, left: 12 }} onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <button className="save-btn" style={{ position: "absolute", top: 12, right: 12 }} onClick={() => onToggleSave(exp.id)}>
          <Heart size={18} fill={saved ? "var(--terracotta)" : "none"} color={saved ? "var(--terracotta)" : "#222"} />
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <div className="muted" style={{ fontWeight: 700 }}>{exp.type} · {exp.place}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: "6px 0 10px", lineHeight: 1.25 }}>{exp.title}</h2>
        <div className="row" style={{ gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
          <StarRow rating={exp.rating} />
          <span className="muted">{exp.reviews} отзывов</span>
          <span className="row muted"><Clock size={14} /> {exp.duration}</span>
        </div>
        {exp.freeCancel && <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Бесплатная отмена за 24 часа</div>}
        <p style={{ margin: "0 0 16px", color: "#333", lineHeight: 1.5 }}>{exp.description}</p>
        <b>Что будет</b>
        <ul style={{ paddingLeft: 18, margin: "8px 0 16px" }}>
          {exp.highlights.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}
        </ul>
        <div className="row" style={{ marginBottom: 8 }}><MapPin size={16} /> <b>Точка встречи</b></div>
        <div className="muted" style={{ marginBottom: 10 }}>{exp.meeting}</div>
        <MiniMap lat={exp.lat} lng={exp.lng} label={exp.place} />
      </div>
      <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid var(--line)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>от</div>
          <div className="price" style={{ fontSize: 20 }}>${exp.price}</div>
        </div>
        <button className="cta" onClick={() => onBook(exp)}>Выбрать дату</button>
      </div>
    </div>
  );
}

function Booking({ exp, onBack, onConfirm }) {
  const dates = useMemo(() => upcomingDates(), []);
  const [date, setDate] = useState(dates[1]?.key || dates[0].key);
  const [guests, setGuests] = useState(2);
  const total = exp.price * guests;

  return (
    <div className="gyg-scroll" style={{ background: "#fff", minHeight: "100svh" }}>
      <div className="screen-head">
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={20} /></button>
        <b>Бронирование</b>
      </div>
      <div style={{ padding: 16 }}>
        <div className="muted" style={{ fontWeight: 700, marginBottom: 6 }}>{exp.title}</div>
        <b>Когда</b>
        <div className="h-scroll" style={{ padding: "12px 0" }}>
          {dates.map((d) => (
            <button key={d.key} className={`date-chip ${date === d.key ? "on" : ""}`} onClick={() => setDate(d.key)}>
              <div style={{ fontSize: 11, color: "#888" }}>{d.label}</div>
              <div style={{ fontWeight: 800 }}>{d.num}</div>
            </button>
          ))}
        </div>

        <b>Гости</b>
        <div className="row" style={{ justifyContent: "space-between", margin: "12px 0 20px", background: "var(--sand-100)", borderRadius: 14, padding: 12 }}>
          <span className="row"><Users size={16} /> {guests}</span>
          <div className="row">
            <button className="icon-btn" onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
            <button className="icon-btn" onClick={() => setGuests((g) => Math.min(10, g + 1))}>+</button>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <span>Итого</span>
          <b>${total}</b>
        </div>

        <button className="cta" onClick={() => onConfirm({ exp, date, guests, total, code: makeCode() })}>
          Подтвердить · ${total}
        </button>
      </div>
    </div>
  );
}

function TicketView({ booking, onClose }) {
  const exp = booking.exp;
  return (
    <div className="gyg-scroll" style={{ background: "#fff", minHeight: "100svh" }}>
      <div className="screen-head">
        <button className="icon-btn" onClick={onClose}><ChevronLeft size={20} /></button>
        <b>Ваш билет</b>
      </div>
      <div style={{ padding: 16 }}>
        <div className="ticket">
          <div className="row" style={{ color: "var(--green)", fontWeight: 800, marginBottom: 8 }}>
            <Check size={16} /> Подтверждено
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{exp.title}</div>
          <div className="muted"><Calendar size={14} /> {booking.date} · {booking.guests} гостя</div>
          <div className="muted" style={{ margin: "8px 0" }}><MapPin size={14} /> {exp.meeting}</div>
          <div style={{ marginTop: 16, padding: 12, background: "#111", color: "#fff", borderRadius: 12, textAlign: "center", letterSpacing: 2, fontWeight: 800 }}>
            {booking.code}
          </div>
        </div>
      </div>
    </div>
  );
}

// ГЛАВНЫЙ ЭКСПОРТ
export default function App() {
  const [tab, setTab] = useState("route");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [bookingExp, setBookingExp] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mapSelected, setMapSelected] = useState(EXPERIENCES[0].id);

  const [routeItems, setRouteItems] = useState([EXPERIENCES[3], EXPERIENCES[4], EXPERIENCES[0]]);

  const mapItem = EXPERIENCES.find((e) => e.id === mapSelected) || EXPERIENCES[0];

  function toggleSave(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRoute(exp) {
    setRouteItems((prev) => {
      const exists = prev.some((x) => x.id === exp.id);
      if (exists) return prev.filter((x) => x.id !== exp.id);
      return [...prev, exp];
    });
  }

  function confirmBooking(entry) {
    setBookings((b) => [entry, ...b]);
    setBookingExp(null);
    setSelected(null);
    setTicket(entry);
    setTab("profile");
  }

  if (ticket) return <TicketView booking={ticket} onClose={() => setTicket(null)} />;
  if (bookingExp) return <Booking exp={bookingExp} onBack={() => setBookingExp(null)} onConfirm={confirmBooking} />;
  if (selected) {
    return (
      <Detail
        exp={selected}
        saved={saved.has(selected.id)}
        onBack={() => setSelected(null)}
        onToggleSave={toggleSave}
        onBook={setBookingExp}
      />
    );
  }

  return (
    <div className="gyg-app ornament-bg">
      {tab === "home" && <HomeView onGoToRoute={() => setTab("route")} onGoTo={setTab} />}

      {tab === "map" && (
        <ExploreMap
          items={EXPERIENCES}
          selectedId={mapSelected}
          onSelect={setMapSelected}
          footer={(
            <div className="map-sheet">
              <div style={{ width: 36, height: 4, background: "#ded0bc", borderRadius: 2, margin: "0 auto 10px" }} />
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Карта Оша · выберите точку</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                {EXPERIENCES.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setMapSelected(exp.id)}
                    style={{
                      minWidth: 220,
                      textAlign: "left",
                      border: mapSelected === exp.id ? "2px solid var(--terracotta)" : "1px solid rgba(70,50,35,0.08)",
                      borderRadius: 14,
                      background: "#fff",
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{exp.title}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{exp.place} · от ${exp.price}</div>
                  </button>
                ))}
              </div>
              <button className="cta" style={{ marginTop: 12 }} onClick={() => setSelected(mapItem)}>
                Открыть карточку места
              </button>
            </div>
          )}
        />
      )}

      {tab === "route" && (
        <RouteView items={routeItems} setItems={setRouteItems} onGoToTours={() => setTab("tours")} />
      )}

      {tab === "tours" && (
        <ToursView
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          saved={saved}
          routeItems={routeItems}
          onOpen={setSelected}
          onToggleSave={toggleSave}
          onToggleRoute={toggleRoute}
        />
      )}

      {tab === "profile" && (
        <ProfileView bookings={bookings} onOpenTicket={setTicket} />
      )}

      {/* Нижняя панель Liquid Glass */}
      <nav className="gyg-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${tab === t.id ? "active" : ""} ${t.id === "route" ? "route-tab" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon"><t.Icon size={20} /></span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
