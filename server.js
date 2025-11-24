const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Kad galėtume priimti JSON iš frontend
app.use(express.json());

// Statiniai failai (index.html ir pan.)
app.use(express.static(path.join(__dirname, "public")));

// Kad neištraukti porų
const forbiddenPairs = [
  ["Redulė", "Tėtis Linas"],
  ["Tėtis Linas", "Redulė"],
  ["Rūtukas", "Jonelis"],
  ["Jonelis", "Rūtukas"],
  ["Valentina", "Linukas"],
  ["Linukas", "Valentina"],
  ["Vaivūni", "Vytuks"],
  ["Vytuks", "Vaivūni"]
];


// ČIA SĄRAŠAS ŽMONIŲ (vardas + slaptas kodas)
const participants = [
  { name: "Redulė", code: "1111" },
  { name: "Tėtis Linas", code: "2222" },
  { name: "Rūtukas", code: "3333" },
  { name: "Jonelis", code: "4444" },
  { name: "Valentina", code: "5555" },
  { name: "Linukas", code: "6666" },
  { name: "Vaivūni", code: "7777" },
  { name: "Vytuks", code: "8888" }
];

const pairsFile = path.join(__dirname, "pairs.json");
let assignments = {};

// Jeigu jau buvo sugeneruota porų – perskaitom iš failo
if (fs.existsSync(pairsFile)) {
  try {
    assignments = JSON.parse(fs.readFileSync(pairsFile, "utf-8"));
  } catch (e) {
    console.error("Nepavyko perskaityti pairs.json, generuosim iš naujo.");
    assignments = {};
  }
}

function saveAssignments() {
  fs.writeFileSync(pairsFile, JSON.stringify(assignments, null, 2), "utf-8");
}

// Sugeneruoja atsitiktinius „kam dovanoja“, kad niekas negautų savęs
function generateAssignments() {
  const names = participants.map(p => p.name);
  let targets;

  do {
    targets = [...names];

    // Random maišymas
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }

    // Draudžiamos poros
    const invalid = targets.some((target, i) => {
      const giver = names[i];

      // negali gauti pats savęs
      if (target === giver) return true;

      // negali gauti antros pusės
      return forbiddenPairs.some(pair => pair[0] === giver && pair[1] === target);
    });

    if (invalid) {
      // kartojam iš naujo
      continue;
    }

    break;

  } while (true);

  assignments = {};
  names.forEach((name, i) => {
    assignments[name] = targets[i];
  });

  saveAssignments();
}

// API: grąžinti dalyvių vardus (be kodų)
app.get("/api/participants", (req, res) => {
  res.json(participants.map(p => p.name));
});

// API: gauti, kam dovanoja konkretus žmogus pagal vardą + kodą
app.post("/api/get-target", (req, res) => {
  const { name, code } = req.body;

  const person = participants.find(p => p.name === name);
  if (!person) {
    return res.status(400).json({ error: "Tokio žmogaus sąraše nėra." });
  }

  if (person.code !== code) {
    return res.status(403).json({ error: "Neteisingas kodas." });
  }

  // Jei dar nėra porų – sugeneruojam visiems iš karto
  if (Object.keys(assignments).length === 0) {
    generateAssignments();
  }

  const target = assignments[name];
  if (!target) {
    return res.status(500).json({ error: "Įvyko klaida, pabandyk vėliau." });
  }

  res.json({ target });
});

app.listen(PORT, () => {
  console.log(`Serveris veikia: http://localhost:${PORT}`);
});
