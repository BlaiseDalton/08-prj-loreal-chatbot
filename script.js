// Find the chat elements on the page.
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendBtn");
const chatWindow = document.getElementById("chatWindow");

// This Worker holds the OpenAI API key, so the key is never exposed here.
const workerUrl = "https://lorealchatbot.blaised381.workers.dev/";

// Keep the assistant focused on L'Oréal beauty products and advice.
const systemPrompt =
  "You are a L'Oréal beauty advisor. Answer questions about L'Oréal products, beauty routines and recommendations, and related beauty topics. Politely decline requests unrelated to beauty, explain that you can help with beauty topics, and invite a related question. Do not invent product details; say when you are unsure. Use a few relevant emojis, such as ✅ for recommendation list items, without overusing them.";

// Keep the conversation history so the assistant can remember names and past questions.
const conversation = [];

// Add a message as text so user input is displayed safely.
function addMessage(role, text) {
  const messageElement = document.createElement("p");
  messageElement.className = `msg ${role}`;
  messageElement.textContent = `${role === "user" ? "You" : "Assistant"}: ${text}`;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show an accessible animated typing bubble while the Worker is responding.
function addTypingIndicator() {
  const typingMessage = document.createElement("p");
  typingMessage.className = "msg ai typing-indicator";
  typingMessage.setAttribute("role", "status");
  typingMessage.setAttribute("aria-label", "Assistant is typing");

  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    dot.setAttribute("aria-hidden", "true");
    typingMessage.appendChild(dot);
  }

  chatWindow.appendChild(typingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return typingMessage;
}

// Show a greeting when the chat page first opens.
addMessage("ai", "Hello! How can I help you today?");

// Send each message to the class Cloudflare Worker.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  // Show only the latest question and its reply; conversation context stays in memory.
  chatWindow.textContent = "";
  addMessage("user", message);
  conversation.push({ role: "user", content: message });
  userInput.value = "";
  sendButton.disabled = true;
  const typingIndicator = addTypingIndicator();

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`The request failed (${response.status}).`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The Worker returned an unexpected response.");
    }

    conversation.push({ role: "assistant", content: reply });
    addMessage("ai", reply);
  } catch (error) {
    addMessage("ai", `Sorry, I couldn't get a reply. ${error.message}`);
  } finally {
    typingIndicator.remove();
    sendButton.disabled = false;
    userInput.focus();
  }
});
