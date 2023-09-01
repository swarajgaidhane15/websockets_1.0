const chatHeader = document.getElementById("chat-header");
const box = document.getElementById("chatbox");
const input = document.getElementById("chat-input");
const submit = document.getElementById("chat-send");

let typingTimer;

const currentUser = prompt("What is your username?");

const socket = new WebSocket("ws://localhost:8080");
socket.onopen = () => {
  socket.send(
    JSON.stringify({
      type: "name",
      payload: currentUser,
    })
  );
};

function sendData() {
  let message = input.value;

  if (message === "") return;

  socket.send(
    JSON.stringify({
      type: "message",
      payload: message,
    })
  );
  input.value = "";
}

socket.onmessage = (event) => {
  const { type, username, payload } = JSON.parse(event.data);

  switch (type) {
    case "joined":
      if (payload !== null) {
        const alert = document.createElement("p");
        alert.className = "chat-alert";
        alert.innerText = `${payload} joined the chat`;
        box.appendChild(alert);
      }
      break;
    case "message":
      const message = document.createElement("p");
      message.className =
        username === currentUser ? "your__chat" : "other__chats";
      message.textContent =
        (username === currentUser ? "" : username + " : ") + payload;
      box.appendChild(message);
      break;
    case "left":
      if (payload) {
        const alert = document.createElement("p");
        alert.className = "chat-alert";
        alert.innerText = `${payload} left the chat`;
        alert.style.backgroundColor = "red";
        alert.style.color = "white";
        box.appendChild(alert);
      }
      break;
    case "user_exists":
      alert(payload);
      window.location.reload();
      break;
    default:
      alert("Some error occurred");
      window.location.reload();
      break;
  }
};

socket.onclose = (event) => {
  alert("Connection closed");
};
