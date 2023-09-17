import express from "express";

const SERVER_PORT = 26410;

const app = express();

const httpServer = app.listen(SERVER_PORT, () => {
	console.log(`Listening on port ${SERVER_PORT}`);
});

httpServer.on("upgrade", (request, socket, head) => {
	const pathname = request.url === undefined ? undefined
		: new URL(request.url, `http://${request.headers.host}`).pathname;

	if (pathname === "/play") {

	}
	else {
		socket.destroy();
	}
});
