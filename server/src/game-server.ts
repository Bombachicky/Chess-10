import { Server, WebSocket, WebSocketServer } from "ws";
import { deleteRoom } from "./rooms";

export class GameServer {

	wss: WebSocketServer;
	state: "empty" | "waiting" | "playing" | "closed" = "empty";

	white!: WebSocket;
	black!: WebSocket;

	constructor() {
		this.wss = new WebSocketServer({ noServer: true });

		this.wss.on("connection", async (ws: WebSocket) => {
			if (this.state === "empty") {
				this.white = ws;
				this.state = "waiting";
			}
			else if (this.state === "waiting") {
				this.black = ws;
				this.state = "playing";

				deleteRoom(this);
				this.join();
			}
			else {
				ws.close();
			}

			let aliveInterval: NodeJS.Timeout;
			ws.on("close", () => {
				this.wss.close();
				deleteRoom(this);
				clearInterval(aliveInterval);
			});

			ws.on("message", e => {
				try {
					const packet = JSON.parse(e.toString());
					if (ws === this.white) {
						this.black.send(JSON.stringify(packet));
					}
					else {
						this.white.send(JSON.stringify(packet));
					}
				}
				catch (e) {
					console.error("Error while processing client input:");
					console.error(e);
				}
			});

			let lastPongTime = performance.now() / 1000;
			aliveInterval = setInterval(() => {
				if (performance.now() / 1000 - lastPongTime >= 10) {
					ws.close();
				}
				else {
					ws.ping();
				}
			}, 500);

			ws.on("pong", data => {
				lastPongTime = performance.now() / 1000;
			});
		});
	}

	join() {
		this.white.send(JSON.stringify({
			type: "join",
			role: "white",
		}));
		this.black.send(JSON.stringify({
			type: "join",
			role: "black",
		}));
	}

}
