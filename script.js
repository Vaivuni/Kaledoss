const envelopeWrapper = document.querySelector('.envelope-wrapper');
const startButton = document.getElementById('startButton');

// pasirinktas vardas (iš kortelių)
let selectedName = null;

envelopeWrapper.addEventListener('click', (event) => {
    // Jei paspaudė ant mygtuko ar kortelės - ignoruojam
    if (event.target.tagName === 'BUTTON' || 
        event.target.classList.contains('name-card') ||
        event.target.tagName === 'INPUT') {
        return;
    }
    
    envelopeWrapper.classList.add('flap');

    setTimeout(() => {
        startButton.classList.remove('start-hidden');
    }, 600);
});

// Paspaudus "Pradėti traukimą"
function setupStartScreen() {
    const letterTextBlock = document.querySelector('.letter-text-block');
    const formBlock = document.getElementById('formBlock');

    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        letterTextBlock.classList.add('hidden');
        formBlock.classList.remove('hidden');
        startButton.classList.add('hidden');
    });
}

// Dalyvių duomenys su kodais
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

// Užkrauti vardus
function loadParticipants() {
    const grid = document.getElementById("nameGrid");

    participants.forEach(participant => {
        const card = document.createElement("div");
        card.classList.add("name-card");
        card.textContent = participant.name;

        card.addEventListener("click", () => {
            document.querySelectorAll(".name-card")
                .forEach(c => c.classList.remove("selected"));

            card.classList.add("selected");
            selectedName = participant.name;
        });

        grid.appendChild(card);
    });
}

// Mygtukas „Sužinoti, kam dovanosiu"
async function setupButton() {
    const button = document.getElementById("checkButton");
    const codeInput = document.getElementById("codeInput");
    const result = document.getElementById("result");

    button.addEventListener("click", async () => {
        const name = selectedName;
        const code = codeInput.value.trim();

        if (!name || !code) {
            result.textContent = "Pasirink vardą ir įvesk kodą.";
            return;
        }

        // Patikrinti kodą
        const person = participants.find(p => p.name === name);
        if (!person) {
            result.textContent = "Tokio žmogaus sąraše nėra.";
            return;
        }

        if (person.code !== code) {
            result.textContent = "Neteisingas kodas.";
            return;
        }

        try {
            // Užkrauti poras iš pairs.json
            const res = await fetch("./pairs.json");
            const pairs = await res.json();

            const target = pairs[name];
            if (!target) {
                result.textContent = "Įvyko klaida. Pabandyk vėliau.";
                return;
            }

            result.textContent = "Tavo dovana bus skirta: " + target;
        } catch (err) {
            result.textContent = "Nepavyko užkrauti duomenų. Patikrink interneto ryšį.";
        }
    });
}

// SNIEGO ANIMACIJA
const snowContainer = document.querySelector('.snow');

function createSnowflakeDot() {
    const dot = document.createElement('div');
    dot.classList.add('snowflake-dot');

    dot.style.left = Math.random() * 100 + "vw";
    const duration = Math.random() * 5 + 5;
    dot.style.animationDuration = duration + "s";

    const size = Math.random() * 4 + 2;
    dot.style.width = size + "px";
    dot.style.height = size + "px";

    snowContainer.appendChild(dot);

    setTimeout(() => {
        dot.remove();
    }, duration * 1000);
}

setInterval(createSnowflakeDot, 120);

// Paleidžiam viską
setupStartScreen();
loadParticipants();
setupButton();
