// Lernpfad: Stufen → Einheiten → Kapitel. Jedes Kapitel verweist auf Stapel aus decks.js.
//   decks:         Wort-Stapel des Kapitels
//   sentenceDecks: Satz-Stapel (eigener Abschnitt „Sätze")
//   goal:          Lernziel in einem Satz
// Neue Lektion (z.B. Buch 2 · L13): Stapel in decks.js anlegen, dann hier ein
// Kapitel ergänzen — alles andere (Fortschritt, Freischaltung, Test) läuft automatisch.
// Stapel, die hier nicht vorkommen, bleiben in „Frei üben" erreichbar.

window.CURRICULUM = [
  {
    id: "a11", titleEn: "First Steps", subEn: "WU Business Language Center", label: "A1.1", title: "Erste Schritte", sub: "WU Business Language Center",
    chapters: [
      { id: "a11-zahlen", titleEn: "Numbers & Time Expressions", goalEn: "You count, name prices and simple times.", unitEn: "Arriving", unit: "Ankommen", icon: "🔢", title: "Zahlen & Zeitangaben", goal: "Du zählst, nennst Preise und einfache Zeitangaben.", decks: ["a11-zahlen"] },
      { id: "a11-grundlagen", titleEn: "Introductions & Everyday Life", goalEn: "You introduce yourself and hold a short conversation.", unitEn: "Arriving", unit: "Ankommen", icon: "👋", title: "Vorstellung & Alltag", goal: "Du stellst dich vor und führst ein kurzes Gespräch.", decks: ["a11-grundlagen"] },
      { id: "a11-hoeflichkeit", titleEn: "Politeness & Question Words", goalEn: "You greet, say thanks and ask questions.", unitEn: "Arriving", unit: "Ankommen", icon: "🙏", title: "Höflichkeit & Fragewörter", goal: "Du begrüßt, bedankst dich und stellst Fragen.", decks: ["a11-hoeflichkeit-fragen"] },
      { id: "a11-zeit", titleEn: "Time & Calendar", goalEn: "You name weekdays, dates and the time.", unitEn: "Time & Action", unit: "Zeit & Handeln", icon: "📅", title: "Zeit & Kalender", goal: "Du nennst Wochentage, Datum und Uhrzeit.", decks: ["a11-zeit", "a11-wochentage"] },
      { id: "a11-tierkreis", titleEn: "Zodiac Animals", goalEn: "You say which year you were born in.", unitEn: "Time & Action", unit: "Zeit & Handeln", icon: "🐲", title: "Tierkreiszeichen", goal: "Du sagst, in welchem Jahr du geboren bist.", decks: ["a11-tierkreis"] },
      { id: "a11-verben", titleEn: "Common Verbs", goalEn: "You say what you do, like and need.", unitEn: "Time & Action", unit: "Zeit & Handeln", icon: "🏃", title: "Häufige Verben", goal: "Du sagst, was du tust, magst und brauchst.", decks: ["a11-verben"] }
    ]
  },
  {
    id: "a12", titleEn: "Expanding Everyday Life", subEn: "WU Business Language Center", label: "A1.2", title: "Alltag erweitern", sub: "WU Business Language Center",
    chapters: [
      { id: "a12-laender", titleEn: "Countries & Languages", goalEn: "You say where you are from and which languages you speak.", unitEn: "People & Places", unit: "Menschen & Orte", icon: "🌍", title: "Länder & Sprachen", goal: "Du sagst, woher du kommst und welche Sprachen du sprichst.", decks: ["a12-china-sprachen"] },
      { id: "a12-familie", titleEn: "Family", goalEn: "You describe your family.", unitEn: "People & Places", unit: "Menschen & Orte", icon: "👨‍👩‍👧", title: "Familie", goal: "Du beschreibst deine Familie.", decks: ["a12-familie"] },
      { id: "a12-verabredung", titleEn: "Meeting Up & Directions", goalEn: "You make plans and ask for directions.", unitEn: "People & Places", unit: "Menschen & Orte", icon: "🧭", title: "Verabredung & Richtungen", goal: "Du verabredest dich und fragst nach der Richtung.", decks: ["a12-zeit-verabredung", "a12-himmelsrichtungen"] },
      { id: "a12-essen", titleEn: "Food & Taste", goalEn: "You name dishes and say what you like.", unitEn: "Food & Drink", unit: "Essen & Trinken", icon: "🍜", title: "Essen & Geschmack", goal: "Du nennst Speisen und sagst, was dir schmeckt.", decks: ["a12-essen", "a12-essen-gerichte"] },
      { id: "a12-getraenke", titleEn: "Drinks", goalEn: "You order drinks.", unitEn: "Food & Drink", unit: "Essen & Trinken", icon: "☕", title: "Getränke", goal: "Du bestellst Getränke.", decks: ["a12-getraenke"] },
      { id: "a12-kochen", titleEn: "Cooking & Table Culture", goalEn: "You know cooking methods, tableware and cutlery.", unitEn: "Food & Drink", unit: "Essen & Trinken", icon: "🥢", title: "Kochen & Tischkultur", goal: "Du kennst Zubereitungsarten, Geschirr und Besteck.", decks: ["a12-essen-zubereitung", "a12-tischgedecke"] },
      { id: "a12-restaurant", titleEn: "At the Restaurant", goalEn: "You order and pay at a restaurant.", unitEn: "Out & About", unit: "Unterwegs", icon: "🍽️", title: "Im Restaurant", goal: "Du bestellst und bezahlst im Restaurant.", decks: ["a12-restaurant-dialog"] },
      { id: "a12-geld", titleEn: "Money, Shopping & Colours", goalEn: "You ask for prices and describe colours.", unitEn: "Out & About", unit: "Unterwegs", icon: "💴", title: "Geld, Einkaufen & Farben", goal: "Du fragst nach Preisen und beschreibst Farben.", decks: ["a12-geld-einkaufen", "a12-farben"] },
      { id: "a12-saetze", titleEn: "Whole Sentences", goalEn: "You use everything in complete sentences.", unitEn: "Speaking", unit: "Sprechen", icon: "💬", title: "Ganze Sätze", goal: "Du wendest alles in vollständigen Sätzen an.", decks: [], sentenceDecks: ["a12-saetze"] }
    ]
  },
  {
    id: "a21", titleEn: "Confucius Institute", subEn: "成功之路 起步篇 · Book 1", label: "A2.1", title: "Konfuzius-Institut", sub: "成功之路 起步篇 · Buch 1",
    chapters: [
      { id: "a21-l01", titleEn: "Name & Nationality", goalEn: "You give names and nationality.", unitEn: "Unit 1 · Introductions", unit: "Einheit 1 · Vorstellen", icon: "🪪", zh: "我叫大卫", title: "Name & Nationalität", goal: "Du nennst Namen und Nationalität.", decks: ["a21-l01"] },
      { id: "a21-l02", titleEn: "Objects", goalEn: "You name objects and possessions.", unitEn: "Unit 1 · Introductions", unit: "Einheit 1 · Vorstellen", icon: "🗺️", zh: "这是安妮的地图", title: "Gegenstände", goal: "Du benennst Gegenstände und Besitz.", decks: ["a21-l02"] },
      { id: "a21-l03", titleEn: "Family", goalEn: "You talk about your family.", unitEn: "Unit 1 · Introductions", unit: "Einheit 1 · Vorstellen", icon: "👪", zh: "你家有几口人", title: "Familie", goal: "Du erzählst von deiner Familie.", decks: ["a21-l03"] },
      { id: "a21-l04", titleEn: "Class & Numbers", goalEn: "You ask for and give quantities.", unitEn: "Unit 1 · Introductions", unit: "Einheit 1 · Vorstellen", icon: "🏫", zh: "你们班有多少学生", title: "Klasse & Zahlen", goal: "Du fragst und nennst Mengen.", decks: ["a21-l04"] },
      { id: "a21-s1", titleEn: "Core Sentences 1 · Introductions", goalEn: "You speak the Unit 1 sentences fluently.", unitEn: "Unit 1 · Introductions", unit: "Einheit 1 · Vorstellen", icon: "💬", title: "Kernsätze 1 · Vorstellen", goal: "Du sprichst die Sätze der Einheit 1 flüssig.", decks: [], sentenceDecks: ["a21-saetze-e1"] },
      { id: "a21-l05", titleEn: "Date & Birthday", goalEn: "You give the date and your birthday.", unitEn: "Unit 2 · Time & Places", unit: "Einheit 2 · Zeit & Orte", icon: "🎂", zh: "我的生日是五月九号", title: "Datum & Geburtstag", goal: "Du nennst Datum und Geburtstag.", decks: ["a21-l05"] },
      { id: "a21-l06", titleEn: "Time & Daily Routine", goalEn: "You describe your daily routine.", unitEn: "Unit 2 · Time & Places", unit: "Einheit 2 · Zeit & Orte", icon: "⏰", zh: "我们上午八点半上课", title: "Uhrzeit & Tagesablauf", goal: "Du beschreibst deinen Tagesablauf.", decks: ["a21-l06"] },
      { id: "a21-l07", titleEn: "Directions & Places", goalEn: "You ask the way and describe places.", unitEn: "Unit 2 · Time & Places", unit: "Einheit 2 · Zeit & Orte", icon: "🏦", zh: "银行在哪儿", title: "Wegbeschreibung & Orte", goal: "Du fragst nach dem Weg und beschreibst Orte.", decks: ["a21-l07"] },
      { id: "a21-l08", titleEn: "Room & Location", goalEn: "You describe what is where.", unitEn: "Unit 2 · Time & Places", unit: "Einheit 2 · Zeit & Orte", icon: "🏠", zh: "墙上有一张中国地图", title: "Zimmer & Lage", goal: "Du beschreibst, was wo steht und hängt.", decks: ["a21-l08"] },
      { id: "a21-s2", titleEn: "Core Sentences 2 · Time & Places", goalEn: "You speak the Unit 2 sentences fluently.", unitEn: "Unit 2 · Time & Places", unit: "Einheit 2 · Zeit & Orte", icon: "💬", title: "Kernsätze 2 · Zeit & Orte", goal: "Du sprichst die Sätze der Einheit 2 flüssig.", decks: [], sentenceDecks: ["a21-saetze-e2"] },
      { id: "a21-l09", titleEn: "Food & Restaurant", goalEn: "You choose between dishes and order.", unitEn: "Unit 3 · Daily Life", unit: "Einheit 3 · Alltag", icon: "🥟", zh: "你吃米饭还是饺子", title: "Essen & Restaurant", goal: "Du wählst zwischen Speisen und bestellst.", decks: ["a21-l09"] },
      { id: "a21-l10", titleEn: "Shopping & Prices", goalEn: "You shop and bargain over prices.", unitEn: "Unit 3 · Daily Life", unit: "Einheit 3 · Alltag", icon: "🍎", zh: "苹果多少钱一斤", title: "Einkaufen & Preise", goal: "Du kaufst ein und verhandelst Preise.", decks: ["a21-l10"] },
      { id: "a21-l11", titleEn: "Bank, Money & Phone", goalEn: "You exchange money and make phone calls.", unitEn: "Unit 3 · Daily Life", unit: "Einheit 3 · Alltag", icon: "💱", zh: "我去银行换钱", title: "Bank, Geld & Telefon", goal: "Du wechselst Geld und telefonierst.", decks: ["a21-l11"] },
      { id: "a21-l12", titleEn: "Transport & Day Trip", goalEn: "You plan a trip and pick the transport.", unitEn: "Unit 3 · Daily Life", unit: "Einheit 3 · Alltag", icon: "🚲", zh: "我们骑自行车去颐和园", title: "Verkehrsmittel & Ausflug", goal: "Du planst einen Ausflug und wählst das Verkehrsmittel.", decks: ["a21-l12"] },
      { id: "a21-s3", titleEn: "Core Sentences 3 · Daily Life", goalEn: "You speak the Unit 3 sentences fluently.", unitEn: "Unit 3 · Daily Life", unit: "Einheit 3 · Alltag", icon: "💬", title: "Kernsätze 3 · Alltag", goal: "Du sprichst die Sätze der Einheit 3 flüssig.", decks: [], sentenceDecks: ["a21-saetze-e3"] }
    ]
  }
];
