import { WebSocketServer } from "ws";
const server = new WebSocketServer({ port: 8080 });

const clients = new Map();

function broadcast(data) {
  clients.forEach((client) => {
    client.send(data);
  });
}

function broadcastExceptItself(id, data) {
  clients.forEach((client) => {
    if (id === client.uniqueId) return;
    client.send(data);
  });
}

server.on("connection", (ws) => {
  ws.on("message", (data) => {
    ws.uniqueId = Math.random().toString(36).substring(7);

    const { type, payload } = JSON.parse(data);

    if (type === "name") {
      let canProceed = true;
      clients.forEach((client) => {
        if (client.username === payload) {
          ws.send(
            JSON.stringify({
              type: "user_exists",
              payload: `Username ${payload} is already taken. Try another one.`,
            })
          );
          canProceed = false;
          return;
        }
      });

      if (!canProceed) return;

      ws.username = payload;

      clients.set(ws.uniqueId, ws);

      broadcastExceptItself(
        ws.uniqueId,
        JSON.stringify({
          type: "joined",
          payload,
        })
      );
      return;
    }

    if (type === "typing") {
      broadcastExceptItself(
        ws.uniqueId,
        JSON.stringify({
          type: "typing",
          payload,
        })
      );
      return;
    }

    broadcast(
      JSON.stringify({
        type: "message",
        username: ws.username,
        payload,
      })
    );
  });

  ws.on("close", () => {
    broadcast(
      JSON.stringify({
        type: "left",
        payload: ws.username,
      })
    );
  });
});
