import express from "express";
import { Server, WebSocket, WebSocketServer } from "ws";
import { GameServer } from "./game-server";
import { rooms } from "./rooms";

const SERVER_PORT = 21530;

const app = express();

const httpServer = app.listen(SERVER_PORT, () => {
	console.log(`Listening on port ${SERVER_PORT}`);
});

app.use(express.json());

app.get("/api/list-rooms", (req, res) => {
	res.contentType("application/json");
	res.end(JSON.stringify(rooms.map(room => {
		return {
			id: room.id,
			username: room.username,
		};
	})));
});

httpServer.on("upgrade", (request, socket, head) => {
	const pathname = request.url === undefined ? undefined
		: new URL(request.url, `http://${request.headers.host}`).pathname;

	if (pathname?.startsWith("/create-room/")) {
		const username = pathname.substring("/create-room/".length);

		const server = new GameServer();
		const id = (Math.random() * 1000000 | 0).toString();
		rooms.push({ id, username, server });

		server.wss.handleUpgrade(request, socket, head, (ws) => {
			server.wss.emit("connection", ws, request);
		});
	}
	else if (pathname?.startsWith("/join-room/")) {
		const id = pathname.substring("/join-room/".length);
		const room = rooms.find(r => r.id === id);
		if (room?.server.state === "waiting") {
			const server = room.server;
			server.wss.handleUpgrade(request, socket, head, (ws) => {
				server.wss.emit("connection", ws, request);
			});
		}
		else {
			socket.destroy();
		}
	}
	else {
		socket.destroy();
	}
});
