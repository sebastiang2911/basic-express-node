const SESSION_KEY = "socketAuthSession";
const login = document.querySelector("#login");
const messenger = document.querySelector("#messenger");
const feedback = document.querySelector("#login-feedback");
const connection = document.querySelector("#connection");
const scope = document.querySelector("#scope");
const recipient = document.querySelector("#recipient");
const roomInput = document.querySelector("#room");
const joinRoom = document.querySelector("#join-room");
const messages = document.querySelector("#messages");
let socket;
let session;
let currentRoom = "";

function saveSession(data) {
  session = { user: data.user, token: data.token };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  openMessenger();
}

function openMessenger() {
  login.hidden = true;
  messenger.hidden = false;
  document.querySelector("#session-name").textContent = session.user.name;
  connectSocket();
}

function connectSocket() {
  socket?.disconnect();
  socket = io("/auth", {
    auth: { token: session.token },
    extraHeaders: { "x-token": session.token },
  });
  socket.on("connect", () => {
    connection.textContent = "Authenticated socket";
    connection.classList.add("online");
  });
  socket.on("connect_error", (error) => {
    connection.textContent = error.message;
    connection.classList.remove("online");
  });
  socket.on("disconnect", () => {
    connection.textContent = "Socket disconnected";
    connection.classList.remove("online");
  });
  socket.on("users:online", renderUsers);
  socket.on("message:new", renderMessage);
  socket.on("room:joined", (room) => {
    currentRoom = room;
    connection.textContent = `Room: ${room}`;
  });
}

function renderUsers(users) {
  document.querySelector("#online-users").innerHTML = users
    .map((user) => `<li>${escapeHtml(user.name)}</li>`)
    .join("");
  recipient.innerHTML = users
    .filter((user) => user.uid !== session.user.uid)
    .map((user) => `<option value="${user.uid}">${escapeHtml(user.name)}</option>`)
    .join("");
}

function renderMessage(message) {
  const element = document.createElement("article");
  const isOwn = message.from.uid === session.user.uid;
  element.className = `message${isOwn ? " own" : ""}`;
  const labels = { global: "everyone", private: "private" };
  const label = message.scope === "room" ? `room ${message.room}` : labels[message.scope];
  const author = isOwn ? "You" : message.from.name;
  element.innerHTML = `<strong>${escapeHtml(author)}</strong><p>${escapeHtml(message.text)}</p><small>${label} · ${new Date(message.sentAt).toLocaleTimeString("en-US")}</small>`;
  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.textContent = "Validating…";
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to sign in");
    feedback.textContent = "";
    saveSession(data);
  } catch (error) {
    feedback.textContent = error.message;
  }
});

window.handleSocketGoogleCredential = async ({ credential }) => {
  feedback.textContent = "Validating Google…";
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: credential }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Google Sign-In failed");
    feedback.textContent = "";
    saveSession(data);
  } catch (error) {
    feedback.textContent = error.message;
  }
};

scope.addEventListener("change", () => {
  recipient.hidden = scope.value !== "private";
  roomInput.hidden = scope.value !== "room";
  joinRoom.hidden = scope.value !== "room";
});

joinRoom.addEventListener("click", () => {
  const room = roomInput.value.trim();
  if (room) socket.emit("room:join", room);
});

document.querySelector("#message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#message-input");
  const text = input.value.trim();
  if (!text) return;
  if (scope.value === "private") socket.emit("message:private", { text, to: recipient.value });
  else if (scope.value === "room") {
    if (!currentRoom) return;
    socket.emit("message:room", { text, room: currentRoom });
  } else socket.emit("message:global", { text });
  input.value = "";
});

document.querySelector("#signout").addEventListener("click", () => {
  socket?.disconnect();
  localStorage.removeItem(SESSION_KEY);
  session = null;
  messenger.hidden = true;
  login.hidden = false;
  connection.textContent = "Not authenticated";
  connection.classList.remove("online");
  messages.innerHTML = "";
});

try {
  session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (session?.user && session?.token) openMessenger();
} catch {
  localStorage.removeItem(SESSION_KEY);
}
