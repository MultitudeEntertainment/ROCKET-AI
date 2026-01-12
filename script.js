let pipeline;
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");

async function init() {
  send.disabled = true;
  const status = document.createElement("div");
  status.className = "message ai";
  status.innerHTML = `<div class="bubble">Chargement du moteur ROCKET AI…</div>`;
  chat.appendChild(status);

  pipeline = await window.transformers.pipeline("text-generation", "Xenova/distilgpt2");
  send.disabled = false;

  status.innerHTML = `<div class="bubble">ROCKET AI est prêt. Pose ta question.</div>`;
}

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<div class="bubble">${text}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

send.addEventListener("click", async () => {
  const question = input.value.trim();
  if (!question) return;

  addMessage("user", question);
  input.value = "";
  send.disabled = true;

  const prompt = `Tu es ROCKET AI, un assistant intelligent qui répond en français de façon concise.\nUtilisateur : ${question}\nROCKET AI :`;

  const output = await pipeline(prompt, {
    max_new_tokens: 100,
    temperature: 0.7,
    do_sample: true,
  });

  addMessage("ai", output[0].generated_text.split("ROCKET AI :")[1].trim());
  send.disabled = false;
});

init();
