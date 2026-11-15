// Inhalte der Aussprache-Schule (eigene Formulierungen, angelehnt an die Gliederung der WU-Einführung).
// Beispiele sind Schriftzeichen, damit die Sprachausgabe sie sicher liest.
window.AUSSPRACHE = {
  // Töne: Kontur auf einer Skala 1 (tief) bis 5 (hoch)
  tones: [
    { n: 1, mark: "¯", name: ["Hoch & gleichbleibend", "High & level"], py: "mā", h: "妈", de: "Mutter", en: "mother",
      tip: ["Wie ein lang gehaltener, hoher Ton beim Singen.", "Like a long, high note held while singing."], line: [5, 5] },
    { n: 2, mark: "´", name: ["Steigend", "Rising"], py: "má", h: "麻", de: "Hanf", en: "hemp",
      tip: ["Steigt wie bei einer überraschten Rückfrage: „Hä?“", "Rises like a surprised “Huh?”"], line: [3, 5] },
    { n: 3, mark: "ˇ", name: ["Tief, erst fallend, dann leicht steigend", "Low, dipping"], py: "mǎ", h: "马", de: "Pferd", en: "horse",
      tip: ["Tief und etwas gedehnt, wie ein nachdenkliches „Hmm“. Am Satzende steigt er leicht.", "Low and a bit drawn out, like a thoughtful “hmm”."], line: [2, 1, 4] },
    { n: 4, mark: "`", name: ["Kurz & fallend", "Short & falling"], py: "mà", h: "骂", de: "schimpfen", en: "to scold",
      tip: ["Fällt schnell von oben nach unten, wie ein knapper Befehl: „Stopp!“", "Drops sharply from high to low, like a curt “Stop!”"], line: [5, 1] },
    { n: 5, mark: "", name: ["Neutralton", "Neutral tone"], py: "ma", h: "吗", de: "Fragepartikel", en: "question particle",
      tip: ["Leicht und kurz, ohne eigene Tonhöhe; er „hängt“ am Ton davor.", "Light and short, with no pitch of its own."], line: [3, 3] }
  ],
  toneNotes: [
    ["Das Tonzeichen steht immer auf dem Vokal. Bei mehreren Vokalen gilt: a vor e/o, bei iu und ui auf dem zweiten Vokal.", "The tone mark goes on the vowel: a before e/o; in iu and ui on the second vowel."],
    ["Zahlen 0–10 sind ein guter Tonträger: yī èr sān sì wǔ liù qī bā jiǔ shí.", "The numbers 0–10 are a good tone workout: yī èr sān sì wǔ liù qī bā jiǔ shí."]
  ],
  sandhi: [
    { rule: ["Zwei dritte Töne hintereinander: der erste wird zum zweiten Ton.", "Two third tones in a row: the first becomes second tone."], ex: [["你好", "nǐ hǎo → ní hǎo", "hallo", "hello"], ["很好", "hěn hǎo → hén hǎo", "sehr gut", "very good"]] },
    { rule: ["不 (bù) wird vor einem vierten Ton zu bú.", "不 (bù) becomes bú before a fourth tone."], ex: [["不是", "bú shì", "nicht sein", "is not"], ["不对", "bú duì", "falsch", "wrong"], ["不好", "bù hǎo", "nicht gut", "not good"]] },
    { rule: ["一 (yī) wird vor 1., 2., 3. Ton zu yì, vor einem 4. Ton zu yí.", "一 (yī) becomes yì before tones 1–3 and yí before tone 4."], ex: [["一天", "yì tiān", "ein Tag", "one day"], ["一年", "yì nián", "ein Jahr", "one year"], ["一起", "yì qǐ", "zusammen", "together"], ["一个", "yí ge", "ein(e)", "one (item)"]] }
  ],
  // Anlaute in Gruppen: [Laut, Beispielzeichen, Pinyin, Bedeutung de, Bedeutung en, Hilfe de, Hilfe en]
  initials: [
    { group: ["Lippenlaute", "Lip sounds"], items: [
      ["b", "爸", "bà", "Vater", "dad", "Wie ein weiches p, ohne Luftstoß.", "Like a soft p, no puff of air."],
      ["p", "怕", "pà", "fürchten", "to fear", "p mit kräftigem Luftstoß (Hand vor den Mund halten).", "p with a strong puff of air."],
      ["m", "妈", "mā", "Mutter", "mother", "Wie im Deutschen.", "As in English."],
      ["f", "发", "fā", "senden", "to send", "Wie im Deutschen.", "As in English."]] },
    { group: ["Zungenspitzenlaute", "Tongue-tip sounds"], items: [
      ["d", "大", "dà", "groß", "big", "Wie ein weiches t, ohne Luftstoß.", "Like a soft t, no puff."],
      ["t", "他", "tā", "er", "he", "t mit kräftigem Luftstoß.", "t with a strong puff."],
      ["n", "你", "nǐ", "du", "you", "Wie im Deutschen.", "As in English."],
      ["l", "来", "lái", "kommen", "to come", "Wie im Deutschen.", "As in English."]] },
    { group: ["Gaumenlaute", "Back sounds"], items: [
      ["g", "个", "gè", "Stück (Zählwort)", "measure word", "Wie ein weiches k, ohne Luftstoß.", "Like a soft k, no puff."],
      ["k", "看", "kàn", "sehen", "to look", "k mit kräftigem Luftstoß.", "k with a strong puff."],
      ["h", "好", "hǎo", "gut", "good", "Kratziger als im Deutschen, wie das ch in „Bach“.", "Rougher than English h, like ch in “Bach”."]] },
    { group: ["Hohe Zischlaute (Zunge unten)", "Palatals (tongue low)"], items: [
      ["j", "家", "jiā", "Haus, Familie", "home", "Weiches „dsch“, Zungenspitze hinter den unteren Zähnen.", "A soft “dj”, tongue tip behind the lower teeth."],
      ["q", "去", "qù", "gehen", "to go", "Wie j, aber mit Luftstoß: „tschi“.", "Like j but with a puff: “chi”."],
      ["x", "谢", "xiè", "danken", "to thank", "Weiches „sch“ zwischen s und sch, Mund wie beim Lächeln.", "A soft sound between s and sh, mouth as if smiling."]] },
    { group: ["Zungenspitze zurückgebogen", "Retroflex sounds"], items: [
      ["zh", "知", "zhī", "wissen", "to know", "Wie „dsch“ mit zurückgebogener Zunge.", "Like “dj” with the tongue curled back."],
      ["ch", "吃", "chī", "essen", "to eat", "Wie zh, aber mit Luftstoß.", "Like zh but with a puff."],
      ["sh", "是", "shì", "sein", "to be", "„Sch“ mit zurückgebogener Zunge.", "“Sh” with the tongue curled back."],
      ["r", "日", "rì", "Tag, Sonne", "day, sun", "Wie ein weiches, gebrummtes sch (französisches j).", "A soft, buzzed sh (like the s in “measure”)."]] },
    { group: ["Zischlaute (Zungenspitze vorn)", "Dental sounds"], items: [
      ["z", "在", "zài", "sein, in", "to be at", "Wie „ds“ in „Rads“, ohne Luftstoß.", "Like “ds” in “roads”, no puff."],
      ["c", "次", "cì", "Mal", "time (occasion)", "Wie „ts“ in „Zeit“, aber mit Luftstoß.", "Like “ts” in “cats” with a puff."],
      ["s", "三", "sān", "drei", "three", "Scharfes „ss“.", "A sharp “ss”."]] },
    { group: ["Halbvokale", "Glides"], items: [
      ["y", "一", "yī", "eins", "one", "Wie j in „Jahr“.", "Like y in “yes”."],
      ["w", "我", "wǒ", "ich", "I", "Wie das englische w.", "Like English w."]] }
  ],
  // Auslaute: [Laut, Zeichen, Pinyin, de, en, Hilfe de, Hilfe en]
  finals: [
    { group: ["Einfache Vokale", "Simple vowels"], items: [
      ["a", "啊", "ā", "ah", "ah", "Offenes a.", "Open a."],
      ["o", "喔", "ō", "oh", "oh", "Wie „o“, Lippen gerundet.", "Like “o” with rounded lips."],
      ["e", "喝", "hē", "trinken", "to drink", "Zwischen „ö“ und „o“, Mund breit, hinten im Hals.", "Between “uh” and “o”, back in the throat."],
      ["i", "你", "nǐ", "du", "you", "Wie „i“ in „Igel“.", "Like “ee”."],
      ["u", "五", "wǔ", "fünf", "five", "Wie „u“ in „Uhr“.", "Like “oo”."],
      ["ü", "绿", "lǜ", "grün", "green", "Wie „ü“: „i“ sagen, Lippen rund machen.", "Say “ee” with rounded lips."]] },
    { group: ["Zusammengesetzte Vokale", "Compound vowels"], items: [
      ["ai", "爱", "ài", "lieben", "to love", "Wie „ei“ in „Eis“.", "Like “eye”."],
      ["ei", "北", "běi", "Norden", "north", "Wie „ee-i“, ähnlich „ey“ in „hey“.", "Like “ay” in “day”."],
      ["ao", "好", "hǎo", "gut", "good", "Wie „au“ in „Haus“.", "Like “ow” in “now”."],
      ["ou", "都", "dōu", "alle", "all", "Wie englisch „oh“.", "Like “oh”."]] },
    { group: ["Mit -n und -ng", "With -n and -ng"], items: [
      ["an", "看", "kàn", "sehen", "to look", "„an“ mit Zungenspitze oben.", "“an” with the tongue tip up."],
      ["en", "们", "men", "Mehrzahl", "plural", "Wie „en“ in „wen“.", "Like “en” in “open”."],
      ["ang", "忙", "máng", "beschäftigt", "busy", "„ang“ hinten im Mund, Zunge bleibt unten.", "“ang”, tongue stays low."],
      ["eng", "能", "néng", "können", "can", "Wie „öng“.", "Like “ung”."],
      ["ong", "中", "zhōng", "Mitte", "middle", "Klingt wie „ung“.", "Sounds like “oong”."]] },
    { group: ["Mit i-, u-, ü-", "With i-, u-, ü-"], items: [
      ["ia", "家", "jiā", "Haus", "home", "„i“ + „a“.", "“ee” + “ah”."],
      ["ie", "谢", "xiè", "danken", "to thank", "„i“ + „e“, wie „jä“.", "“ee” + “eh”."],
      ["iao", "小", "xiǎo", "klein", "small", "„i“ + „ao“.", "“ee” + “ow”."],
      ["iu", "六", "liù", "sechs", "six", "Klingt wie „jou“.", "Sounds like “yo”."],
      ["ian", "天", "tiān", "Tag, Himmel", "day, sky", "Klingt wie „jän“.", "Sounds like “yen”."],
      ["in", "今", "jīn", "heute", "today", "„i“ + „n“.", "“ee” + “n”."],
      ["iang", "两", "liǎng", "zwei", "two", "„i“ + „ang“.", "“ee” + “ang”."],
      ["ing", "请", "qǐng", "bitte", "please", "„i“ + „ng“.", "“ee” + “ng”."],
      ["ua", "花", "huā", "Blume", "flower", "„u“ + „a“.", "“oo” + “ah”."],
      ["uo", "说", "shuō", "sagen", "to say", "„u“ + „o“.", "“oo” + “o”."],
      ["uai", "快", "kuài", "schnell", "fast", "„u“ + „ai“.", "“oo” + “eye”."],
      ["ui", "对", "duì", "richtig", "correct", "Klingt wie „uei“.", "Sounds like “way”."],
      ["uan", "玩", "wán", "spielen", "to play", "„u“ + „an“.", "“oo” + “an”."],
      ["un", "问", "wèn", "fragen", "to ask", "Klingt wie „uen“.", "Sounds like “wen”."],
      ["üe", "学", "xué", "lernen", "to study", "„ü“ + „e“.", "“ü” + “eh”."],
      ["üan", "远", "yuǎn", "weit", "far", "„ü“ + „an“.", "“ü” + “an”."],
      ["ün", "云", "yún", "Wolke", "cloud", "„ü“ + „n“.", "“ü” + “n”."]] }
  ],
  // Rechtschreib-Fallen
  traps: [
    ["Nach zh, ch, sh, r und z, c, s ist das geschriebene „i“ ein stummer Stützlaut (zhi, chi, shi, ri, zi, ci, si) – kein langes „i“.", "After zh, ch, sh, r and z, c, s the written “i” is just a buzz, not an “ee” (zhi, chi, shi, ri, zi, ci, si)."],
    ["Nach j, q, x, y wird „ü“ ohne Pünktchen geschrieben (ju, qu, xu, yu), klingt aber wie „ü“.", "After j, q, x, y the “ü” is written without dots (ju, qu, xu, yu) but still sounds like “ü”."],
    ["„-ian“ klingt wie „jän“, „-iu“ wie „jou“, „-ong“ wie „ung“.", "“-ian” sounds like “yen”, “-iu” like “yo”, “-ong” like “oong”."],
    ["Das „e“ klingt je nach Umgebung unterschiedlich (he, xie, hei).", "The “e” sounds different depending on its neighbours (he, xie, hei)."]
  ],
  // Töne hören: Silbe, vier Zeichen für Ton 1–4
  toneSets: [
    ["ma", "妈麻马骂"], ["shi", "诗十使是"], ["yi", "衣姨椅意"], ["tang", "汤糖躺烫"], ["wen", "温文稳问"],
    ["ji", "鸡急几记"], ["xi", "西席洗细"], ["qi", "七骑起气"], ["fu", "夫扶府父"]
  ],
  // Minimalpaare: [Pinyin A, Zeichen A, Pinyin B, Zeichen B]
  pairs: [
    ["bà", "爸", "pà", "怕"], ["dà", "大", "tà", "踏"], ["gè", "个", "kè", "课"], ["jī", "鸡", "qī", "七"], ["xī", "西", "shī", "诗"],
    ["zhī", "知", "chī", "吃"], ["zì", "字", "cì", "次"], ["sān", "三", "shān", "山"], ["qù", "去", "xù", "续"], ["lǎo", "老", "nǎo", "脑"]
  ]
};
