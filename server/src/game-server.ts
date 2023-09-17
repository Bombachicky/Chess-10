import { Server, WebSocket, WebSocketServer } from "ws";

export class GameServer {

	wss: WebSocketServer;
	state: "empty" | "waiting" | "playing" | "closed" = "empty";

	constructor() {
		this.wss = new WebSocketServer({ noServer: true });

		this.wss.on("connection", async (ws: WebSocket) => {
			if (this.state === "empty") {
				this.state = "waiting";
			}
			else if (this.state === "waiting") {
				this.state = "playing";
			}
		});
	}

}
