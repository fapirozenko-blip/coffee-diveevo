"use strict";

const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1xJno03epbyJtxuAWT6uYdtIqZ1eaveS4Z5aMZHIgGbk/edit";
const spreadsheetId = spreadsheetUrl.match(/\/d\/([^/]+)/)[1];
const cacheKey = `coffee-diveevo:${spreadsheetId}:v1`;
const sheets = {
  menu: { name: "Меню", columns: ["Категория", "Название", "Описание", "Объем", "Цена", "Теги", "Фото", "Наличие"] },
  showcase: { name: "Витрина", columns: ["Тип", "Название", "Описание", "Цена", "Активно", "Фото"] },
  promos: { name: "Акции", columns: ["Заголовок", "Текст", "Активно", "Фото"] },
  settings: { name: "Настройки", columns: ["Параметр", "Значение"] }
};

Object.assign(sheets, { gallery:{name:"Галерея",columns:["Фото","Подпись","Активно","Порядок"]}, amenities:{name:"Удобства",columns:["Название","Активно"]}, sections:{name:"Разделы",columns:["Раздел","Активно","Порядок"]}, exceptions:{name:"Расписание",columns:["Дата исключения (ГГГГ-ММ-ДД)","Открытие (ЧЧ:ММ)","Закрытие (ЧЧ:ММ)","Закрыто весь день","Комментарий"]} });
const starterRows = {
 gallery:[], amenities:[], sections:[], exceptions:[],
  menu: [
    ["Кофе", "Эспрессо", "Плотный и насыщенный чёрный кофе.", "40 мл", "160", "", "", "Да"],
    ["Кофе", "Капучино", "Эспрессо и молоко с нежной пеной.", "200 / 300 мл", "250 / 330 ₽", "Хит", "", "Да"],
    ["Кофе", "Флэт уайт", "Двойной эспрессо и немного молока.", "200 мл", "290", "", "", "Да"],
    ["Кофе", "Фильтр-кофе", "Чёрный кофе с чистым вкусом и лёгким телом.", "250 мл", "230", "Постное, Без сахара", "", "Да"],
    ["Завтраки", "Сырники", "Румяные сырники со сметаной и ягодами.", "180 г", "390", "Хит", "", "Да"],
    ["Завтраки", "Овсяная каша", "На растительном молоке, с яблоком и корицей.", "250 г", "310", "Постное, Без сахара", "", "Да"],
    ["Десерты", "Медовик", "Медовые коржи и лёгкий сметанный крем.", "120 г", "290", "Хит", "", "Да"],
    ["Десерты", "Брауни", "Шоколадный десерт с плотной серединкой.", "90 г", "260", "", "", "Да"]
  ],
  showcase: [
    ["Суп дня", "Тыквенный крем-суп", "Нежная тыква, пряности и хрустящие семечки.", "340", "Да"],
    ["Десерт на витрине", "Медовик", "Медовые коржи и лёгкий сметанный крем.", "290", "Да"]
  ],
  promos: [],
  settings: [
    ["Название кофейни", "Кофейня в Дивееве"],
    ["Слоган", "То самое место, где хорошо"],
    ["Подзаголовок", "Кофе, завтраки весь день и время для себя в самом сердце Дивеева."],
    ["Заголовок о нас", "Здесь можно выдохнуть"],
    ["Текст о нас", "Загляните на кофе, сделайте паузу в дороге или задержитесь за поздним завтраком."],
    ["Удобства", "Wi-Fi, Розетки, Завтраки весь день, Постные блюда"],
    ["Режим Пн-Пт", "08:00–21:00"],
    ["Режим Сб-Вс", "09:00–21:00"],
    ["Адрес", "с. Дивеево, Нижегородская область"]
  ]
};

const $ = (id) => document.getElementById(id);
const clean = (value) => String(value ?? "").trim();
const key = (value) => clean(value).toLowerCase().replace(/ё/g, "е").replace(/[‐‑‒–—−]/g, "-").replace(/\s+/g, " ");
const splitList = (value) => clean(value).split(/[,;|\n]+/).map(clean).filter(Boolean);
const isYes = (value) => ["да", "true", "1"].includes(key(value));
const isNo = (value) => ["нет", "false", "0"].includes(key(value));
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
    return ["https:", "http:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
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

function convertResponse(payload, kind) {
  if (payload?.status === "error" || !Array.isArray(payload?.table?.rows)) {
    throw new Error("Google Sheets не вернул таблицу");
  }

  const labels = sheets[kind].columns.map(key);
  const actualLabels = (payload.table.cols || []).map((column) => key(column.label));
  let indexes = labels.map((label) => actualLabels.indexOf(label));
  const dataRows = payload.table.rows;
  if (indexes.some((index) => index < 0)) {
    const firstRow = (dataRows[0]?.c || []).map((cell) => key(cell?.v));
    const headerIndexes = labels.map((label) => firstRow.indexOf(label));
    if (headerIndexes.every((index) => index >= 0)) {
      indexes = headerIndexes;
      return unpackRows(dataRows.slice(1), indexes);
    }
    if (!dataRows.length) return [];
    throw new Error("Столбцы листа не совпадают с ожидаемыми");
  }
  return unpackRows(dataRows, indexes);
}

function unpackRows(dataRows, indexes) {
  return dataRows.map(({ c }) => indexes.map((index) => clean(c?.[index]?.f ?? c?.[index]?.v)))
    .filter((row) => row.some(Boolean));
}

function parseGviz(text) {
  const response = text.trim();
  if (response.startsWith("{")) return JSON.parse(response);
  const match = response.match(/^(?:\/\*[\s\S]*?\*\/\s*)?google\.visualization\.Query\.setResponse\(([\s\S]*)\)\s*;?$/);
  if (!match) throw new Error("Неожиданный ответ Google Sheets");
  return JSON.parse(match[1]);
}

let callbackId = 0;

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `coffeeSheetsResponse${++callbackId}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => finish(new Error("Google Sheets не ответил вовремя")), 5000);
    function finish(error, payload) {
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      if (error) reject(error);
      else resolve(payload);
    }
    window[callback] = (payload) => finish(null, payload);
    script.onerror = () => finish(new Error("Лист Google Sheets недоступен"));
    url.searchParams.set("tqx", `out:json;responseHandler:${callback}`);
    script.src = url.href;
    document.head.append(script);
  });
}

async function loadSheet(kind) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`);
  url.search = new URLSearchParams({ tqx: "out:json", sheet: sheets[kind].name, headers: "1" });
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);
  let payload;
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit", cache: "no-cache" });
    if (!response.ok) throw new Error(`Google Sheets: ${response.status}`);
    payload = parseGviz(await response.text());
  } catch {
    payload = await loadJsonp(url);
  } finally {
    clearTimeout(timeout);
  }
  return convertResponse(payload, kind);
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

function rubles(price) {
  if (!price) return "";
  price = String(price);
  if (/[₽]|руб\.?|\bRUB\b/i.test(price)) return price;
  return `${price} ₽`;
}

function addText(parent, tag, className, content) {
  if (content) parent.append(node(tag, className, content));
}

function addImage(parent, url, alt, options = {}) {
  const image = node("img");
  image.alt = alt;
  image.loading = options.eager ? "eager" : "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.remove();
    options.onError?.();
  }, { once: true });
  image.src = url.href;
  parent.append(image);
}

function renderPromos() {
  const announcements = $("announcements");
  const active = records("promos", rows.promos).filter((promo) => isYes(promo["Активно"]) && (promo["Заголовок"] || promo["Текст"]));
  announcements.replaceChildren(...active.map((promo) => {
    const line = node("article", "promo-card");
    const photo = httpUrl(promo["Фото"]); if (photo) addImage(line, photo, promo["Заголовок"]);
    addText(line, "strong", "", promo["Заголовок"]);
    if (promo["Текст"]) line.append(promo["Заголовок"] ? ` · ${promo["Текст"]}` : promo["Текст"]);
    return line;
  }));
  announcements.hidden = !active.length;
  const hero = $("hero-visual")?.closest("section"); if (hero && !hero.contains(announcements)) hero.after(announcements);
}

function renderShowcase() {
  const active = records("showcase", rows.showcase).filter((item) => isYes(item["Активно"]) && item["Название"]);
  $("showcase").hidden = !active.length;
  $("showcase-note").hidden = !demo.showcase;
  $("showcase-grid").replaceChildren(...active.map((item) => {
    const card = node("article", "showcase-card");
    const photo = httpUrl(item["Фото"]); if (photo) addImage(card, photo, item["Название"]);
    addText(card, "p", "eyebrow", item["Тип"]);
    addText(card, "h3", "", item["Название"]);
    addText(card, "p", "muted", item["Описание"]);
    addText(card, "p", "price", rubles(item["Цена"]));
    return card;
  }));
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
    const search = node("input", "menu-search"); search.id = "menu-search"; search.type = "search"; search.placeholder = "Найти блюдо или напиток"; search.setAttribute("aria-label", "Поиск по меню"); search.addEventListener("input", () => { searchText = key(search.value); renderMenuItems(); }); $("categories").before(search);
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
    const photo = httpUrl(item["Фото"]);
    if (photo) addImage(card, photo, item["Название"]);
    const body = node("div", "menu-card-body");
    const heading = node("div", "item-heading");
    addText(heading, "h3", "", item["Название"]);
    const prices = item["Цена"].split(/\s*\/\s*/); const volumes = item["Объем"].split(/\s*\/\s*/); const unit = item["Объем"].match(/(мл|г|л)\s*$/i)?.[0] || ""; 
    if(prices.length>1 && prices.length===volumes.length){const variants=node("div","price-variants"); prices.forEach((p,i)=>{const v=node("div","price-variant");addText(v,"span","volume",volumes[i]+(/\d$/.test(volumes[i])&&unit?" "+unit:""));addText(v,"strong","price",rubles(p));variants.append(v);});heading.append(variants);}else addText(heading,"p","price",rubles(item["Цена"]));
    body.append(heading);
    addText(body, "p", "muted", item["Описание"]);
    if(prices.length===1 || prices.length!==volumes.length) addText(body, "p", "volume", item["Объем"]);
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

function renderIntro() {
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
  const amenities = demo.amenities ? splitList(settingOrDefault("Удобства")) : records("amenities",rows.amenities).filter(x=>isYes(x["Активно"])).map(x=>x["Название"]).filter(Boolean);
  document.querySelectorAll("[data-amenities]").forEach((list) => {
    list.replaceChildren(...amenities.map((text) => node("li", "", text)));
  });

  const hero = $("hero-visual");
  const art = $("hero-art");
  const photo = httpUrl(setting("Фото главного экрана"));
  hero.replaceChildren(art);
  art.hidden = Boolean(photo);
  if (photo) addImage(hero, photo, "", { eager: true, onError: () => { art.hidden = false; } });

  const gallery = $("gallery");
  const images = new Map();
  for (const [name, value] of settings) {
    if (!/^(фото интерьер[а-я]*|фото галереи|галерея)(?:[\s_-]*\d+)?$/.test(name)) continue;
    for (const part of value.split(/[\s;|]+|,(?=\s*https?:\/\/)/)) {
      const url = httpUrl(part);
      if (url) images.set(url.href, url);
    }
  }
  if (!demo.gallery) { images.clear(); for (const item of records("gallery",rows.gallery).filter(x=>isYes(x["Активно"])).sort((a,b)=>Number(a["Порядок"])-Number(b["Порядок"]))) { const url=httpUrl(item["Фото"]); if(url) images.set(url.href,url); } }
  gallery.replaceChildren($("gallery-quote") || node("div","quote-card",slogan));
  function updateGalleryLayout() {
    const count = gallery.querySelectorAll("img").length;
    gallery.toggleAttribute("data-empty", count === 0);
    gallery.toggleAttribute("data-even", count > 0 && count % 2 === 0);
  }
  for (const photo of images.values()) {
    addImage(gallery, photo, "Интерьер кофейни", {
      onError: () => { updateGalleryLayout(); setupGallery(gallery); }
    });
  }
  updateGalleryLayout();
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

function dayCode(token, year) {
  if (token.includes("-")) return Number(token.replaceAll("-", ""));
  const [day, month, labelYear = year] = token.split(".");
  return Number(labelYear) * 10000 + Number(month) * 100 + Number(day);
}

function specialHoursFor(date, special) {
  const dateKey = Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
  for (const line of special.split(/[;\n]+/).map(clean).filter(Boolean)) {
    const tokens = [...line.matchAll(dateToken)];
    const intervals = parseHours(line.replace(dateToken, ""));
    if (!intervals) continue;
    if (!tokens.length) return intervals;
    const year = date.getUTCFullYear();
    const codes = tokens.map(([token]) => dayCode(token, year));
    const separator = tokens.length === 2 ? line.slice(tokens[0].index + tokens[0][0].length, tokens[1].index) : "";
    if (codes.includes(dateKey) || (/^\s*(?:[–—-]|по)\s*$/.test(separator) && dateKey >= codes[0] && dateKey <= codes[1])) return intervals;
  }
  return null;
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
    return { exception, hours: exception ?? (weekend ? weekendHours : weekdayHours) };
  }
  const today = forDay(0);
  const yesterday = today.exception === null ? forDay(-1).hours : null;
  const openUntil = Math.max(-1,
    ...(today.hours ?? []).filter(({ start, end }) => start <= minutes && end > minutes).map(({ end }) => end),
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
      return ["closed", `Закрыто до ${time}`];
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
  const extra = records("exceptions",rows.exceptions).map(x=>{let date=x["Дата исключения (ГГГГ-ММ-ДД)"]; const dm=date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); if(dm)date=dm[3]+"-"+dm[2].padStart(2,"0")+"-"+dm[1].padStart(2,"0"); if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return ""; return isYes(x["Закрыто весь день"])?date+" закрыто":date+" "+x["Открытие (ЧЧ:ММ)"]+"-"+x["Закрытие (ЧЧ:ММ)"];}).filter(Boolean).join("; ");
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

  const telegramCandidate = httpUrl(setting("Telegram", "Ссылка Telegram", "Ссылка на Telegram", "Телеграм")); const telegram = telegramCandidate && telegramCandidate.pathname !== "/" ? telegramCandidate : null;
  const vkCandidate = httpUrl(setting("VK", "Ссылка VK", "Ссылка на VK", "ВКонтакте")); const vk = vkCandidate && vkCandidate.pathname !== "/" ? vkCandidate : null;
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

  let route = httpUrl(setting("Маршрут в Яндекс Картах", "Ссылка на Яндекс Карты", "Ссылка Яндекс Карты", "Яндекс Карты", "Яндекс маршрут", "Ссылка на маршрут", "Маршрут Яндекс", "Ссылка Яндекс", "Ссылка на Яндекс Маршрут"));
  const destination = route?.searchParams.get("rtext")?.split("~").filter(Boolean).at(-1);
  const point = coordinates(destination) || coordinates(setting("Координаты", "Координаты кофейни"))
    || coordinates([setting("Широта"), setting("Долгота")].join(";"));
  const location = address || defaultSettings["адрес"];
  if (!route && point) {
    route = new URL("https://yandex.ru/maps/");
    route.searchParams.set("rtext", `~${point.lat},${point.lon}`);
    route.searchParams.set("rtt", "mt");
  }
  if (!route && address && address !== defaultSettings["адрес"]) {
    route = new URL("https://yandex.ru/maps/");
    route.searchParams.set("rtext", `~${address}`);
    route.searchParams.set("rtt", "mt");
  }
  const gis = httpUrl(setting("Открыть в 2ГИС", "2ГИС", "Ссылка на 2ГИС", "Ссылка 2ГИС", "2GIS"))
    || new URL(`https://2gis.ru/search/${encodeURIComponent(point ? `${point.lat}, ${point.lon}` : location)}`);
  link("yandex", route);
  link("map-link", route);
  link("gis", gis);
  const heroRoute = $("hero-route");
  heroRoute.href = route?.href || "#directions";
  if (route) {
    heroRoute.target = "_blank";
    heroRoute.rel = "noopener noreferrer";
  } else {
    heroRoute.removeAttribute("target");
    heroRoute.removeAttribute("rel");
  }

  $("map-placeholder-text").textContent = location;
  $("map-note").textContent = route ? "Маршрут откроется в Яндекс Картах." : "Точный адрес пока не указан.";
  let embed = httpUrl(setting("Виджет Яндекс Карт", "Миникарта Яндекс", "Карта iframe"));
  if (embed && !/^(?:www\.)?yandex\.(?:ru|com)$/.test(embed.hostname)) embed = null;
  if (!embed && (point || route)) {
    embed = new URL("https://yandex.ru/map-widget/v1/");
    if (point) {
      const center = `${point.lon},${point.lat}`;
      embed.search = new URLSearchParams({ ll: center, pt: `${center},pm2rdm`, z: "16", l: "map" });
    } else {
      embed.searchParams.set("text", address || destination || `${settingOrDefault("Название кофейни", "Название")}, Дивеево`);
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
  renderIntro();
  renderHours();
  renderContacts();
}

var galleryTimer;
function setupGallery(gallery) {
 clearInterval(galleryTimer);
 gallery.querySelector(".gallery-controls")?.remove();
 let index=0, paused=false;
 const photos=()=>[...gallery.querySelectorAll("img")];
 const controls=node("div","gallery-controls");
 const show=(delta=0)=>{const list=photos(); if(!list.length){const quote=gallery.querySelector(".quote-card");if(quote)quote.hidden=false;controls.hidden=true;return;} index=((index+delta)%list.length+list.length)%list.length; list.forEach((img,i)=>img.hidden=i!==index); const quote=gallery.querySelector(".quote-card"); if(quote)quote.hidden=true;};
 if(photos().length){show(); if(photos().length>1){for(const [label,delta] of [["‹",-1],["›",1]]){const b=node("button","",label);b.type="button";b.setAttribute("aria-label",delta<0?"Предыдущее фото":"Следующее фото");b.onclick=()=>{paused=true;show(delta);};controls.append(b);}const pause=node("button","","Пауза");pause.type="button";pause.onclick=()=>{paused=!paused;pause.textContent=paused?"Продолжить":"Пауза";};controls.append(pause);gallery.append(controls);if(!matchMedia("(prefers-reduced-motion: reduce)").matches)galleryTimer=setInterval(()=>{if(!paused&&!document.hidden)show(1);},6000);}}
}
function applySections(){
 const ids={"акции":"announcements","витрина":"showcase","меню":"menu","о нас":"about","контакты":"contacts"};
 const list=records("sections",rows.sections).sort((a,b)=>Number(a["Порядок"])-Number(b["Порядок"]));
 for(const item of list){const el=$(ids[key(item["Раздел"])]);if(!el)continue; if(!isYes(item["Активно"]))el.hidden=true;else if(el.id!=="announcements"&&el.id!=="showcase")el.hidden=false; $("main").append(el);}
 document.querySelectorAll('a[href^="#"]').forEach(a=>{const id=a.getAttribute("href").slice(1);const target=$(id);if(target&&["menu","about","contacts","directions"].includes(id))a.hidden=target.hidden||Boolean(target.closest("[hidden]"));});
}
const renderers = { menu: renderMenu, showcase: renderShowcase, promos: renderPromos, settings: renderSettings, gallery:renderIntro, amenities:renderIntro, sections:()=>{renderPromos();renderShowcase();applySections();}, exceptions:renderHours };
for (const render of Object.values(renderers)) render();
applySections();
window.setInterval(updateStatus, 15000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateStatus(); });

for (const [kind, render] of Object.entries(renderers)) {
  loadSheet(kind).then((result) => {
    rows[kind] = result;
    demo[kind] = false;
    cachedRows[kind] = result;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cachedRows));
    } catch {
      // Данные всё равно доступны в текущей вкладке.
    }
    render();
    applySections();
  }).catch((error) => {
    console.warn(`Лист «${sheets[kind].name}» не обновился:`, error.message);
  });
}


$("menu-more")?.addEventListener("click",()=>{menuLimit+=6;renderMenuItems(true);});
$("menu-collapse")?.addEventListener("click",()=>{renderMenuItems();$("menu").scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});});
