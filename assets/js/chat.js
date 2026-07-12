const BACKEND_URL = "https://aibed-a5du.onrender.com/chat";

const toggleBtn = document.getElementById("chat-toggle");
const chatWindow = document.getElementById("chat-window");
const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send");

let history = [];
let isOpen = false;

toggleBtn?.addEventListener("click", () => {
  isOpen = !isOpen;
  chatWindow.classList.toggle("open", isOpen);
  toggleBtn.setAttribute("aria-expanded", String(isOpen));
  toggleBtn.setAttribute("aria-label", isOpen ? "Chat sluiten" : "Chat openen");
  if (isOpen && history.length === 0) {
    addBubble("bot", "Hallo! Ik ben de assistent van Rova. Waarmee kan ik je helpen?");
  }
  if (isOpen) inputEl.focus();
});

sendBtn?.addEventListener("click", sendMessage);
inputEl?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function addTyping() {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bot typing";
  bubble.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  sendBtn.disabled = true;
  addBubble("user", text);
  history.push({ role: "user", content: text });

  const typing = addTyping();

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    typing.remove();
    const reply = data.reply || "Ik kon geen antwoord ophalen. Probeer het gerust opnieuw.";
    addBubble("bot", reply);
    history.push({ role: "assistant", content: reply });
  } catch {
    typing.remove();
    addBubble("bot", "Er ging iets mis. Probeer het later opnieuw.");
  }

  sendBtn.disabled = false;
  inputEl.focus();
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !isOpen) return;
  isOpen = false;
  chatWindow.classList.remove("open");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.setAttribute("aria-label", "Chat openen");
  toggleBtn.focus();
});
