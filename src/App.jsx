import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Compass,
  Heart,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  Ticket,
  User,
  Users,
} from "lucide-react";
import {
  ATTRACTIONS,
  CATEGORIES,
  CITY,
  EXPERIENCES,
  loadLeaflet,
  makeCode,
  upcomingDates,
} from "./data.js";
const TABS = [
  { id: "home", label: "Главная", Icon: Compass },
  { id: "map", label: "Карта", Icon: MapIcon },
  { id: "saved", label: "Избранное", Icon: Bookmark },
  { id: "bookings", label: "Билеты", Icon: Ticket },
  { id: "profile", label: "Профиль", Icon: User },
];

function BottomNav({ tab, setTab }) {
  const draggingRef = useRef(false);

  const pickTabAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const btn = el && el.closest ? el.closest("[data-tab-id]") : null;
    if (btn) {
      const id = btn.getAttribute("data-tab-id");
      setTab((prev) => (prev === id ? prev : id));
    }
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    pickTabAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    pickTabAt(e.clientX, e.clientY);
  };

  const stopDragging = () => {
    draggingRef.current = false;
  };

  return (
    <nav
      className="gyg-nav"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          data-tab-id={t.id}
          className={tab === t.id ? "active" : ""}
          onClick={() => setTab(t.id)}
        >
          <t.Icon size={20} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

function StarRow({ rating }) {
  return (
    <span className="row" style={{ gap: 4 }}>
      <Star size={14} fill="#d4a359" color="#d4a359" />
      <b style={{ fontSize: 13, color: "var(--ink)" }}>{rating.toFixed(1)}</b>
    </span>
  );
}

export function ExperienceCard({ exp, saved, onOpen, onToggleSave, compact }) {
  return (
    <article className="card exp-card" style={{ minWidth: compact ? 250 : undefined }}>
      <div style={{ position: "relative" }}>
        <img className="cover" src={exp.image} alt="" style={{ height: compact ? 138 : 176 }} />
        {exp.badge && <div className="badge">{exp.badge}</div>}
        <button
          className="save-btn"
          aria-label="Сохранить"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(exp.id);
          }}
        >
          <Heart size={18} fill={saved ? "#c85a32" : "none"} color={saved ? "#c85a32" : "#2b2520"} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onOpen(exp)}
        style={{
          display: "block", width: "100%", textAlign: "left", border: "none",
          background: "transparent", padding: "14px 14px 16px", cursor: "pointer",
        }}
      >
        <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2px", marginBottom: 5 }}>
          {exp.type.toUpperCase()} · {exp.duration}
        </div>
        <div style={{ fontWeight: 800, fontSize: compact ? 14 : 16, lineHeight: 1.3, marginBottom: 10, color: "var(--ink)", letterSpacing: "-0.2px" }}>
          {exp.title}
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <StarRow rating={exp.rating} />
          <div className="price">от ${exp.price}</div>
        </div>
      </button>
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

  return <div ref={ref} style={{ height: 180, borderRadius: 16, overflow: "hidden", background: "var(--sand-100)", border: "1px solid var(--sand-200)" }} />;
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
      const map = L.map(ref.current, { zoomControl: false }).setView([CITY.lat, CITY.lng], 14);
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
    }).catch(() => { if (!cancelled) setFailed(true); });
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !window.L) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      return;
    }
    userMarkerRef.current = window.L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 8, color: "#c85a32", fillColor: "#c85a32", fillOpacity: 1,
    }).addTo(map).bindTooltip("Вы", { permanent: true, direction: "right" });
  }, [userLocation]);

  return (
    <div className="map-wrap">
      <div ref={ref} className="map-canvas" />
      {failed && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--sand-100)", color: "var(--muted)" }}>
          Карта недоступна. Проверьте сеть.
        </div>
      )}
      {footer}
    </div>
  );
}

function Home({
  query, setQuery, category, setCategory, saved, onOpen, onToggleSave, onEnableGeo, userLocation,
}) {
  const practices = EXPERIENCES.filter((e) => e.category === "practices" || e.badge === "Практика");
  const filtered = EXPERIENCES.filter((e) => {
    const byCat = category === "all" || e.category === category || (category === "practices" && e.badge === "Практика");
    const q = query.trim().toLowerCase();
    const byQ = !q || `${e.title} ${e.place} ${e.type}`.toLowerCase().includes(q);
    return byCat && byQ;
  });

  return (
    <div className="gyg-scroll">
      <div style={{ background: "var(--sand-50)", padding: "22px 18px 14px", borderBottom: "1px solid var(--line)" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
          <div className="muted" style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Локальный гид · Ош
          </div>
          <span className="row muted" style={{ fontSize: 12, gap: 4 }}>
            <Sparkles size={13} color="var(--terracotta)" /> Аутентичные практики
          </span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 16px", letterSpacing: -0.7, color: "var(--ink)" }}>
          Впечатления в Оше
        </h1>
        <div className="search">
          <Search size={18} color="#9e958c" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск практик, экскурсий и вкусов…"
          />
        </div>
        {!userLocation && (
          <button className="cta ghost" style={{ marginTop: 12, fontSize: 13, padding: "10px 14px", borderRadius: 14 }} onClick={onEnableGeo}>
            <span className="row" style={{ justifyContent: "center", gap: 6 }}>
              <Navigation size={14} color="var(--terracotta)" /> Показать, что рядом со мной
            </span>
          </button>
        )}
      </div>

      <div className="h-scroll" style={{ paddingTop: 16 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`pill ${category === c.id ? "on" : ""}`} onClick={() => setCategory(c.id)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {category === "all" && !query && (
        <>
          <div style={{ padding: "8px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Практики: делай своими руками</div>
              <div className="muted" style={{ fontSize: 12 }}>Мастер-классы с местными ремесленниками</div>
            </div>
            <button className="pill" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setCategory("practices")}>Все</button>
          </div>
          <div className="h-scroll">
            {practices.map((exp) => (
              <ExperienceCard key={exp.id} exp={exp} saved={saved.has(exp.id)} onOpen={onOpen} onToggleSave={onToggleSave} compact />
            ))}
          </div>
        </>
      )}

      <div style={{ padding: "14px 18px 10px" }}>
        <b style={{ fontSize: 16 }}>{query || category !== "all" ? "Результаты поиска" : "Популярные впечатления"}</b>
      </div>
      <div style={{ padding: "0 18px 24px", display: "grid", gap: 16 }}>
        {filtered.length === 0 && <div className="empty">Ничего не нашли. Смените фильтр или запрос.</div>}
        {filtered.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} saved={saved.has(exp.id)} onOpen={onOpen} onToggleSave={onToggleSave} />
        ))}
      </div>

      {!query && category === "all" && (
        <div style={{ padding: "0 18px 30px" }}>
          <b style={{ fontSize: 16 }}>Знаковые места города</b>
          <div style={{ display: "flex", gap: 12, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
            {ATTRACTIONS.map((a) => (
              <div key={a.id} className="card" style={{ minWidth: 168 }}>
                <img src={a.image} alt="" style={{ height: 100, width: "100%", objectFit: "cover" }} />
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>{a.name}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{a.hint}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ exp, saved, onBack, onToggleSave, onBook }) {
  return (
    <div className="gyg-scroll" style={{ background: "#fff", minHeight: "100svh" }}>
      <div style={{ position: "relative" }}>
        <img src={exp.image} alt="" style={{ height: 260, width: "100%", objectFit: "cover" }} />
        <button className="icon-btn" style={{ position: "absolute", top: 14, left: 14 }} onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <button className="icon-btn" style={{ position: "absolute", top: 14, right: 14 }} onClick={() => onToggleSave(exp.id)}>
          <Heart size={18} fill={saved ? "#c85a32" : "none"} color={saved ? "#c85a32" : "#2b2520"} />
        </button>
      </div>
      <div style={{ padding: "20px 18px" }}>
        <div className="muted" style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.2px" }}>{exp.type.toUpperCase()} · {exp.place}</div>
        <h2 style={{ fontSize: 23, fontWeight: 900, margin: "6px 0 12px", lineHeight: 1.25, letterSpacing: -0.4 }}>{exp.title}</h2>
        <div className="row" style={{ gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <StarRow rating={exp.rating} />
          <span className="muted">{exp.reviews} отзывов</span>
          <span className="row muted"><Clock size={14} /> {exp.duration}</span>
        </div>
        {exp.freeCancel && (
          <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={16} strokeWidth={2.5} /> Бесплатная отмена за 24 часа
          </div>
        )}
        <p style={{ margin: "0 0 18px", color: "#38312b", lineHeight: 1.6, fontSize: 15 }}>{exp.description}</p>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Что вас ждёт</div>
        <ul style={{ paddingLeft: 20, margin: "0 0 20px", color: "var(--ink-soft)" }}>
          {exp.highlights.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}
        </ul>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Что включено</div>
        <ul style={{ paddingLeft: 20, margin: "0 0 20px", color: "var(--ink-soft)" }}>
          {exp.includes.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}
        </ul>
        <div className="muted" style={{ marginBottom: 10, fontSize: 13 }}>Языки: {exp.lang} · Группа: {exp.group}</div>
        <div className="row" style={{ marginBottom: 8, gap: 6 }}><MapPin size={16} color="var(--terracotta)" /> <b>Точка сбора</b></div>
        <div className="muted" style={{ marginBottom: 12 }}>{exp.meeting}</div>
        <MiniMap lat={exp.lat} lng={exp.lng} label={exp.place} />
      </div>
      <div style={{
        position: "sticky", bottom: 0, background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--line)", padding: "14px 18px calc(14px + env(safe-area-inset-bottom))",
        display: "flex", alignItems: "center", gap: 14, zIndex: 30,
      }}>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>от человека</div>
          <div className="price" style={{ fontSize: 22 }}>${exp.price}</div>
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
        <b style={{ fontSize: 16 }}>Бронирование впечатления</b>
      </div>
      <div style={{ padding: "18px" }}>
        <div className="muted" style={{ fontWeight: 700, marginBottom: 8 }}>{exp.title}</div>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Дата визита</div>
        <div className="h-scroll" style={{ padding: "10px 0 16px" }}>
          {dates.map((d) => (
            <button key={d.key} className={`date-chip ${date === d.key ? "on" : ""}`} onClick={() => setDate(d.key)}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.label}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)", marginTop: 2 }}>{d.num}</div>
            </button>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Количество участников</div>
        <div className="row" style={{
          justifyContent: "space-between", margin: "10px 0 20px", background: "var(--sand-100)",
          borderRadius: 16, padding: "12px 14px", border: "1px solid var(--sand-200)",
        }}>
          <span className="row" style={{ fontWeight: 700 }}>
            <Users size={18} color="var(--terracotta)" /> {guests} {guests === 1 ? "гость" : "гостя"}
          </span>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
            <button className="icon-btn" onClick={() => setGuests((g) => Math.min(10, g + 1))}>+</button>
          </div>
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18, padding: "4px 2px" }}>
          <span style={{ fontSize: 15, color: "var(--muted)" }}>Итого к оплате</span>
          <b style={{ fontSize: 22, color: "var(--terracotta-dark)" }}>${total}</b>
        </div>
        <button className="cta" onClick={() => onConfirm({ exp, date, guests, total, code: makeCode() })}>
          Подтвердить · ${total}
        </button>
        <p className="muted" style={{ marginTop: 14, fontSize: 12, textAlign: "center", lineHeight: 1.4 }}>
          Тестовый режим: оплата не требуется. Ваш билет появится в разделе «Билеты».
        </p>
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
        <b style={{ fontSize: 16 }}>Электронный билет</b>
      </div>
      <div style={{ padding: "20px 18px" }}>
        <div className="ticket" style={{ border: "1px solid var(--sand-200)", boxShadow: "0 10px 30px rgba(45,32,22,0.08)" }}>
          <div className="row" style={{ color: "var(--green)", fontWeight: 800, marginBottom: 10, fontSize: 14 }}>
            <Check size={18} strokeWidth={2.5} /> Бронирование подтверждено
          </div>
          <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 10, lineHeight: 1.3 }}>{exp.title}</div>
          <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={15} color="var(--terracotta)" /> {booking.date} · {booking.guests} участника
          </div>
          <div className="muted" style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={15} color="var(--terracotta)" /> {exp.meeting}
          </div>
          <div style={{
            marginTop: 20, padding: 14, background: "linear-gradient(135deg, #1f1b18 0%, #342a22 100%)",
            color: "#fff", borderRadius: 14, textAlign: "center", letterSpacing: 2.5, fontWeight: 800, fontSize: 16,
            boxShadow: "0 6px 18px rgba(31,27,24,0.25)",
          }}>
            {booking.code}
          </div>
        </div>

        <button className="cta ghost" style={{ marginTop: 16 }} onClick={onClose}>
          Вернуться к билетам
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [bookingExp, setBookingExp] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [askGeo, setAskGeo] = useState(false);
  const [mapSelected, setMapSelected] = useState(EXPERIENCES[0].id);
  const watchRef = useRef(null);

  const savedList = EXPERIENCES.filter((e) => saved.has(e.id));
  const mapItem = EXPERIENCES.find((e) => e.id === mapSelected) || EXPERIENCES[0];

  function toggleSave(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Сброс всех модальных состояний при смене вкладки таббара
  function handleTabChange(nextTab) {
    setTicket(null);
    setBookingExp(null);
    setSelected(null);
    setTab(nextTab);
  }

  function requestGeo() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Геолокация недоступна в этом браузере");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setAskGeo(false);
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = navigator.geolocation.watchPosition((p) => {
          setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        });
      },
      () => setGeoError("Не удалось получить местоположение. Разрешите доступ в браузере."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  useEffect(() => () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); }, []);

  function confirmBooking(entry) {
    setBookings((b) => [entry, ...b]);
    setBookingExp(null);
    setSelected(null);
    setTicket(entry);
    setTab("bookings");
  }

  return (
    <div className="gyg-app">
      {/* Если открыт просмотр билета */}
      {ticket ? (
        <TicketView booking={ticket} onClose={() => setTicket(null)} />
      ) : bookingExp ? (
        /* Экран оформления брони */
        <Booking exp={bookingExp} onBack={() => setBookingExp(null)} onConfirm={confirmBooking} />
      ) : selected ? (
        /* Детальный экран впечатления */
        <Detail
          exp={selected}
          saved={saved.has(selected.id)}
          onBack={() => setSelected(null)}
          onToggleSave={toggleSave}
          onBook={setBookingExp}
        />
      ) : (
        /* Основные экраны вкладок */
        <>
          {tab === "home" && (
            <Home
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              saved={saved}
              onOpen={setSelected}
              onToggleSave={toggleSave}
              onEnableGeo={() => setAskGeo(true)}
              userLocation={userLocation}
            />
          )}

          {tab === "map" && (
            <ExploreMap
              items={EXPERIENCES}
              selectedId={mapSelected}
              onSelect={setMapSelected}
              userLocation={userLocation}
              footer={(
                <div className="map-sheet">
                  <div style={{ width: 34, height: 4, background: "rgba(122, 112, 103, 0.3)", borderRadius: 99, margin: "0 auto 10px" }} />

                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Впечатления на карте Оша
                    </span>
                    <span className="badge" style={{ position: "static", padding: "3px 8px", fontSize: 10 }}>
                      {EXPERIENCES.length} локаций
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
                    {EXPERIENCES.map((exp) => {
                      const isCur = mapSelected === exp.id;
                      return (
                        <button
                          key={exp.id}
                          onClick={() => setMapSelected(exp.id)}
                          className="sheet-pill-item"
                          style={{
                            border: isCur ? "2px solid var(--terracotta)" : "1px solid rgba(70, 50, 35, 0.08)",
                            background: isCur ? "#fff9f6" : "rgba(255, 255, 255, 0.95)",
                            boxShadow: isCur ? "0 6px 18px rgba(200, 90, 50, 0.16)" : "0 2px 6px rgba(45, 32, 22, 0.03)",
                          }}
                        >
                          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                            <span className="muted" style={{ fontSize: 10, fontWeight: 700 }}>{exp.duration}</span>
                            <StarRow rating={exp.rating} />
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)", lineHeight: 1.3, marginBottom: 6 }}>
                            {exp.title}
                          </div>
                          <div className="row" style={{ justifyContent: "space-between" }}>
                            <span className="muted" style={{ fontSize: 11 }}>{exp.place}</span>
                            <b style={{ color: "var(--terracotta-dark)", fontSize: 13 }}>${exp.price}</b>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="cta"
                    style={{ marginTop: 12, padding: "13px 16px" }}
                    onClick={() => setSelected(mapItem)}
                  >
                    Подробнее о «{mapItem.place}»
                  </button>
                </div>
              )}
            />
          )}

          {tab === "saved" && (
            <div className="gyg-scroll" style={{ padding: 18 }}>
              <h2 style={{ margin: "8px 0 14px", fontWeight: 900, letterSpacing: -0.5 }}>Избранное</h2>
              {savedList.length === 0 && (
                <div className="empty">Сохраняйте практики и экскурсии сердцем на карточке — соберите персональный маршрут.</div>
              )}
              <div style={{ display: "grid", gap: 16 }}>
                {savedList.map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} saved onOpen={setSelected} onToggleSave={toggleSave} />
                ))}
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="gyg-scroll" style={{ padding: 18 }}>
              <h2 style={{ margin: "8px 0 14px", fontWeight: 900, letterSpacing: -0.5 }}>Мои билеты</h2>
              {bookings.length === 0 && (
                <div className="empty">Пока нет забронированных практик. Выберите мастер-класс или экскурсию.</div>
              )}
              <div style={{ display: "grid", gap: 14 }}>
                {bookings.map((b) => (
                  <button
                    key={b.code}
                    className="ticket"
                    style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--sand-200)", width: "100%" }}
                    onClick={() => setTicket(b)}
                  >
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{b.exp.title}</div>
                    <div className="muted">{b.date} · {b.guests} участника · Код: {b.code}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div className="gyg-scroll" style={{ padding: 18 }}>
              <h2 style={{ margin: "8px 0 8px", fontWeight: 900, letterSpacing: -0.5 }}>Профиль путешественника</h2>
              <p className="muted" style={{ marginBottom: 18 }}>Osh Guide — аутентичные практики, ремёсла и экскурсии древнего Оша.</p>
              <div className="card" style={{ padding: 18 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">Локация</span><b>Ош, Кыргызстан</b>
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                  <span className="muted">Геолокация</span><b>{userLocation ? "Активна" : "Отключена"}</b>
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                  <span className="muted">В избранном</span><b>{saved.size}</b>
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                  <span className="muted">Бронирования</span><b>{bookings.length}</b>
                </div>
              </div>
              {!userLocation && <button className="cta" style={{ marginTop: 18 }} onClick={() => setAskGeo(true)}>Включить геолокацию</button>}
            </div>
          )}
        </>
      )}

      {askGeo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,19,17,0.5)", backdropFilter: "blur(6px)", zIndex: 1300, display: "grid", placeItems: "end center" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 430, borderRadius: "28px 28px 0 0", padding: "24px 20px" }}>
            <b style={{ fontSize: 17 }}>Доступ к геолокации</b>
            <p className="muted" style={{ margin: "8px 0 16px", lineHeight: 1.4 }}>
              Позволит показать расстояние до ремесленных мастерских и отобразить ваше местоположение на карте.
            </p>
            {geoError && <p style={{ color: "var(--terracotta-dark)", fontSize: 13, marginBottom: 10 }}>{geoError}</p>}
            <button className="cta" onClick={requestGeo}>Разрешить доступ</button>
            <button className="cta ghost" style={{ marginTop: 8 }} onClick={() => setAskGeo(false)}>Не сейчас</button>
          </div>
        </div>
      )}

      {/* Нижняя навигационная панель всегда доступна и сбрасывает зависшие экраны */}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}