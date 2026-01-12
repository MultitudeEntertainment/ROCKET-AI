// ROCKET AI – logique côté navigateur (WebLLM)

let engine = null;
let isReady = false;
let isGenerating = false;

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

function setStatus(mode, text) {
    statusDot.classList.remove("offline", "loading", "online");
    statusDot.classList.add(mode);
    statusText.textContent = text;
}

// Initialisation du moteur IA
async function initEngine() {
    try {
        setStatus("loading", "Chargement du moteur ROCKET AI…");

        // Configuration du moteur: ici on choisit un modèle performant,
        // mais son nom N'EST JAMAIS affiché dans l'interface.
        const config = {
            // modèle interne, caché à l’utilisateur
            model: "Llama-3-1B-Instruct-q4f32_1-MLC",
            // tu peux ajuster ces paramètres d’inférence au besoin
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: 256
        };

        // Création du moteur dans le navigateur
        engine = await webllm.createEngine(config.model);

        isReady = true;
        setStatus("online", "Prêt. ROCKET AI est opérationnel.");
        sendBtn.disabled = false;
    } catch (err) {
        console.error(err);
        setStatus("offline", "Erreur lors du chargement de ROCKET AI.");
        sendBtn.disabled = true;

        addSystemMessage(
            "Une erreur est survenue lors du chargement de ROCKET AI. " +
            "Essaie de recharger la page ou de changer de navigateur (Chrome / Edge récent)."
        );
    }
}

// Ajoute un message dans l’interface
function addMessage(role, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    if (role === "user") {
        messageDiv.classList.add("message-user");
    } else {
        messageDiv.classList.add("message-ai");
    }

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    if (role === "user") {
        avatar.classList.add("user-avatar");
        avatar.textContent = "U";
    } else {
        avatar.classList.add("ai-avatar");
        avatar.textContent = "R";
    }

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    const header = document.createElement("div");
    header.classList.add("bubble-header");
    header.textContent = role === "user" ? "Vous" : "ROCKET AI";

    const body = document.createElement("div");
    body.classList.add("bubble-body");
    body.innerHTML = text
        .split("\n")
        .map(line => `<p>${line.trim()}</p>`)
        .join("");

    bubble.appendChild(header);
    bubble.appendChild(body);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addSystemMessage(text) {
    addMessage("ai", text);
}

// Envoi d’un message utilisateur
async function handleSend() {
    if (!isReady || isGenerating) return;

    const userText = inputEl.value.trim();
    if (!userText) return;

    inputEl.value = "";
    autoResizeTextarea();

    addMessage("user", userText);

    isGenerating = true;
    sendBtn.disabled = true;
    setStatus("loading", "ROCKET AI réfléchit…");

    try {
        const prompt = buildPrompt(userText);
        const response = await generateResponse(prompt);
        addMessage("ai", response);
        setStatus("online", "Prêt.");
    } catch (err) {
        console.error(err);
        addSystemMessage(
            "Je n’ai pas pu générer de réponse. " +
            "Vérifie que ton navigateur supporte WebGPU (Chrome/Edge récent) puis réessaie."
        );
        setStatus("offline", "Erreur de génération.");
    } finally {
        isGenerating = false;
        sendBtn.disabled = !isReady;
    }
}

// Construit le prompt pour ROCKET AI
function buildPrompt(userText) {
    return `
Tu es ROCKET AI, un assistant IA moderne qui tourne directement dans le navigateur de l'utilisateur.
Tu réponds en français, de manière claire, concise et utile. Tu évites les longs discours.
Réponds en un maximum de 3 à 5 phrases, sauf si l'utilisateur demande explicitement plus de détails.

Utilisateur : ${userText}
ROCKET AI :`.trim();
}

// Génère une réponse avec le moteur WebLLM
async function generateResponse(prompt) {
    if (!engine) {
        throw new Error("Moteur non initialisé.");
    }

    let outputText = "";
    const chunkCallback = (chunk) => {
        if (chunk && chunk.output_text) {
            outputText = chunk.output_text;
        }
    };

    await engine.chatCompletion({
        messages: [
            { role: "system", content: "Tu es ROCKET AI, assistant IA francophone, concis et utile." },
            { role: "user", content: prompt }
        ],
        max_tokens: 256,
        temperature: 0.6,
        top_p: 0.9,
        stream: true
    }, chunkCallback);

    if (!outputText) {
        outputText = "Je n’ai rien pu générer cette fois-ci. Peux-tu reformuler ta question ?";
    }

    return outputText.trim();
}

// Auto-resize du textarea
function autoResizeTextarea() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
}

// Événements
sendBtn.addEventListener("click", handleSend);

inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

inputEl.addEventListener("input", autoResizeTextarea);

// Démarrage
document.addEventListener("DOMContentLoaded", () => {
    setStatus("loading", "Initialisation de ROCKET AI…");
    initEngine();
});
