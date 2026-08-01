const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const BACKEND_URL = isLocalhost
  ? "http://127.0.0.1:8000/chat"
  : "https://rovai-api.onrender.com/chat";

const REQUEST_TIMEOUT_MS = 30000;
const MAX_HISTORY_MESSAGES = 10;
const CONTACT_CTA_TOKEN = "[CONTACT_CTA]";
const HISTORY_STORAGE_KEY = "rovai_chat_history";

const toggleBtn = document.getElementById("chat-toggle");
const chatWindow = document.getElementById("chat-window");
const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send");

let history = loadHistory();
let isOpen = false;

renderHistory();

toggleBtn?.addEventListener("click", () => {
  isOpen = !isOpen;
  chatWindow.classList.toggle("open", isOpen);
  toggleBtn.setAttribute("aria-expanded", String(isOpen));
  toggleBtn.setAttribute("aria-label", isOpen ? "Chat sluiten" : "Chat openen");
  if (isOpen && history.length === 0) {
    addBubble("bot", "Hallo! Ik ben de assistent van Rovai. Waarmee kan ik je helpen?");
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

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // sessionStorage kan onbeschikbaar zijn (bv. privénavigatie) — gesprek werkt dan gewoon zonder persistentie
  }
}

function renderHistory() {
  history.forEach((msg) => addBubble(msg.role === "user" ? "user" : "bot", msg.content));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderMarkdown(text) {
  const escaped = escapeHtml(text);
  const lines = escaped.split("\n");
  let html = "";
  let listTag = null;

  const closeList = () => {
    if (listTag) {
      html += `</${listTag}>`;
      listTag = null;
    }
  };

  for (const line of lines) {
    if (!line.trim()) continue;

    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.*)/);

    if (bulletMatch || numberedMatch) {
      const tag = bulletMatch ? "ul" : "ol";
      const content = bulletMatch ? bulletMatch[1] : numberedMatch[1];
      if (listTag !== tag) {
        closeList();
        html += `<${tag}>`;
        listTag = tag;
      }
      html += `<li>${content}</li>`;
    } else {
      closeList();
      html += `<p>${line}</p>`;
    }
  }
  closeList();

  return html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  if (role === "bot") {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function addContactCta() {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-bubble bot chat-cta";
  const link = document.createElement("a");
  link.href = "pages/contact.html";
  link.className = "chat-cta-link";
  link.textContent = "Bespreek je idee →";
  wrapper.appendChild(link);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
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
  saveHistory();

  const typing = addTyping();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-MAX_HISTORY_MESSAGES) }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    typing.remove();

    const rawReply = data.reply || "Ik kon geen antwoord ophalen. Probeer het gerust opnieuw.";
    const hasCta = rawReply.includes(CONTACT_CTA_TOKEN);
    const reply = rawReply.replace(CONTACT_CTA_TOKEN, "").trim();

    addBubble("bot", reply);
    history.push({ role: "assistant", content: reply });
    saveHistory();
    if (hasCta) addContactCta();
  } catch (err) {
    typing.remove();
    const message =
      err.name === "AbortError"
        ? "Het duurt langer dan verwacht. Probeer het straks opnieuw."
        : "Er ging iets mis. Probeer het later opnieuw.";
    addBubble("bot", message);
  } finally {
    clearTimeout(timeoutId);
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
