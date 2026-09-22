import Fuse from fuse.js;

// API laden
async function loadAPI() {
    let allRecommendations = [];               
    try {
        const response = await fetch("https://127.0.0.1:8080/travel_recommendation_api.json");
        const data = await response.json();

        // Arrays aus der JSON zusammenführen
        allRecommendations = [
            ...data.temples,
            ...data.countries.flatMap(c => c.cities),
            ...data.beaches
        ];
    } catch (error) {
        console.error("Fehler:", error);
    }
    return allRecommendations;        
}



//Suchfunktion
// 1. Fuse‑Instanz erzeugen
let fuse;                     // globale Variable

async function initFuse() {
    const recommendations = await loadAPI();

    const options = {
        keys: ["name"], //welches Feld wird durchsucht
        includeScore: true,
        threshold: 0.3, //wieviel Übereinstimmung ist erforderlich?
        ignoreLocation: true //Position des Suchsbegriffs innerhalb des durchsuchten Feldes ist egal
    };

    fuse = new Fuse(recommendations, options);
}

// Suchfunktion
async function searchRecommendations() {
    const input = document.getElementById("suchEingabe").value.trim();

    // Keine Angabe, wenn Input leer ist.
    if (input === "") {
        document.getElementById("results").innerHTML = "";
        return;
    }

    // Sicherstellen, dass Fuse initialisiert wird
    if (!fuse) {
        await initFuse();              
    }

    // Definition des Suchergebnisses
    const result = fuse.search(input);

    // Filtern der Ausgabe
    const filtered = result.map(r => r.item);

    // Ausgabe
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";  

    if (filtered.length === 0) {
        resultsContainer.innerHTML = "<p>Keine Ergebnisse gefunden.</p>";
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("result-item");
        div.innerHTML = `
            <h3>${item.name}</h3>
            <img src="${item.imageUrl}" alt="${item.name}" style="width:200px;">
            <p>${item.description}</p>`;
        resultsContainer.appendChild(div);
    });
}

// Buttons verbinden
document.getElementById("suchButton").addEventListener("click", searchRecommendations);
document.getElementById("resetButton").addEventListener("click", () => {
   document.getElementById("suchEingabe").value = "";
   document.getElementById("results").innerHTML = "";
});

