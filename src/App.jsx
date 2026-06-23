import { useState, useEffect, useRef } from "react";

const DGIS_KEY = "9a637f92-4af5-4ca6-b86a-47cd8459b2f6";

const PLACES = [
    {
        id: 1, name: "Сулайман-Тоо", category: "Природа", emoji: "⛰️", xp: 150, color: "#7C5C3A", bg: "#FFF4E6", locked: false,
        lat: 40.5275, lng: 72.7985,
        tasks: ["Подняться на вершину", "Найти петроглифы", "Сфотографировать закат"]
    },
    {
        id: 2, name: "Базар Джайма", category: "Культура", emoji: "🛒", xp: 80, color: "#2E7D6E", bg: "#E6F7F4", locked: false,
        lat: 40.5233, lng: 72.7969,
        tasks: ["Попробовать самсу", "Найти ряд специй", "Поторговаться"]
    },
    {
        id: 3, name: "Мечеть Равзат", category: "История", emoji: "🕌", xp: 100, color: "#5B4A8A", bg: "#F0ECFB", locked: false,
        lat: 40.5260, lng: 72.7940,
        tasks: ["Изучить архитектуру", "Узнать историю"]
    },
    {
        id: 4, name: "Парк Победы", category: "Природа", emoji: "🌳", xp: 60, color: "#3A7A3A", bg: "#EAF5EA", locked: true,
        lat: 40.5310, lng: 72.8020,
        tasks: ["Найти фонтан", "Познакомиться с местным", "Сделать пикник"]
    },
    {
        id: 5, name: "Река Ак-Буура", category: "Природа", emoji: "🌊", xp: 90, color: "#1A6B9A", bg: "#E6F2FA", locked: true,
        lat: 40.5180, lng: 72.8100,
        tasks: ["Пройти 1 км по берегу", "Найти мост с замками", "Увидеть рассвет"]
    },
    {
        id: 6, name: "Старый город", category: "История", emoji: "🏘️", xp: 120, color: "#9A5A1A", bg: "#FAF2E6", locked: true,
        lat: 40.5290, lng: 72.7910,
        tasks: ["Найти дом 100+ лет", "Попробовать чай в чайхане", "Сфоткать ворота"]
    },
];

const TABS = [
    { id: "home", emoji: "🏠", label: "Главная" },
    { id: "map", emoji: "🗺️", label: "Карта" },
    { id: "community", emoji: "👥", label: "Люди" },
    { id: "profile", emoji: "👤", label: "Профиль" },
];

const STEPS_DATA = [
    { day: "Пн", steps: 3200, cal: 128 },
    { day: "Вт", steps: 5800, cal: 232 },
    { day: "Ср", steps: 2100, cal: 84 },
    { day: "Чт", steps: 7400, cal: 296 },
    { day: "Пт", steps: 4900, cal: 196 },
    { day: "Сб", steps: 9100, cal: 364 },
    { day: "Вс", steps: 6300, cal: 252 },
];

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const VISITED_DAYS = [3, 5, 8, 10, 15, 17, 21, 23];

function MapModal({ place, onClose }) {
    const mapRef = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!mapRef.current) return;
        const script = document.createElement("script");
        script.src = `https://mapgl.2gis.com/api/js/v1`;
        script.onload = () => {
            const map = new window.mapgl.Map(mapRef.current, {
                center: [place.lng, place.lat],
                zoom: 16,
                key: DGIS_KEY,
            });
            new window.mapgl.Marker(map, {
                coordinates: [place.lng, place.lat],
                label: { text: place.name, relativeAnchor: [0.5, 2] },
            });
            setLoaded(true);
        };
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", height: "70vh", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F0EBE3" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 28 }}>{place.emoji}</span>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 17 }}>{place.name}</div>
                            <div style={{ fontSize: 12, color: place.color, fontWeight: 600 }}>{place.category}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "#F0EBE3", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
                <div ref={mapRef} style={{ flex: 1, borderRadius: "0 0 24px 24px", overflow: "hidden", position: "relative" }}>
                    {!loaded && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
                                <div style={{ color: "#888", fontSize: 14 }}>Загружаем карту...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [tab, setTab] = useState("home");
    const [visited, setVisited] = useState({});
    const [completedTasks, setCompletedTasks] = useState({});
    const [totalXP, setTotalXP] = useState(310);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [mapPlace, setMapPlace] = useState(null);
    const [splash, setSplash] = useState(true);
    const [splashExit, setSplashExit] = useState(false);
    const [calMonth, setCalMonth] = useState(5); // June (0-indexed)
    const [calYear, setCalYear] = useState(2026);
    const [selectedDay, setSelectedDay] = useState(null);
    const streak = 3;
    const visitedCount = Object.keys(visited).length;
    const heroSwipeRef = useRef(null);
    const [heroWidget, setHeroWidget] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setSplashExit(true), 2400);
        const t2 = setTimeout(() => setSplash(false), 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    function toggleTask(placeId, taskIdx) {
        const key = `${placeId}-${taskIdx}`;
        const done = completedTasks[key];
        setCompletedTasks(p => ({ ...p, [key]: !done }));
        const place = PLACES.find(p => p.id === placeId);
        const xpPer = Math.floor(place.xp / place.tasks.length);
        setTotalXP(p => p + (done ? -xpPer : xpPer));
        if (!visited[placeId]) setVisited(p => ({ ...p, [placeId]: true }));
    }

    const levelInfo = totalXP < 100 ? { level: 1, title: "Турист", next: 100 }
        : totalXP < 300 ? { level: 2, title: "Путешественник", next: 300 }
            : totalXP < 600 ? { level: 3, title: "Знаток", next: 600 }
                : { level: 4, title: "Легенда Оша", next: 600 };
    const levelProgress = Math.min((totalXP / levelInfo.next) * 100, 100);

    const maxSteps = Math.max(...STEPS_DATA.map(d => d.steps));

    // Calendar helpers
    function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
    function getFirstDay(y, m) {
        let d = new Date(y, m, 1).getDay();
        return d === 0 ? 6 : d - 1; // Monday first
    }

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDay(calYear, calMonth);

    function prevMonth() {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
        setSelectedDay(null);
    }
    function nextMonth() {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
        setSelectedDay(null);
    }

    return (
        <div style={{ fontFamily: "'Segoe UI',sans-serif", background: "#F5F0EB", minHeight: "100vh", maxWidth: 420, margin: "0 auto", position: "relative" }}>

            <style>{`
        @keyframes drop1{0%{transform:translate(-80px,-100px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes drop2{0%{transform:translate(80px,-80px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes drop3{0%{transform:translate(-60px,90px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes drop4{0%{transform:translate(70px,80px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes drop5{0%{transform:translate(0,-120px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes drop6{0%{transform:translate(-100px,20px) scale(0.2);opacity:0}70%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:1}}
        @keyframes titleIn{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes splashOut{0%{opacity:1}100%{opacity:0}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 #E86A2A44}50%{box-shadow:0 0 0 16px #E86A2A00}}
      `}</style>

            {/* SPLASH */}
            {splash && (
                <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#0D0500", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: splashExit ? "splashOut 0.6s ease forwards" : "none" }}>
                    <div style={{ position: "relative", width: 130, height: 130, marginBottom: 36 }}>
                        {[
                            { top: "8%", left: "42%", size: 20, delay: "0s", anim: "drop1" },
                            { top: "15%", left: "8%", size: 16, delay: "0.12s", anim: "drop2" },
                            { top: "60%", left: "2%", size: 14, delay: "0.22s", anim: "drop3" },
                            { top: "65%", left: "58%", size: 18, delay: "0.08s", anim: "drop4" },
                            { top: "30%", left: "68%", size: 22, delay: "0.18s", anim: "drop5" },
                            { top: "38%", left: "28%", size: 48, delay: "0.35s", anim: "drop6" },
                        ].map((d, i) => (
                            <div key={i} style={{ position: "absolute", top: d.top, left: d.left, width: d.size, height: d.size, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: "linear-gradient(135deg,#FF9500,#E86A2A,#C84A0A)", boxShadow: "0 0 12px #E86A2A66", animation: `${d.anim} 0.9s cubic-bezier(.36,1.3,.5,1) ${d.delay} both` }} />
                        ))}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,#E86A2A44,transparent)", animation: "pulse 1.5s ease 0.8s infinite" }} />
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", color: "white", animation: "titleIn 0.7s ease 1.1s both" }}>
                        <span style={{ color: "#E86A2A" }}>OSH</span>{" "}<span style={{ color: "white" }}>EXPLORER</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 10, letterSpacing: 4, textTransform: "uppercase", animation: "titleIn 0.7s ease 1.4s both" }}>ОТКРЫВАЙ СВОЙ ГОРОД</div>
                </div>
            )}

            {/* PLACE TASK MODAL */}
            {selectedPlace && (
                <div onClick={() => setSelectedPlace(null)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", padding: 24, maxHeight: "80vh", overflowY: "auto" }}>
                        <div style={{ width: 40, height: 4, background: "#E0E0E0", borderRadius: 2, margin: "0 auto 20px" }} />
                        <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "center" }}>
                            <div style={{ width: 60, height: 60, borderRadius: 18, background: selectedPlace.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{selectedPlace.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedPlace.name}</div>
                                <div style={{ fontSize: 13, color: selectedPlace.color, fontWeight: 600 }}>{selectedPlace.category} · +{selectedPlace.xp} XP</div>
                            </div>
                            <button onClick={() => { setSelectedPlace(null); setMapPlace(selectedPlace); }} style={{ background: selectedPlace.bg, border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: selectedPlace.color }}>🗺️ Карта</button>
                        </div>
                        {selectedPlace.tasks.map((task, i) => {
                            const done = completedTasks[`${selectedPlace.id}-${i}`];
                            return (
                                <div key={i} onClick={() => toggleTask(selectedPlace.id, i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: done ? selectedPlace.bg : "#F8F8F8", borderRadius: 14, marginBottom: 8, cursor: "pointer", border: `2px solid ${done ? selectedPlace.color : "transparent"}` }}>
                                    <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: done ? selectedPlace.color : "#E0E0E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {done && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
                                    </div>
                                    <span style={{ fontSize: 14, color: done ? selectedPlace.color : "#444", fontWeight: done ? 600 : 400 }}>{task}</span>
                                </div>
                            );
                        })}
                        <button onClick={() => setSelectedPlace(null)} style={{ width: "100%", padding: 14, background: selectedPlace.color, color: "white", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, marginTop: 8, cursor: "pointer" }}>Закрыть</button>
                    </div>
                </div>
            )}

            {/* 2GIS MAP MODAL */}
            {mapPlace && <MapModal place={mapPlace} onClose={() => setMapPlace(null)} />}

            <div style={{ overflowY: "auto", paddingBottom: 80 }}>

                {/* ── HOME ── */}
                {tab === "home" && (
                    <div>
                        {/* Header */}
                        <div style={{ background: "linear-gradient(160deg,#0D0500,#2A1500,#7C3A1A)", padding: "32px 20px 28px" }}>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Понедельник, 23 июня</div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 2 }}>Привет, исследователь 👋</div>
                            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Ош ждёт тебя сегодня</div>
                            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#E86A2A,#D4A03A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 13 }}>{levelInfo.level}</div>
                                        <div>
                                            <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{levelInfo.title}</div>
                                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{totalXP}/{levelInfo.next} XP</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 16 }}>
                                        <div style={{ textAlign: "center" }}><div style={{ color: "#FF6B35", fontWeight: 900, fontSize: 18 }}>🔥{streak}</div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>стрик</div></div>
                                        <div style={{ textAlign: "center" }}><div style={{ color: "#A78BFA", fontWeight: 900, fontSize: 18 }}>📍{visitedCount}</div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>мест</div></div>
                                    </div>
                                </div>
                                <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#E86A2A,#D4A03A)", borderRadius: 4, transition: "width .5s" }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "20px 16px 0" }}>
                            {/* Swipeable widgets */}
                            <div style={{ overflow: "hidden", marginBottom: 20 }}>
                                <div style={{ display: "flex", transition: "transform 0.35s cubic-bezier(.4,0,.2,1)", transform: `translateX(${heroWidget === 0 ? "0" : "-100%"})` }}
                                    onTouchStart={e => { heroSwipeRef.current = e.touches[0].clientX; }}
                                    onTouchEnd={e => {
                                        const diff = heroSwipeRef.current - e.changedTouches[0].clientX;
                                        if (diff > 40) setHeroWidget(1);
                                        if (diff < -40) setHeroWidget(0);
                                    }}>
                                    {/* Widget 1: задание дня */}
                                    <div style={{ minWidth: "100%", background: "linear-gradient(135deg,#E86A2A,#C85A1A)", borderRadius: 20, padding: "18px", display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ fontSize: 40 }}>🌅</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Задание дня</div>
                                            <div style={{ color: "white", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Утренний Ош</div>
                                            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Посети 2 места до 9:00 · +200 XP</div>
                                        </div>
                                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>← смахни</div>
                                    </div>
                                    {/* Widget 2: неделя открытий */}
                                    <div style={{ minWidth: "100%", background: "linear-gradient(135deg,#1A1A2E,#3A2A5A)", borderRadius: 20, padding: "18px", display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ fontSize: 40 }}>🏆</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Испытание недели</div>
                                            <div style={{ color: "white", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Неделя открытий</div>
                                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Посети 5 мест · +500 XP бонус</div>
                                            <div style={{ marginTop: 8, height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(visitedCount / 5) * 100}%`, background: "linear-gradient(90deg,#A78BFA,#7C5CDA)", borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Dots */}
                                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
                                    {[0, 1].map(i => (
                                        <div key={i} onClick={() => setHeroWidget(i)} style={{ width: i === heroWidget ? 16 : 6, height: 6, borderRadius: 3, background: i === heroWidget ? "#E86A2A" : "#D0C8C0", cursor: "pointer", transition: "all .3s" }} />
                                    ))}
                                </div>
                            </div>

                            {/* Steps + Calories chart */}
                            <div style={{ background: "white", borderRadius: 20, padding: "18px 16px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>Активность</div>
                                    <div style={{ fontSize: 12, color: "#888" }}>эта неделя</div>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                    <div style={{ background: "#FFF4E6", borderRadius: 10, padding: "6px 12px" }}>
                                        <span style={{ fontSize: 12, color: "#E86A2A", fontWeight: 700 }}>👟 {STEPS_DATA.reduce((a, d) => a + d.steps, 0).toLocaleString()} шагов</span>
                                    </div>
                                    <div style={{ background: "#FFF0E8", borderRadius: 10, padding: "6px 12px" }}>
                                        <span style={{ fontSize: 12, color: "#C84A0A", fontWeight: 700 }}>🔥 {STEPS_DATA.reduce((a, d) => a + d.cal, 0)} ккал</span>
                                    </div>
                                </div>
                                {/* Bar chart */}
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                                    {STEPS_DATA.map((d, i) => {
                                        const h = Math.round((d.steps / maxSteps) * 72);
                                        const isToday = i === 6;
                                        return (
                                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                <div style={{ fontSize: 9, color: "#E86A2A", fontWeight: 700, opacity: isToday ? 1 : 0 }}>{d.cal}</div>
                                                <div style={{ width: "100%", height: h, background: isToday ? "linear-gradient(180deg,#E86A2A,#D4A03A)" : "#F0EBE3", borderRadius: "4px 4px 0 0", position: "relative", minHeight: 4 }}>
                                                    {isToday && <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#E86A2A" }} />}
                                                </div>
                                                <div style={{ fontSize: 9, color: isToday ? "#E86A2A" : "#AAA", fontWeight: isToday ? 800 : 400 }}>{d.day}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recommended places */}
                            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14, color: "#1A1A1A" }}>Рекомендуем сегодня</div>
                            {PLACES.filter(p => !p.locked).map(place => (
                                <div key={place.id} onClick={() => setSelectedPlace(place)} style={{ background: "white", borderRadius: 20, padding: 16, marginBottom: 12, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: place.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{place.emoji}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: 16 }}>{place.name}</div>
                                            <div style={{ fontSize: 12, color: place.color, fontWeight: 600, marginBottom: 6 }}>{place.category} · +{place.xp} XP</div>
                                            <div style={{ height: 5, background: "#F0F0F0", borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(place.tasks.filter((_, i) => completedTasks[`${place.id}-${i}`]).length / place.tasks.length) * 100}%`, background: place.color, borderRadius: 3, transition: "width .5s" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── MAP ── */}
                {tab === "map" && (
                    <div style={{ padding: "20px 16px" }}>
                        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 4 }}>Карта Оша</div>
                        <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Нажми на место чтобы открыть карту</div>
                        {PLACES.map((place, i) => {
                            const isVisited = visited[place.id];
                            const isLeft = i % 2 === 0;
                            return (
                                <div key={place.id} style={{ display: "flex", flexDirection: isLeft ? "row" : "row-reverse", alignItems: "center", marginBottom: 40, position: "relative" }}>
                                    {i < PLACES.length - 1 && <div style={{ position: "absolute", [isLeft ? "left" : "right"]: 38, top: 80, width: 3, height: 56, background: isVisited ? place.color : "#E0D8D0", borderRadius: 2, zIndex: 0 }} />}
                                    <div onClick={() => !place.locked && setMapPlace(place)} style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0, background: place.locked ? "#E8E0D8" : isVisited ? `linear-gradient(135deg,${place.color},${place.color}BB)` : "white", border: `3px solid ${place.locked ? "#D0C8C0" : place.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: place.locked ? 22 : 34, cursor: place.locked ? "default" : "pointer", filter: place.locked ? "grayscale(1) opacity(0.5)" : "none", zIndex: 1, position: "relative", boxShadow: !place.locked ? `0 4px 16px ${place.color}44` : "none" }}>
                                        {place.locked ? "🔒" : place.emoji}
                                        {isVisited && <div style={{ position: "absolute", top: -4, right: -4, background: "#22C55E", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, border: "2px solid white" }}>✓</div>}
                                    </div>
                                    <div style={{ flex: 1, margin: isLeft ? "0 0 0 16px" : "0 16px 0 0", background: "white", borderRadius: 16, padding: "12px 14px", opacity: place.locked ? 0.5 : 1, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>{place.name}</div>
                                        <div style={{ fontSize: 11, color: place.locked ? "#aaa" : place.color, fontWeight: 600, marginTop: 2 }}>{place.locked ? "Закрыто" : `+${place.xp} XP · ${place.category}`}</div>
                                        {!place.locked && <div onClick={e => { e.stopPropagation(); setSelectedPlace(place); }} style={{ marginTop: 6, fontSize: 11, color: "#888", textDecoration: "underline", cursor: "pointer" }}>задания →</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── COMMUNITY ── */}
                {tab === "community" && (
                    <div style={{ padding: "20px 16px" }}>
                        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 4 }}>Сообщество</div>
                        <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Что исследуют другие</div>
                        <div style={{ background: "linear-gradient(135deg,#0D0500,#2A1500)", borderRadius: 20, padding: 18, marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6 }}>Испытание недели</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: 4 }}>🔥 Неделя открытий</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Посети 5 мест — получи +500 XP бонус</div>
                        </div>
                        {[
                            { user: "Айгерим", avatar: "👩", place: "Сулайман-Тоо", emoji: "⛰️", likes: 14, color: "#7C5C3A", time: "2 часа назад" },
                            { user: "Бакыт", avatar: "👦", place: "Базар Джайма", emoji: "🛒", likes: 8, color: "#2E7D6E", time: "5 часов назад" },
                            { user: "Нурзат", avatar: "👩", place: "Мечеть Равзат", emoji: "🕌", likes: 21, color: "#5B4A8A", time: "вчера" },
                            { user: "Эрлан", avatar: "👦", place: "Старый город", emoji: "🏘️", likes: 6, color: "#9A5A1A", time: "вчера" },
                        ].map((post, idx) => (
                            <div key={idx} style={{ background: "white", borderRadius: 20, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ height: 160, background: `linear-gradient(160deg,${post.color}22,${post.color}77)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
                                    {post.emoji}
                                    <div style={{ position: "absolute", bottom: 10, left: 12, background: "rgba(0,0,0,0.45)", borderRadius: 10, padding: "4px 10px", color: "white", fontSize: 11, fontWeight: 600 }}>{post.place}</div>
                                </div>
                                <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ fontSize: 26 }}>{post.avatar}</div>
                                        <div><div style={{ fontWeight: 700, fontSize: 14 }}>{post.user}</div><div style={{ fontSize: 11, color: "#888" }}>{post.time}</div></div>
                                    </div>
                                    <div style={{ color: "#888", fontWeight: 700, fontSize: 13 }}>🤍 {post.likes}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── PROFILE ── */}
                {tab === "profile" && (
                    <div>
                        <div style={{ background: "linear-gradient(160deg,#0D0500,#2A1500,#3A2A5A)", padding: "28px 20px 24px", textAlign: "center" }}>
                            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#E86A2A,#5B4A8A)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 0 24px #E86A2A55" }}>🧭</div>
                            <div style={{ fontWeight: 900, fontSize: 22, color: "white", marginBottom: 2 }}>Исследователь</div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>Уровень {levelInfo.level} · {levelInfo.title}</div>
                            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>до следующего уровня</span>
                                    <span style={{ fontSize: 12, color: "#E86A2A", fontWeight: 700 }}>{levelInfo.next - totalXP} XP</span>
                                </div>
                                <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#E86A2A,#D4A03A)", borderRadius: 4 }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "20px 16px 0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                                {[{ emoji: "📍", value: visitedCount, label: "Мест" }, { emoji: "⚡", value: totalXP, label: "XP" }, { emoji: "🔥", value: streak, label: "Стрик" }].map(s => (
                                    <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "14px 10px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                                        <div style={{ fontSize: 24 }}>{s.emoji}</div>
                                        <div style={{ fontWeight: 900, fontSize: 22, color: "#1A1A1A" }}>{s.value}</div>
                                        <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* FULL CALENDAR */}
                            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12, color: "#1A1A1A" }}>Мои прогулки</div>
                            <div style={{ background: "white", borderRadius: 20, padding: 16, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                {/* Month nav */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <button onClick={prevMonth} style={{ background: "#F0EBE3", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>‹</button>
                                    <div style={{ fontWeight: 800, fontSize: 15 }}>{MONTHS[calMonth]} {calYear}</div>
                                    <button onClick={nextMonth} style={{ background: "#F0EBE3", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>›</button>
                                </div>
                                {/* Weekday headers */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
                                    {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => (
                                        <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: i >= 5 ? "#E86A2A" : "#888", paddingBottom: 6 }}>{d}</div>
                                    ))}
                                </div>
                                {/* Days grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                        const isWeekend = ((day + firstDay - 1) % 7) >= 5;
                                        const hasVisit = VISITED_DAYS.includes(day) && calMonth === 5 && calYear === 2026;
                                        const isSelected = selectedDay === day;
                                        const isToday = day === 23 && calMonth === 5 && calYear === 2026;
                                        return (
                                            <div key={day} onClick={() => hasVisit && setSelectedDay(isSelected ? null : day)} style={{
                                                aspectRatio: "1", borderRadius: 10,
                                                background: hasVisit ? "linear-gradient(135deg,#E86A2A,#D4A03A)" : isToday ? "#F0EBE3" : "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12,
                                                fontWeight: isToday || hasVisit ? 800 : 400,
                                                color: hasVisit ? "white" : isWeekend ? "#E86A2A" : isToday ? "#E86A2A" : "#333",
                                                cursor: hasVisit ? "pointer" : "default",
                                                border: isToday && !hasVisit ? "2px solid #E86A2A" : isSelected ? "2px solid #E86A2A" : "2px solid transparent",
                                            }}>
                                                {hasVisit ? "⛰️" : day}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Selected day detail */}
                                {selectedDay && (
                                    <div style={{ marginTop: 12, background: "#FFF4E6", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ fontSize: 28 }}>⛰️</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>Сулайман-Тоо</div>
                                            <div style={{ fontSize: 11, color: "#888" }}>{selectedDay} {MONTHS[calMonth]} · +150 XP · 📸 Фото сохранено</div>
                                        </div>
                                        <button onClick={() => setSelectedDay(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#AAA", fontSize: 16, cursor: "pointer" }}>✕</button>
                                    </div>
                                )}
                                <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 11, color: "#888" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(135deg,#E86A2A,#D4A03A)" }} />посещение</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, border: "2px solid #E86A2A" }} />сегодня</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#E86A2A" }}>Сб/Вс = выходные</div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12, color: "#1A1A1A" }}>Настройки</div>
                            <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                {["🔔 Уведомления", "🌐 Язык", "🔒 Приватность", "❓ Помощь", "⭐ Оценить приложение"].map((item, i, arr) => (
                                    <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: i < arr.length - 1 ? "1px solid #F5F0EB" : "none", cursor: "pointer" }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item}</span>
                                        <span style={{ color: "#CCC", fontSize: 18 }}>›</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM NAV */}
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "white", boxShadow: "0 -4px 24px rgba(0,0,0,0.1)", display: "flex", borderTop: "1px solid #F0EBE3", zIndex: 40 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 8px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span style={{ fontSize: 22 }}>{t.emoji}</span>
                        <span style={{ fontSize: 10, fontWeight: tab === t.id ? 800 : 400, color: tab === t.id ? "#E86A2A" : "#888" }}>{t.label}</span>
                        {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#E86A2A" }} />}
                    </button>
                ))}
            </div>
        </div>
    );
}