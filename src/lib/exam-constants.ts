/* ---------------------------------- Types ---------------------------------- */
type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

/* -------------------------------- Constants -------------------------------- */
export const BOARDS: { key: BoardKey; label: string }[] = [
  { key: "CAIE", label: "Cambridge (CAIE)" },
  { key: "Edexcel", label: "Pearson Edexcel (UK)" },
  { key: "Edexcel_IAL", label: "Edexcel IAL" },
  { key: "AQA", label: "AQA" },
  { key: "OCR", label: "OCR" },
  { key: "WJEC", label: "WJEC/Eduqas" },
];

export const SUBJECTS_BY_BOARD: Record<
  BoardKey,
  { code: string; name: string }[]
> = {
  CAIE: [
    { code: "9709", name: "Mathematics" },
    { code: "9701", name: "Chemistry" },
    { code: "9702", name: "Physics" },
    { code: "9708", name: "Economics" },
    { code: "9691", name: "Computing / Computer Science" },
    { code: "9700", name: "Biology" },
    { code: "9609", name: "Business Studies" },
    { code: "9706", name: "Accounting" },
    { code: "9704", name: "Art & Design" },
    { code: "9696", name: "Geography" },
    { code: "9695", name: "Literature in English" },
    { code: "9699", name: "Sociology" },
    { code: "9990", name: "Psychology" },
    { code: "9693", name: "Marine Science" },
    { code: "9703", name: "Music" },
    { code: "9705", name: "Design & Technology" },
    { code: "9713", name: "Applied ICT" },
    { code: "9680", name: "Arabic" },
    { code: "9687", name: "Hindi" },
    { code: "9715", name: "Chinese" },
    { code: "9716", name: "French" },
    { code: "9717", name: "German" },
    { code: "9719", name: "Spanish" },
    { code: "9231", name: "Further Mathematics" },
    { code: "9626", name: "Information Technology" },
    { code: "9698", name: "Psychology (alternate code)" },
    { code: "9395", name: "Travel & Tourism" },
    { code: "9093", name: "English Language" },
    { code: "8291", name: "Environmental Management" },
    { code: "9608", name: "Computer Science (older code)" },
    { code: "9676", name: "Urdu" },
    { code: "9689", name: "Tamil" },
  ],
  Edexcel: [
    { code: "9MA0", name: "Mathematics" },
    { code: "8CH0/9CH0", name: "Chemistry" },
    { code: "8PH0/9PH0", name: "Physics" },
    { code: "9EC0", name: "Economics" },
    { code: "9PS0", name: "Psychology" },
    { code: "9BI0", name: "Biology" },
    { code: "9BS0", name: "Business" },
    { code: "9FM0", name: "Further Mathematics" },
    { code: "9EN0", name: "English Language" },
    { code: "9ET0", name: "English Literature" },
    { code: "9RS0", name: "Religious Studies" },
    { code: "9HI0", name: "History" },
    { code: "9GE0", name: "Geography" },
    { code: "9PL0", name: "Politics" },
    { code: "9PE0", name: "Physical Education" },
    { code: "9CS0", name: "Computer Science" },
    { code: "9DT0", name: "Design and Technology" },
    { code: "9FA0", name: "Fine Art" },
    { code: "9PY0", name: "Photography" },
    { code: "9MU0", name: "Music" },
    { code: "9DR0", name: "Drama and Theatre" },
    { code: "9FD0", name: "Fashion and Textiles" },
    { code: "9AD0", name: "Art, Craft and Design" },
    { code: "9SP0", name: "Spanish" },
    { code: "9FR0", name: "French" },
    { code: "9GN0", name: "German" },
    { code: "9RU0", name: "Russian" },
    { code: "9PLH0", name: "Politics (Newer Code Variant)" },
    { code: "9TD0", name: "Technology (Design Engineering)" },
    { code: "9H0", name: "History (alt code ranges)" }, // optional, history has variants
    { code: "9CL0", name: "Classical Civilisation" },
    { code: "9LT0", name: "Latin" },
    { code: "9G10", name: "Geography (fieldwork variant)" },
    { code: "9PH0W", name: "Physics (endorsement/variant)" },
  ],
  Edexcel_IAL: [
    { code: "XMA01", name: "Mathematics (AS)" },
    { code: "YMA01", name: "Mathematics (A Level)" },

    { code: "XFM01", name: "Further Mathematics (AS)" },
    { code: "YFM01", name: "Further Mathematics (A Level)" },

    { code: "XPH11", name: "Physics (AS)" },
    { code: "YPH11", name: "Physics (A Level)" },

    { code: "XCH11", name: "Chemistry (AS)" },
    { code: "YCH11", name: "Chemistry (A Level)" },

    { code: "XBI11", name: "Biology (AS)" },
    { code: "YBI11", name: "Biology (A Level)" },

    { code: "XEC11", name: "Economics (AS)" },
    { code: "YEC11", name: "Economics (A Level)" },

    { code: "XBS11", name: "Business Studies (AS)" },
    { code: "YBS11", name: "Business Studies (A Level)" },

    { code: "XAC11", name: "Accounting (AS)" },
    { code: "YAC11", name: "Accounting (A Level)" },

    { code: "XCS11", name: "Computer Science (AS)" },
    { code: "YCS11", name: "Computer Science (A Level)" },

    { code: "XIT11", name: "Information Technology (AS)" },
    { code: "YIT11", name: "Information Technology (A Level)" },

    { code: "XPS11", name: "Psychology (AS)" },
    { code: "YPS11", name: "Psychology (A Level)" },

    { code: "XHI11", name: "History (AS)" },
    { code: "YHI11", name: "History (A Level)" },

    { code: "XGE11", name: "Geography (AS)" },
    { code: "YGE11", name: "Geography (A Level)" },

    { code: "XEN01", name: "English Language (AS)" },
    { code: "YEN01", name: "English Language (A Level)" },

    { code: "XET01", name: "English Literature (AS)" },
    { code: "YET01", name: "English Literature (A Level)" },

    { code: "XCH01", name: "Chinese (AS)" },
    { code: "YCH01", name: "Chinese (A Level)" },

    { code: "XFR01", name: "French (AS)" },
    { code: "YFR01", name: "French (A Level)" },

    { code: "XGN01", name: "German (AS)" },
    { code: "YGN01", name: "German (A Level)" },

    { code: "XSP01", name: "Spanish (AS)" },
    { code: "YSP01", name: "Spanish (A Level)" },

    { code: "XHI01", name: "Hindi (AS)" },
    { code: "YHI01", name: "Hindi (A Level)" },

    { code: "XAR01", name: "Arabic (AS)" },
    { code: "YAR01", name: "Arabic (A Level)" },

    { code: "XAD01", name: "Art & Design (AS)" },
    { code: "YAD01", name: "Art & Design (A Level)" },
  ],
  AQA: [
    // Sciences
    { code: "7408", name: "Biology" },
    { code: "7405", name: "Chemistry" },
    { code: "7407", name: "Physics" },

    // Social Sciences
    { code: "7181", name: "Economics (AS)" },
    { code: "7182", name: "Economics (A Level)" }, // Economics uses 7182 as full A-level
    { code: "7182", name: "Psychology" }, // psychology uses 7182 for full A-level; AS is 7181

    // Maths
    { code: "7357", name: "Mathematics" },
    { code: "7367", name: "Further Mathematics" },

    // English
    { code: "7702", name: "English Language" },
    { code: "7712", name: "English Literature A" },
    { code: "7717", name: "English Language and Literature" },

    // Humanities
    { code: "7037", name: "Geography" },
    { code: "7042", name: "History" },
    { code: "7062", name: "Religious Studies" },
    { code: "7172", name: "Sociology" },

    // Business & Accounting
    { code: "7132", name: "Business" },
    { code: "7127", name: "Accounting" },

    // Computer Science
    { code: "7517", name: "Computer Science" },

    // Physical Education
    { code: "7582", name: "Physical Education" },

    // Political Studies
    { code: "7152", name: "Politics" },

    // Media & Arts
    { code: "7572", name: "Media Studies" },
    { code: "7202", name: "Art and Design" },
    { code: "7242", name: "Music" },
    { code: "7262", name: "Drama and Theatre" },

    // Languages (major A-level languages available under AQA)
    { code: "7652", name: "French" },
    { code: "7662", name: "German" },
    { code: "7692", name: "Spanish" },

    // Others (less common but official)
    { code: "8631", name: "Law" }, // A-level Law (AQA)
    { code: "7932", name: "Environmental Science" },
    { code: "7136", name: "Business (older/AS code)" },
  ],
  OCR: [
    // Sciences
    { code: "H420", name: "Biology A" }, // Biology (A)
    { code: "H422", name: "Biology B (Advancing Biology)" },

    { code: "H432", name: "Chemistry A" }, // Chemistry (A)
    { code: "H433", name: "Chemistry B (Salters)" },

    { code: "H556", name: "Physics A" }, // Physics (A)
    { code: "H557", name: "Physics B (Advancing Physics)" },

    // Mathematics
    { code: "H240", name: "Mathematics" },
    { code: "H245", name: "Further Mathematics" },

    // Computing & IT
    { code: "H446", name: "Computer Science" }, // official: H446 (not H866)
    { code: "H052", name: "IT (Cambridge Technicals)" }, // optional listing

    // Psychology, Sociology, Philosophy
    { code: "H567", name: "Psychology" },
    { code: "H580", name: "Sociology" },
    { code: "H573", name: "Philosophy" }, // OCR has a well-known Philosophy A-level

    // History
    { code: "H505", name: "History A" },
    { code: "H506", name: "History B (Schools History Project)" },

    // Geography
    { code: "H481", name: "Geography" },

    // English
    { code: "H470", name: "English Literature" },
    { code: "H474", name: "English Language and Literature" },
    { code: "H470", name: "English Language (varies by centre)" },

    // Religious Studies
    { code: "H573", name: "Religious Studies" },

    // Economics & Business
    { code: "H460", name: "Economics" },
    { code: "H431", name: "Business" },

    // Art & Design
    { code: "H601", name: "Art and Design (Fine Art)" },
    { code: "H603", name: "Art and Design (Graphics)" },
    { code: "H605", name: "Art and Design (Photography)" },

    // Media & Performing Arts
    { code: "H409", name: "Media Studies" },
    { code: "H459", name: "Drama and Theatre" },
    { code: "H543", name: "Music" },

    // Physical Education
    { code: "H555", name: "Physical Education" },

    // Classical Subjects
    { code: "H408", name: "Classical Civilisation" },
    { code: "H441", name: "Latin" },
    { code: "H443", name: "Classical Greek" },
  ],
  WJEC: [
    // Sciences
    { code: "WJEC-CH", name: "Chemistry" },
    { code: "WJEC-PH", name: "Physics" },
    { code: "WJEC-BI", name: "Biology" },

    // Mathematics
    { code: "WJEC-MA", name: "Mathematics" },
    { code: "WJEC-FM", name: "Further Mathematics" },

    // Social Sciences
    { code: "WJEC-EC", name: "Economics" },
    { code: "WJEC-BS", name: "Business" },
    { code: "WJEC-PS", name: "Psychology" },
    { code: "WJEC-SO", name: "Sociology" },
    { code: "WJEC-GE", name: "Geography" },
    { code: "WJEC-HI", name: "History" },
    { code: "WJEC-PL", name: "Politics / Government & Politics" },

    // English
    { code: "WJEC-EL", name: "English Language" },
    { code: "WJEC-ET", name: "English Literature" },
    { code: "WJEC-ELL", name: "English Language & Literature" },

    // Computer Science
    { code: "WJEC-CS", name: "Computer Science" },
    { code: "WJEC-IT", name: "Information Technology" },

    // Arts
    { code: "WJEC-AD", name: "Art & Design" },
    { code: "WJEC-PHOTO", name: "Photography" },
    { code: "WJEC-DT", name: "Design & Technology" },
    { code: "WJEC-DR", name: "Drama & Theatre" },
    { code: "WJEC-MU", name: "Music" },

    // Sport
    { code: "WJEC-PE", name: "Physical Education" },

    // Languages
    { code: "WJEC-FR", name: "French" },
    { code: "WJEC-SP", name: "Spanish" },
    { code: "WJEC-GN", name: "German" },
    { code: "WJEC-BY", name: "Welsh (First Language)" },
    { code: "WJEC-WL", name: "Welsh (Second Language)" },

    // Religious Studies
    { code: "WJEC-RS", name: "Religious Studies" },

    // Media
    { code: "WJEC-ME", name: "Media Studies" },
  ],
};

export const SESSIONS_BY_BOARD: Record<BoardKey, string[]> = {
  CAIE: [
    "Feb/Mar", // some regions e.g. India for IGCSE/IAL Feb-Mar session  [oai_citation:0‡Scribd](https://www.scribd.com/document/875871431/February-March-2026-Examination-Time-Table?utm_source=chatgpt.com)
    "May/June",
    "Oct/Nov",
  ],
  Edexcel: [
    "May/June", // UK A-Level main series  [oai_citation:1‡Save My Exams](https://www.savemyexams.com/learning-hub/exam-dates-timetables/a-level-and-as-level-exam-dates/?utm_source=chatgpt.com)
    "Jan", // International / early series for IAL and summer entry  [oai_citation:2‡British Council](https://www.britishcouncil.om/en/exam/school-exams/register/dates-deadlines?utm_source=chatgpt.com)
    "Oct/Nov",
  ],
  Edexcel_IAL: [
    "Jan",
    "May/June",
    "Oct/Nov", // Verified International A-Level series months  [oai_citation:3‡British Council](https://www.britishcouncil.om/en/exam/school-exams/register/dates-deadlines?utm_source=chatgpt.com)
  ],
  AQA: [
    "May/June", // UK mainstream A-Level series  [oai_citation:4‡Save My Exams](https://www.savemyexams.com/learning-hub/exam-dates-timetables/a-level-and-as-level-exam-dates/?utm_source=chatgpt.com)
    "Oct/Nov", // Some international variants use Oct/Nov (but less standard)
    "Jan", // International sessions
  ],
  OCR: [
    "May/June",
    "Jan",
    "Oct/Nov", // International/variant sessions
  ],
  WJEC: [
    "May/June", // Welsh A-Level standard series
    "Jan", // Some international or special arrangements
    "Oct/Nov",
  ],
};
