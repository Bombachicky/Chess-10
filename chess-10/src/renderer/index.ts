import { AmbientLight, AudioListener, BoxGeometry, Color, DirectionalLight, Matrix4, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PositionalAudio, Quaternion, Raycaster, Scene, SphereGeometry, Vector2, Vector3, WebGLRenderer } from "three";
import { loadAudioBuffer, loadOBJ } from "./assets";
import { ChessController, Point } from "../chess-controller";
import PieceSelect  from "../components/PieceSelect";
import { connection, setDataCallback } from "../connection";
import { history } from "../components/Username";
import { setGameOverState } from "../components/GameOver";

const SQUARE_SIZE = 5.64633;
const BOARD_SIZE = 8;

const sphereGeom = new SphereGeometry(0.5, 16, 8);

const moveGeom = new BoxGeometry(SQUARE_SIZE, 0.1, SQUARE_SIZE);

const moveMaterial = new MeshStandardMaterial({
	color: 0x00d000,
	emissive: 0x00a000,
	opacity: 0.3,
	transparent: true,
	depthWrite: false,
});

export type Effect = () => void;

interface ExplosionOptions {
	soundVolume: number;
	soundSpeed: number;
	shockwaveOpacity: number;
	shockwaveDropoff: number;
	shockwaveSpeed: number;
	components: {
		baseScale: number;
		scaleSpread: number;
		velocitySpread: number;
		numBits: number;
		reductionAcceleration: number;
		buoyancy: number;
		friction: number;
		dropoff: [number, number, number];
	}[];
}

const pieceExplosion: ExplosionOptions = {
	soundVolume: 1,
	soundSpeed: 1,
	shockwaveOpacity: 0.5,
	shockwaveDropoff: 0.04,
	shockwaveSpeed: 1,
	components: [{
		baseScale: 3,
		scaleSpread: 2,
		velocitySpread: 20 / 60,
		numBits: 15,
		reductionAcceleration: 0.005,
		buoyancy: 0.02,
		friction: 0.01,
		dropoff: [0, 0.05, 0.2],
	}, {
		baseScale: 2,
		scaleSpread: 2,
		velocitySpread: 20 / 60,
		numBits: 5,
		reductionAcceleration: 0.005,
		buoyancy: 0.03,
		friction: 0.03,
		dropoff: [0.2, 0.2, 0.2],
	}, {
		baseScale: 1,
		scaleSpread: 0.5,
		velocitySpread: 40 / 60,
		numBits: 20,
		reductionAcceleration: 0.008,
		buoyancy: 0,
		friction: 0,
		dropoff: [0, 0.05, 0.2],
	}],
};

function randomUnitVector() {
	const vec = new Vector3(0, 0, 0);
	do {
		vec.x = Math.random() * 2 - 1;
		vec.y = Math.random() * 2 - 1;
		vec.z = Math.random() * 2 - 1;
	}
	while (vec.lengthSq() > 1);
	vec.normalize();
	return vec;
}

export interface RenderPiece {
	obj: Object3D;
	targetPosition: Vector3;
	mtl: string;
	isWhite: boolean;
	position: [number, number];
}

export class Renderer {
	canvas: HTMLCanvasElement;

	camera = new PerspectiveCamera(70, 1, 0.1, 400);
	listener = new AudioListener();

	constructor() {
		this.camera.add(this.listener);
	}

	renderer: WebGLRenderer;
	rendererInitialized = false;

	scene = new Scene();
	pointer = new Vector2();
	raycaster = new Raycaster();
	basePlane: Mesh;

	sun: DirectionalLight;
	sun2: DirectionalLight;

	effects = new Set<Effect>();

	processEffects() {
		if (this.rendererInitialized)
			for (const effect of this.effects)
				effect();
	}

	renderExplosion(point: Vector3, options: ExplosionOptions) {
		const shockwaveMaterial = new MeshStandardMaterial({
			color: 0xffffff,
			emissive: 0xffffff,
			transparent: true,
			depthWrite: false,
		});
		const shockwave = new Mesh(sphereGeom, shockwaveMaterial);
		shockwave.position.set(point.x, point.y, point.z);
		this.scene.add(shockwave);

		const sound = new PositionalAudio(this.listener);
		sound.setBuffer(loadAudioBuffer("explosion.ogg"));
		sound.setVolume(options.soundVolume);
		sound.setPlaybackRate(options.soundSpeed);
		sound.setRefDistance(20);
		sound.play();
		shockwave.add(sound);

		let shockwaveOpacity = options.shockwaveOpacity;

		const effect = () => {
			shockwaveMaterial.opacity = shockwaveOpacity;
			shockwave.scale.addScalar(options.shockwaveSpeed);
			shockwaveOpacity -= options.shockwaveDropoff;
			if (shockwaveOpacity <= 0) {
				this.scene.remove(shockwave);
				this.effects.delete(effect);
			}
		};
		this.effects.add(effect);

		for (const component of options.components) {
			const bits = new Set<{
				mesh: Mesh;
				material: MeshStandardMaterial;
				reductionSpeed: number;
				velocity: Vector3;
				dropoff: number;
			}>();

			for (let i = 0; i < component.numBits; i++) {
				const material = new MeshStandardMaterial({
					color: 0xffffff,
					emissive: 0xffffff,
				});
				const mesh = new Mesh(sphereGeom, material);
				mesh.position.set(point.x, point.y, point.z);
				mesh.scale.set(
					component.baseScale + Math.random() * component.scaleSpread,
					component.baseScale + Math.random() * component.scaleSpread,
					component.baseScale + Math.random() * component.scaleSpread,
				);
				this.scene.add(mesh);
				const vec = randomUnitVector();
				bits.add({
					mesh,
					material,
					reductionSpeed: 0,
					velocity: vec.multiplyScalar(Math.random() * component.velocitySpread),
					dropoff: Math.random() * 0.8 + 0.2,
				});
			}

			const effect = () => {
				for (const bit of bits) {
					bit.reductionSpeed += component.reductionAcceleration;

					bit.velocity.x *= 1 - component.friction;
					bit.velocity.y += component.buoyancy;
					bit.velocity.z *= 1 - component.friction;

					bit.material.color.r *= 1 - (bit.dropoff * component.dropoff[0]);
					bit.material.color.g *= 1 - (bit.dropoff * component.dropoff[1]);
					bit.material.color.b *= 1 - (bit.dropoff * component.dropoff[2]);

					bit.material.emissive.set(bit.material.color);

					bit.mesh.position.add(bit.velocity);
					const newScale = bit.mesh.scale.x - bit.reductionSpeed;
					if (newScale <= 0) {
						this.scene.remove(bit.mesh);
						bits.delete(bit);
					}
					else {
						bit.mesh.scale.set(newScale, newScale, newScale);
					}
				}

				if (bits.size === 0)
					this.effects.delete(effect);
			};
			this.effects.add(effect);
		}
	}

	findPiece(pos: [number, number]): RenderPiece | undefined {
		return this.pieces.find(piece => {
			return piece.position[0] === pos[0]
				&& piece.position[1] === pos[1];
		});
	}

	explodePiece(pos: [number, number]) {
		const offset = -SQUARE_SIZE / 2 * (BOARD_SIZE - 1);
		this.renderExplosion(new Vector3(
			offset + SQUARE_SIZE * pos[1],
			4,
			offset + SQUARE_SIZE * pos[0],
		), pieceExplosion);
	}

	isWhite: boolean;
	pieces: RenderPiece[] = [];
	controller: ChessController;
	setPieceToPromote: (piece: RenderPiece) => void;

	async initializeRenderer(theCanvas: HTMLCanvasElement, isWhite: boolean, setPieceToPromote: (piece: RenderPiece) => void) {
		this.isWhite = isWhite;
		this.canvas = theCanvas;
		this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas });
		this.setPieceToPromote = setPieceToPromote;
		this.controller = new ChessController({
			me: isWhite ? "white" : "black",
			enableEnpassant: true,
		});

		setDataCallback(data => {
			if (data.type === "move") {
				this.doMove(data.from, data.to, true);
			}
			else if (data.type === "promote") {
				this.promote(this.findPiece(data.pos), data.unit, data.unitOnBoard, false);
			}
		});

		this.canvas.addEventListener("mousemove", e => {
			this.pointer.x = (e.clientX / this.canvas.clientWidth) * 2 - 1;
			this.pointer.y = (e.clientY / this.canvas.clientHeight) * -2 + 1;
		});

		this.canvas.addEventListener("mousedown", e => {
			if (e.button === 0) {
				if (this.hoveredPiece) {
					if (!this.controller.myTurn)
						return;
					this.draggingPiece = this.hoveredPiece;

					this.startDrag(this.draggingPiece);
				}
			}
		});

		this.canvas.addEventListener("mouseup", e => {
			if (e.button === 0) {
				if (this.draggingPiece) {
					this.finishDrag(this.draggingPiece);
				}
			}
		});

		this.scene.background = new Color(0x333333);

		this.sun = new DirectionalLight(0xffffff, 2);
		this.sun.castShadow = true;
		this.sun.shadow.mapSize.width = 4096; // default
		this.sun.shadow.mapSize.height = 4096; // default
		this.sun.shadow.camera.left = this.sun.shadow.camera.bottom = -50;
		this.sun.shadow.camera.right = this.sun.shadow.camera.top = 50;
		this.sun.shadow.camera.near = 0.5; // default
		this.sun.shadow.camera.far = 5000; // default
		this.sun.position.set(5, 16, 2).multiplyScalar(10);
		this.scene.add(this.sun);

		this.sun2 = new DirectionalLight(0xffffff, 1);
		this.sun2.castShadow = true;
		this.sun2.shadow.mapSize.width = 2048; // default
		this.sun2.shadow.mapSize.height = 2048; // default
		this.sun2.shadow.camera.left = this.sun2.shadow.camera.bottom = -50;
		this.sun2.shadow.camera.right = this.sun2.shadow.camera.top = 50;
		this.sun2.shadow.camera.near = 0.5; // default
		this.sun2.shadow.camera.far = 5000; // default
		this.sun2.shadow.radius = 2;
		this.sun2.position.set(10, 26, 2).multiplyScalar(10);
		this.scene.add(this.sun2);

		const ambient = new AmbientLight(0xffffff, 0.3);
		this.scene.add(ambient);

		this.basePlane = new Mesh(new PlaneGeometry(1000, 1000), new MeshStandardMaterial({
			opacity: 0,
			transparent: true,
			depthWrite: false,
		}));
		this.basePlane.rotateX(-Math.PI / 2);
		this.scene.add(this.basePlane);

		const board: string[][] = [
			["r", "n", "b", "q", "k", "b", "n", "r"],
			["p", "p", "p", "p", "p", "p", "p", "p"],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			[" ", " ", " ", " ", " ", " ", " ", " "],
			["P", "P", "P", "P", "P", "P", "P", "P"],
			["R", "N", "B", "Q", "K", "B", "N", "R"],
		];

		this.scene.add(loadOBJ("board.mtl", "board.obj"));

		for (let i = 0; i < 8; ++i) {
			for (let j = 0; j < 8; ++j) {
				let piece = board[i][j];
				const black = piece.toLowerCase() !== piece;
				piece = piece.toLowerCase();
				switch (piece) {
					case "p": piece = "pawn.obj"; break;
					case "r": piece = "rook.obj"; break;
					case "n": piece = "knight.obj"; break;
					case "b": piece = "bishop.obj"; break;
					case "q": piece = "queen.obj"; break;
					case "k": piece = "king.obj"; break;
				}
				if (piece !== " ") {
					const mtl = black ? "black.mtl" : "white.mtl";
					const obj = loadOBJ(
						mtl,
						piece,
					);
					const offset = -SQUARE_SIZE / 2 * (BOARD_SIZE - 1);
					obj.translateX(offset + SQUARE_SIZE * j);
					obj.translateZ(offset + SQUARE_SIZE * i);
					if (black)
						obj.rotateY(Math.PI);
					this.scene.add(obj);
					this.pieces.push({
						obj, mtl,
						targetPosition: obj.position.clone(),
						isWhite: !black,
						position: [i, j],
					});
				}
			}
		}

		this.renderer.shadowMap.enabled = true;

		this.rendererInitialized = true;
	}

	isInvertedView() {
		return this.isWhite;
	}

	startDrag(piece: RenderPiece) {
		const moves = this.controller.getMoves(piece.position);
		moves.forEach(move => this.showMoveSpot(move.end));
	}

	promote(piece: RenderPiece, unit: string, unitOnBoard: string, send: boolean = true) {
		if (send) {
			connection.ws.send(JSON.stringify({
				type: "promote",
				pos: piece.position,
				unit, unitOnBoard,
			}));
		}
		else {
			// vvvv if you're confused, ask brian what this is vvvv
			this.controller.myTurn = !this.controller.myTurn;
		}

		this.setPieceToPromote(undefined);
		this.scene.remove(piece.obj);
		const old = piece.obj.position.clone();
		piece.obj = loadOBJ(piece.mtl, `${unit}.obj`);
		piece.obj.position.copy(old);
		this.scene.add(piece.obj);
		this.controller.board[piece.position[0]][piece.position[1]] = piece.mtl === "white.mtl" // bruh
			? unitOnBoard.toLowerCase()
			: unitOnBoard.toUpperCase();
		this.checkGameOver();
	}

	checkGameOver() {
		const currentTurn = this.controller.me === "white"
			? this.controller.myTurn
			: !this.controller.myTurn;
		if (
			!this.controller.hasMovesAvailable(currentTurn)
		) {
			if (this.controller.inCheck(this.controller.me === "white")) {
				setGameOverState("you-lost");
			}
			else if (this.controller.inCheck(this.controller.me !== "white")) {
				setGameOverState("you-won");
			}
			else {
				setGameOverState("stalemate");
			}

			history.push("/game-over");
		}
	}

	doMove(from: Point, to: Point | undefined, legal: boolean): boolean {
		const piece = this.findPiece(from);

		const moves = this.controller.getMoves(piece.position);
		const move = to === undefined ? undefined : moves.find(move => move.end[0] === to[0] && move.end[1] === to[1]);

		let success = false;
		if (move && legal) {
			const commands = this.controller.executeMove(move);
			commands.forEach(cmd => {
				if (cmd.type === "destroy") {
					const capturedPiece = this.findPiece(cmd.point);
					this.explodePiece(capturedPiece.position);
					this.scene.remove(capturedPiece.obj);
					this.pieces.splice(this.pieces.indexOf(capturedPiece), 1);
				}
				else if (cmd.type === "move") {
					const piece = this.findPiece(cmd.from);
					const [i, j] = cmd.to;
					const offset = -SQUARE_SIZE / 2 * (BOARD_SIZE - 1);
					piece.targetPosition.setX(offset + SQUARE_SIZE * j);
					piece.targetPosition.setY(0);
					piece.targetPosition.setZ(offset + SQUARE_SIZE * i);
					piece.position = cmd.to;
				}
				else if (cmd.type === "promote") {
					if (piece.isWhite === (this.controller.me === "white")) {
						this.setPieceToPromote(piece);
					}
					else {
						this.controller.myTurn = !this.controller.myTurn;
					}
				}
			});
			piece.position = move.end;
			success = true;
			this.controller.myTurn = !this.controller.myTurn;
		}

		this.checkGameOver();

		const [i, j] = piece.position;
		const offset = -SQUARE_SIZE / 2 * (BOARD_SIZE - 1);
		piece.targetPosition.setX(offset + SQUARE_SIZE * j);
		piece.targetPosition.setY(0);
		piece.targetPosition.setZ(offset + SQUARE_SIZE * i);

		return success;
	}

	finishDrag(piece: RenderPiece) {
		const req = JSON.stringify({
			type: "move",
			from: piece.position,
			to: this.hoverSquare,
		});
		if (this.doMove(piece.position, this.hoverSquare, this.controller.myTurn)) {
			connection.ws.send(req);
		}

		this.removeMoveSpots();

		this.draggingPiece = undefined;
	}

	hoverPoint: [number, number] | undefined;
	hoverSquare: [number, number] | undefined;

	findHoveredSquare(): [number, number] {
		// calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects([this.basePlane], false);
		if (intersects.length > 0) {
			this.hoverPoint = [
				intersects[0].point.z,
				intersects[0].point.x,
			];

			const offset = -SQUARE_SIZE / 2 * BOARD_SIZE;

			const i = Math.floor((this.hoverPoint[0] - offset) / SQUARE_SIZE);
			const j = Math.floor((this.hoverPoint[1] - offset) / SQUARE_SIZE);

			if (i < 0 || j < 0 || i >= BOARD_SIZE || j >= BOARD_SIZE)
				return undefined;

			return [i, j];
		}
		else {
			this.hoverPoint = undefined;
			return undefined;
		}
	}

	hoveredPiece: RenderPiece | undefined;
	draggingPiece: RenderPiece | undefined;

	updateHover() {
		if (this.hoveredPiece)
			this.hoveredPiece.obj.scale.setScalar(1);

		const hovered = this.findHoveredSquare();

		this.hoverSquare = hovered;

		if (this.draggingPiece)
			this.hoveredPiece = this.draggingPiece;
		else if (hovered)
			this.hoveredPiece = this.findPiece(hovered);
		else
			this.hoveredPiece = undefined;

		if (this.hoveredPiece?.isWhite !== (this.controller.me === "white")) {
			this.hoveredPiece = undefined;
		}

		if (this.hoveredPiece)
			this.hoveredPiece.obj.scale.setScalar(1.2);
	}

	updateDrag() {
		if (this.draggingPiece) {
			const [i, j] = this.hoverPoint;
			this.draggingPiece.targetPosition.setX(j);
			this.draggingPiece.targetPosition.setY(4);
			this.draggingPiece.targetPosition.setZ(i);
		}
	}

	firstRender: boolean = true;
	render() {
		if (this.firstRender
			|| this.canvas.width !== this.canvas.clientWidth
			|| this.canvas.height !== this.canvas.clientHeight
		) {
			this.firstRender = false;
			this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
			this.canvas.height = this.canvas.clientHeight * devicePixelRatio;
			this.camera.aspect = this.canvas.width / this.canvas.height;
			this.camera.updateProjectionMatrix();
		}

		this.raycaster.setFromCamera(this.pointer, this.camera);

		this.updateHover();
		this.updateDrag();

		for (const piece of this.pieces) {
			piece.obj.position.lerp(piece.targetPosition, 0.3);
		}

		const ZOOM = 15;
		this.camera.position.set(
			0,
			3 * ZOOM,
			(this.isInvertedView() ? -1 : 1) * 2 * ZOOM,
		);
		this.camera.quaternion.setFromRotationMatrix(
			new Matrix4().lookAt(this.camera.position, new Vector3(
				0,
				0,
				(this.isInvertedView() ? -1 : 1) * 0.5 * ZOOM
			), new Vector3(0, 1, 0))
		);

		this.renderer.setSize(this.canvas.width, this.canvas.height, false);
		this.renderer.render(this.scene, this.camera);
	}

	moveSpots: Object3D[] = [];

	removeMoveSpots() {
		this.moveSpots.forEach(v => this.scene.remove(v));
		this.moveSpots = [];
	}

	showMoveSpot(pos: [number, number]) {
		const offset = -SQUARE_SIZE / 2 * (BOARD_SIZE - 1);
		const mesh = new Mesh(moveGeom, moveMaterial);
		mesh.position.set(
			offset + pos[1] * SQUARE_SIZE,
			0,
			offset + pos[0] * SQUARE_SIZE,
		);
		this.moveSpots.push(mesh);
		this.scene.add(mesh);
	}
}
