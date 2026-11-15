// Scriptable-Widget „Zeichen des Tages" für 中文 Karten.
// Zeigt alle 30 Minuten ein anderes Wort (Zeichen, Pinyin, Bedeutung). Funktioniert als Home- und
// Sperrbildschirm-Widget. Widget-Parameter "en" zeigt Englisch (Standard: Deutsch).
// Einrichtung: siehe Vokabeln/README.md, Abschnitt „iPhone-Widget".
const BASE = "https://mariuswocke.github.io/zhongwen-karten/";
const SLOT_MIN = 30; // Minuten pro Wort
const lang = String(args.widgetParameter || "de").toLowerCase().startsWith("en") ? "en" : "de";

// Wortliste laden; ohne Netz die zuletzt gespeicherte Fassung nehmen
async function loadItems() {
  const fm = FileManager.local();
  const file = fm.joinPath(fm.documentsDirectory(), "zhongwen-widget.json");
  try {
    const data = await new Request(BASE + "widget.json").loadJSON();
    if (data && Array.isArray(data.items) && data.items.length) {
      fm.writeString(file, JSON.stringify(data));
      return data.items;
    }
  } catch (e) { /* offline */ }
  try { return JSON.parse(fm.readString(file)).items; } catch (e) { return null; }
}

const items = await loadItems();
const family = config.widgetFamily || "small";
const lock = family.startsWith("accessory");
const w = new ListWidget();
w.url = BASE;
w.refreshAfterDate = new Date(Date.now() + SLOT_MIN * 60 * 1000);

if (!items) {
  w.addText("Keine Daten — einmal mit Netz öffnen");
} else {
  const slot = Math.floor(Date.now() / (SLOT_MIN * 60 * 1000));
  const it = items[slot % items.length];
  const meaning = lang === "en" ? it.e : it.d;
  if (!lock) {
    const g = new LinearGradient();
    g.colors = [new Color("#5b34c8"), new Color("#3c7de8")];
    g.locations = [0, 1];
    w.backgroundGradient = g;
  }
  const big = family === "large" ? 72 : family === "medium" ? 52 : 44;
  if (family === "accessoryInline") {
    w.addText(`${it.h} ${it.p} · ${meaning}`);
  } else if (family === "accessoryRectangular") {
    const t = w.addText(it.h); t.font = Font.boldSystemFont(24);
    const p = w.addText(`${it.p} · ${meaning}`); p.font = Font.systemFont(11); p.minimumScaleFactor = 0.7;
  } else if (family === "accessoryCircular") {
    const t = w.addText(it.h); t.font = Font.boldSystemFont(it.h.length > 2 ? 15 : 26); t.centerAlignText(); t.minimumScaleFactor = 0.5;
  } else {
    w.addSpacer();
    const t = w.addText(it.h); t.font = Font.boldSystemFont(it.h.length > 3 ? big * 0.7 : big); t.textColor = Color.white(); t.centerAlignText(); t.minimumScaleFactor = 0.5;
    const p = w.addText(it.p); p.font = Font.mediumSystemFont(family === "small" ? 16 : 20); p.textColor = new Color("#ffd166"); p.centerAlignText();
    w.addSpacer(4);
    const m = w.addText(meaning); m.font = Font.systemFont(family === "small" ? 13 : 16); m.textColor = Color.white(); m.centerAlignText(); m.minimumScaleFactor = 0.6;
    w.addSpacer();
  }
}
if (config.runsInWidget) Script.setWidget(w);
else if (family === "medium") await w.presentMedium();
else await w.presentSmall();
Script.complete();
