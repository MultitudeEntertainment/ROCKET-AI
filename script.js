let generator;
let isReady = false;

const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

// Affiche le statut de ROCKET AI
function setStatus(mode, text) {
  statusDot.className = "status-dot " + mode;
  statusText.textContent = text;
}

// Ajoute un message dans l'interface
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + (role === "user" ? "message-user" : "message-ai");

  const avatar = document.createElement("div");
  avatar.className = "avatar " + (role === "user" ? "user-avatar" : "ai-avatar");
  avatar.textContent = role === "user" ? "U" : "R";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const header = document.createElement("div");
  header.className = "bubble-header";
  header.textContent = role === "user" ? "Vous" : "ROCKET AI";

  const body = document.createElement("div");
  body.className = "bubble-body";
  body.innerHTML = text.replace(/\n/g, "<br>");

  bubble.appendChild(header);
  bubble.appendChild(body);
  div.appendChild(avatar);
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Initialise le moteur IA
async function initRocket() {
  setStatus("loading", "Chargement du moteur ROCKET AI…");
  sendBtn.disabled = true;

  try {
    generator = await window.transformers.pipeline("text-generation", "Xenova/distilgpt2");
    isReady = true;
    setStatus("online", "Prêt.");
    sendBtn.disabled = false;
    addMessage("ai", "ROCKET AI est prêt. Pose ta question.");
  } catch (err) {
    console.error("Erreur de chargement :", err);
    setStatus("offline", "Erreur de chargement.");
    addMessage("ai", "Impossible de charger ROCKET AI. Essaie avec un navigateur récent comme Chrome ou Edge.");
  }
}

// Envoie une question à ROCKET AI
async function handleSend() {
  const question = input.value.trim();
  if (!question || !isReady) return;

  addMessage("user", question);
  input.value = "";
  sendBtn.disabled = true;
  setStatus("loading", "ROCKET AI réfléchit…");

  const prompt = `Tu es ROCKET AI, un assistant intelligent qui répond toujours en français de manière claire et logique.\nQuestion : ${question}\nRéponse :`;

  try {
    const output = await generator(prompt, {
      max_new_tokens: 100,
      temperature: 0.8,
      do_sample: true,
    });

    const raw = output[0]?.generated_text || "";
    const answer = raw.split("Réponse :")[1]?.trim() || "Je n’ai pas compris. Peux-tu reformuler ?";
    addMessage("ai", answer);
    setStatus("online", "Prêt.");
  } catch (err) {
    console.error("Erreur de génération :", err);
    addMessage("ai", "Une erreur est survenue pendant la réponse. Essaie à nouveau.");
    setStatus("offline", "Erreur.");
  }

  sendBtn.disabled = false;
}

// Événements
sendBtn.addEventListener("click", handleSend);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// Démarrage
document.addEventListener("DOMContentLoaded", initRocket);
