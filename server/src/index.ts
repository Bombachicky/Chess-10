import express from "express";
import { Game } from "common";
import { GameServer } from "./game-server";

const SERVER_PORT = 26410;

const app = express();

const gameServers = new Set<GameServer>();

const httpServer = app.listen(SERVER_PORT, () => {
	console.log(`Listening on port ${SERVER_PORT}`);
});

function rankImbalance(server: GameServer) {
	let blueCount = 0, redCount = 0;
	for (const c of server.clients.values()) {
		if (c.team === "blue") blueCount++;
		else if (c.team === "red") redCount++;
	}

	if (blueCount === 0 || redCount === 0)
		return Infinity;
	return Math.max(blueCount, redCount) / Math.min(blueCount, redCount);
}

httpServer.on("upgrade", (request, socket, head) => {
	const pathname = request.url === undefined ? undefined
		: new URL(request.url, `http://${request.headers.host}`).pathname;

	if (pathname === "/play") {
		const array: GameServer[] = [];
		for (const s of gameServers.values())
			array.push(s);
		array.sort((a, b) => {
			const imbalanceA = rankImbalance(a);
			const imbalanceB = rankImbalance(b);
			if (imbalanceA === imbalanceB) {
				// fill in smaller servers first
				return a.clients.size - b.clients.size;
			}
			else {
				// fill in more imbalanced servers first
				return imbalanceB - imbalanceA;
			}
		});
		let chosenServer: GameServer | undefined;
		for (const candidate of array) {
			if (candidate.clients.size < 12) {
				chosenServer = candidate;
				break;
			}
		}
		if (chosenServer === undefined) {
			chosenServer = new GameServer();
			console.log("Start server");
			gameServers.add(chosenServer);
		}
		const server = chosenServer;
		server.wss.handleUpgrade(request, socket, head, (ws) => {
			server.wss.emit("connection", ws, request);
		});
	}
	else {
		socket.destroy();
	}
});

setInterval(() => {
	for (const server of gameServers) {
		if (server.alive)
			server.tick();
		else {
			gameServers.delete(server);
			console.log("Close server");
		}
	}
}, 5);
