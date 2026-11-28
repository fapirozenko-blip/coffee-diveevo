"use strict";

const spreadsheetId = "1xJno03epbyJtxuAWT6uYdtIqZ1eaveS4Z5aMZHIgGbk";
const spreadsheetBase = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
const cacheKey = `coffee-diveevo:${spreadsheetId}:v5`;
const sheets = {
  menu: {
    name: "Меню",
    gid: 101,
    columns: ["Категория", "Название", "Описание", "Объем", "Цена", "Теги", "Фото", "Наличие", "Блюдо дня"],
    required: ["Название", "Наличие"],
    important: ["Цена", "Объем", "Категория", "Блюдо дня"]
  },
  promos: { name: "Акции", gid: 103, columns: ["Заголовок", "Текст", "Активно", "Фото"], required: ["Заголовок", "Текст", "Активно"] },
  settings: { name: "Настройки", gid: 104, columns: ["Параметр", "Значение"] },
  gallery: { name: "Галерея", gid: 201, columns: ["Фото", "Подпись", "Активно", "Порядок"], required: ["Фото", "Активно"] },
  amenities: { name: "Удобства", gid: 202, columns: ["Название", "Активно"] },
  sections: { name: "Разделы", gid: 203, columns: ["Раздел", "Активно", "Порядок"], required: ["Раздел", "Активно"] },
  exceptions: {
    name: "Расписание",
    gid: 204,
    columns: ["Дата исключения (ГГГГ-ММ-ДД)", "Открытие (ЧЧ:ММ)", "Закрытие (ЧЧ:ММ)", "Закрыто весь день", "Комментарий"],
    required: ["Дата исключения (ГГГГ-ММ-ДД)", "Открытие (ЧЧ:ММ)", "Закрытие (ЧЧ:ММ)", "Закрыто весь день"]
  }
};
const starterRows = {
  menu: [
    ["Кофе","Эспрессо","Классический насыщенный шот спешелти-кофе","60 мл","200","постное","","Да"],
    ["Кофе","Американо","Эспрессо с горячей водой","200 / 300 мл","200 / 280","постное","","Да"],
    ["Кофе","Капучино","Классический баланс эспрессо и взбитого молока","250 / 350 мл","250 / 330","хит","","Да"],
    ["Кофе","Латте","Нежный молочный напиток на основе эспрессо","250 / 350 мл","250 / 330","","./images/latte.webp","Да"],
    ["Кофе","Флэт Уайт","Двойной эспрессо с тонким слоем бархатистого молока","200 / 300 мл","280 / 330","","","Да"],
    ["Кофе","Раф классический","Сливочный кофейный напиток с ванильным сахаром","300 мл","350","","","Да"],
    ["Холодные напитки","Айс-латте","Освежающий холодный латте со льдом","350 мл","330","","","Да"],
    ["Холодные напитки","Бамбл кофе","Эспрессо со свежевыжатым апельсиновым соком и карамелью","350 мл","380","постное, хит","","Да"],
    ["Кофе","Арахисовый раф","Авторский сливочный раф с натуральной арахисовой пастой","300 мл","370","хит","","Да"],
    ["Кофе","Сырный раф","Нежный раф с творожным сыром и сливочным послевкусием","300 мл","390","","","Да"],
    ["Кофе","Фисташковый раф","Фирменный раф с насыщенной фисташковой пастой","300 мл","420","хит","","Да"],
    ["Чай и другие напитки","Матча-латте","Японский зелёный чай матча со взбитым молоком","300 мл","280","без сахара","","Да"],
    ["Чай и другие напитки","Какао","Горячий шоколадный напиток на молоке","250 / 350 мл","200 / 250","","","Да"],
    ["Чай и другие напитки","Цикорий","Мягкий напиток без кофеина","300 мл","230","постное, без кофеина","","Да"],
    ["Холодные напитки","Морс ягодный","Домашний освежающий морс из лесных ягод","250 мл","250","постное","","Да"],
    ["Холодные напитки","Лимонад","Авторский освежающий лимонад","400 мл","280","постное","","Да"],
    ["Чай и другие напитки","Чай листовой","Ароматный заварной чай на выбор","300 / 500 мл","180 / 250","постное","","Да"],
    ["Добавки","Альтернативное молоко","Кокосовое, миндальное, банановое или овсяное","порция","50 / 70","постное, альт. молоко","","Да"],
    ["Добавки","Сироп в напиток","Большой выбор вкусов на баре","20 мл","30","","","Да"],
    ["Добавки","Маршмеллоу","Воздушный зефир для кофе или какао","порция","40","","","Да"],
    ["Завтраки","Вафля с фруктами","Хрустящая венская вафля со свежими сезонными фруктами","1 порция","330","","./images/waffle.webp","Да"],
    ["Завтраки","Запеканка творожная","Нежная домашняя запеканка из фермерского творога","1 порция","320","","","Да"],
    ["Завтраки","Вафля картофельная","Сытная картофельная вафля с соусом","1 порция","400","","","Да"],
    ["Завтраки","Наггетсы куриные","Хрустящие куриные наггетсы","8 шт","250","","","Да"],
    ["Завтраки","Драники картофельные","Румяные драники со сметаной","3 шт","300","можно постное","","Да"],
    ["Завтраки","Блины с мясом","Домашние тонкие блинчики с сочной мясной начинкой","2 шт","300","","","Да"],
    ["Завтраки","Блины с творогом","Тонкие блинчики с нежным творогом","2 шт","280","","","Да"],
    ["Завтраки","Блины с малиной","Сладкие блинчики с ароматной малиной","2 шт","330","","","Да"],
    ["Завтраки","Блины с яблоком и корицей","Тёплые блинчики с карамелизированным яблоком и корицей","2 шт","330","","","Да"],
    ["Основные блюда","Суп дня","Актуальный домашний суп — уточняйте в блоке витрины дня","300 мл","300","можно постное","","Да"],
    ["Основные блюда","Паста Карбонара","Классическая паста со сливочным соусом, беконом и пармезаном","300 г","470","","","Да"],
    ["Основные блюда","Плов с индейкой","Рассыпчатый ароматный плов с нежным филе индейки","300 г","420","","","Да"],
    ["Основные блюда","Цезарь с курицей","Листья салата, соус Цезарь, куриное филе, гренки и пармезан","250 г","520","","","Да"],
    ["Основные блюда","Цезарь с креветками","Листья салата, соус Цезарь, тигровые креветки, гренки и пармезан","250 г","560","","","Да"],
    ["Основные блюда","Оливье","Классический домашний салат","200 г","360","","","Да"],
    ["Основные блюда","Винегрет","Овощной салат с ароматным маслом","200 г","300","постное","","Да"],
    ["Десерты","Венская вафля","С мороженым пломбир и топпингом на выбор","1 порция","330","","","Да"],
    ["Десерты","Мороженое","Два шарика сливочного пломбира с топпингом","2 шарика","330","","","Да"],
    ["Холодные напитки","Молочный коктейль","Ванильный, шоколадный или клубничный","400 мл","300","","","Да"]
  ],
  promos: [
    ["Завтраки весь день","Подаём горячие вафли, сырники и блинчики с открытия и до самого закрытия","Да",""],
    ["Постное меню","Многие блюда и напитки на альтернативном молоке приготовим в постном варианте — просто скажите бариста","Да",""]
  ],
  settings: [
    ["Название","Кофейня"],
    ["Слоган","То самое место, где хорошо"],
    ["Подзаголовок","Спешелти-кофе, завтраки весь день и уютные обеды в Дивеево"],
    ["Заголовок о нас","Уютная кофейня с характером и теплом"],
    ["Текст о нас","Мы создали пространство в Дивеево, куда приятно зайти после прогулки или перед дорогой: завариваем свежий спешелти-кофе, готовим авторские рафы, сытные завтраки весь день и домашние обеды. У нас светлый зал с живой зеленью, удобные столики с розетками у каждого места и витрина со свежими десертами."],
    ["Режим Пн-Пт","08:00 - 21:00"],
    ["Режим Сб-Вс","09:00 - 21:00"],
    ["Особый режим",""],
    ["Адрес","с. Дивеево, Нижегородская область"],
    ["Телефон","+7 (900) 000-00-00"],
    ["Telegram","https://t.me/"],
    ["VK","https://vk.com/"],
    ["Удобства","Wi-Fi, Розетки у столиков, Завтраки весь день, Постные блюда, Можно с питомцами"],
    ["Фото главного экрана","https://drive.google.com/thumbnail?id=1AVVGoa2bB2fn6A6CksC97ttGlriiQ9ZZ&sz=w1600"],
    ["Фото интерьера 1","https://drive.google.com/thumbnail?id=1yrI2Dg_Wciodi1_EMPETILH9gJObUpJU&sz=w1600"],
    ["Фото интерьера 2","https://drive.google.com/thumbnail?id=1N3jUIoX1Qy1Xthx-gYfOpze4fcm3f3rQ&sz=w1600"],
    ["Фото интерьера 3","https://drive.google.com/thumbnail?id=1UZdrNSm5Bq0X5iuj4rnZUim32Nzs37id&sz=w1600"]
  ],
  gallery: [
    ["https://drive.google.com/thumbnail?id=1yrI2Dg_Wciodi1_EMPETILH9gJObUpJU&sz=w1600","Солнечный зал","True","1"],
    ["https://drive.google.com/thumbnail?id=1N3jUIoX1Qy1Xthx-gYfOpze4fcm3f3rQ&sz=w1600","Барная стойка","True","2"],
    ["https://drive.google.com/thumbnail?id=1UZdrNSm5Bq0X5iuj4rnZUim32Nzs37id&sz=w1600","Уютный уголок","True","3"],
    ["https://drive.google.com/thumbnail?id=1-pIK_mkGriKWDVu1eK6Fw_gEXSTbyU_J&sz=w1600","Кофе с собой","True","4"],
    ["https://drive.google.com/thumbnail?id=1fq58-l5lZLtlMrhykVQZhZjIEor1uHXX&sz=w1600","Кофе и десерт","True","5"],
    ["https://drive.google.com/thumbnail?id=1fgSbmxxkrH6ZE_7qg7HuqbA3k-UkNUNv&sz=w1600","Витрина","True","6"],
    ["https://drive.google.com/thumbnail?id=1-jPbSdcPgq3kegO4sT_voS1-J7ModO7S&sz=w1600","Вход в кофейню","True","7"]
  ],
  amenities: [["Wi-Fi","True"],["Розетки у столиков","True"],["Завтраки весь день","True"],["Постные блюда","True"],["Можно с питомцами","True"]],
  sections: [["Акции","True","1"],["Витрина","True","2"],["Меню","True","3"],["О нас","True","4"],["Контакты","True","5"]],
  exceptions: []
};

// Витрина управляется единственным флажком в листе «Меню».
starterRows.menu = starterRows.menu.map((row) => {
  const item = [...row, "Нет"];
  if (item[1] === "Суп дня") {
    item[1] = "Овощной крем-суп с гренками";
    item[2] = "Готовим каждое утро из свежих овощей (можно постный вариант)";
    item[3] = "300 мл";
    item[4] = "300";
    item[6] = "./images/showcase-soup.svg";
    item[8] = "Да";
  }
  return item;
});
starterRows.menu.push(
  ["Десерты", "Чизкейк Нью-Йорк", "Классический сливочный чизкейк на песочной основе", "1 порция", "290", "", "./images/showcase-cheesecake.svg", "Да", "Да"],
  ["Десерты", "Медовик домашний", "Тонкие медовые коржи со сметанным кремом", "1 порция", "270", "", "./images/showcase-honey-cake.svg", "Да", "Да"]
);

const $ = (id) => document.getElementById(id);
const clean = (value) => String(value ?? "").trim();
const key = (value) => clean(value).toLowerCase().replace(/ё/g, "е").replace(/[‐‑‒–—−]/g, "-").replace(/\s+/g, " ");
const splitList = (value) => clean(value).split(/[,;|\n]+/).map(clean).filter(Boolean);
const isYes = (value) => ["да", "true", "1"].includes(key(value));
let filters = ["Все"]; 
let searchText = "";

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

function httpUrl(value) {
  try {
    const url = new URL(clean(value));
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function serviceUrl(value, host, path) {
  const url = httpUrl(value);
  return url?.protocol === "https:" && !url.port && host.test(url.hostname) && path.test(url.pathname) ? url : null;
}

function imageUrl(value) {
  const path = clean(value);
  const localPath = /^\.\/images\/[\w.-]+\.(?:webp|svg|png)$/i;
  if (localPath.test(path)) return new URL(path, document.baseURI);

  const url = httpUrl(path);
  if (url?.hostname === "fapirozenko-blip.github.io") {
    const relativePath = url.pathname.replace(/^\/coffee-diveevo\/preview\//, "./");
    if (localPath.test(relativePath)) return new URL(relativePath, document.baseURI);
  }
  return url;
}

function records(kind, rows) {
  return rows.map((row) => Object.fromEntries(sheets[kind].columns.map((label, index) => [label, clean(row[index])])));
}

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey));
    return Object.fromEntries(Object.keys(sheets).filter((kind) => {
      return Array.isArray(saved?.[kind]) && saved[kind].every((row) => Array.isArray(row) && row.every((value) => typeof value === "string"));
    }).map((kind) => [kind, saved[kind]]));
  } catch {
    return {};
  }
}

const cachedRows = readCache();
const rows = { ...starterRows, ...cachedRows };
const demo = Object.fromEntries(Object.keys(sheets).map((kind) => [kind, !(kind in cachedRows)]));

function parseCsv(text) {
  const csv = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  // Читаем поле вместе с разделителем, чтобы сохранить переносы строк внутри кавычек.
  const field = /("(?:[^"]|"")*"|[^",\r\n]*)(,|\r\n|\n|\r|$)/y;
  while (true) {
    const match = field.exec(csv);
    if (!match) throw new Error("Некорректный CSV");
    const [, value, separator] = match;
    row.push(value.startsWith('"') ? value.slice(1, -1).replaceAll('""', '"') : value);
    if (separator === ",") continue;
    rows.push(row);
    if (!separator || field.lastIndex === csv.length) return rows;
    row = [];
  }
}

function parseGviz(text) {
  const response = text.trim();
  if (response.startsWith("{")) return JSON.parse(response);
  const match = response.match(/^(?:\/\*[\s\S]*?\*\/\s*)?google\.visualization\.Query\.setResponse\(([\s\S]*)\)\s*;?$/);
  if (!match) throw new Error("Неожиданный ответ Google Sheets");
  return JSON.parse(match[1]);
}

async function fetchSheetText(path, params, contentType, timeoutMs = 8000) {
  const url = new URL(spreadsheetBase + path);
  url.search = new URLSearchParams(params);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit", cache: "no-cache" });
    if (!response.ok) throw new Error(`Google Sheets: ${response.status}`);
    if (!contentType.test(response.headers.get("content-type") || "")) {
      throw new Error("Google Sheets вернул данные в неожиданном формате");
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function cellText(cell) {
  return clean(cell?.f) || clean(cell?.v);
}

async function restoreUnformattedPrices(items) {
  const missing = items.filter((item) => isYes(item["Наличие"]) && item["Название"] && !item["Цена"]);
  if (!missing.length) return;
  try {
    // CSV сохраняет смешанные типы. GViz нужен только для ячеек, где CSV не дал отображаемого текста.
    const text = await fetchSheetText("/gviz/tq", { gid: sheets.menu.gid, tqx: "out:json", headers: "1" }, /(?:javascript|json)\b/i, 3500);
    const table = parseGviz(text)?.table;
    if (!Array.isArray(table?.rows)) throw new Error("Google Sheets не вернул строки");
    const headers = table.cols.map((column) => key(column.label));
    const nameIndex = headers.indexOf(key("Название"));
    const priceIndex = headers.indexOf(key("Цена"));
    if (nameIndex < 0 || priceIndex < 0) return;

    const source = new Map();
    for (const { c } of table.rows) {
      const name = cellText(c?.[nameIndex]);
      // Одинаковые названия нельзя надёжно сопоставить при чтении двух разных выгрузок.
      source.set(name, source.has(name) ? "" : cellText(c?.[priceIndex]));
    }
    const counts = new Map();
    for (const item of items) counts.set(item["Название"], (counts.get(item["Название"]) || 0) + 1);
    for (const item of missing) {
      const name = item["Название"];
      if (counts.get(name) === 1) item["Цена"] = source.get(name) || "";
    }
  } catch (error) {
    console.warn("Меню: исходные значения пустых цен недоступны", error.message);
  }
}

async function loadSheet(kind) {
  const { name, gid, columns, required = columns, important = [] } = sheets[kind];
  const text = await fetchSheetText("/export", { format: "csv", gid }, /^text\/csv\b/i);
  const [header, ...data] = parseCsv(text);
  const labels = header.map(key);
  const missingRequired = required.filter((label) => !labels.includes(key(label)));
  if (missingRequired.length) throw new Error(`Отсутствуют обязательные столбцы: ${missingRequired.join(", ")}`);
  const missingImportant = important.filter((label) => !labels.includes(key(label)));
  if (missingImportant.length) console.warn(`Лист «${name}»: отсутствуют важные столбцы: ${missingImportant.join(", ")}`);

  const indexes = columns.map((label) => labels.indexOf(key(label)));
  const result = data.map((row) => indexes.map((index) => clean(row[index]))).filter((row) => row.some(Boolean));
  if (kind !== "menu" || missingImportant.includes("Цена")) return result;

  const items = records(kind, result);
  await restoreUnformattedPrices(items);
  reportMenuPrices(items);
  return items.map((item) => columns.map((label) => item[label]));
}

const defaultSettings = Object.fromEntries(starterRows.settings.map(([name, value]) => [key(name), value]));
let settings = new Map();
let menu = [];
let selectedCategory = "";
let selectedTag = filters[0];

function setting(...names) {
  for (const name of names) {
    const value = settings.get(key(name));
    if (value) return value;
  }
  return "";
}

function settingOrDefault(...names) {
  return setting(...names) || defaultSettings[key(names[0])] || "";
}

function settingEnabled(name) {
  return !["нет", "false", "0"].includes(key(setting(name)));
}

const currencySuffix = /\s*(?:₽|руб\.?|RUB)$/i;

function isNumericPrice(value) {
  return /^(?:\d+|\d{1,3}(?:\s\d{3})+)(?:[.,]\d+)?$/.test(value.replace(currencySuffix, ""));
}

function reportMenuPrices(items) {
  for (const item of items) {
    const name = item["Название"];
    if (!name || !isYes(item["Наличие"])) continue;
    const price = item["Цена"];
    const prices = price.split(/\s*\/\s*/);
    if (!price) {
      console.warn(`Меню: отсутствует цена у позиции «${name}»`);
    } else if (!prices.every(isNumericPrice)) {
      console.warn(`Меню: нестандартный формат цены у позиции «${name}»`);
    } else if (prices.length > 1) {
      const volumes = item["Объем"].split(/\s*\/\s*/);
      if (volumes.length !== prices.length || !volumes.every(Boolean)) {
        console.warn(`Меню: число цен и объёмов не совпадает у позиции «${name}»`);
      }
    }
  }
}

function rubles(price) {
  if (!price.split(/\s*\/\s*/).every(isNumericPrice) || currencySuffix.test(price)) return price;
  return `${price} ₽`;
}

function addText(parent, tag, className, content) {
  if (content) parent.append(node(tag, className, content));
}

function galleryArrow(direction, onClick) {
  const button = node("button", "gallery-arrow");
  button.type = "button";
  button.setAttribute("aria-label", direction < 0 ? "Предыдущее фото" : "Следующее фото");
  button.innerHTML = direction < 0
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  button.addEventListener("click", () => onClick(direction));
  return button;
}

function swipeDirection(start, end) {
  if (!start || !end) return 0;
  const dx = end.clientX - start.clientX;
  const dy = end.clientY - start.clientY;
  return Math.abs(dx) > Math.max(45, Math.abs(dy)) ? (dx < 0 ? 1 : -1) : 0;
}

function addImage(parent, url, alt, options = {}) {
  const image = node("img");
  image.alt = alt;
  image.loading = options.eager ? "eager" : "lazy";
  image.hidden = Boolean(options.onLoad);
  image.decoding = "async";
  if (options.onLoad) image.addEventListener("load", options.onLoad, { once: true });
  image.addEventListener("error", () => {
    image.remove();
    options.onError?.();
  }, { once: true });
  image.src = url.href;
  parent.append(image);

  if (parent.id === "gallery") {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "Открыть фотографию на весь экран");

    const open = () => {
      if (document.querySelector(".gallery-photo-dialog")) return;
      const photos = loadedGalleryPhotos(parent);
      if (!photos.includes(image)) return;
      const dialog = document.createElement("dialog");
      dialog.className = "gallery-photo-dialog";
      dialog.setAttribute("aria-label", "Фотографии кофейни");
      const panel = document.createElement("div");
      panel.className = "gallery-photo-dialog-panel";
      const full = document.createElement("img");
      full.className = "gallery-photo-full";
      full.alt = alt || "Фотография кофейни";

      const close = document.createElement("button");
      close.type = "button";
      close.className = "gallery-photo-close";
      close.setAttribute("aria-label", "Закрыть просмотр");
      close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      close.addEventListener("click", () => dialog.close());

      let index = Math.max(0, photos.indexOf(image));
      const show = (delta = 0) => {
        index = (index + delta + photos.length) % photos.length;
        const selected = photos[index];
        full.src = selected.currentSrc || selected.src;
        full.alt = selected.alt || "Фотография кофейни";
      };

      const controls = document.createElement("div");
      controls.className = "gallery-photo-controls";
      controls.hidden = photos.length < 2;
      if (photos.length > 1) controls.append(galleryArrow(-1, show), galleryArrow(1, show));

      let touchStart;
      dialog.addEventListener("touchstart", event => {
        touchStart = event.changedTouches[0];
      }, {passive:true});
      dialog.addEventListener("touchend", event => {
        const direction = swipeDirection(touchStart, event.changedTouches[0]);
        touchStart = null;
        if (direction && photos.length > 1) show(direction);
      }, {passive:true});
      dialog.addEventListener("keydown", event => {
        if (photos.length > 1 && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          show(event.key === "ArrowLeft" ? -1 : 1);
        }
        if (event.key === "Escape") dialog.close();
      });
      dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener("close", () => {
        dialog.remove();
        if (image.isConnected) image.focus({preventScroll:true});
      }, {once:true});

      panel.append(full, controls, close);
      dialog.append(panel);
      document.body.append(dialog);
      dialog.showModal();
      show();
      close.focus();
    };
    image.addEventListener("click", open);
    image.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  }
}
function renderPromos() {
  const announcements = $("announcements");
  const active = records("promos", rows.promos).filter((promo) => isYes(promo["Активно"]) && (promo["Заголовок"] || promo["Текст"]));
  announcements.replaceChildren(...active.map((promo) => {
    const line = node("article", "promo-card");
    const photo = imageUrl(promo["Фото"]); if (photo) addImage(line, photo, promo["Заголовок"]);
    addText(line, "strong", "", promo["Заголовок"]);
    if (promo["Текст"]) line.append(promo["Заголовок"] ? ` · ${promo["Текст"]}` : promo["Текст"]);
    return line;
  }));
}

function renderShowcase() {
  const active = records("menu", rows.menu).filter((item) => isYes(item["Наличие"]) && isYes(item["Блюдо дня"]) && item["Название"]);
  $("showcase-note").hidden = !demo.menu;
  $("showcase-grid").replaceChildren(...active.map((item) => {
    const card = node("article", "showcase-card");
    const photo = imageUrl(item["Фото"]); if (photo) addImage(card, photo, item["Название"], { onError: () => card.classList.add("menu-card--no-photo") }); else card.classList.add("menu-card--no-photo");
    const category = key(item["Категория"]);
    const label = category === "десерты" ? "Десерт на витрине" : category === "основные блюда" ? "Блюдо дня" : "Выбор дня";
    addText(card, "p", "eyebrow", label);
    addText(card, "h3", "", item["Название"]);
    addText(card, "p", "muted", item["Описание"]);
    addText(card, "p", "volume", item["Объем"]);
    addText(card, "p", "price", rubles(item["Цена"]));
    return card;
  }));
}

function setupShowcaseScrolling() {
  const track = $("showcase-grid");
  const controls = $("showcase-controls");
  const previous = $("showcase-prev");
  const next = $("showcase-next");
  function updateControls() {
    const available = track.scrollWidth - track.clientWidth;
    const canScroll = track.clientWidth > 0 && available > 1;
    const canGoBack = canScroll && track.scrollLeft > 1;
    const canGoForward = canScroll && track.scrollLeft < available - 1;
    const focused = document.activeElement;
    controls.hidden = !canScroll;
    previous.hidden = !canGoBack;
    next.hidden = !canGoForward;
    if (canScroll) track.tabIndex = 0;
    else track.removeAttribute("tabindex");
    if (focused === previous && !canGoBack && canGoForward) next.focus({ preventScroll: true });
    if (focused === next && !canGoForward && canGoBack) previous.focus({ preventScroll: true });
  }
  function scroll(direction) {
    const card = track.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    track.scrollBy({ left: direction * step, behavior });
  }
  previous.addEventListener("click", () => scroll(-1));
  next.addEventListener("click", () => scroll(1));
  track.addEventListener("scroll", updateControls, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.target !== track || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    scroll(event.key === "ArrowLeft" ? -1 : 1);
  });
  if ("ResizeObserver" in window) new ResizeObserver(updateControls).observe(track);
  else window.addEventListener("resize", updateControls);
  new MutationObserver(updateControls).observe(track, { childList: true });
  updateControls();
}

function renderButtons(container, options, selected, onSelect) {
  const focusedValue = container.contains(document.activeElement) ? document.activeElement.dataset.value : null;
  container.replaceChildren(...options.map(({ label, value }) => {
    const button = node("button", "", label);
    button.type = "button";
    button.dataset.value = value;
    button.setAttribute("aria-pressed", String(value === selected));
    button.addEventListener("click", () => {
      onSelect(value);
      for (const option of container.children) option.setAttribute("aria-pressed", String(option === button));
      renderMenuItems();
    });
    return button;
  }));
  if (focusedValue !== null) {
    const button = [...container.children].find((option) => option.dataset.value === focusedValue);
    button?.focus({ preventScroll: true });
  }
}

function setupCategoryScrolling() {
  const row = $("category-row");
  const track = $("categories");
  const arrows = $("category-arrows");
  const previous = $("category-prev");
  const next = $("category-next");
  const desktopInput = matchMedia("(hover: hover) and (pointer: fine)");

  function reveal(button) {
    if (!button) return;
    const viewport = track.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.left < viewport.left) track.scrollLeft += item.left - viewport.left;
    else if (item.right > viewport.right) track.scrollLeft += item.right - viewport.right;
  }

  function updateArrows() {
    // Compare with the full row so arrows never create the overflow that keeps them visible.
    const active = track.querySelector('[aria-pressed="true"]');
    const focused = document.activeElement;
    const showArrows = desktopInput.matches && row.clientWidth > 0 && track.scrollWidth > row.clientWidth + 1;
    const visibilityChanged = arrows.hidden === showArrows;
    arrows.hidden = !showArrows;
    if (visibilityChanged) {
      if (!showArrows && arrows.contains(focused)) active?.focus({ preventScroll: true });
      reveal(active);
    }
    previous.setAttribute("aria-disabled", String(track.scrollLeft <= 1));
    next.setAttribute("aria-disabled", String(track.scrollLeft >= track.scrollWidth - track.clientWidth - 1));
  }

  for (const [arrow, direction] of [[previous, -1], [next, 1]]) {
    arrow.addEventListener("click", () => {
      if (arrow.getAttribute("aria-disabled") === "true") return;
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      track.scrollBy({ left: direction * track.clientWidth * .8, behavior });
    });
  }
  for (const event of ["click", "focusin"]) {
    track.addEventListener(event, (interaction) => reveal(interaction.target.closest("button")));
  }
  track.addEventListener("scroll", updateArrows, { passive: true });
  desktopInput.addEventListener("change", updateArrows);
  document.fonts?.addEventListener("loadingdone", updateArrows);
  if ("ResizeObserver" in window) new ResizeObserver(updateArrows).observe(row);
  else window.addEventListener("resize", updateArrows);
  new MutationObserver(() => {
    updateArrows();
    reveal(track.querySelector('[aria-pressed="true"]'));
  }).observe(track, { childList: true });
}

function renderMenu() {
  const items = records("menu", rows.menu);
  menu = items
    .filter((item) => item["Название"] && isYes(item["Наличие"]))
    .map((item) => ({ ...item, tags: splitList(item["Теги"]), categoryKey: key(item["Категория"]) }));
  const categories = new Map();
  for (const item of menu) {
    const category = key(item["Категория"]);
    if (category && !categories.has(category)) categories.set(category, item["Категория"]);
  }
  if (!categories.has(selectedCategory)) selectedCategory = "";
  $("menu-note").hidden = !demo.menu;
  renderButtons($("categories"), [{ value: "", label: "Все категории" }, ...Array.from(categories, ([value, label]) => ({ value, label }))],
    selectedCategory, (value) => { selectedCategory = value; renderTagFilters(); });

  if (!$("menu-search")) {
    const search = node("input", "menu-search"); search.id = "menu-search"; search.type = "search"; search.placeholder = "Найти блюдо или напиток"; search.setAttribute("aria-label", "Поиск по меню"); search.addEventListener("input", () => { searchText = key(search.value); renderMenuItems(); }); $("category-row").before(search);
  }
  renderTagFilters();
  renderMenuItems();
}

function renderTagFilters() {
 const tags = new Map();
 for(const item of menu) if(!selectedCategory || item.categoryKey===selectedCategory) for(const tag of item.tags) if(key(tag)!=="все"&&!tags.has(key(tag))) tags.set(key(tag),tag);
 filters=["Все",...tags.values()];
 if(!filters.includes(selectedTag)) selectedTag="Все";
 $("filters").hidden=filters.length===1;
 renderButtons($("filters"),filters.map(label=>({label,value:label})),selectedTag,value=>{selectedTag=value;});
}
var menuLimit = 6;
function renderMenuItems(keepLimit = false) {
  if (!keepLimit) menuLimit = 6;
  const visible = menu.filter((item) => (!searchText || key([item["Название"], item["Описание"], item["Категория"], ...item.tags].join(" ")).includes(searchText)) && (!selectedCategory || item.categoryKey === selectedCategory)
    && (selectedTag === filters[0] || item.tags.some((tag) => key(tag) === key(selectedTag))));
  $("menu-grid").replaceChildren(...visible.slice(0,menuLimit).map((item) => {
    const card = node("article", "menu-card");
    const photo = imageUrl(item["Фото"]);
    if (photo) addImage(card, photo, item["Название"]);
    const body = node("div", "menu-card-body");
    const heading = node("div", "item-heading");
    addText(heading, "h3", "", item["Название"]);
    const prices = item["Цена"].split(/\s*\/\s*/);
    const volumes = item["Объем"].split(/\s*\/\s*/);
    const pairPrices = prices.length > 1 && prices.length === volumes.length
      && prices.every(isNumericPrice) && volumes.every(Boolean);
    if (pairPrices) {
      const unit = item["Объем"].match(/(мл|г|л)$/i)?.[0];
      const variants = node("div", "price-variants");
      prices.forEach((price, index) => {
        const variant = node("div", "price-variant");
        const volume = volumes[index];
        addText(variant, "span", "volume", unit && /\d$/.test(volume) ? `${volume} ${unit}` : volume);
        addText(variant, "strong", "price", rubles(price));
        variants.append(variant);
      });
      heading.append(variants);
    } else {
      addText(heading, "p", "price", rubles(item["Цена"]));
    }
    body.append(heading);
    addText(body, "p", "muted", item["Описание"]);
    if (!pairPrices) addText(body, "p", "volume", item["Объем"]);
    if (item.tags.length) {
      const tags = node("ul", "item-tags");
      tags.append(...item.tags.map((tag) => node("li", "", tag)));
      body.append(tags);
    }
    card.append(body);
    return card;
  }));
  const emptyText = menu.length ? "По этим фильтрам ничего не найдено." : "Меню обновляется.";
  $("empty-menu").hidden = visible.length > 0;
  $("menu-more-wrap").hidden = visible.length <= 6;
  $("menu-more").hidden = visible.length <= menuLimit;
  $("menu-more").textContent = `Показать ещё (${Math.min(6, Math.max(0, visible.length-menuLimit))})`;
  $("menu-collapse").hidden = menuLimit <= 6;
  $("empty-menu").textContent = emptyText;
  $("menu-count").textContent = visible.length ? `Позиций в меню: ${visible.length}` : emptyText;
}

function renderIntroText() {
  const name = settingOrDefault("Название кофейни", "Название");
  const slogan = settingOrDefault("Слоган");
  const description = settingOrDefault("Подзаголовок", "Подзаголовок главного экрана");
  document.title = name;
  document.querySelectorAll("[data-name]").forEach((element) => { element.textContent = name; });
  $("hero-name").textContent = name;
  $("hero-description").textContent = description;
  if (slogan === defaultSettings["слоган"]) {
    $("hero-title").replaceChildren(node("span", "", "То самое место,"), node("em", "", "где хорошо"));
  } else {
    $("hero-title").textContent = slogan;
  }
  $("about-title").textContent = settingOrDefault("Заголовок о нас", "Заголовок «О нас»");
  $("about-text").textContent = settingOrDefault("Текст о нас", "О нас", "Описание кофейни");
  $("quote").textContent = slogan;
}

function renderAmenities() {
  const amenities = demo.amenities ? splitList(settingOrDefault("Удобства")) : records("amenities",rows.amenities).filter(x=>isYes(x["Активно"])).map(x=>x["Название"]).filter(Boolean);
  document.querySelectorAll("[data-amenities]").forEach((list) => {
    list.replaceChildren(...amenities.map((text) => node("li", "", text)));
  });
}

function gallerySheetPhotos() {
  const photos = new Map();
  if (!demo.gallery) {
    const active = records("gallery", rows.gallery).filter((item) => isYes(item["Активно"]));
    active.sort((a, b) => Number(a["Порядок"]) - Number(b["Порядок"]));
    for (const item of active) {
      const url = imageUrl(item["Фото"]);
      if (url) photos.set(url.href, { url, caption: item["Подпись"] || "Интерьер кофейни" });
    }
  }
  return photos;
}

let heroSources = "";
function renderHeroPhotos() {
  const hero = $("hero-visual");
  const art = $("hero-art");
  const galleryPhotos = [...gallerySheetPhotos().values()];
  if (!galleryPhotos.length) {
    const fallback = imageUrl(setting("Фото главного экрана"));
    if (fallback) galleryPhotos.push({ url: fallback });
  }
  const sources = JSON.stringify(galleryPhotos.map(({ url }) => url.href));
  if (sources === heroSources) return;
  heroSources = sources;
  window.clearInterval(window.heroSlideshowTimer);
  hero.replaceChildren(art);
  hero.classList.add("hero-slideshow");
  const loadedSlides = () => [...hero.querySelectorAll(".hero-slide")]
    .filter((image) => image.complete && image.naturalWidth > 0);
  function showSlide(advance = false) {
    const slides = loadedSlides();
    const active = slides.findIndex((image) => image.classList.contains("is-active"));
    const next = slides[active < 0 ? 0 : (active + Number(advance)) % slides.length];
    slides.forEach((image) => image.classList.toggle("is-active", image === next));
    art.hidden = Boolean(next);
  }
  art.hidden = false;
  galleryPhotos.forEach(({url}, index) => {
    const image = node("img", "hero-slide");
    image.alt = "";
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.setAttribute("aria-hidden","true");
    image.addEventListener("load", () => showSlide(), { once: true });
    image.addEventListener("error", () => {
      image.remove();
      showSlide();
    }, { once: true });
    image.src = url.href;
    hero.append(image);
  });
  if (galleryPhotos.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.heroSlideshowTimer = window.setInterval(() => {
      if (!document.hidden) showSlide(true);
    }, 3250);
  }
}

let gallerySources = "";
let galleryNearViewport = !("IntersectionObserver" in window);
function observeGallery() {
  if (galleryNearViewport) return;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    galleryNearViewport = true;
    observer.disconnect();
    renderGalleryPhotos();
  }, { rootMargin: "300px" });
  observer.observe($("gallery"));
}

function renderGalleryPhotos() {
  if (!galleryNearViewport) return;
  const gallery = $("gallery");
  const images = gallerySheetPhotos();
  if (demo.gallery) {
    for (const [name, value] of settings) {
      if (!/^(фото интерьер[а-я]*|фото галереи|галерея)(?:[\s_-]*\d+)?$/.test(name)) continue;
      for (const part of value.split(/[\s;|]+|,(?=\s*https?:\/\/)/)) {
        const url = imageUrl(part);
        if (url) images.set(url.href, { url, caption: "Интерьер кофейни" });
      }
    }
  }
  const sources = JSON.stringify([...images].map(([url, { caption }]) => [url, caption]));
  if (sources === gallerySources) return;
  gallerySources = sources;
  gallery.replaceChildren($("gallery-quote"));
  for (const {url,caption} of images.values()) {
    addImage(gallery, url, caption, {
      eager: true,
      onLoad: () => setupGallery(gallery),
      onError: () => setupGallery(gallery)
    });
  }
  setupGallery(gallery);
}

const moscowClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});
const dateToken = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}(?:\.\d{4})?)\b/g;
const timeRange = /\b(\d{1,2})[:.](\d{2})\s*(?:-|до)\s*(\d{1,2})[:.](\d{2})\b/g;

function parseHours(text) {
  const normalized = key(text);
  if (/закрыто|выходно[йе]|не работаем|^-$/.test(normalized)) return [];
  if (/круглосуточно|24\/7/.test(normalized)) return [{ start: 0, end: 1440 }];
  const intervals = [];
  for (const [, fromHour, fromMinute, toHour, toMinute] of normalized.matchAll(timeRange)) {
    const start = Number(fromHour) * 60 + Number(fromMinute);
    let end = Number(toHour) * 60 + Number(toMinute);
    if (+fromMinute > 59 || +toMinute > 59 || start >= 1440 || end > 1440 || start === end) continue;
    if (end < start) end += 1440;
    intervals.push({ start, end });
  }
  return intervals.length ? intervals : null;
}

function dateParts(token) {
  if (token.includes("-")) {
    const [year, month, day] = token.split("-").map(Number);
    return { year, month, day };
  }
  const [day, month, year] = token.split(".").map(Number);
  return { year, month, day };
}

function dayCode({ month, day }, year) {
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
    ? year * 10000 + month * 100 + day : NaN;
}

function includesDate(dateKey, year, dates, isRange) {
  if (!isRange) return dates.some((date) => dayCode(date, date.year ?? year) === dateKey);
  const [start, end] = dates;
  const wraps = Number(start.month * 100 + start.day > end.month * 100 + end.day);
  const startYears = start.year ? [start.year] : end.year ? [end.year - wraps] : [year, year - 1];
  return startYears.some((startYear) => {
    const first = dayCode(start, startYear);
    const last = dayCode(end, end.year ?? startYear + wraps);
    return dateKey >= first && dateKey <= last;
  });
}

function specialHoursFor(date, special) {
  const dateKey = Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
  for (const line of special.split(/[;\n]+/).map(key).filter(Boolean)) {
    // Время с точками выглядит как дата. Маскируем только пары допустимых часов.
    const masked = line.replace(timeRange, (range, fromHour, fromMinute, toHour, toMinute) =>
      parseHours(`${fromHour}:${fromMinute}-${toHour}:${toMinute}`) ? " ".repeat(range.length) : range);
    // Если строка начинается с диапазона дат, он имеет приоритет перед временем с точками.
    const leadingRange = /^((?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}(?:\.\d{4})?)\s*(?:-|по)\s*(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}(?:\.\d{4})?))(?=\s+(?:\d|закрыто|выходн|не работаем|круглосуточно))/i.exec(line);
    const rangeDates = leadingRange ? [...leadingRange[0].matchAll(dateToken)].map(([token]) => dateParts(token)) : [];
    const hasDateRange = rangeDates.length === 2 && rangeDates.every((part) => Number.isFinite(dayCode(part, part.year ?? 2000)));
    const dated = hasDateRange ? leadingRange[0] + masked.slice(leadingRange[0].length) : masked;
    const tokens = [...dated.matchAll(dateToken)];
    const positions = new Set(tokens.map((token) => token.index));
    const intervals = parseHours(line.replace(dateToken, (token, index) => positions.has(index) ? "" : token));
    if (!tokens.length) {
      if (intervals) return intervals;
      continue;
    }
    const separator = tokens.length === 2 ? line.slice(tokens[0].index + tokens[0][0].length, tokens[1].index) : "";
    if (includesDate(dateKey, date.getUTCFullYear(), tokens.map(([token]) => dateParts(token)), /^\s*(?:-|по)\s*$/.test(separator))) return intervals;
  }
  return undefined;
}

function clockTime(minutes) {
  const time = minutes % 1440;
  return [Math.floor(time / 60), time % 60].map((value) => String(value).padStart(2, "0")).join(":");
}

function getStatus(now, weekdayHours, weekendHours, special) {
  const parts = Object.fromEntries(moscowClock.formatToParts(now).map(({ type, value }) => [type, value]));
  const midnight = Date.UTC(+parts.year, +parts.month - 1, +parts.day);
  const minutes = +parts.hour * 60 + +parts.minute;
  function forDay(offset) {
    const date = new Date(midnight + offset * 86400000);
    const exception = specialHoursFor(date, special);
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    return { exception, hours: exception === undefined ? (weekend ? weekendHours : weekdayHours) : exception };
  }
  const today = forDay(0);
  const yesterday = today.exception === undefined ? forDay(-1).hours : null;
  const nextDayOverridesOvernight = forDay(1).exception !== undefined;
  const openUntil = Math.max(-1,
    ...(today.hours ?? []).filter(({ start, end }) => start <= minutes && end > minutes)
      .map(({ end }) => nextDayOverridesOvernight ? Math.min(end, 1440) : end),
    ...(yesterday ?? []).filter(({ end }) => end - 1440 > minutes).map(({ end }) => end - 1440));
  if (openUntil >= 0) {
    const allDay = today.hours?.some(({ start, end }) => start === 0 && end === 1440);
    if (allDay) return ["open", "Открыто круглосуточно"];
    return ["open", `Открыто до ${clockTime(openUntil)}`];
  }
  if (!today.hours) return ["unknown", "Уточняем часы работы"];
  for (let offset = 0; offset <= 14; offset += 1) {
    const hours = offset ? forDay(offset).hours : today.hours;
    if (!hours) break;
    const starts = hours.map(({ start }) => start).filter((start) => offset || start > minutes);
    if (starts.length) {
      const time = clockTime(Math.min(...starts));
      const day = offset > 1 ? new Intl.DateTimeFormat("ru-RU", {
        timeZone: "UTC", day: "numeric", month: "long"
      }).format(midnight + offset * 86400000) : "";
      if (day) return ["closed", `Откроемся ${day} в ${time}`];
      return ["closed", offset === 1 ? `Откроемся завтра в ${time}` : `Закрыто до ${time}`];
    }
  }
  return ["closed", "Сейчас закрыто"];
}

let schedule = { weekday: null, weekend: null, special: "" };

function updateStatus() {
  const [state, label] = getStatus(new Date(), schedule.weekday, schedule.weekend, schedule.special);
  $("status").dataset.state = state;
  $("status-text").textContent = demo.settings && state !== "unknown" ? `Пример · ${label}` : label;
}

function renderHours() {
  const weekdays = setting("Режим Пн-Пт");
  const weekends = setting("Режим Сб-Вс");
  const extra = records("exceptions", rows.exceptions).map((row) => {
    const date = row["Дата исключения (ГГГГ-ММ-ДД)"];
    if (!/^(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4})$/.test(date)) return "";
    const parts = dateParts(date);
    if (!Number.isFinite(dayCode(parts, parts.year))) return "";
    if (isYes(row["Закрыто весь день"])) return `${date} закрыто`;
    const hours = `${row["Открытие (ЧЧ:ММ)"]}-${row["Закрытие (ЧЧ:ММ)"]}`;
    return `${date} ${parseHours(hours)?.length ? hours : "часы уточняются"}`;
  }).filter(Boolean).join("; ");
  const special = [extra,setting("Особый режим")].filter(Boolean).join("; ");
  schedule = { weekday: parseHours(weekdays), weekend: parseHours(weekends), special };
  $("hours").replaceChildren(...[["Пн–Пт", weekdays], ["Сб–Вс", weekends]].flatMap(([label, value]) => {
    return value ? [node("dt", "", label), node("dd", "", value)] : [];
  }));
  $("hours-block").hidden = !(weekdays || weekends || special);
  $("hours-note").hidden = !demo.settings;
  $("special-hours").hidden = !special;
  $("special-hours").textContent = special ? `Особый режим · ${special}` : "";
  updateStatus();
}

function link(id, url) {
  const anchor = $(id);
  anchor.hidden = !url;
  if (url) {
    anchor.href = url.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  } else {
    anchor.removeAttribute("href");
  }
}

function coordinates(value) {
  const match = /^(\s*[+-]?\d+(?:[.,]\d+)?)\s*[,;]\s*([+-]?\d+(?:[.,]\d+)?)\s*$/.exec(clean(value));
  if (!match) return null;
  const lat = Number(match[1].replace(",", "."));
  const lon = Number(match[2].replace(",", "."));
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null;
}

function renderContacts() {
  const address = setting("Адрес");
  const landmark = setting("Ориентир");
  $("address").textContent = address || defaultSettings["адрес"];
  $("landmark").textContent = landmark;
  $("landmark").hidden = !landmark;
  const phone = setting("Телефон").replace(/^\+7\s*\(900\)\s*000-00-00$/, "");
  const digits = phone.replace(/\D/g, "");
  $("phone-block").hidden = !digits;
  $("phone").textContent = phone;
  if (digits) $("phone").href = `tel:${phone.startsWith("+") ? "+" : ""}${digits}`;
  else $("phone").removeAttribute("href");

  const telegram = serviceUrl(setting("Telegram", "Ссылка Telegram", "Ссылка на Telegram", "Телеграм"),
    /^(?:www\.)?(?:t\.me|telegram\.me)$/, /^\/.+/);
  const vk = serviceUrl(setting("VK", "Ссылка VK", "Ссылка на VK", "ВКонтакте"),
    /^(?:www\.|m\.)?vk\.(?:com|ru)$/, /^\/.+/);
  link("telegram", telegram);
  link("vk", vk);
  const social=$("social");
  social.querySelectorAll("[data-custom-contact]").forEach(el=>el.remove());
  for(const [name,value] of settings){
    const match=name.match(/^(?:контакт|соцсеть|канал)\s*:\s*(.+)$/);
    if(!match||!value)continue;
    const url=httpUrl(value);
    const el=node(url?"a":"span",url?"button button-outline":"custom-contact",match[1]+(url?"":": "+value));
    el.dataset.customContact="true";
    if(url){el.href=url.href;el.target="_blank";el.rel="noopener noreferrer";}
    social.append(el);
  }
  social.hidden = !telegram && !vk && !social.querySelector("[data-custom-contact]");

  const yandexHost = /^(?:www\.)?yandex\.(?:ru|com)$/;
  let route = serviceUrl(setting("Маршрут в Яндекс Картах", "Ссылка на Яндекс Карты", "Ссылка Яндекс Карты", "Яндекс Карты", "Яндекс маршрут", "Ссылка на маршрут", "Маршрут Яндекс", "Ссылка Яндекс", "Ссылка на Яндекс Маршрут"),
    yandexHost, /^\/maps(?:\/|$)/);
  const destination = route?.searchParams.get("rtext")?.split("~").filter(Boolean).at(-1);
  const point = coordinates(destination) || coordinates(setting("Координаты", "Координаты кофейни"))
    || coordinates([setting("Широта"), setting("Долгота")].join(";"));
  const location = address || defaultSettings["адрес"];
  const routeAddress = address && address !== defaultSettings["адрес"] ? address : "";
  if (!route && point) {
    route = new URL("https://yandex.ru/maps/");
    route.searchParams.set("rtext", `~${point.lat},${point.lon}`);
    route.searchParams.set("rtt", "mt");
  }
  if (!route && routeAddress) {
    route = new URL("https://yandex.ru/maps/");
    route.searchParams.set("rtext", `~${routeAddress}`);
    route.searchParams.set("rtt", "mt");
  }
  const gisCandidate = serviceUrl(setting("Открыть в 2ГИС", "2ГИС", "Ссылка на 2ГИС", "Ссылка 2ГИС", "2GIS"),
    /^(?:(?:www\.)?2gis\.ru|go\.2gis\.com)$/, /^\/.+/);
  const gisDestination = point ? `${point.lat}, ${point.lon}` : routeAddress;
  const gis = gisCandidate || (gisDestination ? new URL(`https://2gis.ru/search/${encodeURIComponent(gisDestination)}`) : null);
  const googleSetting = setting("Ссылка Google Карты", "Ссылка на Google Карты");
  const googleLegacy = serviceUrl(googleSetting, /^maps\.google\.com$/, /^\/$/);
  let googleRoute = serviceUrl(googleSetting, /^(?:www\.)?google\.com$/, /^\/maps(?:\/|$)/)
    || serviceUrl(googleSetting, /^maps\.app\.goo\.gl$/, /^\/[^/]+\/?$/);
  if (!googleRoute && (googleLegacy?.searchParams.get("q") || googleLegacy?.searchParams.get("daddr"))) {
    googleRoute = googleLegacy;
  }
  const googleDestination = point ? `${point.lat},${point.lon}` : routeAddress || destination;
  if (!googleRoute && googleDestination) {
    googleRoute = new URL("https://www.google.com/maps/dir/");
    googleRoute.search = new URLSearchParams({ api: "1", destination: googleDestination });
  }

  const yandexEnabled = settingEnabled("Показывать кнопку Яндекс Карты");
  const gisEnabled = settingEnabled("Показывать кнопку 2ГИС");
  const googleEnabled = settingEnabled("Показывать кнопку Google Карты");
  const yandexButton = yandexEnabled ? route : null;
  const gisButton = gisEnabled ? gis : null;
  const googleButton = googleEnabled ? googleRoute : null;
  link("yandex", yandexButton);
  link("map-link", route);
  link("gis", gisButton);
  link("google-maps", googleButton);
  const heroRoute = $("hero-route");
  const primaryRoute = yandexButton || gisButton || googleButton;
  heroRoute.href = primaryRoute?.href || "#directions";
  heroRoute.textContent = primaryRoute ? "Построить маршрут" : "Как добраться";
  heroRoute.hidden = false;
  if (primaryRoute) {
    heroRoute.target = "_blank";
    heroRoute.rel = "noopener noreferrer";
  } else {
    heroRoute.removeAttribute("target");
    heroRoute.removeAttribute("rel");
  }

  $("map-placeholder-text").textContent = location;
  $("map-actions").hidden = !primaryRoute;
  const hasMapSettings = Boolean(point || routeAddress || route || gis || googleRoute);
  const mapNote = $("map-note");
  mapNote.hidden = !primaryRoute && (hasMapSettings || !(yandexEnabled || gisEnabled || googleEnabled));
  mapNote.textContent = primaryRoute ? "Выберите сервис, чтобы открыть маршрут." : "Точный адрес пока не указан.";
  let embed = serviceUrl(setting("Виджет Яндекс Карт", "Миникарта Яндекс", "Карта iframe"),
    yandexHost, /^\/map-widget\/v1\/?$/);
  if (!embed && (point || routeAddress || destination)) {
    embed = new URL("https://yandex.ru/map-widget/v1/");
    if (point) {
      const center = `${point.lon},${point.lat}`;
      embed.search = new URLSearchParams({ ll: center, pt: `${center},pm2rdm`, z: "16", l: "map" });
    } else {
      embed.searchParams.set("text", routeAddress || destination);
      embed.searchParams.set("z", "16");
    }
  }
  const oldFrame = $("map").querySelector("iframe");
  if (oldFrame && oldFrame.src !== embed?.href) oldFrame.remove();
  if (embed && oldFrame?.src !== embed.href) {
    const frame = node("iframe");
    frame.title = "Кофейня на Яндекс Картах";
    frame.loading = "lazy";
    frame.tabIndex = -1;
    frame.src = embed.href;
    $("map").insertBefore(frame, $("map-link"));
  }
}

function renderSettings() {
  settings = new Map(records("settings", rows.settings).map((row) => [key(row["Параметр"]), row["Значение"]]));
  $("preview-banner").hidden = !settingEnabled("Показывать полосу тестовой версии");
  renderIntroText();
  if (demo.amenities) renderAmenities();
  renderHeroPhotos();
  if (demo.gallery) renderGalleryPhotos();
  renderHours();
  renderContacts();
}

var galleryTimer;
function loadedGalleryPhotos(gallery) {
  return [...gallery.querySelectorAll("img")].filter((image) => image.complete && image.naturalWidth > 0);
}

function setupGallery(gallery) {
  clearInterval(galleryTimer);
  gallery.querySelector(".gallery-controls")?.remove();
  gallery.onkeydown = gallery.ontouchstart = gallery.ontouchend = gallery.ontouchcancel = null;
  const list = loadedGalleryPhotos(gallery);
  const quote = $("gallery-quote");
  quote.hidden = list.length > 0;
  gallery.toggleAttribute("data-empty", list.length === 0);
  gallery.toggleAttribute("data-even", list.length > 0 && list.length % 2 === 0);
  if (!list.length) return;

  let index = Math.max(0, list.findIndex((image) => !image.hidden));
  let paused = gallery.matches(":hover") || gallery.contains(document.activeElement);
  const show = (delta = 0) => {
    const focusedImage = document.activeElement === list[index];
    index = (index + delta + list.length) % list.length;
    list.forEach((img, i) => {
      img.hidden = i !== index;
      img.setAttribute("aria-hidden", String(i !== index));
    });
    if (focusedImage) list[index].focus({ preventScroll: true });
  };
  if (list.length > 1) {
    const controls = node("div", "gallery-controls");
    const step = (delta) => { paused = true; show(delta); };
    controls.append(galleryArrow(-1, step), galleryArrow(1, step));
    gallery.append(controls);
    gallery.onmouseenter = () => { paused = true; };
    gallery.onmouseleave = () => { paused = false; };
    gallery.onfocusin = () => { paused = true; };
    gallery.onfocusout = event => { if (!gallery.contains(event.relatedTarget)) paused = false; };
    gallery.onkeydown = event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    };
    let touchStart;
    gallery.ontouchstart = event => { touchStart = event.changedTouches[0]; paused = true; };
    gallery.ontouchend = event => {
      const direction = swipeDirection(touchStart, event.changedTouches[0]);
      if (direction) show(direction);
      gallery.ontouchcancel();
    };
    gallery.ontouchcancel = () => { touchStart = null; paused = gallery.contains(document.activeElement); };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      galleryTimer = setInterval(() => {
        if (!paused && !document.hidden && !document.querySelector(".gallery-photo-dialog")) show(1);
      }, 3250);
    }
  }
  show();
}
function applySections() {
  const ids = new Map([["акции", "announcements"], ["витрина", "showcase"], ["меню", "menu"], ["о нас", "about"], ["контакты", "contacts"]]);
  const list = records("sections", rows.sections).sort((a, b) => Number(a["Порядок"]) - Number(b["Порядок"]));
  const ordered = new Map();
  for (const item of list) {
    const id = ids.get(key(item["Раздел"]));
    if (!id) continue;
    ordered.delete(id);
    ordered.set(id, isYes(item["Активно"]));
  }
  for (const id of ids.values()) {
    const section = $(id);
    const content = id === "showcase" ? $("showcase-grid") : id === "announcements" ? section : null;
    section.hidden = ordered.get(id) === false || Boolean(content && !content.childElementCount);
  }

  // Перемещение уже правильно расположенного раздела перезагружает встроенную карту.
  let next = null;
  for (const id of [...ordered.keys()].reverse()) {
    const section = $(id);
    if (section.nextElementSibling !== next) $("main").insertBefore(section, next);
    next = section;
  }
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    const id = anchor.getAttribute("href").slice(1);
    if (["menu", "about", "contacts", "directions"].includes(id)) anchor.hidden = Boolean($(id)?.closest("[hidden]"));
  }
}

function renderMenuSections() {
  renderMenu();
  renderShowcase();
}

const renderers = {
  menu: renderMenuSections, promos: renderPromos, settings: renderSettings,
  gallery: () => { renderHeroPhotos(); renderGalleryPhotos(); },
  amenities: renderAmenities, sections: null, exceptions: renderHours
};
observeGallery();
setupShowcaseScrolling();
setupCategoryScrolling();
renderMenuSections();
renderPromos();
renderSettings();
if (!demo.amenities) renderAmenities();
if (!demo.gallery) renderGalleryPhotos();
applySections();
window.setInterval(updateStatus, 15000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateStatus(); });

let cacheTimer;
function saveCachedRows() {
  clearTimeout(cacheTimer);
  cacheTimer = undefined;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cachedRows));
  } catch {
    // Данные всё равно доступны в текущей вкладке.
  }
}
window.addEventListener("pagehide", () => {
  if (cacheTimer !== undefined) saveCachedRows();
});

for (const [kind, render] of Object.entries(renderers)) {
  loadSheet(kind).then((result) => {
    rows[kind] = result;
    demo[kind] = false;
    cachedRows[kind] = result;
    clearTimeout(cacheTimer);
    cacheTimer = window.setTimeout(saveCachedRows, 120);
    render?.();
    applySections();
  }).catch((error) => {
    console.warn(`Лист «${sheets[kind].name}» не обновился:`, error.message);
  });
}


$("menu-more")?.addEventListener("click", () => {
  menuLimit += 6;
  renderMenuItems(true);
  if ($("menu-more").hidden) $("menu-collapse").focus();
});
$("menu-collapse")?.addEventListener("click", () => {
  renderMenuItems();
  $("menu-title").focus({ preventScroll: true });
  $("menu").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
