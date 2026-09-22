import Fuse from fuse.js;

// API laden
async function loadAPI() {
    let allRecommendations = [];               // <-- sichtbar für die ganze Funktion
    try {
        const response = await fetch("https://127.0.0.1:8080/travel_recommendation_api.json");
        const data = await response.json();

        // Die drei Arrays zusammenführen
        allRecommendations = [
            ...data.temples,
            ...data.countries.flatMap(c => c.cities), // flatten countries → cities
            ...data.beaches
        ];
    } catch (error) {
        console.error("Fehler:", error);
    }
    return allRecommendations;                  // immer ein Array zurückgeben
}



//Suchfunktion
// --- 1. Fuse‑Instanz erzeugen (nur einmal) ---------------------------------
let fuse;                     // globale Variable, damit wir sie wiederverwenden können

async function initFuse() {
    const recommendations = await loadAPI();

    // Optionen: wir durchsuchen nur das Feld "name"
    // - `threshold: 0.3` → Wie „unscharf“ die Suche sein darf
    //   (0 = exakte Übereinstimmung, 1 = alles passt)
    // - `ignoreLocation: true` → Position im Wort spielt keine Rolle
    const options = {
        keys: ["name"],
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true
    };

    fuse = new Fuse(recommendations, options);
}

// --- 2. eigentliche Suchfunktion --------------------------------------------
async function searchRecommendations() {
    const input = document.getElementById("suchEingabe").value.trim();

    // Falls das Input‑Feld leer ist, nichts anzeigen
    if (input === "") {
        document.getElementById("results").innerHTML = "";
        return;
    }

    // Sicherstellen, dass Fuse bereits initialisiert ist
    if (!fuse) {
        await initFuse();               // lädt JSON und baut Fuse‑Index
    }

    // Fuse liefert ein Array von Objekten `{ item, score }`
    const result = fuse.search(input);

    // Wir geben nur die eigentlichen Items (die Empfehlungen) zurück
    const filtered = result.map(r => r.item);

    // --- Ausgabe ---
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";      // vorherige Ergebnisse leeren

    if (filtered.length === 0) {
        resultsContainer.innerHTML = "<p>Keine Ergebnisse gefunden.</p>";
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("result-item");
        // kleiner Fix: fehlendes "=" nach src
        div.innerHTML = `
            <h3>${item.name}</h3>
            <img src="${item.imageUrl}" alt="${item.name}" style="width:200px;">
            <p>${item.description}</p>`;
        resultsContainer.appendChild(div);
    });
}

// Buttons verbinden (wie gehabt)
document.getElementById("suchButton").addEventListener("click", searchRecommendations);
document.getElementById("resetButton").addEventListener("click", () => {
   document.getElementById("suchEingabe").value = "";
   document.getElementById("results").innerHTML = "";
});

