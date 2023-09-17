import express from "express";
import { Server, WebSocket, WebSocketServer } from "ws";
import { GameServer } from "./game-server";

const SERVER_PORT = 21530;

const app = express();

const httpServer = app.listen(SERVER_PORT, () => {
	console.log(`Listening on port ${SERVER_PORT}`);
});

app.use(express.json());

const rooms: {
	id: string;
	username: string;
	server: GameServer;
}[] = [];

app.post("/api/create-room", (req, res) => {
	if (typeof req.body.username !== "string") {
		throw new Error("bad request, shame on you");
	}

	const id = (Math.random() * 1000000 | 0).toString();
	rooms.push({
		id,
		username: req.body.username,
		server: new GameServer(),
	});

	res.end(JSON.stringify({
		success: true,
	}));
});

app.get("/api/list-rooms", (req, res) => {
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

	if (pathname?.startsWith("/play/")) {
		const id = pathname.substring("/play/".length);
		const room = rooms.find(r => r.id === id);
		if (room?.server.state === "empty" || room?.server.state === "waiting") {
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
