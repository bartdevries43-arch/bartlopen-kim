/* ================================================================== *
 *  Kim's Halve Marathon — Run Coach
 *  Vast schema + invullen/afvinken, Strava-achtige stats, badges.
 *  Alles lokaal in de browser. Geen server nodig (werkt ook via file://).
 *  Sturing: TIJD & GEVOEL leidend (Kim start vanaf 0 — kilometers volgen later vanzelf).
 * ================================================================== */

/* ========== INSTELLINGEN PER HARDLOPER — pas dit blok aan ==========
   Hergebruik deze app voor een andere loper: kopieer de map, wijzig dit
   blok, vervang coach.jpg, en pas zo nodig het PLAN/de ZONES aan.       */
const CONFIG = {
  appName:    "Op naar 21,1K",                 // titel boven in de app
  runner:     "Kim",                            // naam van de loper
  goal:       "21,1 km uitlopen — halve marathon", // doel (groot in de hero)
  startDate:  new Date(2026, 6, 6),              // maandag van week 1 (maand 0-based: 6 = juli)
  storeKey:   "kim-hm.log.v1",                   // UNIEKE opslagsleutel — per loper anders!
  coachName:  "Coach Bart",                      // naam van de coach
  coachHandle:"@bartlopen",                      // TikTok/social van de coach
  coachPhoto: "coach.jpg",                       // coachfoto (bestand in deze map)
  athleteWord:"strijder",                        // hoe de coach de loper aanspreekt
  catchphrase:"Van 0 naar 21,1 — stap voor stap, strijder 💪", // jouw TikTok-leus
};
/* =================================================================== */

const RUNNER = CONFIG.runner;
const GOAL = CONFIG.goal;
const START_DATE = CONFIG.startDate;
const STORE_KEY = CONFIG.storeKey;
const TOTAL_WEEKS = 28;
const COACH_INITIAL = (CONFIG.coachName.replace(/^coach\s+/i, "")[0] || "C").toUpperCase();

/* --- Tempozones — tijd & RPE leidend, paces zijn indicatief --------- */
const ZONES = [
  { key: "opbouw",   name: "Wandel-hardloop opbouw", pace: "8:00–9:30", info: "RPE 3-4 · hardlopen en wandelen wisselen elkaar af" },
  { key: "herstel",  name: "Heel rustig",            pace: "langzamer dan 8:00", info: "RPE 2-3 · herstel, wandelpauze mag altijd" },
  { key: "duur",     name: "Rustige duurloop",       pace: "7:00–7:45", info: "RPE 3-4 · praten moet makkelijk kunnen" },
  { key: "lang",     name: "Lange duurloop",         pace: "7:00–7:45", info: "RPE 3-5 · bouwt rustig naar de 21,1 km" },
  { key: "tempo",    name: "Tempoblok",               pace: "6:15–6:40", info: "RPE 6 · comfortabel oncomfortabel" },
  { key: "tienkm",   name: "10 km-tempo",             pace: "5:25–5:40", info: "RPE 7 · korte, beheerste blokken richting sub-55" },
  { key: "doel",     name: "HM-tempo",                pace: "≈ 6:50–7:10", info: "RPE 5-6 · het tempo dat je de hele 21,1 km volhoudt" },
];
const zoneByKey = Object.fromEntries(ZONES.map((z) => [z.key, z]));

/* --- Coach Bart (@bartlopen): warme, geduldige praat per type ------- */
const COACH = {
  opbouw: [
    "Rustig opbouwen, strijder. Elke minuut hardlopen is winst.",
    "Je hoeft niets te bewijzen — wandelen is hier gewoon onderdeel van het plan.",
    "Geniet van elke loopmoment, hoe kort ook. Dit is waar het begint.",
    "Van 0 naar 21,1 gaat stap voor stap, strijder. Precies zo.",
    "Voel je het wandelinterval als rust? Mooi, dan doe je het goed.",
    "Niet jagen op tempo. Vandaag telt alleen dat je in beweging bent.",
    "Elke training bouwt door op de vorige. Je bent al onderweg.",
    "Trots op jezelf mag hier, strijder — dit is de moeilijkste stap.",
  ],
  herstel: [
    "Hersteldag, strijder. Rustig aan, daar word je juist beter van.",
    "Vandaag laad je op. Herstel hoort net zo goed bij trainen.",
    "Houd het licht en kalm; morgen sta je er sterker.",
    "Wandelpauze nemen mag hier altijd — niets aan te bewijzen.",
    "Niets forceren vandaag. Gewoon losdraaien.",
    "Rust is waar de winst binnenkomt, strijder. Geniet ervan.",
    "Combineer je dit met Rocycle of Pilates deze week? Houd het dan extra rustig.",
  ],
  duur: [
    "Rustig tempo vandaag, strijder. Hier bouw je je basis op.",
    "Geen haast — deze kalme minuten maken je sterker.",
    "Lekker ontspannen lopen. Praten moet makkelijk kunnen, strijder.",
    "Rustig is precies goed. Zo blijf je fit en blessurevrij.",
    "Niets forceren vandaag. Stap voor stap bouw je het op.",
    "Soepele benen, rustige adem. Mooi onderweg, strijder.",
    "Deze rustige minuten tellen net zo hard als de lange loop.",
  ],
  lang: [
    "De lange duurloop, strijder. Rustig beginnen, sterk eindigen.",
    "Tijd op de benen betaalt zich later uit. Jij kunt dit, strijder.",
    "Verdeel je krachten en geniet van de tijd die je maakt.",
    "Elke minuut telt vandaag. Mooi onderweg, strijder.",
    "Bewust rustiger dan je voelt — dat is precies goed.",
    "Geduld is je kracht vandaag, strijder. Lekker doorkabbelen.",
    "Dit is de basis onder je halve marathon. Stap voor stap.",
    "Wandelpauze nodig? Neem 'm — dat is slim trainen, geen falen.",
  ],
  tempo: [
    "Tempoblok, strijder: stevig, maar netjes onder controle.",
    "Zoek een gelijkmatig, vlot ritme. Hier word je sneller van.",
    "Net buiten je comfortzone — daar zit je winst, strijder.",
    "Beheerst doorzetten. Je tilt je niveau rustig omhoog.",
    "Korte zinnen moeten nog lukken. Mooi gedoseerd, strijder.",
    "Niet jagen tot je verzuurt — vlot en in balans.",
    "Voel je sterker worden, strijder. Houd 'm beheerst.",
  ],
  tienkm: [
    "Richting 5:30/km, strijder. Beheerst snel is vandaag precies goed.",
    "Bart pakt straks het tempo; jij leert nu hoe sub-55 hoort te voelen.",
    "Vlot, ontspannen en technisch netjes. Geen sprint, wel focus.",
    "Maak de snelle blokken gelijkmatig. De laatste mag niet de zwaarste zijn.",
    "Maastunnelloop in zicht — vertrouwen verzamelen, niet forceren.",
  ],
  doel: [
    "HM-tempo, strijder. Onthoud goed hoe dit voelt voor je race.",
    "Dit is je wedstrijdritme. Vertrouw op je benen, strijder.",
    "Beheerst op tempo blijven — precies waar je het voor doet.",
    "Voel je halve-marathontempo, strijder. Je bouwt er rustig naartoe.",
    "Niet sneller dan dit. Rustig vertrouwen, strijder.",
    "Dit ritme ga je terugzien in Maassluis. Prent het in.",
    "Gecontroleerd op koers, strijder. Mooi in balans.",
  ],
};

const DONE = [
  "💪 Sterk gedaan, strijder!",
  "✅ Weer een stap dichterbij, strijder!",
  "🙌 Mooi volgehouden, strijder!",
  "🌟 Knap werk, strijder!",
  "🏃‍♀️ Lekker bezig, strijder!",
  "💚 Rustig sterk, strijder!",
];
const coachLine = (zone) => {
  const arr = COACH[zone] || COACH.duur;
  return arr[Math.floor(Math.random() * arr.length)];
};

/* --- Waarom deze training? (uitleg per type) ------------------------ */
const WHY = {
  opbouw:   "Door hardlopen en wandelen af te wisselen went je lichaam stap voor stap aan de belasting, zonder dat het te veel wordt. Zo bouw je een aerobe basis op en blijf je blessurevrij — precies de eerste stap tussen 0 en 21,1 km.",
  herstel:  "Herstel is waar je sterker wordt. Lichte inspanning (of gewoon rust) houdt het bloed stromen zonder nieuwe belasting, zodat de winst van de vorige trainingen — en van Rocycle of Pilates — echt binnenkomt.",
  duur:     "Rustige duurlopen bouwen je aerobe motor: sterker hart, meer haarvaten en betere vetverbranding. Het grootste deel van je trainingstijd hoort hier rustig te zijn — zo kun je vaker en blessurevrij trainen.",
  lang:     "De lange duurloop traint je uithoudingsvermogen en de gewenning aan tijd op de benen. Je leert energie sparen en mentaal doorzetten — de basis onder een sterke halve marathon.",
  tempo:    "Tempoblokken liggen rond je omslagpunt. Je leert vlotter lopen zónder te verzuren, zodat lopen op een steviger tempo straks minder zwaar voelt.",
  tienkm:   "Deze korte blokken laten je gecontroleerd wennen aan ongeveer 5:30 per kilometer, het ritme voor een 10 kilometer onder de 55 minuten. De herstelpauzes houden de kwaliteit hoog zonder dat deze tussendoelrace je halve-marathonopbouw overneemt.",
  doel:     "Lopen op je halve-marathontempo maakt dat tempo vertrouwd. Op de racedag in Maassluis voelt het dan als thuiskomen in plaats van een gok.",
};

/* --- Helpers om het schema compact te schrijven ---------------------
   min = totale trainingstijd (incl. wandelen/in- en uitlopen). Loopdagen:
   woensdag (kwaliteit) · zaterdag (lang) · alleen in raceweek: zondag. */
const wo = (o) => ({ day: "wo", dayLabel: "Woensdag", kind: "Kwaliteit",       ...o });
const za = (o) => ({ day: "za", dayLabel: "Zaterdag",  kind: "Lange duurloop", ...o });
const zo = (o) => ({ day: "zo", dayLabel: "Zondag",    kind: "Wedstrijd",      ...o });

/* --- Het 28-weken schema (van 0 naar de halve marathon van Maassluis, 17 jan 2027) --- */
const PLAN = [
  /* ---- Fase 1 · Wandelen naar hardlopen ---- */
  { week: 1, dates: "6–12 jul", phase: "Fase 1 · Wandelen naar hardlopen", sessions: [
    wo({ zone: "opbouw", min: 20, kind: "Hardlopen-wandelen", title: "Interval 1: 1 min hardlopen", goal: "Rustig wennen aan de eerste stapjes hardlopen", blocks: ["5 min stevig wandelen als warming-up", "8×(1 min hardlopen + 2 min wandelen)", "5 min rustig uitwandelen"] }),
    za({ zone: "opbouw", min: 25, kind: "Hardlopen-wandelen", title: "Interval 1: iets langer volhouden", goal: "Hetzelfde patroon, iets langer", blocks: ["5 min wandelen warm", "10×(1 min hardlopen + 2 min wandelen)", "5 min uitwandelen"] }),
  ]},
  { week: 2, dates: "13–19 jul", phase: "Fase 1 · Wandelen naar hardlopen", sessions: [
    wo({ zone: "opbouw", min: 22, kind: "Hardlopen-wandelen", title: "Interval 2: 1,5 min hardlopen", goal: "Iets langer doorlopen per keer", blocks: ["5 min wandelen warm", "7×(1,5 min hardlopen + 2 min wandelen)", "4 min uitwandelen"] }),
    za({ zone: "opbouw", min: 26, kind: "Hardlopen-wandelen", title: "Interval 2: iets langer volhouden", goal: "Hetzelfde patroon, iets langer", blocks: ["5 min wandelen warm", "8×(1,5 min hardlopen + 2 min wandelen)", "5 min uitwandelen"] }),
  ]},
  { week: 3, dates: "20–26 jul", phase: "Fase 1 · Wandelen naar hardlopen", sessions: [
    wo({ zone: "opbouw", min: 24, kind: "Hardlopen-wandelen", title: "Interval 3: 2 min hardlopen", goal: "De loopblokken worden langer dan de wandelblokken", blocks: ["5 min wandelen warm", "6×(2 min hardlopen + 1,5 min wandelen)", "6 min uitwandelen"] }),
    za({ zone: "opbouw", min: 28, kind: "Hardlopen-wandelen", title: "Interval 3: iets langer volhouden", goal: "Hetzelfde patroon, iets langer", blocks: ["5 min wandelen warm", "7×(2 min hardlopen + 1,5 min wandelen)", "6 min uitwandelen"] }),
  ]},
  { week: 4, dates: "27 jul–2 aug", phase: "Fase 1 · Wandelen naar hardlopen", recovery: true, sessions: [
    wo({ zone: "herstel", min: 18, kind: "Hardlopen-wandelen", title: "Herstelweek: rustig aan", goal: "Even een stapje terug, dat hoort erbij", blocks: ["5 min wandelen", "4×(2 min hardlopen + 2 min wandelen)", "5 min wandelen"] }),
    za({ zone: "herstel", min: 22, kind: "Hardlopen-wandelen", title: "Herstelweek: iets langer", goal: "Rustig blijven, geen nieuwe prikkel", blocks: ["5 min wandelen", "5×(2 min hardlopen + 2 min wandelen)", "5 min wandelen"] }),
  ]},

  { week: 5, dates: "3–9 aug", phase: "Fase 1 · Wandelen naar hardlopen", sessions: [
    wo({ zone: "opbouw", min: 26, kind: "Hardlopen-wandelen", title: "Interval 4: 3 min hardlopen", goal: "De loopblokken groeien door", blocks: ["5 min wandelen warm", "5×(3 min hardlopen + 1,5 min wandelen)", "5 min uitwandelen"] }),
    za({ zone: "opbouw", min: 30, kind: "Hardlopen-wandelen", title: "Interval 4: iets langer volhouden", goal: "Hetzelfde patroon, iets langer", blocks: ["5 min wandelen warm", "6×(3 min hardlopen + 1,5 min wandelen)", "5 min uitwandelen"] }),
  ]},
  { week: 6, dates: "10–16 aug", phase: "Fase 1 · Wandelen naar hardlopen", sessions: [
    wo({ zone: "opbouw", min: 28, kind: "Hardlopen-wandelen", title: "Interval 5: 5 min hardlopen", goal: "Bijna aan één stuk", blocks: ["5 min wandelen warm", "4×(5 min hardlopen + 1 min wandelen)", "3 min uitwandelen"] }),
    za({ zone: "opbouw", min: 32, title: "🎉 Eerste 20 minuten aan één stuk!", goal: "Mijlpaal: continu hardlopen zonder wandelpauze", blocks: ["5 min wandelen warm", "20 min aan één stuk hardlopen, RPE 3-4", "7 min rustig uitwandelen of -lopen"] }),
  ]},

  /* ---- Fase 2 · Duur opbouwen ---- */
  { week: 7, dates: "17–23 aug", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "duur", min: 30, title: "30 min rustige duurloop", goal: "Eerste volledige duurloop zonder wandelpauze", blocks: ["5 min inlopen", "20 min duurloop, RPE 3-4", "5 min uitlopen"] }),
    za({ zone: "lang", min: 35, title: "35 min lange duurloop", goal: "Bouwt door op je eerste 20 minuten", blocks: ["35 min rustig, RPE 3-4", "Wandelpauze mag als dat nodig is"] }),
  ]},
  { week: 8, dates: "24–30 aug", phase: "Fase 2 · Duur opbouwen", recovery: true, sessions: [
    wo({ zone: "herstel", min: 24, title: "24 min heel rustig", goal: "Herstelweek", blocks: ["24 min heel rustig, RPE 2-3", "Wandelpauze mag altijd"] }),
    za({ zone: "herstel", min: 28, title: "28 min ontspannen", goal: "Herstel, geen tempo", blocks: ["28 min ontspannen, geen tempo"] }),
  ]},
  { week: 9, dates: "31 aug–6 sep", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "duur", min: 32, title: "32 min rustige duurloop", goal: "Volume", blocks: ["5 min inlopen", "22 min duurloop, RPE 3-4", "5 min uitlopen"] }),
    za({ zone: "lang", min: 42, title: "42 min lange duurloop", goal: "Duur opbouwen", blocks: ["42 min rustig, RPE 3-4", "Constant tempo, niet jagen"] }),
  ]},
  { week: 10, dates: "7–13 sep", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "duur", min: 34, title: "34 min rustige duurloop", goal: "Volume", blocks: ["5 min inlopen", "24 min duurloop, RPE 3-4", "5 min uitlopen"] }),
    za({ zone: "lang", min: 48, title: "48 min lange duurloop", goal: "Duur opbouwen", blocks: ["48 min rustig, RPE 3-4", "Drinken oefenen als het warm is"] }),
  ]},
  { week: 11, dates: "14–20 sep", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "duur", min: 36, title: "36 min rustige duurloop", goal: "Volume", blocks: ["5 min inlopen", "26 min duurloop, RPE 3-4", "5 min uitlopen"] }),
    za({ zone: "lang", min: 52, title: "52 min lange duurloop", goal: "Duur vasthouden", blocks: ["52 min rustig, RPE 3-4"] }),
  ]},
  { week: 12, dates: "21–27 sep", phase: "Fase 2 · Duur opbouwen", recovery: true, sessions: [
    wo({ zone: "herstel", min: 26, title: "26 min heel rustig", goal: "Herstelweek", blocks: ["26 min heel rustig, RPE 2-3"] }),
    za({ zone: "herstel", min: 38, title: "38 min ontspannen", goal: "Herstel, geen tempo", blocks: ["38 min ontspannen, geen tempo"] }),
  ]},
  { week: 13, dates: "28 sep–4 okt", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "duur", min: 36, title: "Rustig + 6 korte versnellingen", goal: "Soepele snelheid voorbereiden richting de Maastunnelloop", blocks: ["25 min rustige duurloop, RPE 3-4", "6×20 sec soepel versnellen, ruim onder sprinttempo", "Steeds 60 sec rustig dribbelen", "Rustig uitlopen"] }),
    za({ zone: "lang", min: 56, title: "56 min lange duurloop", goal: "Duur vasthouden", blocks: ["56 min rustig, RPE 3-4"] }),
  ]},
  { week: 14, dates: "5–11 okt", phase: "Fase 2 · Duur opbouwen", sessions: [
    wo({ zone: "tempo", min: 40, title: "5×3 min richting 10 km-tempo", goal: "Eerste gecontroleerde stap richting sub-55", blocks: ["10 min rustig inlopen", "5×3 min op 5:50–6:00/km, RPE 6", "2 min rustig dribbelen tussen de blokken", "Rustig uitlopen"] }),
    za({ zone: "lang", min: 60, title: "🎉 Eerste uur hardlopen!", goal: "Mijlpaal: 60 minuten aan één stuk", blocks: ["60 min rustig, RPE 3-4", "Mooi keerpunt richting de halve marathon"] }),
  ]},

  /* ---- Fase 3 · Naar sub-55 in de Maastunnelloop ---- */
  { week: 15, dates: "12–18 okt", phase: "Fase 3 · Naar sub-55 in de Maastunnelloop", sessions: [
    wo({ zone: "tienkm", min: 42, title: "4×4 min richting sub-55", goal: "Het 10 km-ritme stap voor stap benaderen", blocks: ["10 min rustig inlopen", "4×4 min op 5:40–5:45/km, RPE 6-7", "2,5 min rustig dribbelen tussen de blokken", "Rustig uitlopen"] }),
    za({ zone: "lang", min: 65, title: "65 min lange duurloop", goal: "Duur uitbouwen", blocks: ["65 min rustig, RPE 3-5"] }),
  ]},
  { week: 16, dates: "19–25 okt", phase: "Fase 3 · Naar sub-55 in de Maastunnelloop", recovery: true, sessions: [
    wo({ zone: "herstel", min: 30, title: "Herstel + 4 ontspannen strides", goal: "Herstellen en het loopgevoel fris houden", blocks: ["24 min heel rustig, RPE 2-3", "4×20 sec ontspannen versnellen", "Steeds volledig rustig herstellen"] }),
    za({ zone: "herstel", min: 48, title: "48 min ontspannen", goal: "Herstel, geen tempo", blocks: ["48 min ontspannen, geen tempo"] }),
  ]},
  { week: 17, dates: "26 okt–1 nov", phase: "Fase 3 · Naar sub-55 in de Maastunnelloop", sessions: [
    wo({ zone: "tienkm", min: 45, title: "3×1 km op beoogd 10 km-tempo", goal: "5:30/km gecontroleerd leren vasthouden", blocks: ["12 min rustig inlopen", "3×1 km op 5:30–5:35/km, RPE 7", "3 min rustig dribbelen tussen de kilometers", "10 min rustig uitlopen", "Stop het snelle werk als de loopvorm inzakt"] }),
    za({ zone: "lang", min: 65, title: "65 min rustige duurloop", goal: "Duur onderhouden zonder vermoeid de raceweek in te gaan", blocks: ["65 min rustig, RPE 3-4", "Geen snelle finale — frisheid gaat voor"] }),
  ]},
  { week: 18, dates: "2–8 nov", phase: "Fase 3 · Naar sub-55 in de Maastunnelloop", tuneup: true, sessions: [
    wo({ zone: "duur", min: 28, title: "Raceweek: loslopen + 4 prikkels", goal: "Frisse benen met even het wedstrijdritme voelen", blocks: ["18 min heel rustig, RPE 3", "4×1 min op ongeveer 5:30/km", "Steeds 90 sec heel rustig dribbelen", "Kort uitlopen — stop terwijl het makkelijk voelt"] }),
    zo({ zone: "tienkm", min: 75, title: "🏁 Maastunnelloop · 10 km", goal: "Met Bart als pacer richting sub-55", kind: "Tussendoelrace", why: "Dit is je tussendoel: 10 kilometer door Rotterdam, met Bart als pacer richting sub-55. Alle korte tempoblokken van de afgelopen weken komen hier samen. Open gecontroleerd, laat Bart het tempo bewaken en geniet ervan — een sterke, gelijkmatige race is belangrijker dan de exacte tijd. Daarna verschuift de focus weer volledig naar je halve marathon.", blocks: ["10–12 min rustig inlopen en een paar korte versnellingen", "Km 1–2: gecontroleerd op circa 5:32/km", "Km 3–8: samen met Bart zo vlak mogelijk rond 5:28–5:30/km", "Km 9–10: op gevoel versnellen als er nog ruimte is", "Doel: onder 55:00, maar een sterke gelijkmatige race gaat voor", "10 min rustig uitlopen en goed herstellen"] }),
  ]},
  /* ---- Fase 4 · Van 10 km naar de Halve ---- */
  { week: 19, dates: "9–15 nov", phase: "Fase 4 · Van 10 km naar de Halve", recovery: true, sessions: [
    wo({ zone: "herstel", min: 30, title: "Herstel na de Maastunnelloop", goal: "De 10 km verwerken", blocks: ["30 min heel rustig, RPE 2-3", "Wandelen of een extra rustdag mag als de benen nog zwaar zijn"] }),
    za({ zone: "lang", min: 65, title: "65 min ontspannen duurloop", goal: "Rustig terug naar de halve-marathonopbouw", blocks: ["65 min rustig, RPE 3-4", "Geen tempo — alleen soepel minuten maken"] }),
  ]},
  { week: 20, dates: "16–22 nov", phase: "Fase 4 · Van 10 km naar de Halve", sessions: [
    wo({ zone: "duur", min: 38, title: "38 min progressieve duurloop", goal: "De focus terug naar duur en halve marathon", blocks: ["10 min heel rustig", "18 min rustige duurloop, RPE 3-4", "10 min steady, RPE 5", "Niet terug naar 10 km-tempo"] }),
    za({ zone: "lang", min: 90, title: "🎉 Anderhalf uur!", goal: "Langste duurloop tot nu toe", blocks: ["90 min rustig, RPE 3-5", "Verdeel je krachten en oefen drinken"] }),
  ]},
  { week: 21, dates: "23–29 nov", phase: "Fase 4 · Van 10 km naar de Halve", sessions: [
    wo({ zone: "doel", min: 40, title: "Eerste stukken op HM-tempo", goal: "Wennen aan het tempo dat je straks de hele 21,1 km volhoudt", blocks: ["10 min inlopen", "2×10 min op HM-gevoel, RPE 5-6", "4 min rustig ertussen", "uitlopen"] }),
    za({ zone: "lang", min: 100, title: "100 min lange duurloop", goal: "Duur uitbouwen", blocks: ["100 min rustig, RPE 3-5"] }),
  ]},
  { week: 22, dates: "30 nov–6 dec", phase: "Fase 4 · Van 10 km naar de Halve", sessions: [
    wo({ zone: "doel", min: 40, title: "2×12 min op HM-tempo", goal: "HM-ritme voelen", blocks: ["10 min inlopen", "2×12 min op HM-gevoel, RPE 5-6", "4 min rustig ertussen", "uitlopen"] }),
    za({ zone: "lang", min: 108, title: "108 min lange duurloop", goal: "Duur uitbouwen", blocks: ["108 min rustig, RPE 3-5"] }),
  ]},

  /* ---- Fase 5 · Piek, taper & race ---- */
  { week: 23, dates: "7–13 dec", phase: "Fase 5 · Piek, taper & race", sessions: [
    wo({ zone: "doel", min: 35, title: "3×8 min op HM-tempo", goal: "HM-ritme voelen", blocks: ["10 min inlopen", "3×8 min op HM-gevoel, RPE 5-6", "3 min rustig ertussen", "uitlopen"] }),
    za({ zone: "lang", min: 120, title: "🎉 Twee uur!", goal: "Piekmoment nummer 1", blocks: ["120 min rustig, RPE 3-5", "Oefen precies wat je op de racedag eet en drinkt"] }),
  ]},
  { week: 24, dates: "14–20 dec", phase: "Fase 5 · Piek, taper & race", recovery: true, sessions: [
    wo({ zone: "herstel", min: 28, title: "28 min heel rustig", goal: "Herstelweek", blocks: ["28 min heel rustig, RPE 2-3"] }),
    za({ zone: "herstel", min: 75, title: "75 min ontspannen", goal: "Even bijkomen na de piekweek", blocks: ["75 min ontspannen, geen tempo"] }),
  ]},
  { week: 25, dates: "21–27 dec", phase: "Fase 5 · Piek, taper & race", sessions: [
    wo({ zone: "doel", min: 35, title: "3×8 min op HM-tempo", goal: "HM-ritme voelen", blocks: ["10 min inlopen", "3×8 min op HM-gevoel, RPE 5-6", "3 min rustig ertussen", "uitlopen"] }),
    za({ zone: "lang", min: 130, title: "🎉 Piek-duurloop: langste training van het schema", goal: "Hierna gaat het volume omlaag richting de wedstrijd", blocks: ["130 min rustig, RPE 3-5"] }),
  ]},
  { week: 26, dates: "28 dec–3 jan", phase: "Fase 5 · Piek, taper & race", taper: true, sessions: [
    wo({ zone: "duur", min: 25, title: "25 min rustig", goal: "Taper start", blocks: ["25 min rustig, RPE 3-4", "Dagen rond de jaarwisseling — verzet gerust als het beter uitkomt"] }),
    za({ zone: "lang", min: 70, title: "70 min rustig", goal: "Omvang omlaag", blocks: ["70 min rustig, RPE 3-4"] }),
  ]},
  { week: 27, dates: "4–10 jan", phase: "Fase 5 · Piek, taper & race", taper: true, sessions: [
    wo({ zone: "duur", min: 20, title: "20 min rustig", goal: "Benen licht houden", blocks: ["20 min rustig, RPE 3"] }),
    za({ zone: "lang", min: 40, title: "40 min soepel", goal: "Kort en fris, vertrouwen opbouwen", blocks: ["40 min soepel, RPE 3"] }),
  ]},
  { week: 28, dates: "11–17 jan", phase: "Fase 5 · Piek, taper & race", taper: true, race: true, sessions: [
    wo({ zone: "duur", min: 15, title: "Laatste losse loop voor de race", goal: "Benen los, hoofd rustig", blocks: ["15 min heel soepel, RPE 2-3", "Niets meer bewijzen — je hebt het werk al gedaan"] }),
    zo({ zone: "doel", min: 150, title: "🏁 Halve Maassluis", goal: "Doelrace · 21,1 km uitlopen", kind: "Doelrace", why: "Dit is waar je een half jaar naartoe hebt gewerkt: 21,1 kilometer. De lange duurlopen, het HM-tempo en de mentale kilometers zitten in je benen. Start bewust rustig, zoek je eigen duurzame ritme en vertrouw op je opbouw — dit is jouw dag, strijder.", blocks: ["Eerste paar kilometer bewust rustig starten", "Zoek daarna je eigen duurzame ritme, RPE 5-6", "Geniet van het publiek in Maassluis", "Laatste kilometers op gevoel — en trots zijn op wat je hebt opgebouwd"] }),
  ]},
];

/* --- Extra advies (info-kaarten) ------------------------------------ */
const INFO = [
  { icon: "🔥", title: "Warming-up & wandelen-wennen", items: [
    "Fase 1: begin elke training met 5 min stevig wandelen als warming-up.",
    "Volg het hardloop-/wandelritme uit het schema — niet vooruitlopen op het volgende blok.",
    "Elke training: rustig uitwandelen of -lopen om af te sluiten.",
  ]},
  { icon: "💪", title: "Kracht, mobiliteit & rust", items: [
    "Rocycle en Reformer Pilates tellen mee als training — plan ze bij voorkeur niet vlak vóór je woensdagtraining.",
    "5–8 min mobiliteit na het lopen: kuiten, heupbuigers, bilspieren, hamstrings.",
    "Minstens 1 echte rustdag per week naast je 2 hardloopdagen en je andere sporten.",
    "Nieuwe pijn die tijdens het lopen verandert of oploopt: stop en bouw rustiger op.",
  ]},
  { icon: "🥤", title: "Voeding & drinken", items: [
    "Langer dan 75 min: 400–600 ml per uur, bij warmte met elektrolyten.",
    "Vanaf ~60–70 min: oefen met een gel of iets kleins koolhydraatrijks.",
    "2–3 uur voor een lange duurloop een koolhydraatrijke maaltijd.",
    "Na afloop binnen 1–2 uur eiwit + koolhydraten.",
  ]},
  { icon: "🌉", title: "Maastunnelloop · samen naar sub-55", items: [
    "De opbouw in week 13–17 gaat van korte strides naar 3×1 km rond 5:30/km.",
    "Raceweek: woensdag alleen kort loslopen met vier rustige tempo-prikkels.",
    "Bart bepaalt het tempo: gecontroleerd openen en daarna zo vlak mogelijk rond 5:28–5:30/km.",
    "Sub-55 is het doel, maar een sterke gelijkmatige 10 km zonder forceren is altijd winst.",
    "Week 19 is bewust herstel; daarna verschuift de focus weer volledig naar de halve marathon.",
  ]},
  { icon: "🎯", title: "Taper & racedag Maassluis", items: [
    "Week 26–28: omvang flink omlaag, je moet je bijna té fris voelen.",
    "De Halve Maassluis is op zondag 17 januari 2027 — woensdag ervoor is alleen een korte losloop.",
    "Start bewust rustig, zoek daarna je eigen duurzame ritme.",
    "Uitlopen is het hoofddoel — geniet ervan, je hebt het werk al gedaan.",
  ]},
];

/* --- Badges ---------------------------------------------------------- */
const BADGES = [
  { id: "first",  icon: "👟",  name: "Eerste run",        desc: "1 training afgevinkt",       test: (s) => s.done >= 1 },
  { id: "ten",    icon: "🔟",  name: "Tien op de teller", desc: "10 trainingen gedaan",        test: (s) => s.done >= 10 },
  { id: "half",   icon: "⚡",  name: "Halverwege",        desc: "50% van het schema",          test: (s) => s.done >= s.total / 2 },
  { id: "week",   icon: "✅",  name: "Week compleet",     desc: "Een hele week afgerond",       test: (s) => s.fullWeeks >= 1 },
  { id: "long",   icon: "🏔️", name: "Lange loper",       desc: "≥ 90 min gelopen",             test: (s) => s.maxTime >= 90 * 60 },
  { id: "fast",   icon: "💨",  name: "Snelle benen",      desc: "Een run onder 7:00/km",        test: (s) => s.bestPace > 0 && s.bestPace < 420 },
  { id: "tunnel", icon: "🌉",  name: "Tunneltemmer",      desc: "Maastunnelloop voltooid",      test: (s) => s.tenKDone },
  { id: "sub55",  icon: "⏱️", name: "Sub-55",            desc: "10 km onder 55:00",            test: (s) => s.tenKSub55 },
  { id: "streak", icon: "🔥",  name: "On fire",           desc: "Reeks van 5 trainingen",       test: (s) => s.streak >= 5 },
  { id: "finish", icon: "🏅",  name: "Finisher",          desc: "Halve marathon voltooid",      test: (s) => s.raceDone },
];

/* ================================================================== *
 *  State
 * ================================================================== */
function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}
function saveLog() { localStorage.setItem(STORE_KEY, JSON.stringify(log)); }
let log = loadLog();

const sid = (week, day) => `w${week}-${day}`;
const flatSessions = PLAN.flatMap((w) => w.sessions.map((s) => ({ ...s, week: w.week })));
const totalSessions = flatSessions.length;
const DAY_OFFSET = { ma: 0, di: 1, wo: 2, do: 3, vr: 4, za: 5, zo: 6 };

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function dateAtDay(dayIndex) {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + dayIndex);
  date.setHours(12, 0, 0, 0);
  return date;
}

function sessionDate(week, day) {
  return dateAtDay((week - 1) * 7 + (DAY_OFFSET[day] ?? 0));
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function planningEntries() {
  return Array.isArray(log.__planning) ? log.__planning : [];
}

function planningForWeek(week) {
  const start = isoDate(dateAtDay((week - 1) * 7));
  const end = isoDate(dateAtDay((week - 1) * 7 + 6));
  return planningEntries().filter((entry) => entry.start <= end && (entry.end || entry.start) >= start);
}

function parseTime(str) {
  if (!str) return null;
  const parts = String(str).split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 60;
}

function durationParts(str) {
  const total = parseTime(str) || 0;
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

function durationValue(minutes, seconds) {
  const m = Math.max(0, parseInt(minutes, 10) || 0);
  const s = Math.min(59, Math.max(0, parseInt(seconds, 10) || 0));
  return `${m}:${String(s).padStart(2, "0")}`;
}
function paceSeconds(distance, timeStr) {
  const d = parseFloat(String(distance).replace(",", "."));
  const sec = parseTime(timeStr);
  if (!d || !sec) return null;
  return sec / d;
}
function fmtPace(perKm) {
  if (!perKm) return null;
  const m = Math.floor(perKm / 60);
  const s = Math.round(perKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/* Afgeleide statistieken uit de log */
function computeStats() {
  let done = 0, km = 0, maxDist = 0, maxTime = 0, bestPace = 0, raceDone = false, tenKDone = false, tenKSub55 = false;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (!e || !e.done) return;
    done++;
    const d = parseFloat(String(e.distance || "").replace(",", ".")) || 0;
    km += d;
    if (d > maxDist) maxDist = d;
    const t = parseTime(e.time) || 0;
    if (t > maxTime) maxTime = t;
    const p = paceSeconds(e.distance, e.time);
    if (p && (bestPace === 0 || p < bestPace)) bestPace = p;
    if (s.week === 18 && s.day === "zo") {
      tenKDone = true;
      tenKSub55 = t > 0 && t < 55 * 60;
    }
    if (s.week === TOTAL_WEEKS && s.day === "zo") raceDone = true;
  });
  let streak = 0, run = 0;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (e && e.done) { run++; streak = Math.max(streak, run); } else run = 0;
  });
  let fullWeeks = 0;
  PLAN.forEach((w) => {
    if (w.sessions.every((s) => log[sid(w.week, s.day)]?.done)) fullWeeks++;
  });
  return { done, total: totalSessions, km, maxDist, maxTime, bestPace, raceDone, tenKDone, tenKSub55, streak, fullWeeks };
}

function currentWeek() {
  const diff = Math.floor((Date.now() - START_DATE.getTime()) / (7 * 864e5));
  return Math.min(TOTAL_WEEKS, Math.max(1, diff + 1));
}

/* ================================================================== *
 *  Rendering
 * ================================================================== */
const $ = (id) => document.getElementById(id);

function animateCount(el, to, suffix = "") {
  const dur = 700, t0 = performance.now();
  const dec = to % 1 !== 0;
  function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    const v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = (dec ? v.toFixed(1) : Math.round(v)) + suffix;
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderHero(stats) {
  $("runnerName").textContent = RUNNER;
  $("goalText").textContent = GOAL;
  const pct = Math.round((stats.done / stats.total) * 100);
  $("ringPct").textContent = `${pct}%`;
  const r = 52, c = 2 * Math.PI * r;
  const fg = $("ringFg");
  fg.style.strokeDasharray = c;
  fg.style.strokeDashoffset = c;
  requestAnimationFrame(() => { fg.style.strokeDashoffset = c * (1 - pct / 100); });
  const mottos = ["Zet 'm op, strijder!", "Lekker bezig, strijder!", "Je bouwt 'm rustig op, strijder.", "Halverwege — knap volgehouden! ⚡", "Bijna race-klaar, strijder!", "Finisher! Wat een prestatie, strijder. 🏅"];
  $("heroMotto").textContent =
    stats.raceDone ? mottos[5] : pct >= 80 ? mottos[4] : pct >= 50 ? mottos[3] : pct >= 20 ? mottos[2] : pct > 0 ? mottos[1] : mottos[0];
  renderCountdown();
}

function raceInfo() {
  const rw = PLAN.find((w) => w.race) || PLAN[PLAN.length - 1];
  const rs = rw.sessions.find((s) => s.day === "zo") || rw.sessions[rw.sessions.length - 1];
  const off = { ma: 0, di: 1, wo: 2, do: 3, vr: 4, za: 5, zo: 6 }[rs.day] ?? 5;
  const date = new Date(START_DATE.getTime() + ((rw.week - 1) * 7 + off) * 864e5);
  const days = Math.round((date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  return { days, name: rs.title.replace(/^🏁\s*/, "") };
}
function renderCountdown() {
  const motto = $("heroMotto");
  if (!motto) return;
  let el = $("raceCountdown");
  if (!el) {
    el = document.createElement("p");
    el.id = "raceCountdown";
    el.className = "hero-countdown";
    motto.after(el);
  }
  const { days, name } = raceInfo();
  const wks = Math.round(days / 7), mon = Math.round(days / 30);
  el.textContent =
    days > 180 ? `🗓️ jouw grote doel: over ~${mon} maanden — ${name}` :
    days > 14 ? `🗓️ nog ${wks} weken tot je ${name}` :
    days > 1 ? `🗓️ nog ${days} dagen tot je ${name}` :
    days === 1 ? `🗓️ morgen is het zover: ${name}!` :
    days === 0 ? `🔥 vandaag is het zover: ${name}!` :
    `🎉 ${name} volbracht — chapeau!`;
}

function renderStats(stats) {
  animateCount($("statDone"), stats.done);
  animateCount($("statKm"), Math.round(stats.km * 10) / 10, " km");
  animateCount($("statStreak"), stats.streak);
  const cw = currentWeek();
  const wk = PLAN.find((w) => w.week === cw);
  const wkDone = wk.sessions.filter((s) => log[sid(cw, s.day)]?.done).length;
  $("statWeek").textContent = `${wkDone}/${wk.sessions.length}`;
}

function renderNextUp() {
  const cw = currentWeek();
  const next =
    flatSessions.find((s) => s.week >= cw && !log[sid(s.week, s.day)]?.done) ||
    flatSessions.find((s) => !log[sid(s.week, s.day)]?.done);
  const box = $("nextUp");
  if (!next) {
    box.innerHTML = `<div class="nextup-card done"><span class="nextup-eyebrow">🏅 Schema compleet</span><strong>Alles afgevinkt — chapeau, ${RUNNER}!</strong></div>`;
    return;
  }
  const z = zoneByKey[next.zone];
  box.innerHTML = `
    <button class="nextup-card zone-${next.zone}" data-week="${next.week}" data-day="${next.day}">
      <span class="nextup-eyebrow">Volgende training · week ${next.week} · ${next.dayLabel}</span>
      <strong>${next.title}</strong>
      <span class="nextup-meta">${next.min} min · ${z.name}</span>
      <span class="nextup-go">Openen ›</span>
    </button>`;
  box.querySelector(".nextup-card").addEventListener("click", () => openDetail(next.week, next.day));
}

const PLANNING_META = {
  race: {
    icon: "🏁", label: "Tussentijdse race",
    advice: "Laat deze race je lange training vervangen. Houd de training ervoor rustig en plan daarna minimaal één hersteldag.",
  },
  vacation: {
    icon: "🌴", label: "Vakantie",
    advice: "Gemiste trainingen hoef je niet in te halen. Pak bij thuiskomst de eerstvolgende rustige training op.",
  },
  rest: {
    icon: "🩹", label: "Rust / blessure",
    advice: "Herstel gaat voor het schema. Hervat pas pijnvrij en bouw de eerste week extra rustig op.",
  },
};

function formatPlanDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function renderPlanning() {
  const list = $("planningList");
  if (!list) return;
  const entries = [...planningEntries()].sort((a, b) => a.start.localeCompare(b.start));
  if (!entries.length) {
    list.innerHTML = `<div class="planning-empty"><span>🗓️</span><p>Nog niets gepland. Voeg een vakantie of oefenwedstrijd toe zodra je die weet.</p></div>`;
    return;
  }
  list.innerHTML = entries.map((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    const period = entry.end && entry.end !== entry.start
      ? `${formatPlanDate(entry.start)} – ${formatPlanDate(entry.end)}`
      : formatPlanDate(entry.start);
    return `<article class="planning-item plan-${entry.type}">
      <span class="planning-icon">${meta.icon}</span>
      <div class="planning-copy">
        <span class="planning-type">${meta.label} · ${period}</span>
        <strong>${escapeHtml(entry.title)}</strong>
        ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        <p class="planning-advice"><b>Coachadvies:</b> ${meta.advice}</p>
      </div>
      <button class="planning-remove" type="button" data-plan-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.title)} verwijderen">×</button>
    </article>`;
  }).join("");
  list.querySelectorAll(".planning-remove").forEach((button) => {
    button.addEventListener("click", () => {
      log.__planning = planningEntries().filter((entry) => entry.id !== button.dataset.planId);
      saveLog();
      renderAll();
      toast("Uit je planning verwijderd");
    });
  });
}

function renderZones() {
  $("zonesList").innerHTML = ZONES.map((z) => `
    <div class="zone-row zone-${z.key}">
      <span class="zone-dot"></span>
      <div class="zone-main"><strong>${z.name}</strong><span>${z.info}</span></div>
      <span class="zone-pace">${z.pace}<small>/km</small></span>
    </div>`).join("");
}

function renderChart() {
  const cwBar = currentWeek();
  const max = Math.max(...PLAN.map((w) => w.sessions.reduce((n, s) => n + s.min, 0)));
  $("volumeChart").innerHTML = PLAN.map((w) => {
    const planned = w.sessions.reduce((n, s) => n + s.min, 0);
    const doneMin = w.sessions.reduce((n, s) => n + (log[sid(w.week, s.day)]?.done ? s.min : 0), 0);
    const h = Math.round((planned / max) * 100);
    const fill = planned ? Math.round((doneMin / planned) * 100) : 0;
    const cls = ((w.race || w.tuneup) ? "is-race" : w.recovery ? "is-rest" : "") + (w.week === cwBar ? " is-now" : "");
    return `
      <div class="bar ${cls}" title="Week ${w.week}: ${planned} min gepland">
        <div class="bar-track" style="height:${h}%">
          <div class="bar-fill" style="height:${fill}%"></div>
        </div>
        <span class="bar-x">${w.week}</span>
      </div>`;
  }).join("");
}

function tagOf(w) {
  if (w.race) return `<span class="week-tag tag-race">Raceweek</span>`;
  if (w.tuneup) return `<span class="week-tag tag-tuneup">10 km race</span>`;
  if (w.recovery) return `<span class="week-tag tag-rest">Herstel</span>`;
  if (w.taper) return `<span class="week-tag tag-taper">Taper</span>`;
  return "";
}

function renderWeeks() {
  const cw = currentWeek();
  const todayIso = isoDate(new Date());
  let html = "", lastPhase = "";
  PLAN.forEach((w, i) => {
    if (w.phase !== lastPhase) { html += `<h4 class="sub-phase reveal">${w.phase}</h4>`; lastPhase = w.phase; }
    const sess = w.sessions.map((s) => {
      const e = log[sid(w.week, s.day)] || {};
      const z = zoneByKey[s.zone];
      const pace = fmtPace(paceSeconds(e.distance, e.time));
      const bits = [];
      if (e.distance) bits.push(`${e.distance} km`);
      if (pace) bits.push(pace);
      if (e.hr) bits.push(`${e.hr} bpm`);
      const logged = bits.length ? `<span class="session-logged">📊 ${bits.join(" · ")}</span>` : "";
      const isRaceSession = s.day === "zo" && (w.tuneup || w.race);
      const isToday = isoDate(sessionDate(w.week, s.day)) === todayIso;
      const raceKicker = isRaceSession
        ? `<span class="session-race-kicker">${w.race ? "🏅 Doelrace · 21,1 km" : "🏁 Raceday · 10 km"}</span>`
        : "";
      return `
        <button class="session zone-${s.zone} ${isRaceSession ? "is-race-session" : ""} ${e.done ? "is-done" : ""} ${isToday ? "is-today" : ""}" data-week="${w.week}" data-day="${s.day}">
          <span class="session-day">${isRaceSession ? "<small>🏁</small>" : ""}${s.dayLabel.slice(0, 2)}</span>
          <span class="session-body">
            ${raceKicker}
            <span class="session-title">${s.title}${isToday ? ' <span class="today-badge">Vandaag</span>' : ""}</span>
            <span class="session-meta">${s.min} min · ${s.kind}</span>
            ${logged}
          </span>
          <span class="session-check">${e.done ? "✓" : ""}</span>
        </button>`;
    }).join("");
    const weekPlans = planningForWeek(w.week);
    const planStrip = weekPlans.length ? `<div class="week-planning">${weekPlans.map((entry) => {
      const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
      return `<span>${meta.icon} ${escapeHtml(entry.title)}</span>`;
    }).join("")}</div>` : "";
    html += `
      <article class="week-card reveal ${w.tuneup ? "is-tuneup-week" : ""} ${w.race ? "is-goal-race-week" : ""} ${w.week === cw ? "is-current" : ""} ${w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? "is-complete" : "is-missed") : ""}" style="--i:${i % 4}">
        <header class="week-head">
          <div><span class="week-no">Week ${w.week}</span><span class="week-dates">${w.dates}</span></div>
          ${w.week === cw ? `<span class="week-tag tag-now">Nu</span>` : w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? `<span class="week-tag tag-done">✓ af</span>` : `<span class="week-tag tag-missed">gemist</span>`) : tagOf(w)}
        </header>
        ${planStrip}
        <div class="session-list">${sess}</div>
      </article>`;
  });
  $("weeksList").innerHTML = html;
  $("weeksList").querySelectorAll(".session").forEach((b) =>
    b.addEventListener("click", () => openDetail(+b.dataset.week, b.dataset.day)));
  observeReveals();
}

function renderBadges(stats) {
  $("badgeGrid").innerHTML = BADGES.map((b) => {
    const got = b.test(stats);
    return `
      <div class="badge ${got ? "got" : "locked"}" title="${b.desc}">
        <span class="badge-icon">${got ? b.icon : "🔒"}</span>
        <strong>${b.name}</strong>
        <span class="badge-desc">${b.desc}</span>
      </div>`;
  }).join("");
}

function renderInfo() {
  $("infoList").innerHTML = INFO.map((c, i) => `
    <article class="info-card reveal" style="--i:${i}">
      <span class="info-icon">${c.icon}</span>
      <h4>${c.title}</h4>
      <ul>${c.items.map((t) => `<li>${t}</li>`).join("")}</ul>
    </article>`).join("");
}

function addJumpButton() {
  const head = document.querySelector(".weeks .phase-head");
  if (!head || document.getElementById("jumpNow")) return;
  const btn = document.createElement("button");
  btn.id = "jumpNow";
  btn.type = "button";
  btn.className = "jump-now";
  btn.textContent = "Naar deze week ↓";
  btn.addEventListener("click", () =>
    document.querySelector(".week-card.is-current")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  head.insertAdjacentElement("afterend", btn);
}

function renderAll() {
  const stats = computeStats();
  renderHero(stats);
  renderStats(stats);
  renderNextUp();
  renderPlanning();
  renderChart();
  renderZones();
  renderWeeks();
  addJumpButton();
  renderBadges(stats);
  renderInfo();
  observeReveals();
}

/* ----- Detailweergave ------------------------------------------------ */
function openDetail(week, day) {
  const w = PLAN.find((x) => x.week === week);
  const s = w.sessions.find((x) => x.day === day);
  const id = sid(week, day);
  const e = log[id] || {};
  const z = zoneByKey[s.zone];
  const enteredTime = durationParts(e.time);

  $("detailTitle").textContent = `Week ${week} · ${s.dayLabel}`;
  $("detailBody").innerHTML = `
    <div class="detail-hero zone-${s.zone}">
      <span class="detail-kind">${s.kind} · ${s.min} min</span>
      <h2>${s.title}</h2>
      <p class="detail-goal">${s.goal}</p>
      <span class="detail-zone">${z.name} · ${z.info}</span>
    </div>

    <div class="coach-bubble">
      <div class="coach-ava">
        <img src="${CONFIG.coachPhoto}" alt="${CONFIG.coachName}" onerror="this.style.display='none'">
        <span>${COACH_INITIAL}</span>
      </div>
      <div class="coach-text">
        <strong>${CONFIG.coachName} <span class="coach-handle">${CONFIG.coachHandle}</span></strong>
        <p>${coachLine(s.zone)}</p>
      </div>
    </div>

    <section class="detail-block why">
      <h4>${w.race || w.tuneup ? "Waarom deze wedstrijd" : "Waarom deze training"}</h4>
      <p>${s.why || WHY[s.zone] || ""}</p>
    </section>

    <section class="detail-block">
      <h4>Opbouw</h4>
      <ol class="block-list">${s.blocks.map((b) => `<li>${b}</li>`).join("")}</ol>
    </section>

    <section class="detail-block">
      <h4>${w.race || w.tuneup ? "Invullen na de wedstrijd" : "Invullen na de training"}</h4>
      <div class="form-grid">
        <label>Afstand (km)
          <input id="fDistance" type="text" inputmode="decimal" placeholder="bv. 6,2" value="${escapeHtml(e.distance ?? "")}">
        </label>
        <label>Tijd
          <span class="duration-input">
            <input id="fTimeMinutes" type="number" inputmode="numeric" min="0" max="999" placeholder="36" value="${enteredTime.minutes || ""}" aria-label="Minuten">
            <span>min</span>
            <input id="fTimeSeconds" type="number" inputmode="numeric" min="0" max="59" placeholder="30" value="${enteredTime.seconds || ""}" aria-label="Seconden">
            <span>sec</span>
          </span>
        </label>
        <label class="full">Gemiddeld tempo
          <output id="fPace" class="pace-out">${fmtPace(paceSeconds(e.distance, e.time)) || "—"}</output>
        </label>
        <label>Hartslag (bpm)
          <input id="fHr" type="number" inputmode="numeric" placeholder="bv. 152" value="${escapeHtml(e.hr ?? "")}">
        </label>
        <label>Gevoel / zwaarte
          <select id="fFeel">
            ${["", "1 · heel licht", "2 · licht", "3 · prima", "4 · pittig", "5 · zwaar"]
              .map((o) => `<option value="${o}" ${String(e.feel ?? "") === o ? "selected" : ""}>${o || "Kies…"}</option>`).join("")}
          </select>
        </label>
        <label class="full">Notitie
          <textarea id="fNote" rows="2" placeholder="Hoe ging het?">${escapeHtml(e.note ?? "")}</textarea>
        </label>
      </div>
    </section>

    <div class="detail-actions">
      <button id="toggleDone" class="btn-primary ${e.done ? "is-done" : ""}">${e.done ? "✓ Gedaan" : "Markeer als gedaan"}</button>
      <button id="saveSession" class="btn-ghost">Opslaan</button>
    </div>`;

  const readTime = () => {
    if (!$("fTimeMinutes").value && !$("fTimeSeconds").value) return "";
    return durationValue($("fTimeMinutes").value, $("fTimeSeconds").value);
  };
  const recalc = () => ($("fPace").textContent = fmtPace(paceSeconds($("fDistance").value, readTime())) || "—");
  $("fDistance").addEventListener("input", recalc);
  $("fTimeMinutes").addEventListener("input", recalc);
  $("fTimeSeconds").addEventListener("input", () => {
    if (+$("fTimeSeconds").value > 59) $("fTimeSeconds").value = "59";
    recalc();
  });

  const collect = () => ({
    ...log[id],
    distance: $("fDistance").value.trim(),
    time: readTime(),
    hr: $("fHr").value.trim(),
    feel: $("fFeel").value,
    note: $("fNote").value.trim(),
  });

  $("saveSession").addEventListener("click", () => {
    log[id] = collect(); saveLog();
    toast("Opgeslagen 💾");
    closeDetail();
  });
  $("toggleDone").addEventListener("click", () => {
    const cur = collect();
    cur.done = !cur.done;
    log[id] = cur; saveLog();
    if (cur.done) {
      celebrate();
      toast(w.race ? "🏅 Finisher! Wat een prestatie, strijder!" : w.tuneup ? "🏁 Maastunnelloop voltooid — sterk gepacet!" : DONE[Math.floor(Math.random() * DONE.length)]);
    }
    closeDetail();
  });

  showView("detail");
}

function closeDetail() { renderAll(); showView("list"); }

function showView(name) {
  const list = $("listView"), detail = $("detailView"), back = $("backButton");
  if (name === "detail") {
    list.classList.add("hidden");
    detail.classList.remove("hidden");
    requestAnimationFrame(() => detail.classList.add("is-in"));
    back.classList.remove("hidden");
    window.scrollTo(0, 0);
  } else {
    detail.classList.remove("is-in");
    back.classList.add("hidden");
    setTimeout(() => {
      detail.classList.add("hidden");
      list.classList.remove("hidden");
      window.scrollTo(0, 0);
    }, 280);
  }
}

/* ----- Invliegende beelden -------------------------------------------- */
let io, initialRevealDone = false;
function observeReveals() {
  // Na de eerste keer: nieuw getekende blokken meteen tonen (geen her-animatie bij navigeren)
  if (initialRevealDone) {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    return;
  }
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

/* ----- Toast ----------------------------------------------------------- */
let toastT;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ----- Confetti --------------------------------------------------------- */
function celebrate() {
  const cv = $("confetti");
  const ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const colors = ["--volt", "--flame", "--pastel-blue", "--violet"]
    .map((v) => cs.getPropertyValue(v).trim()).filter(Boolean).concat("#ffffff");
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight / 3,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -16 - 4,
    s: Math.random() * 7 + 4, c: colors[(Math.random() * colors.length) | 0],
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
  }));
  let frame = 0;
  (function loop() {
    frame++;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    if (frame < 120) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

/* ================================================================== *
 *  Init
 * ================================================================== */
/* Branding uit CONFIG zetten (zodat templaten makkelijk is) */
document.title = `${CONFIG.appName} — ${CONFIG.coachHandle}`;
if ($("appName")) $("appName").textContent = CONFIG.appName;
if ($("brandHandle")) $("brandHandle").textContent = CONFIG.coachHandle;
if ($("footCredit")) {
  $("footCredit").innerHTML =
    `<span class="catch">${CONFIG.catchphrase}</span>` +
    `Coaching door ${CONFIG.coachName} · TikTok <strong>${CONFIG.coachHandle}</strong> 🏃‍♀️`;
}

function setPlanningForm(open) {
  const form = $("planningForm");
  const toggle = $("togglePlanningForm");
  form.classList.toggle("hidden", !open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "× Sluiten" : "＋ Toevoegen";
  if (open && !$("planStart").value) $("planStart").value = isoDate(new Date());
}

$("togglePlanningForm").addEventListener("click", () => {
  setPlanningForm($("planningForm").classList.contains("hidden"));
});
$("cancelPlanning").addEventListener("click", () => setPlanningForm(false));
$("planningForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const start = $("planStart").value;
  const end = $("planEnd").value || start;
  if (end < start) {
    toast("De einddatum ligt vóór de startdatum");
    return;
  }
  const entry = {
    id: `plan-${Date.now()}`,
    type: $("planType").value,
    title: $("planTitle").value.trim(),
    start,
    end,
    note: $("planNote").value.trim(),
  };
  log.__planning = [...planningEntries(), entry];
  saveLog();
  $("planningForm").reset();
  setPlanningForm(false);
  renderAll();
  toast("Toegevoegd aan je schema 🗓️");
});

$("backButton").addEventListener("click", closeDetail);
$("resetButton").addEventListener("click", () => {
  if (confirm("Alle ingevulde voortgang wissen?")) { log = {}; saveLog(); renderAll(); toast("Voortgang gewist"); }
});

/* ----- Back-up: exporteren / importeren ------------------------------- */
function downloadJSON(filename, obj) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadText(filename, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function icsEscape(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(/\r?\n/g, "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function icsDay(value) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return isoDate(date).replaceAll("-", "");
}

function addDays(value, amount) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function calendarFile() {
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//bartlopen//Run Coach//NL",
    `X-WR-CALNAME:${icsEscape(CONFIG.appName)} · ${icsEscape(RUNNER)}`,
  ];
  flatSessions.forEach((session) => {
    const date = sessionDate(session.week, session.day);
    const z = zoneByKey[session.zone];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${sid(session.week, session.day)}-${icsDay(date)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(date)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(date, 1))}`,
      `SUMMARY:${icsEscape(`🏃‍♀️ ${session.title}`)}`,
      `DESCRIPTION:${icsEscape(`${session.min} min · ${z.name}\n${session.goal}\n\n${session.blocks.join("\n")}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  planningEntries().forEach((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${icsEscape(entry.id)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(entry.start)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(entry.end || entry.start, 1))}`,
      `SUMMARY:${icsEscape(`${meta.icon} ${entry.title}`)}`,
      `DESCRIPTION:${icsEscape(`${entry.note ? `${entry.note}\n\n` : ""}Coachadvies: ${meta.advice}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
$("exportBtn").addEventListener("click", () => {
  downloadJSON(`${CONFIG.appName.replace(/\s+/g, "-")}-voortgang.json`, {
    app: "bartlopen-runcoach", storeKey: STORE_KEY, runner: RUNNER,
    exportedAt: new Date().toISOString(), log,
  });
  toast("Back-up opgeslagen ⬇︎");
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = data && data.log ? data.log : data;
      if (!incoming || typeof incoming !== "object") throw new Error("ongeldig");
      log = { ...log, ...incoming };
      saveLog(); renderAll();
      toast("Back-up geladen ⬆︎ — welkom terug!");
    } catch {
      toast("Kon dit bestand niet lezen");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

$("calendarBtn").addEventListener("click", () => {
  downloadText("bartlopen-kim-schema.ics", calendarFile(), "text/calendar;charset=utf-8");
  toast("Agenda-bestand staat klaar 🗓️");
});

$("pdfBtn").addEventListener("click", () => {
  document.body.classList.add("print-schema");
  const cleanup = () => document.body.classList.remove("print-schema");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 1500);
});

/* Alles tekenen */
renderAll();
/* Na de intro-animatie geen her-fade meer; failsafe die alles zeker toont */
setTimeout(() => { initialRevealDone = true; }, 900);
setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in")), 1600);

/* Intro-splash netjes weg laten faden (tikken slaat 'm over) */
(function () {
  const splash = $("splash");
  if (!splash) return;
  const hide = () => splash.classList.add("gone");
  setTimeout(hide, 1100);
  splash.addEventListener("click", hide);
  setTimeout(() => splash.remove(), 1700);
})();

/* Service worker voor offline gebruik (alleen op http/https, niet via file://) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
