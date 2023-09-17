import { useHistory } from "react-router-dom";
import { history } from "./components/Username";
import { setRole } from "./components/Game";

export class Connection {

	ws: WebSocket;

	constructor(path: string) {
		this.ws = new WebSocket(
			(window.location.protocol === "https:" ? "wss://" : "ws://")
			+ window.location.host
			+ path
		);

		this.ws.addEventListener("message", e => {
			const data = JSON.parse(e.data);
			if (data.type === "join") {
				setRole(data.role === "white");
				history.push("/game");
			}
		});
	}

}

export let connection: Connection | undefined;

export function connectAndWait(username: string) {
	disconnect();

	connection = new Connection(`/create-room/${username}`);
}

export function connectJoin(roomId: string) {
	disconnect();

	connection = new Connection(`/join-room/${roomId}`);
}

export function disconnect() {
	if (connection) {
		connection.ws.close();
		connection = undefined;
	}
}
