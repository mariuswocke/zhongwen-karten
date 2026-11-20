// HSK-Prüfungssimulation (Kachel „HSK-Prüfung“).
// Läuft NACH dem Haupt-Skript in index.html und nutzt dessen Funktionen (tr, L2, EN, esc, rubyTokens,
// loadDict, segment, listenOnce, speechScore, lightHtml, zhVoice, showView, goHome, readJson, state …).
// Inhalte: window.EXAM_BANK.<stufe> (erzeugt von scripts/build-exam.mjs aus scripts/content-exam/<stufe>.json).
(function () {
  "use strict";

  const XKEY = "cnTutorExam_v1";        // Verlauf der Ergebnisse
  const RKEY = "cnTutorExamRun_v1";     // laufende Prüfung (Neuladen/Abbruch → fortsetzen)
  const SKEY = "cnTutorExamSetup_v1";   // letzte Einstellungen
  const PASS = 0.6;                     // Richtwert je Teil — KEINE offizielle HSK-Punktzahl
  const PLAY_MAX = 2;                   // Hörtexte wie in der Prüfung höchstens zweimal
  const RUN_MAX_AGE = 6 * 3600e3;
  const ESSAY_MAX = 10;

  const LEVELS = [
    { id: "a11", label: "A1.1", hsk: ["vor HSK 1", "before HSK 1"] },
    { id: "a12", label: "A1.2", hsk: ["≈ HSK 1", "≈ HSK 1"] },
    { id: "a21", label: "A2.1", hsk: ["≈ HSK 2", "≈ HSK 2"] },
    { id: "a22", label: "A2.2", hsk: ["≈ HSK 2–3", "≈ HSK 2–3"] }
  ];
  const SCOPE = { a11: ["a11"], a12: ["a11", "a12"], a21: ["a11", "a12", "a21"], a22: ["a11", "a12", "a21", "a22"] };

  const PARTS = [
    { id: "hoeren", ico: "👂", roman: "I", zh: "听力", py: "tīnglì", t: ["Hören", "Listening"], types: ["bild", "rf", "dialog"] },
    { id: "lesen", ico: "📖", roman: "II", zh: "语法与阅读", py: "yǔfǎ yǔ yuèdú", t: ["Grammatik & Lesen", "Grammar & reading"], types: ["luecke", "stellung", "ordnen", "bildrf", "text"] },
    { id: "schreiben", ico: "✍️", roman: "III", zh: "书写", py: "shūxiě", t: ["Schreiben", "Writing"], types: ["einsetzen", "aufsatz"] },
    { id: "sprechen", ico: "🗣️", roman: "IV", zh: "口语", py: "kǒuyǔ", t: ["Sprechen", "Speaking"], types: ["vorlesen", "frage", "thema"] }
  ];
  // [Chinesisch, Pinyin, Deutsch, Englisch] — Aufgabenstellungen wie in der Prüfung mit Pinyin
  const INSTR = {
    bild: ["听录音，选择与词语相符的图片。", "Tīng lùyīn, xuǎnzé yǔ cíyǔ xiāngfú de túpiàn.", "Höre das Wort und wähle das passende Bild.", "Listen to the word and pick the matching picture."],
    rf: ["听句子，判断对错。", "Tīng jùzi, pànduàn duì cuò.", "Höre den Satz und entscheide: richtig oder falsch?", "Listen to the sentence: true or false?"],
    dialog: ["听对话，选择正确答案。", "Tīng duìhuà, xuǎnzé zhèngquè dá'àn.", "Höre den Dialog und wähle die richtige Antwort.", "Listen to the dialogue and choose the correct answer."],
    luecke: ["选词填空。", "Xuǎn cí tiánkòng.", "Wähle für jede Lücke das passende Wort.", "Choose the right word for each blank."],
    stellung: ["选择词语的正确位置。", "Xuǎnzé cíyǔ de zhèngquè wèizhi.", "Wähle die richtige Stelle für das Wort.", "Choose the right place for the word."],
    ordnen: ["把词语连成完整的句子。", "Bǎ cíyǔ liánchéng wánzhěng de jùzi.", "Bringe die Wörter in die richtige Reihenfolge.", "Put the words in the right order to make a sentence."],
    bildrf: ["看图片，判断句子对错。", "Kàn túpiàn, pànduàn jùzi duì cuò.", "Sieh dir das Bild an: Stimmt die Aussage?", "Look at the picture: is the statement true or false?"],
    text: ["阅读短文，回答问题。", "Yuèdú duǎnwén, huídá wèntí.", "Lies den Text und beantworte die Fragen.", "Read the text and answer the questions."],
    einsetzen: ["用所给的词语完成短文。", "Yòng suǒ gěi de cíyǔ wánchéng duǎnwén.", "Vervollständige den Text mit den gegebenen Wörtern (Zeichen oder Pinyin mit Ton).", "Complete the text with the given words (characters or pinyin with tones)."],
    aufsatz: ["写一篇短文（不少于60个字）。", "Xiě yì piān duǎnwén (bù shǎo yú liùshí gè zì).", "Schreibe einen kurzen Aufsatz (mindestens 60 Zeichen).", "Write a short essay (at least 60 characters)."],
    vorlesen: ["朗读下面的句子。", "Lǎngdú xiàmiàn de jùzi.", "Lies den Satz laut vor.", "Read the sentence aloud."],
    frage: ["听问题，用中文回答。", "Tīng wèntí, yòng Zhōngwén huídá.", "Höre die Frage und antworte auf Chinesisch.", "Listen to the question and answer in Chinese."],
    thema: ["围绕话题说一说。", "Wéirào huàtí shuō yi shuō.", "Sprich zum Thema.", "Talk about the topic."]
  };
  const TYPE_LABEL = {
    bild: ["Bild zuordnen", "Match the picture"], rf: ["Hören: richtig/falsch", "Listening: true/false"], dialog: ["Dialoge verstehen", "Understand dialogues"],
    luecke: ["Lückentext", "Fill in the blank"], stellung: ["Wortstellung", "Word position"], ordnen: ["Satz ordnen", "Order the sentence"],
    bildrf: ["Bild + Aussage", "Picture + statement"], text: ["Lesetexte", "Reading texts"], einsetzen: ["Wörter einsetzen", "Complete the text"],
    aufsatz: ["Aufsatz", "Essay"], vorlesen: ["Vorlesen", "Read aloud"], frage: ["Fragen beantworten", "Answer questions"], thema: ["Thema sprechen", "Speak on a topic"]
  };
  const PYFIX = { "了": "le", "的": "de", "得": "de", "吗": "ma", "吧": "ba", "呢": "ne", "啊": "a" };
  const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
  const ESSAY_CHECKS = [
    ["Ich habe alle Fragen des Themas beantwortet", "I answered all the questions of the topic"],
    ["Meine Sätze sind vollständig (wer + was tut)", "My sentences are complete (who + does what)"],
    ["Ich habe nur Wörter benutzt, die ich sicher kann", "I only used words I am sure about"],
    ["Der Text ist auch ohne Pinyin verständlich", "The text is understandable without pinyin"]
  ];

  // ---------- kleine Helfer ----------
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function sshuffle(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const HANRE = /[㐀-鿿]/g;
  const hanCount = s => (String(s).match(HANRE) || []).length;
  const stripP = s => String(s).replace(/[。？！，、；：“”‘’（）()\s]/g, "");
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const bankOf = lv => (window.EXAM_BANK || {})[lv];
  const partOf = id => PARTS.find(p => p.id === id);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const num = n => (Math.round(n * 10) / 10).toString().replace(".", EN ? "." : ",");
  let knownCache = {};
  function knownChars(lv) {
    if (knownCache[lv]) return knownCache[lv];
    const set = new Set();
    for (const d of Object.values(DECKS)) {
      if (!(SCOPE[lv] || []).includes(d.stufe)) continue;
      for (const c of d.cards) { for (const ch of (c.hanzi || "").match(HANRE) || []) set.add(ch); for (const ch of ((c.example && c.example.hanzi) || "").match(HANRE) || []) set.add(ch); }
    }
    return (knownCache[lv] = set);
  }

  // ---------- Zustand ----------
  let S = Object.assign({ level: "a21", mode: "full", set: "s1", timed: true, pinyin: true }, readJson(SKEY) || {});
  let X = null;       // laufende Prüfung
  let tick = null;
  let audioTok = 0;

  function saveSetup() { writeJson(SKEY, S); }
  function save() {
    if (!X || X.screen === "result") return;
    writeJson(RKEY, { ts: Date.now(), level: X.level, setId: X.setId, mode: X.mode, timed: X.timed, pinyin: X.pinyin, partList: X.partList, pi: X.pi, idx: X.idx, screen: X.screen, ans: X.ans, plays: X.plays, partStart: X.partStart, done: X.done });
  }
  // JSON macht aus „unbeantwortet“ (undefined) ein null — beim Laden zurückwandeln
  const unnull = v => (v === null ? undefined : Array.isArray(v) ? v.map(unnull) : v);
  function clearRun() { try { localStorage.removeItem(RKEY); } catch (e) { /* egal */ } }
  function stopAll() { stopTicker(); audioTok++; try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch (e) { /* egal */ } try { stopListening(); } catch (e) { /* egal */ } }

  // ---------- Aufgaben bauen ----------
  function buildTasks(level, setId) {
    const set = bankOf(level).sets.find(s => s.id === setId), T = [];
    const add = (part, type, q, max) => T.push({ part, type, q, max, i: T.length });
    set.hoeren.bild.forEach(q => add("hoeren", "bild", q, 1));
    set.hoeren.rf.forEach(q => add("hoeren", "rf", q, 1));
    set.hoeren.dialog.forEach(q => add("hoeren", "dialog", q, 1));
    add("lesen", "luecke", set.lesen.luecke, set.lesen.luecke.items.length);
    set.lesen.stellung.forEach(q => add("lesen", "stellung", q, 1));
    set.lesen.ordnen.forEach(q => add("lesen", "ordnen", q, 1));
    set.lesen.bildrf.forEach(q => add("lesen", "bildrf", q, 1));
    set.lesen.text.forEach(q => add("lesen", "text", q, q.qs.length));
    add("schreiben", "einsetzen", set.schreiben.einsetzen, set.schreiben.einsetzen.items.length);
    add("schreiben", "aufsatz", set.schreiben.aufsatz, ESSAY_MAX);
    set.sprechen.forEach(q => add("sprechen", q.type, q, q.type === "thema" ? q.check.length : 2));
    T.forEach(t => {
      const seed = hash(level + setId + t.i);
      if (t.type === "luecke") t.bank = sshuffle(t.q.bank, seed);
      if (t.type === "einsetzen") t.chips = sshuffle(t.q.items.map((_, k) => k), seed);
      if (t.type === "ordnen") {
        let p = sshuffle(t.q.words.map((_, k) => k), seed);
        if (p.every((v, k) => v === k)) p = p.slice(1).concat(p[0]);
        t.perm = p;
      }
    });
    return T;
  }
  const tasksOf = part => X.tasks.map((t, i) => (t.part === part ? i : -1)).filter(i => i >= 0);
  const curPart = () => X.partList[X.pi];

  // ---------- Bewertung ----------
  function verdictBlank(input, item) {
    const v = String(input || "").trim();
    if (!v) return 0;
    if (v === item.a) return 1;
    const r = pinyinVerdict(v, item.py);
    return r === "ok" ? 1 : r === "ok-ohne-ton" || r === "ton" ? 0.5 : 0;
  }
  function essayStats(t, a) {
    const text = (a && a.text) || "", len = hanCount(text), min = t.q.min;
    const lenPts = len >= min ? 3 : len >= min * 0.75 ? 2 : len >= min * 0.5 ? 1 : 0;
    const hits = t.q.must.filter(m => text.includes(m));
    const mustPts = t.q.must.length ? (2 * hits.length) / t.q.must.length : 2;
    const ends = (text.match(/[。！？]/g) || []).length, sentPts = ends >= 3 ? 1 : 0;
    const selfPts = ((a && a.checks) || []).filter(Boolean).length;
    const known = knownChars(X.level), chars = text.match(HANRE) || [];
    const knownPct = chars.length ? Math.round((chars.filter(c => known.has(c)).length / chars.length) * 100) : 0;
    return { len, min, lenPts, hits, mustPts, ends, sentPts, selfPts, knownPct, pts: lenPts + mustPts + sentPts + selfPts };
  }
  function scoreTask(t, a) {
    const q = t.q;
    switch (t.type) {
      case "bild": case "dialog": case "stellung": return a === q.a ? 1 : 0;
      case "rf": case "bildrf": return a === q.a ? 1 : 0;
      case "luecke": return q.items.reduce((s, it, k) => s + ((a || [])[k] === it.a ? 1 : 0), 0);
      case "ordnen": {
        if (!Array.isArray(a) || a.length !== q.words.length) return 0;
        const got = a.map(d => q.words[t.perm[d]]).join("");
        return got === stripP(q.a) || (q.alts || []).some(x => got === stripP(x)) ? 1 : 0;
      }
      case "text": return q.qs.reduce((s, qq, k) => s + ((a || [])[k] === qq.a ? 1 : 0), 0);
      case "einsetzen": return q.items.reduce((s, it, k) => s + verdictBlank((a || [])[k], it), 0);
      case "aufsatz": return essayStats(t, a).pts;
      case "vorlesen": return (a && a.pts) || 0;
      case "frage": return (a && a.self) || 0;
      case "thema": return ((a && a.checks) || []).filter(Boolean).length;
    }
    return 0;
  }
  function compute() {
    const R = { parts: {}, types: {}, tasks: [], pts: 0, max: 0 };
    X.partList.forEach(p => { R.parts[p] = { pts: 0, max: 0 }; });
    X.tasks.forEach((t, i) => {
      if (!R.parts[t.part]) return;
      const pts = scoreTask(t, X.ans[i]);
      R.tasks.push({ t, i, pts });
      R.parts[t.part].pts += pts; R.parts[t.part].max += t.max;
      const ty = R.types[t.type] || (R.types[t.type] = { pts: 0, max: 0 });
      ty.pts += pts; ty.max += t.max;
      R.pts += pts; R.max += t.max;
    });
    return R;
  }

  // ---------- Darstellung: Pinyin & Anweisungen ----------
  // Pinyin aus dem Wörterbuch ist ohne Tonänderungen: 一/不 vor Ton 4 → yí/bú, sonst yì (nur 一); Endung -r an das Wort hängen
  const ONE_NUMERAL = new Set(["一月", "一号", "一日", "一百", "一千", "一万", "一零", "一〇"]); // hier bleibt 一 = yī
  const toneOf = syl => { const m = toneMarks(syl || ""); return m.length ? m[0] : 0; };
  const rawPy = t => (PYFIX[t.w] !== undefined ? PYFIX[t.w] : t.py || "");
  function fixTokens(tk) {
    return tk.map((t, i) => {
      let py = rawPy(t);
      if (!py) return { w: t.w, py: "" };
      py = py.replace(/ r$/, "r").toLowerCase();
      const first = t.w[0];
      if (first === "不" || (first === "一" && !ONE_NUMERAL.has(t.w))) {
        const syl = py.split(" ");
        let next = 0;
        if (syl.length > 1) next = t.w[1] === "个" ? 4 : toneOf(syl[1]);
        else if (tk[i + 1] && isHan(tk[i + 1].w[0])) next = tk[i + 1].w[0] === "个" ? 4 : toneOf(rawPy(tk[i + 1]).split(" ")[0]);
        const prev = tk[i - 1], nxt = tk[i + 1];
        if (t.w === "一" && prev && nxt && prev.w === nxt.w && isHan(prev.w[0])) syl[0] = "yi"; // 看一看, 写一写
        else if (first === "不") syl[0] = next === 4 ? "bú" : "bù";
        else syl[0] = next === 4 ? "yí" : next >= 1 ? "yì" : "yī";
        py = syl.join(" ");
      }
      return { w: t.w, py };
    });
  }
  function zh(text, cls) {
    cls = cls || "";
    if (!X || !X.pinyin || !X.dict) return `<span class="xm-zh ${cls} nopy">${esc(text)}</span>`;
    const tk = fixTokens(rubyTokens(X.dict, text));
    return `<span class="xm-zh ${cls}">${tk.map(t => (t.py ? `<ruby>${esc(t.w)}<rt>${t.py}</rt></ruby>` : esc(t.w))).join("")}</span>`;
  }
  function pyOf(word) {
    if (!X || !X.dict) return "";
    return fixTokens(rubyTokens(X.dict, word)).map(t => t.py).filter(Boolean).join(" ");
  }
  function instr(type) {
    const [z, p, d, e] = INSTR[type];
    return `<div class="xm-instr"><div class="xm-zh">${esc(z)}</div>${X.pinyin ? `<div class="xm-py">${esc(p)}</div>` : ""}<div class="xm-de">${EN ? e : d}</div></div>`;
  }

  // ---------- Startbildschirm ----------
  function lastRun() {
    const r = readJson(RKEY);
    if (!r || Date.now() - r.ts > RUN_MAX_AGE || !bankOf(r.level) || !bankOf(r.level).sets.find(s => s.id === r.setId)) return null;
    return r;
  }
  function renderSetup() {
    X = null;
    const lv = LEVELS.find(l => l.id === S.level && bankOf(l.id)) || LEVELS.find(l => bankOf(l.id));
    if (!lv) { examView.innerHTML = `<div class="view-head"><button class="back-btn" data-xm="home">← ${tr("Start", "Home")}</button><h2>📝 ${tr("HSK-Prüfung", "HSK exam")}</h2></div><div class="empty">${tr("Prüfungsinhalte konnten nicht geladen werden.", "Exam content could not be loaded.")}</div>`; return; }
    S.level = lv.id;
    if (S.mode !== "full" && !partOf(S.mode)) S.mode = "full";
    const b = bankOf(S.level);
    if (S.set !== "random" && !b.sets.find(s => s.id === S.set)) S.set = b.sets[0].id;
    const total = Object.values(b.minutes).reduce((a, c) => a + c, 0);
    const run = lastRun(), hist = (readJson(XKEY) || []).slice(-4).reverse();
    const pill = (on, attrs, label, dis) => `<button class="pill ${on ? "on" : ""}" ${attrs} ${dis ? "disabled" : ""}>${label}</button>`;
    const modes = [["full", `${tr("Vollsimulation", "Full simulation")} · ${total} ${tr("Min", "min")}`]].concat(PARTS.map(p => [p.id, `${p.ico} ${L2(p.t)} · ${b.minutes[p.id]} ${tr("Min", "min")}`]));
    examView.innerHTML = `<div class="view-head"><button class="back-btn" data-xm="home">← ${tr("Start", "Home")}</button><h2>📝 ${tr("HSK-Prüfung", "HSK exam")}</h2></div>
      <div class="ex-card">
        <p class="muted-note" style="margin-top:0">${tr("Simuliert eine Prüfung im Aufbau deines Kurses — Hören, Grammatik & Lesen, Schreiben, Sprechen — mit Auswertung am Ende. Aufgabenstellungen und Texte mit Pinyin.", "Simulates an exam in the structure of your course — listening, grammar & reading, writing, speaking — with results at the end. Instructions and texts come with pinyin.")}</p>
        ${run ? `<div class="banner warn">${tr("Eine unterbrochene Prüfung wartet:", "An interrupted exam is waiting:")} ${esc(bankOf(run.level).label)} · ${run.mode === "full" ? tr("Vollsimulation", "full simulation") : L2(partOf(run.mode).t)}
          <div class="actions" style="margin-top:8px"><button class="btn-good" data-xm="resume">${tr("Fortsetzen", "Resume")}</button><button data-xm="discard">${tr("Verwerfen", "Discard")}</button></div></div>` : ""}
        <div class="res-head">${tr("Stufe", "Level")}</div>
        <div class="pill-row">${LEVELS.map(l => pill(l.id === S.level, `data-xm="lvl" data-v="${l.id}"`, `${l.label} <small>${L2(l.hsk)}</small>${bankOf(l.id) ? "" : ` · ${tr("kommt", "soon")}`}`, !bankOf(l.id))).join("")}</div>
        <div class="res-head">${tr("Was möchtest du üben?", "What do you want to practise?")}</div>
        <div class="pill-row">${modes.map(([id, label]) => pill(id === S.mode, `data-xm="mode" data-v="${id}"`, label)).join("")}</div>
        <div class="res-head">${tr("Prüfungssatz", "Exam paper")}</div>
        <div class="pill-row">${b.sets.map((s, k) => pill(s.id === S.set, `data-xm="set" data-v="${s.id}"`, `${tr("Satz", "Paper")} ${k + 1}`)).join("")}${b.sets.length > 1 ? pill(S.set === "random", `data-xm="set" data-v="random"`, tr("Zufall", "Random")) : ""}</div>
        <div class="res-head">${tr("Einstellungen", "Settings")}</div>
        <div class="pill-row">${pill(S.timed, `data-xm="timed"`, `⏱ ${tr("mit Zeitlimit", "timed")}`)}${pill(S.pinyin, `data-xm="pinyin"`, `拼 ${tr("Pinyin", "Pinyin")}`)}</div>
        <p class="hint">${tr("Ohne Zeitlimit ist es ein Übungsdurchlauf. Hörtexte kannst du wie in der Prüfung zweimal abspielen. Die Punkte sind ein Richtwert, keine offiziellen HSK-Punkte.", "Without a time limit it is a practice run. Listening texts can be played twice, as in the exam. Points are a guideline, not official HSK scores.")}</p>
        <div class="actions"><button class="btn-good" id="xmStart" data-xm="start">${tr("Prüfung starten", "Start exam")}</button></div>
      </div>
      ${hist.length ? `<div class="res-head" style="margin-top:16px">${tr("Letzte Ergebnisse", "Recent results")}</div>${hist.map(h => `<div class="xm-res-row"><span class="xm-lbl" style="flex-basis:7em">${new Date(h.ts).toLocaleDateString(EN ? "en-GB" : "de-AT", { day: "2-digit", month: "2-digit" })} ${esc(h.label || h.level)}</span><div class="mini ${h.pct < PASS * 100 ? "xm-bar-bad" : ""}"><i style="width:${h.pct}%"></i></div><span class="xm-num">${h.pct} % · ${h.mode === "full" ? tr("voll", "full") : L2(partOf(h.mode).t)}</span></div>`).join("")}` : ""}`;
  }

  // ---------- Prüfung starten / fortsetzen ----------
  async function loadDictSafe() {
    try { return await loadDict(); } catch (e) { showToast(tr("Wörterbuch konnte nicht geladen werden — Pinyin fehlt, die Prüfung läuft trotzdem.", "Dictionary could not be loaded — pinyin is missing, the exam still works.")); return null; }
  }
  async function start() {
    const b = bankOf(S.level);
    const setId = S.set === "random" ? b.sets[Math.floor(Math.random() * b.sets.length)].id : S.set;
    saveSetup();
    examView.innerHTML = `<div class="empty">${tr("Prüfung wird vorbereitet …", "Preparing the exam …")}</div>`;
    const dict = S.pinyin ? await loadDictSafe() : null;
    X = { level: S.level, setId, mode: S.mode, timed: S.timed, pinyin: S.pinyin, dict, partList: S.mode === "full" ? PARTS.map(p => p.id) : [S.mode], pi: 0, idx: 0, screen: "intro", tasks: buildTasks(S.level, setId), partStart: {}, done: [], plays: {}, tmp: {}, n: 0 };
    X.ans = X.tasks.map(() => undefined);
    if (typeof maybeShowVoiceHint === "function") maybeShowVoiceHint();
    save(); render();
  }
  async function resume() {
    const r = lastRun();
    if (!r) { renderSetup(); return; }
    const dict = r.pinyin ? await loadDictSafe() : null;
    X = { level: r.level, setId: r.setId, mode: r.mode, timed: r.timed, pinyin: r.pinyin, dict, partList: r.partList, pi: r.pi, idx: r.idx, screen: r.screen, tasks: buildTasks(r.level, r.setId), partStart: r.partStart || {}, done: r.done || [], plays: r.plays || {}, tmp: {}, n: 0, ans: unnull(r.ans || []) };
    if (X.screen === "task") {
      const lim = bankOf(X.level).minutes[curPart()] * 60000;
      X.deadline = X.partStart[curPart()] + lim;
      if (X.timed && X.deadline <= Date.now()) { finishPart(); return; }
      startTicker();
    }
    render();
  }

  function startPart() {
    const p = curPart();
    X.partStart[p] = Date.now();
    X.deadline = X.partStart[p] + bankOf(X.level).minutes[p] * 60000;
    X.idx = tasksOf(p)[0];
    X.screen = "task"; X.tmp = {};
    save(); startTicker(); render();
  }
  function finishPart() {
    stopAll();
    X.done.push(curPart());
    if (X.pi + 1 < X.partList.length) X.screen = "break";
    else return finishExam();
    save(); render();
  }
  function finishExam() {
    stopAll();
    X.screen = "result";
    const R = compute(), label = bankOf(X.level).label + " · " + (bankOf(X.level).sets.find(s => s.id === X.setId) || {}).title;
    const hist = readJson(XKEY) || [];
    hist.push({ ts: Date.now(), level: X.level, label: bankOf(X.level).label, set: X.setId, mode: X.mode, timed: X.timed, pct: pct(R.pts, R.max), parts: Object.fromEntries(Object.entries(R.parts).map(([k, v]) => [k, [Math.round(v.pts * 10) / 10, v.max]])) });
    writeJson(XKEY, hist.slice(-30));
    clearRun();
    X.R = R; X.label = label;
    render();
  }
  function nextTask() {
    const ids = tasksOf(curPart()), pos = ids.indexOf(X.idx);
    audioTok++; try { speechSynthesis.cancel(); } catch (e) { /* egal */ } try { stopListening(); } catch (e) { /* egal */ }
    if (pos + 1 < ids.length) { X.idx = ids[pos + 1]; X.tmp = {}; save(); render(); window.scrollTo(0, 0); }
    else finishPart();
  }
  function prevTask() {
    const ids = tasksOf(curPart()), pos = ids.indexOf(X.idx);
    if (pos > 0) { audioTok++; try { speechSynthesis.cancel(); } catch (e) { /* egal */ } X.idx = ids[pos - 1]; X.tmp = {}; save(); render(); window.scrollTo(0, 0); }
  }

  // ---------- Timer ----------
  function startTicker() { stopTicker(); tick = setInterval(onTick, 500); }
  function stopTicker() { if (tick) { clearInterval(tick); tick = null; } }
  function onTick() {
    if (!X || examView.hidden || X.screen !== "task") { stopTicker(); return; }
    X.n++;
    if (X.timed) {
      const left = X.deadline - Date.now(), el = document.getElementById("xmTimer");
      if (el) { el.textContent = "⏱ " + fmt(left); el.classList.toggle("low", left < 60000); }
      if (left <= 0) { showToast(tr("Zeit abgelaufen — der Teil wurde abgegeben.", "Time is up — this part was submitted.")); finishPart(); return; }
    }
    if (X.n % 20 === 0) save();
  }

  // ---------- Hören ----------
  function sayAsync(text, pitch) {
    return new Promise(resolve => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      const v = zhVoice(); if (v) u.voice = v;
      u.rate = 0.8; u.pitch = pitch || 1;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }
  async function play(i) {
    const t = X.tasks[i];
    const limited = t.part === "hoeren";
    if (limited && (X.plays[i] || 0) >= PLAY_MAX) return;
    if (limited) X.plays[i] = (X.plays[i] || 0) + 1;
    const tok = ++audioTok;
    updatePlayLabel(i);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (t.type === "dialog") {
      for (const [role, text] of t.q.lines) {
        if (tok !== audioTok) return;
        await sayAsync(text, role === "男" ? 0.8 : 1.25);
        await wait(350);
      }
    } else await sayAsync(t.type === "frage" ? t.q.q : t.type === "vorlesen" ? t.q.t : t.q.say, 1);
    save();
  }
  function playLabel(i) {
    const t = X.tasks[i];
    if (t.part !== "hoeren") return "";
    const left = PLAY_MAX - (X.plays[i] || 0);
    return left > 0 ? `${tr("noch", "left:")} ${left}×` : tr("keine Wiedergabe mehr", "no more plays");
  }
  function updatePlayLabel(i) {
    const el = document.getElementById("xmPlayLeft"), btn = document.getElementById("xmPlay");
    if (el) el.textContent = playLabel(i);
    if (btn && (X.plays[i] || 0) >= PLAY_MAX) btn.disabled = true;
  }
  function playBlock(i) {
    const used = X.tasks[i].part === "hoeren" && (X.plays[i] || 0) >= PLAY_MAX;
    return `<div style="text-align:center"><button class="ex-hear" id="xmPlay" data-xm="play" ${used ? "disabled" : ""} title="${tr("Abspielen", "Play")}">🔊</button><div class="muted-note" id="xmPlayLeft">${playLabel(i)}</div></div>`;
  }

  // ---------- Aufgaben-Ansichten ----------
  const optBtn = (i, j, k, label, sel) => `<button class="ex-opt ${sel ? "sel" : ""}" data-xm="opt" data-j="${j}" data-i="${k}"><kbd>${k + 1}</kbd><span>${label}</span></button>`;
  const tfButtons = a => `<div class="xm-tf"><button class="${a === true ? "sel" : ""}" data-xm="tf" data-v="1"><kbd>1</kbd> ✓ 对 <small>duì</small></button><button class="${a === false ? "sel" : ""}" data-xm="tf" data-v="0"><kbd>2</kbd> ✗ 错 <small>cuò</small></button></div>`;

  function bodyFor(t, a, i) {
    const q = t.q;
    switch (t.type) {
      case "bild":
        return `${playBlock(i)}<div class="xm-grid">${q.opts.map((e, k) => `<button class="xm-pic ${a === k ? "sel" : ""}" data-xm="opt" data-j="0" data-i="${k}"><div style="font-size:.7rem;color:var(--muted)">${k + 1}</div>${e}</button>`).join("")}</div>`;
      case "rf":
        return `${playBlock(i)}<div class="xm-scene">${q.scene}</div>${tfButtons(a)}`;
      case "dialog":
        return `${playBlock(i)}<div style="margin-top:8px">${zh(q.q, "big")}</div><div class="ex-opts">${q.opts.map((o, k) => optBtn(i, 0, k, zh(o), a === k)).join("")}</div>`;
      case "luecke": {
        const ans = a || [];
        const chips = `<div class="chip-bank">${t.bank.map((w, k) => `<span class="chip"><small>${"ABCDEFGH"[k]}</small>${esc(w)}${X.pinyin ? `<small>${esc(pyOf(w))}</small>` : ""}</span>`).join("")}</div>`;
        const rows = q.items.map((it, k) => {
          const [pre, post] = it.t.split("___");
          const sel = `<select class="xm-sel" data-xm="sel" data-k="${k}"><option value="">—</option>${t.bank.map(w => `<option value="${esc(w)}" ${ans[k] === w ? "selected" : ""}>${esc(w)}</option>`).join("")}</select>`;
          return `<div class="xm-sentline"><b>${k + 1}.</b> ${zh(pre)}${sel}${zh(post)}</div>`;
        }).join("");
        return chips + rows;
      }
      case "stellung": {
        const n = q.parts.length;
        let h = "";
        for (let s = 0; s <= n; s++) {
          h += `<button class="xm-slot ${a === s ? "sel" : ""}" data-xm="slot" data-i="${s}">${a === s ? `<b class="xm-fill">${esc(q.w)}</b>` : CIRCLED[s]}</button>`;
          if (s < n) h += zh(q.parts[s]);
        }
        return `<div class="muted-note" style="margin:0 0 4px">${tr("Wort:", "Word:")} <b>${zh(q.w)}</b></div><div class="xm-sentline" style="line-height:2.6">${h}</div>`;
      }
      case "ordnen": {
        const used = a || [];
        const chip = (d, act) => `<button class="chip" data-xm="${act}" data-i="${d}">${esc(q.words[t.perm[d]])}${X.pinyin ? `<small>${esc(pyOf(q.words[t.perm[d]]))}</small>` : ""}</button>`;
        const pool = t.perm.map((_, d) => d).filter(d => !used.includes(d));
        return `<div class="xm-sentline" style="min-height:3.4em"><div class="chip-bank" style="margin:0;justify-content:flex-start">${used.length ? used.map(d => chip(d, "unchip")).join("") : `<span class="muted-note">${tr("Tippe die Wörter in der richtigen Reihenfolge an …", "Tap the words in the right order …")}</span>`}</div></div>
          <div class="chip-bank">${pool.map(d => chip(d, "chip")).join("")}</div>
          <div class="actions" style="margin-top:4px"><button data-xm="reset">↺ ${tr("Zurücksetzen", "Reset")}</button></div>`;
      }
      case "bildrf":
        return `<div class="xm-scene">${q.scene}</div><div style="text-align:center">${zh(q.t, "big")}</div>${tfButtons(a)}`;
      case "text": {
        const ans = a || [];
        return `<div class="xm-sentline">${zh(q.t)}</div>${q.qs.map((qq, j) => `<div style="margin-top:12px"><b>${j + 1}.</b> ${zh(qq.q)}<div class="ex-opts">${qq.opts.map((o, k) => optBtn(i, j, k, zh(o), ans[j] === k)).join("")}</div></div>`).join("")}`;
      }
      case "einsetzen": {
        const ans = a || [], parts = q.t.split("___");
        const chips = `<div class="chip-bank">${t.chips.map(k => `<span class="chip">${esc(q.items[k].py)}<small>${esc(q.items[k].de)}</small></span>`).join("")}</div>`;
        const text = parts.map((p, k) => zh(p) + (k < q.items.length ? `<input class="answer-input xm-in" data-xm="inp" data-k="${k}" value="${esc(ans[k] || "")}" placeholder="${k + 1}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${k + 1}">` : "")).join("");
        return chips + `<div class="xm-sentline" style="line-height:2.8">${text}</div>`;
      }
      case "aufsatz": {
        const st = essayStats(t, a), ans = a || {};
        return `<div>${zh(q.prompt, "big")}</div><div class="xm-de">${q.de}</div>
          <div class="muted-note" style="margin:8px 0 4px">${tr("Benutze:", "Use:")} ${q.must.map(m => `<b>${zh(m)}</b>`).join(" · ")}</div>
          <textarea class="answer-input xm-essay" data-xm="essay" placeholder="${tr("Schreibe hier auf Chinesisch …", "Write here in Chinese …")}" lang="zh-CN" spellcheck="false">${esc(ans.text || "")}</textarea>
          <div class="xm-count ${st.len >= q.min ? "ok" : ""}"><b id="xmCnt">${st.len}</b> / ${q.min} ${tr("Zeichen", "characters")}</div>
          <div class="res-head">${tr("Korrekturlesen — Selbstcheck (zählt mit)", "Proofreading — self-check (counts)")}</div>
          <div class="xm-checks">${ESSAY_CHECKS.map((c, k) => `<label><input type="checkbox" data-xm="chk" data-k="${k}" ${(ans.checks || [])[k] ? "checked" : ""}> <span>${L2(c)}</span></label>`).join("")}</div>`;
      }
      case "vorlesen": return speakBody(t, a, i);
      case "frage": return speakBody(t, a, i);
      case "thema": return speakBody(t, a, i);
    }
    return "";
  }

  // Sprechen
  function speakBody(t, a, i) {
    const q = t.q, tmp = X.tmp, ans = a || {};
    const micBusy = tmp.busy;
    const sr = !!SRClass && tmp.err !== "unsupported";
    const micBtn = label => `<button class="mic-btn ${micBusy ? "busy" : ""}" data-xm="mic" ${micBusy ? "disabled" : ""}>${micBusy ? "● " + tr("Ich höre zu …", "Listening …") : "🎤 " + label}</button>`;
    const errNote = tmp.err ? `<div class="banner warn">${tr("Spracherkennung hier nicht verfügbar — bewerte dich bitte selbst.", "Speech recognition is not available here — please rate yourself.")}</div>` : "";
    if (t.type === "vorlesen") {
      const done = ans.light, canTry = sr && !ans.self && (ans.attempts || 0) < 2;
      const lights = `<div class="actions"><button data-xm="light" data-v="g">🟢</button><button data-xm="light" data-v="y">🟡</button><button data-xm="light" data-v="r">🔴</button></div><div class="hint" style="text-align:center">${tr("Wie gut war deine Aussprache?", "How good was your pronunciation?")}</div>`;
      return `<div style="text-align:center">${zh(q.t, "big")}</div><div class="xm-de" style="text-align:center">${q.de}</div>
        <div class="actions"><button data-xm="play">🔊 ${tr("Vorhören", "Listen first")}</button></div>
        <div class="actions">${canTry ? micBtn(done ? tr("Nochmal versuchen", "Try again") : tr("Vorlesen", "Read aloud")) : ""}</div>${errNote}
        ${done ? lightHtml(ans.res || { light: ans.light, self: true, states: [] }) : ""}
        ${(!sr || tmp.err) && !done ? lights : ""}`;
    }
    if (t.type === "frage") {
      const tried = ans.tried, rate = [0, 1, 2].map(v => `<button class="${ans.self === v ? "btn-good" : ""}" data-xm="rate" data-v="${v}">${[tr("Nicht geschafft", "Missed"), tr("Teilweise", "Partly"), tr("Gut", "Good")][v]}</button>`).join("");
      return `<div style="text-align:center">${zh(q.q, "big")}</div><div class="xm-de" style="text-align:center">${q.qde}</div>
        <div class="actions"><button data-xm="play">🔊 ${tr("Frage anhören", "Hear the question")}</button></div>
        <div class="actions">${sr ? micBtn(tr("Antworten", "Answer")) : ""}<button data-xm="said">${sr ? tr("Ohne Mikrofon beantworten", "Answer without microphone") : tr("Ich habe laut geantwortet", "I answered aloud")}</button></div>${errNote}
        ${tried ? `<div class="xm-rev">${ans.heard ? `<div>${tr("Verstanden:", "Heard:")} <b>${esc(ans.heard)}</b></div>` : ""}${(ans.hits || []).length ? `<div class="ok">${tr("Stichwörter getroffen:", "Keywords hit:")} ${esc(ans.hits.join("、"))}</div>` : ans.heard ? `<div class="no">${tr("Keine passenden Stichwörter erkannt.", "No matching keywords recognised.")}</div>` : ""}
          <div style="margin-top:6px">${tr("Musterantwort:", "Model answer:")} ${zh(q.model)}<div class="xm-de">${q.modelDe}</div></div></div>
          <div class="hint" style="text-align:center">${tr("Wie gut war deine Antwort?", "How good was your answer?")}</div><div class="actions">${rate}</div>` : ""}`;
    }
    // thema
    const checks = ans.checks || [];
    return `<div style="text-align:center">${zh(q.prompt, "big")}</div><div class="xm-de" style="text-align:center">${q.de}</div>
      <p class="muted-note" style="text-align:center">${tr("Sprich etwa eine Minute laut dazu. Danach vergleiche mit der Musterantwort.", "Speak about a minute on this aloud. Then compare with the model answer.")}</p>
      ${ans.stage ? `<div class="xm-rev"><div>${tr("Musterantwort:", "Model answer:")} ${zh(q.model)}<div class="xm-de">${q.modelDe}</div></div></div>
        <div class="res-head">${tr("Was hat deine Antwort enthalten?", "What did your answer contain?")}</div>
        <div class="xm-checks">${q.check.map((c, k) => `<label><input type="checkbox" data-xm="chk" data-k="${k}" ${checks[k] ? "checked" : ""}> <span>${esc(c)}</span></label>`).join("")}</div>`
        : `<div class="actions"><button class="btn-good" data-xm="reveal">${tr("Ich habe gesprochen", "I have spoken")}</button></div>`}`;
  }
  async function doMic() {
    const t = X.tasks[X.idx];
    if (X.tmp.busy) return;
    X.tmp.busy = true; X.tmp.err = ""; render();
    const r = await listenOnce(t.type === "frage" ? 12000 : 9000);
    X.tmp.busy = false;
    if (!X || X.tasks[X.idx] !== t) return;
    const fatal = ["unsupported", "not-allowed", "service-not-allowed", "start-failed", "audio-capture"].includes(r.error);
    const old = X.ans[X.idx] || {};
    if (fatal) X.tmp.err = r.error;
    else if (t.type === "vorlesen") {
      const res = speechScore(X.dict || (await loadDictSafe()), t.q.t, r.alts);
      X.ans[X.idx] = { res, light: res.light, attempts: (old.attempts || 0) + 1, pts: res.light === "green" ? 2 : res.light === "yellow" ? 1 : 0 };
    } else {
      const heard = (r.alts[0] && r.alts[0].t) || "";
      X.ans[X.idx] = Object.assign({}, old, { tried: true, heard, hits: t.q.kw.filter(k => r.alts.some(x => x.t.includes(k))) });
    }
    save(); render();
  }

  // ---------- Hauptdarstellung ----------
  function render() {
    if (!X) { renderSetup(); return; }
    if (X.screen === "intro") return renderIntro();
    if (X.screen === "break") return renderBreak();
    if (X.screen === "result") return renderResult();
    renderTask();
  }
  function head(title, right) {
    return `<div class="view-head"><button class="back-btn" data-xm="quit">✕ ${tr("Abbrechen", "Quit")}</button><h2>${title}</h2>${right || ""}</div>`;
  }
  function renderIntro() {
    const p = partOf(curPart()), b = bankOf(X.level), ids = tasksOf(p.id);
    const counts = p.types.map(ty => [ty, X.tasks.filter(t => t.part === p.id && t.type === ty).length]).filter(x => x[1]);
    examView.innerHTML = head(`${p.ico} ${tr("Teil", "Part")} ${p.roman}`) + `<div class="ex-card">
      <div class="xm-zh big">${esc(p.zh)}</div>${X.pinyin ? `<div class="xm-py">${esc(p.py)}</div>` : ""}
      <h3 style="margin:6px 0">${L2(p.t)}</h3>
      <p class="muted-note">${ids.length} ${tr("Aufgaben", "tasks")} · ${X.timed ? `${b.minutes[p.id]} ${tr("Minuten", "minutes")}` : tr("ohne Zeitlimit", "no time limit")}${X.partList.length > 1 ? ` · ${tr("Teil", "part")} ${X.pi + 1}/${X.partList.length}` : ""}</p>
      ${counts.map(([ty, n]) => `<div class="xm-instr"><b>${L2(TYPE_LABEL[ty])}</b> · ${n}<div class="xm-zh">${esc(INSTR[ty][0])}</div>${X.pinyin ? `<div class="xm-py">${esc(INSTR[ty][1])}</div>` : ""}<div class="xm-de">${EN ? INSTR[ty][3] : INSTR[ty][2]}</div></div>`).join("")}
      ${p.id === "hoeren" ? `<p class="hint">${tr("Jeder Hörtext lässt sich zweimal abspielen. Mach vorher Ton an.", "Each listening text can be played twice. Turn your sound on first.")}</p>` : ""}
      ${p.id === "sprechen" ? `<p class="hint">${tr("Für das Mikrofon erlaubt der Browser den Zugriff meist erst nach Nachfrage.", "The browser usually asks before allowing microphone access.")}</p>` : ""}
      <div class="actions"><button class="btn-good" id="xmGo" data-xm="go">${tr("Teil beginnen", "Start part")}</button></div></div>`;
  }
  function renderBreak() {
    const prev = partOf(X.partList[X.pi]), nxt = partOf(X.partList[X.pi + 1]);
    examView.innerHTML = head("✅ " + tr("Teil abgegeben", "Part submitted")) + `<div class="ex-card" style="text-align:center">
      <p>${prev.ico} <b>${L2(prev.t)}</b> ${tr("ist abgegeben.", "is submitted.")}</p>
      <p class="muted-note">${tr("Nächster Teil:", "Next part:")} ${nxt.ico} ${L2(nxt.t)} · ${bankOf(X.level).minutes[nxt.id]} ${tr("Min", "min")}</p>
      <div class="actions"><button class="btn-good" id="xmNextPart" data-xm="nextpart">${tr("Weiter", "Continue")}</button></div></div>`;
  }
  function renderTask() {
    const t = X.tasks[X.idx], p = partOf(t.part), ids = tasksOf(p.id), pos = ids.indexOf(X.idx);
    const last = pos === ids.length - 1;
    examView.innerHTML = head(`${p.ico} ${L2(p.t)}`, `<span class="xm-timer" id="xmTimer">${X.timed ? "⏱ " + fmt(X.deadline - Date.now()) : `${pos + 1}/${ids.length}`}</span>`) +
      `<div class="mini" style="margin:0 0 12px"><i style="width:${Math.round((pos / ids.length) * 100)}%"></i></div>
      <div class="xm-part">${L2(TYPE_LABEL[t.type])} · ${pos + 1}/${ids.length}</div>
      <div class="ex-card">${instr(t.type)}${bodyFor(t, X.ans[X.idx], X.idx)}
        <div class="actions">${pos > 0 ? `<button data-xm="prev">← ${tr("Zurück", "Back")}</button>` : ""}<button class="btn-good" id="xmNext" data-xm="next">${last ? tr("Teil abgeben ✓", "Submit part ✓") : tr("Weiter →", "Next →")}</button></div>
        <div class="hint">${tr("Tasten", "Keys")}: <kbd>1</kbd>–<kbd>4</kbd> ${tr("antworten", "answer")} · <kbd>Enter</kbd> ${tr("weiter", "next")} · <kbd>Esc</kbd> ${tr("abbrechen", "quit")}</div></div>`;
  }

  // ---------- Auswertung ----------
  function ansText(t, a) {
    const q = t.q;
    if (a === undefined || a === null) return "–";
    switch (t.type) {
      case "bild": return q.opts[a];
      case "rf": case "bildrf": return a ? "✓ 对" : "✗ 错";
      case "dialog": return q.opts[a];
      case "stellung": return q.parts.slice(0, a).join("") + "【" + q.w + "】" + q.parts.slice(a).join("");
      case "ordnen": return a.map(d => q.words[t.perm[d]]).join("") || "–";
    }
    return "–";
  }
  function review(r) {
    const { t, i, pts } = r, a = X.ans[i], q = t.q, row = (l, h) => `<div><span class="xm-de">${l}</span> ${h}</div>`;
    let h = "";
    switch (t.type) {
      case "bild": h = row(tr("Gehört:", "Heard:"), `${zh(q.say)} (${q.de})`) + row(tr("Richtig:", "Correct:"), `<span class="ok">${q.opts[q.a]}</span>`) + row(tr("Deine Antwort:", "Your answer:"), ansText(t, a)); break;
      case "rf": h = row(tr("Gehört:", "Heard:"), `${zh(q.say)} (${q.de})`) + row(tr("Bild:", "Picture:"), q.scene) + row(tr("Richtig:", "Correct:"), `<span class="ok">${q.a ? "✓ 对" : "✗ 错"}</span>`) + row(tr("Deine Antwort:", "Your answer:"), ansText(t, a)); break;
      case "dialog": h = q.lines.map(([who, tx]) => `<div><b>${esc(who)}:</b> ${zh(tx)}</div>`).join("") + `<div class="xm-de">${q.de}</div>` + row(tr("Frage:", "Question:"), `${zh(q.q)} (${q.qde})`) + row(tr("Richtig:", "Correct:"), `<span class="ok">${zh(q.opts[q.a])}</span>`) + row(tr("Deine Antwort:", "Your answer:"), a == null ? "–" : zh(q.opts[a])); break;
      case "luecke": h = q.items.map((it, k) => ((a || [])[k] === it.a ? "" : `<div>${zh(it.t.replace("___", `【${it.a}】`))} <span class="no">(${tr("deine Antwort:", "your answer:")} ${esc((a || [])[k] || "–")})</span><div class="xm-de">${it.de}</div></div>`)).join(""); break;
      case "stellung": h = row(tr("Richtig:", "Correct:"), `<span class="ok">${zh(q.parts.slice(0, q.a).join("") + "【" + q.w + "】" + q.parts.slice(q.a).join(""))}</span>`) + row(tr("Deine Antwort:", "Your answer:"), a == null ? "–" : zh(ansText(t, a))) + `<div class="xm-de">${q.de}</div>`; break;
      case "ordnen": h = row(tr("Richtig:", "Correct:"), `<span class="ok">${zh(q.a)}</span>`) + row(tr("Deine Antwort:", "Your answer:"), a && a.length ? zh(ansText(t, a)) : "–") + `<div class="xm-de">${q.de}</div>`; break;
      case "bildrf": h = row(tr("Bild:", "Picture:"), q.scene) + row(tr("Aussage:", "Statement:"), zh(q.t)) + row(tr("Richtig:", "Correct:"), `<span class="ok">${q.a ? "✓ 对" : "✗ 错"}</span>`) + row(tr("Deine Antwort:", "Your answer:"), ansText(t, a)) + `<div class="xm-de">${q.de}</div>`; break;
      case "text": h = `<div>${zh(q.t)}</div><div class="xm-de">${q.de}</div>` + q.qs.map((qq, j) => ((a || [])[j] === qq.a ? "" : `<div style="margin-top:6px">${zh(qq.q)} <span class="xm-de">(${qq.qde})</span><br>${tr("Richtig:", "Correct:")} <span class="ok">${zh(qq.opts[qq.a])}</span> · ${tr("deine Antwort:", "your answer:")} ${(a || [])[j] == null ? "–" : zh(qq.opts[a[j]])}</div>`)).join(""); break;
      case "einsetzen": h = `<div>${zh(q.t.split("___").map((p, k) => p + (k < q.items.length ? `【${q.items[k].a}】` : "")).join(""))}</div>` + q.items.map((it, k) => (verdictBlank((a || [])[k], it) === 1 ? "" : `<div>${k + 1}. <span class="ok">${esc(it.a)} (${esc(it.py)})</span> · ${tr("deine Antwort:", "your answer:")} ${esc((a || [])[k] || "–")}${verdictBlank((a || [])[k], it) === 0.5 ? ` <span class="xm-de">(${tr("Pinyin ohne/mit falschem Ton: halber Punkt", "pinyin without/with wrong tone: half a point")})</span>` : ""}</div>`)).join(""); break;
      case "aufsatz": {
        const st = essayStats(t, a);
        h = `<div class="xm-de">${tr("Dein Text", "Your text")}: ${st.len} ${tr("Zeichen", "characters")} (min. ${st.min}) · ${tr("Pflichtwörter", "required words")} ${st.hits.length}/${q.must.length} · ${tr("aus dem Kursstoff", "from course material")} ${st.knownPct} %</div>` +
          `<div class="xm-de">${tr("Länge", "Length")} ${num(st.lenPts)}/3 · ${tr("Pflichtwörter", "Required words")} ${num(st.mustPts)}/2 · ${tr("Satzzeichen", "Punctuation")} ${st.sentPts}/1 · ${tr("Selbstcheck", "Self-check")} ${st.selfPts}/4</div>` +
          `<div style="margin-top:6px">${tr("Musteraufsatz:", "Model essay:")} ${zh(q.model)}<div class="xm-de">${q.modelDe}</div></div>`;
        break;
      }
      case "vorlesen": h = `<div>${zh(q.t)}</div>` + (a && a.heard ? `<div class="xm-de">${tr("Verstanden:", "Heard:")} ${esc(a.heard)}</div>` : `<div class="xm-de">${tr("Nicht bewertet oder nichts erkannt.", "Not rated or nothing recognised.")}</div>`); break;
      case "frage": h = `<div>${zh(q.q)}</div><div style="margin-top:6px">${tr("Musterantwort:", "Model answer:")} ${zh(q.model)}<div class="xm-de">${q.modelDe}</div></div>`; break;
      case "thema": h = `<div>${zh(q.prompt)}</div><div style="margin-top:6px">${tr("Musterantwort:", "Model answer:")} ${zh(q.model)}<div class="xm-de">${q.modelDe}</div></div>` + q.check.map((c, k) => (((a && a.checks) || [])[k] ? "" : `<div class="no">✗ ${esc(c)}</div>`)).join(""); break;
    }
    return `<div class="xm-rev"><b>${L2(TYPE_LABEL[t.type])}</b> · ${num(pts)}/${t.max}${h}</div>`;
  }
  function gapWords(R) {
    if (!X.dict) return [];
    const idx = new Map();
    for (const [deckId, d] of Object.entries(DECKS)) {
      if (!(SCOPE[X.level] || []).includes(d.stufe)) continue;
      for (const c of d.cards) if (c.type !== "satz" && !idx.has(c.hanzi)) idx.set(c.hanzi, { deckId, card: c });
    }
    const out = new Map();
    R.tasks.filter(r => r.pts < r.t.max).forEach(r => {
      const q = r.t.q, texts = [];
      ["say", "q", "t", "w", "a", "prompt"].forEach(k => { if (typeof q[k] === "string") texts.push(q[k]); });
      if (q.items) q.items.forEach(it => { if (it.a) texts.push(it.a); if (it.t) texts.push(it.t); });
      if (q.lines) q.lines.forEach(l => texts.push(l[1]));
      if (q.words) texts.push(q.words.join(""));
      if (q.parts) texts.push(q.parts.join(""));
      if (q.qs) q.qs.forEach(qq => texts.push(qq.q));
      texts.forEach(tx => segment(X.dict, tx).forEach(sg => { const hit = idx.get(sg.w); if (hit && !out.has(sg.w)) out.set(sg.w, hit); }));
    });
    return [...out.values()].slice(0, 25);
  }
  function resultText(R) {
    const lines = [`HSK-Prüfung ${X.label} (${L2(LEVELS.find(l => l.id === X.level).hsk)})`, `${pct(R.pts, R.max)} % (${num(R.pts)} / ${R.max} ${tr("Punkte, Richtwert", "points, guideline")})`];
    Object.entries(R.parts).forEach(([id, v]) => lines.push(`${L2(partOf(id).t)}: ${num(v.pts)}/${v.max} (${pct(v.pts, v.max)} %)`));
    const weak = Object.entries(R.types).filter(([, v]) => v.max && v.pts / v.max < PASS).map(([k]) => L2(TYPE_LABEL[k]));
    if (weak.length) lines.push(`${tr("Schwächen", "Weak spots")}: ${weak.join(", ")}`);
    return lines.join("\n");
  }
  function renderResult() {
    const R = X.R, total = pct(R.pts, R.max), parts = X.partList;
    const low = parts.filter(p => R.parts[p].max && R.parts[p].pts / R.parts[p].max < PASS);
    const weak = Object.entries(R.types).filter(([, v]) => v.max && v.pts / v.max < PASS).sort((a, b) => a[1].pts / a[1].max - b[1].pts / b[1].max);
    const wrong = R.tasks.filter(r => r.pts < r.t.max), gaps = gapWords(R);
    const b = bankOf(X.level), hsk = L2(LEVELS.find(l => l.id === X.level).hsk);
    const bar = (label, v) => { const p = pct(v.pts, v.max); return `<div class="xm-res-row"><span class="xm-lbl">${label}</span><div class="mini ${p < PASS * 100 ? "xm-bar-bad" : ""}"><i style="width:${p}%"></i></div><span class="xm-num">${num(v.pts)}/${v.max} · ${p} %</span></div>`; };
    const goFor = ty => (partOf("sprechen").types.includes(ty) ? "py" : "hub");
    examView.innerHTML = `<div class="view-head"><button class="back-btn" data-xm="home">← ${tr("Start", "Home")}</button><h2>📝 ${tr("Auswertung", "Results")}</h2></div>
      <div class="ex-card">
        <div class="muted-note" style="text-align:center">${esc(X.label)} · ${hsk}${X.timed ? "" : " · " + tr("ohne Zeitlimit", "untimed")}</div>
        <div class="xm-big">${total} %</div>
        <div class="muted-note" style="text-align:center">${num(R.pts)} / ${R.max} ${tr("Punkte (Richtwert, nicht offiziell)", "points (guideline, not official)")}</div>
        <div class="banner ${low.length ? "warn" : ""}">${low.length ? `${tr("Noch unter 60 % in:", "Still under 60 % in:")} ${low.map(p => L2(partOf(p).t)).join(", ")}` : tr(`Alle geprüften Teile liegen über 60 % — das passt für diese Stufe.`, "All tested parts are above 60 % — that fits this level.")}</div>
        <div class="res-head">${tr("Nach Teilen", "By part")}</div>
        ${parts.map(p => bar(`${partOf(p).ico} ${L2(partOf(p).t)}`, R.parts[p])).join("")}
        <div class="res-head">${tr("Nach Aufgabentyp", "By task type")}</div>
        ${Object.entries(R.types).map(([ty, v]) => bar(L2(TYPE_LABEL[ty]), v)).join("")}
        ${weak.length ? `<div class="res-head">${tr("Das übst du als Nächstes", "Practise this next")}</div><ul class="weak-list">${weak.slice(0, 4).map(([ty]) => `<li><b>${L2(TYPE_LABEL[ty])}</b> — ${goFor(ty) === "py" ? tr("Aussprache-Schule und „Lesen & Vorlesen“", "Pronunciation school and “Read aloud”") : tr("Übungen: Lückentext, Satz bauen, Lesen", "Exercises: gap fill, build the sentence, reading")}</li>`).join("")}</ul>
          <div class="actions"><button data-xm="gohub">🧩 ${tr("Zu den Übungen", "To exercises")}</button><button data-xm="gopy">🗣️ ${tr("Zur Aussprache", "To pronunciation")}</button></div>` : ""}
        ${wrong.length ? `<details class="xm-det"><summary>${tr("Fehler ansehen", "Review mistakes")} (${wrong.length})</summary>${wrong.map(review).join("")}</details>` : `<p class="muted-note">${tr("Alles richtig — stark!", "All correct — great!")}</p>`}
        <textarea id="xmCopyText" class="answer-input" rows="6" hidden readonly></textarea>
        <div class="actions">
          ${gaps.length ? `<button id="xmGaps" data-xm="gaps">${tr("Lücken in die Wiederholung", "Add gaps to review")}</button>` : ""}
          <button data-xm="copy">${tr("Ergebnis kopieren", "Copy result")}</button>
          <button data-xm="again">${tr("Nochmal", "Again")}</button>
          <button class="btn-good" data-xm="home">${tr("Fertig", "Done")}</button>
        </div>
      </div>`;
    if (total >= 80 && typeof confetti === "function") setTimeout(() => confetti(90, 0.3, 2.2), 250);
    X.gaps = gaps;
  }
  function addGaps() {
    const t0 = today();
    (X.gaps || []).forEach(g => {
      const id = cardId(g.deckId, g.card), c = state.cards[id] || (state.cards[id] = {});
      const e = c.abrufen || (c.abrufen = { box: 1, due: t0, seen: 0, wrong: 0, last: null });
      e.box = 1; e.due = t0; e.wrong += 1;
    });
    saveState();
    const btn = document.getElementById("xmGaps");
    if (btn) { btn.disabled = true; btn.textContent = tr("✓ übernommen", "✓ added"); }
    showToast(tr(`${X.gaps.length} Wörter sind ab heute in der täglichen Session fällig.`, `${X.gaps.length} words are due in the daily session from today.`));
  }
  function copyResult() {
    const text = resultText(X.R), ta = document.getElementById("xmCopyText");
    const fallback = () => { ta.value = text; ta.hidden = false; ta.select(); showToast(tr("Text markiert — mit ⌘C kopieren.", "Text selected — copy with ⌘C.")); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast(tr("Ergebnis kopiert.", "Result copied.")), fallback); else fallback();
  }

  // ---------- Eingaben ----------
  function setAns(v) { X.ans[X.idx] = v; save(); }
  function chooseOpt(j, k) {
    const t = X.tasks[X.idx];
    if (t.type === "text") { const a = (X.ans[X.idx] || []).slice(); a[j] = k; setAns(a); } else setAns(k);
    render();
  }
  function onClick(e) {
    const el = e.target.closest("[data-xm]");
    if (!el || el.disabled) return;
    const act = el.dataset.xm, v = el.dataset.v, i = Number(el.dataset.i), j = Number(el.dataset.j || 0);
    switch (act) {
      case "home": stopAll(); if (X && X.screen !== "result") save(); X = null; goHome(); return;
      case "lvl": S.level = v; renderSetup(); return;
      case "mode": S.mode = v; renderSetup(); return;
      case "set": S.set = v; renderSetup(); return;
      case "timed": S.timed = !S.timed; renderSetup(); return;
      case "pinyin": S.pinyin = !S.pinyin; renderSetup(); return;
      case "start": start(); return;
      case "resume": resume(); return;
      case "discard": clearRun(); renderSetup(); return;
      case "quit": window.examEsc(); return;
      case "go": startPart(); return;
      case "nextpart": X.pi += 1; X.screen = "intro"; save(); render(); return;
      case "next": nextTask(); return;
      case "prev": prevTask(); return;
      case "play": play(X.idx); return;
      case "opt": chooseOpt(j, i); return;
      case "tf": setAns(v === "1"); render(); return;
      case "slot": setAns(i); render(); return;
      case "chip": setAns((X.ans[X.idx] || []).concat(i)); render(); return;
      case "unchip": setAns((X.ans[X.idx] || []).filter(d => d !== i)); render(); return;
      case "reset": setAns([]); render(); return;
      case "mic": doMic(); return;
      case "said": X.ans[X.idx] = Object.assign({}, X.ans[X.idx], { tried: true }); save(); render(); return;
      case "light": X.ans[X.idx] = { self: true, light: v === "g" ? "green" : v === "y" ? "yellow" : "red", pts: v === "g" ? 2 : v === "y" ? 1 : 0, attempts: 2 }; save(); render(); return;
      case "rate": X.ans[X.idx] = Object.assign({}, X.ans[X.idx], { self: Number(v) }); save(); render(); return;
      case "reveal": X.ans[X.idx] = Object.assign({ checks: [] }, X.ans[X.idx], { stage: 1 }); save(); render(); return;
      case "gaps": addGaps(); return;
      case "copy": copyResult(); return;
      case "again": S.mode = X.mode; S.level = X.level; saveSetup(); renderSetup(); return;
      case "gohub": X = null; openHub(); return;
      case "gopy": X = null; openPinyin(); return;
    }
  }
  examView.addEventListener("click", onClick);
  examView.addEventListener("change", e => {
    const el = e.target.closest("[data-xm]");
    if (!el || !X) return;
    const k = Number(el.dataset.k);
    if (el.dataset.xm === "sel") { const a = (X.ans[X.idx] || []).slice(); a[k] = el.value || undefined; setAns(a); }
    else if (el.dataset.xm === "chk") {
      const old = X.ans[X.idx] || {}, t = X.tasks[X.idx], n = t.type === "aufsatz" ? ESSAY_CHECKS.length : t.q.check.length;
      const checks = Array.from({ length: n }, (_, m) => (old.checks || [])[m] || false);
      checks[k] = el.checked;
      setAns(Object.assign({}, old, { checks }));
    } else save(); // Texteingaben (Lücken, Aufsatz): beim Verlassen des Feldes sichern
  });
  examView.addEventListener("input", e => {
    const el = e.target.closest("[data-xm]");
    if (!el || !X) return;
    if (el.dataset.xm === "inp") { const a = (X.ans[X.idx] || []).slice(); a[Number(el.dataset.k)] = el.value; X.ans[X.idx] = a; }
    else if (el.dataset.xm === "essay") {
      X.ans[X.idx] = Object.assign({}, X.ans[X.idx], { text: el.value });
      const t = X.tasks[X.idx], n = hanCount(el.value), c = document.getElementById("xmCnt");
      if (c) { c.textContent = n; c.parentElement.classList.toggle("ok", n >= t.q.min); }
    }
  });
  document.addEventListener("keydown", e => {
    if (!X || examView.hidden || X.screen !== "task" || e.metaKey || e.ctrlKey || e.altKey) return;
    const a = document.activeElement;
    // Enter in einer Lücke: zur nächsten Lücke springen (Eingabemethoden-Enter ignorieren)
    if (e.key === "Enter" && !e.isComposing && a && a.classList && a.classList.contains("xm-in")) {
      const all = [...examView.querySelectorAll(".xm-in")], nx = all[all.indexOf(a) + 1];
      e.preventDefault(); if (nx) nx.focus(); else a.blur();
      return;
    }
    if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) return;
    const t = X.tasks[X.idx], d = /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : -1;
    if (d < 0) return;
    if (t.type === "bild" || t.type === "dialog") { if (d < t.q.opts.length) { chooseOpt(0, d); e.preventDefault(); } }
    else if (t.type === "rf" || t.type === "bildrf") { if (d < 2) { setAns(d === 0); render(); e.preventDefault(); } }
    else if (t.type === "stellung") { if (d <= t.q.parts.length) { setAns(d); render(); e.preventDefault(); } }
  });
  window.addEventListener("beforeunload", () => { if (X && X.screen !== "result") save(); });

  // ---------- Einstieg ----------
  window.examEsc = function () {
    if (!X || X.screen === "result") { stopAll(); X = null; goHome(); return; }
    if (confirm(tr("Prüfung abbrechen? Du kannst sie später fortsetzen.", "Quit the exam? You can resume it later."))) { stopAll(); save(); X = null; renderSetup(); }
  };
  function openExam() { stopAll(); renderSetup(); showView(examView); }
  window.openExam = openExam;
  const btn = document.getElementById("examBtn");
  if (btn) btn.onclick = openExam;
  ENTER_TARGETS.push("xmNext", "xmGo", "xmNextPart", "xmStart");
})();
