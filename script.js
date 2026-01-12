let generator;
let ready = false;

const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

function setStatus(mode, text) {
    statusDot.className = "status-dot " + mode;
    statusText.textContent = text;
}

function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "message " + (role === "user" ? "message-user" : "message-ai");

    const avatar = document.createElement("div");
    avatar.className = "avatar " + (role === "user" ? "user-avatar" : "ai-avatar");
    avatar.textContent = role === "user" ? "U" : "R";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text.replace(/\n/g, "<br>");

    div.appendChild(avatar);
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

async function init() {
    setStatus("loading", "Chargement du moteur ROCKET AI…");
    sendBtn.disabled = true;

    generator = await window.transformers.pipeline(
        "text-generation",
        "Xenova/distilgpt2"
    );

    ready = true;
    setStatus("online", "Prêt.");
    sendBtn.disabled = false;

    addMessage("ai", "ROCKET AI est prêt. Pose ta question.");
}

async function send() {
    const text = input.value.trim();
    if (!text || !ready) return;

    addMessage("user", text);
    input.value = "";
    sendBtn.disabled = true;
    setStatus("loading", "ROCKET AI réfléchit…");

    const prompt = `Tu es ROCKET AI, un assistant francophone concis.\nUtilisateur : ${text}\nROCKET AI :`;

    const out = await generator(prompt, {
        max_new_tokens: 80,
        temperature: 0.7,
    });

    const answer = out[0].generated_text.split("ROCKET AI :")[1]?.trim() || "Je n’ai pas compris.";

    addMessage("ai", answer);

    setStatus("online", "Prêt.");
    sendBtn.disabled = false;
}

sendBtn.addEventListener("click", send);
input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
    }
});

init();
