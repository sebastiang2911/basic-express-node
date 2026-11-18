const statusElement = document.querySelector("#socket-status");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const submitButton = document.querySelector("#message-submit");
const messagesElement = document.querySelector("#messages");

const addMessage = (message, type) => {
  messagesElement.querySelector(".empty-message")?.remove();

  const messageElement = document.createElement("p");
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  messagesElement.append(messageElement);
  messagesElement.scrollTop = messagesElement.scrollHeight;
};

if (typeof window.io !== "function") {
  statusElement.textContent = "Could not load the Socket.IO client.";
  console.error("Socket.IO client was not loaded");
} else {
  const socket = window.io();

  socket.on("connect", () => {
    statusElement.textContent = `Connected: ${socket.id}`;
    submitButton.disabled = false;
    console.log("Socket.IO connected:", socket.id);
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();
    if (!message || !socket.connected) return;

    addMessage(message, "sent");
    socket.emit("mensaje-cliente", { message }, (response) => {
      addMessage(response.message, "received");
      console.log("Server response:", response);
    });

    messageInput.value = "";
    messageInput.focus();
  });

  socket.on("disconnect", () => {
    statusElement.textContent = "Socket.IO disconnected.";
    submitButton.disabled = true;
  });

  socket.on("connect_error", (error) => {
    statusElement.textContent = "Could not connect to Socket.IO.";
    console.error("Socket.IO connection error:", error.message);
  });
}
