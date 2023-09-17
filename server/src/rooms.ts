import { GameServer } from "./game-server";

export const rooms: {
	id: string;
	username: string;
	server: GameServer;
}[] = [];

export function deleteRoom(server: GameServer) {
	const index = rooms.findIndex(x => x.server === server);
	if (index >= 0) {
		rooms.splice(index, 1);
	}
}
