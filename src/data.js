import { Sparkles, Hand, Compass, UtensilsCrossed, Landmark, Mountain } from "lucide-react";
export const CITY = { name: "Ош", lat: 40.5283, lng: 72.7985 };

export const CATEGORIES = [
  { id: "all", label: "Все", Icon: Sparkles },
  { id: "practices", label: "Практики", Icon: Hand },
  { id: "tours", label: "Экскурсии", Icon: Compass },
  { id: "food", label: "Еда", Icon: UtensilsCrossed },
  { id: "culture", label: "Культура", Icon: Landmark },
  { id: "nature", label: "Природа", Icon: Mountain },
];

export const EXPERIENCES = [
  {
    id: "pottery",
    title: "Гончарная практика: пиала своими руками",
    category: "practices",
    type: "Мастер-класс",
    place: "Мастерская Старого города",
    duration: "2 часа",
    rating: 4.9,
    reviews: 186,
    price: 18,
    badge: "Практика",
    lang: "RU · KY",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&q=80",
    lat: 40.5294,
    lng: 72.7918,
    freeCancel: true,
    group: "до 8 человек",
    meeting: "Мастерская на ул. Курманжан Датка",
    description: "Местный гончар покажет, как крутить пиалу на круге. Вы унесёте своё изделие — практика, а не лекция.",
    highlights: ["Работа за гончарным кругом", "История ошской керамики", "Изделие с собой"],
    includes: ["Глина и обжиг", "Фартук", "Чай"],
  },
  {
    id: "cooking",
    title: "Кулинарная практика: самса и лагман",
    category: "food",
    type: "Мастер-класс",
    place: "Дом у Джаймы",
    duration: "3 часа",
    rating: 4.8,
    reviews: 412,
    price: 29,
    badge: "Практика",
    lang: "RU · EN",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80",
    lat: 40.5238,
    lng: 72.7974,
    freeCancel: true,
    group: "до 10 человек",
    meeting: "Вход на Базар Джайма, южные ворота",
    description: "Готовите с семьёй повара: тесто, начинка, лагман. Потом едите то, что сделали сами, на дворике.",
    highlights: ["Готовите сами, не смотрите со стороны", "Рецепты с собой", "Обед включён"],
    includes: ["Продукты", "Обед и чай", "Рецепты PDF"],
  },
  {
    id: "photo-walk",
    title: "Фотопрактика: золотой час в Старом городе",
    category: "practices",
    type: "Практика",
    place: "Старый город",
    duration: "2.5 часа",
    rating: 4.7,
    reviews: 98,
    price: 16,
    badge: "Практика",
    lang: "RU · EN",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80",
    lat: 40.529,
    lng: 72.791,
    freeCancel: true,
    group: "до 6 человек",
    meeting: "Площадь у южных ворот",
    description: "Короткий маршрут с фотографом: свет, кадр, люди на улице. Телефон или камера — без разницы.",
    highlights: ["Разбор 10 ваших кадров", "Точки с лучшим светом", "Малая группа"],
    includes: ["Гид-фотограф", "Маршрут", "Заметки по съёмке"],
  },
  {
    id: "sulaiman",
    title: "Восход на Сулайман-Тоо с местным гидом",
    category: "tours",
    type: "Экскурсия",
    place: "Сулайман-Тоо",
    duration: "3 часа",
    rating: 4.9,
    reviews: 1284,
    price: 22,
    badge: "Хит продаж",
    lang: "RU · EN · KY",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
    lat: 40.5275,
    lng: 72.7985,
    freeCancel: true,
    group: "до 12 человек",
    meeting: "Главный вход на Сулайман-Тоо",
    description: "Подъём до рассвета, пещеры, петроглифы и вид на Ферганскую долину. Гиды — из Оша, не приезжие шаблоны.",
    highlights: ["Священная гора ЮНЕСКО", "Рассвет над долиной", "Истории паломников"],
    includes: ["Лицензированный гид", "Входной билет", "Вода"],
  },
  {
    id: "bazaar",
    title: "Джайма: рынок с дегустацией специй",
    category: "food",
    type: "Гастротур",
    place: "Базар Джайма",
    duration: "2 часа",
    rating: 4.8,
    reviews: 756,
    price: 19,
    badge: "Рядом с центром",
    lang: "RU · EN",
    image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=900&q=80",
    lat: 40.5233,
    lng: 72.7969,
    freeCancel: true,
    group: "до 8 человек",
    meeting: "Главные ворота базара Джайма",
    description: "Самса, курут, халва, ряды специй. Гид научит торговаться и не брать туристическую наценку.",
    highlights: ["5 дегустаций", "Как выбирать сухофрукты", "Скрытые ряды"],
    includes: ["Гид", "Дегустации", "Чай в чайхане"],
  },
  {
    id: "mosque",
    title: "Мечеть Равзат и исламская архитектура Оша",
    category: "culture",
    type: "Экскурсия",
    place: "Мечеть Равзат",
    duration: "1.5 часа",
    rating: 4.6,
    reviews: 321,
    price: 12,
    badge: null,
    lang: "RU · KY",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615b405?w=900&q=80",
    lat: 40.526,
    lng: 72.794,
    freeCancel: true,
    group: "до 15 человек",
    meeting: "Площадь перед мечетью Равзат",
    description: "Спокойный маршрут по архитектуре и этикету. Платок для женщин выдаём на месте.",
    highlights: ["Архитектура и орнамент", "Правила посещения", "Коротко и по делу"],
    includes: ["Гид", "Платок при необходимости"],
  },
  {
    id: "akbuura",
    title: "Рассветная прогулка вдоль Ак-Бууры",
    category: "nature",
    type: "Прогулка",
    place: "Река Ак-Буура",
    duration: "2 часа",
    rating: 4.7,
    reviews: 204,
    price: 14,
    badge: "На свежем воздухе",
    lang: "RU",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=900&q=80",
    lat: 40.518,
    lng: 72.81,
    freeCancel: true,
    group: "до 10 человек",
    meeting: "Мост у парка",
    description: "Тихий маршрут по берегу: мосты, птицы, утро города. Подходит, если не хотите крутой подъём.",
    highlights: ["Ровный маршрут", "Фото у реки", "Местный завтрак-опция"],
    includes: ["Гид", "Маршрут 3 км"],
  },
  {
    id: "oldtown",
    title: "Пеший гид по Старому городу",
    category: "tours",
    type: "Экскурсия",
    place: "Старый город",
    duration: "2.5 часа",
    rating: 4.8,
    reviews: 540,
    price: 17,
    badge: "Бесплатная отмена",
    lang: "RU · EN",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=900&q=80",
    lat: 40.5288,
    lng: 72.7905,
    freeCancel: true,
    group: "до 12 человек",
    meeting: "Чайхана у восточных ворот",
    description: "Дворы, дома старше века, чайхана. Гиды рассказывают семейные истории, а не википедию.",
    highlights: ["Жилые дворы", "Чай в конце", "Малые группы"],
    includes: ["Гид", "Чай"],
  },
];

export const ATTRACTIONS = [
  { id: "a1", name: "Сулайман-Тоо", hint: "Гора ЮНЕСКО", lat: 40.5275, lng: 72.7985, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80" },
  { id: "a2", name: "Базар Джайма", hint: "Один из старейших базаров", lat: 40.5233, lng: 72.7969, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80" },
  { id: "a3", name: "Мечеть Равзат", hint: "Главная мечеть города", lat: 40.526, lng: 72.794, image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80" },
];

let leafletPromise = null;

export function loadLeaflet() {
  if (typeof window !== "undefined" && window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const css = document.createElement("link");
      css.id = cssId;
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.addEventListener("load", () => {
      const L = window.L;
      if (!L) {
        reject(new Error("Leaflet не загрузился"));
        return;
      }
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      resolve(L);
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Leaflet script error")), { once: true });
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export function upcomingDates(count = 8) {
  const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      label: i === 0 ? "Сегодня" : i === 1 ? "Завтра" : days[d.getDay()],
      num: d.getDate(),
    });
  }
  return out;
}

export function makeCode() {
  return `OSH-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-3)}`;
}
