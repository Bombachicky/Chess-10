import { Audio, AudioContext, Group, Material, Object3D, Texture } from "three";
import MTLLoader from "./loaders/MTLLoader";
import OBJLoader from "./loaders/OBJLoader";
import { mimeLookup } from "./mime";

const utfDecoder = new TextDecoder();

function normalizePath(path: string) {
	const isDir = path.endsWith("/");
	const segments: string[] = [];

	for (const segment of path.split("/")) {
		if (segment === "" || segment === ".")
			continue;
		else if (segment === "..")
			segments.pop();
		else
			segments.push(segment);
	}

	return segments.join("/") + (isDir ? "/" : "");
}

const assets = new Map<string, Uint8Array>();
function readTar(tar: Uint8Array, target: Map<string, Uint8Array>) {
	for (let index = 0; tar[index + 257] !== 0;) {
		if (utfDecoder.decode(tar.subarray(index + 257, index + 262)) !== "ustar")
			throw new Error("malformed tar");
		let fileNameEnd = index;
		while (tar[fileNameEnd] !== 0)
			fileNameEnd += 1;
		const fileName = utfDecoder.decode(tar.subarray(index, fileNameEnd));
		let fileSize = 0;
		for (let i = index + 124;; i += 1) {
			const ch = tar[i];
			if (ch >= 48)
				fileSize = fileSize * 8 + ch - 48;
			else
				break;
		}
		target.set(normalizePath(fileName), tar.subarray(index + 512, index + 512 + fileSize));
		index += 512 * (1 + (fileSize + 511) / 512 | 0);
	}
}

export async function loadAllAssets(): Promise<void> {
	const buffer = await fetch("assets.tar").then(x => x.arrayBuffer());
	readTar(new Uint8Array(buffer), assets);

	await Promise.all([...assets.entries()].map(async ([file, content]) => {
		const mime = mimeLookup(file);
		if (mime.startsWith("image/")) {
			imageCache.set(file, await new Promise<HTMLImageElement>((resolve, reject) => {
				const url = URL.createObjectURL(new Blob([content], { type: mime }));
				const img = new Image();
				img.src = url;
				img.addEventListener("load", () => {
					URL.revokeObjectURL(url);
					resolve(img);
				});
				img.addEventListener("error", e => {
					URL.revokeObjectURL(url);
					reject(new Error(e.message));
				});
			}));
		}
		else if (mime.startsWith("audio/")) {
			audioBufferCache.set(file, await new Promise<AudioBuffer>((resolve, reject) => {
				const buf = new ArrayBuffer(content.byteLength);
				new Uint8Array(buf).set(content);
				AudioContext.getContext().decodeAudioData(buf, resolve, reject);
			}));
		}
	}));
}

export function loadAsset(url: string): Uint8Array {
	url = normalizePath(url);
	if (assets.has(url))
		return assets.get(url)!;
	else
		throw new Error(`could not load ${url}`);
}

const blobAssetCache = new Map<string, string>();
export function loadAssetAsBlobURL(url: string): string {
	url = normalizePath(url);
	if (blobAssetCache.has(url))
		return blobAssetCache.get(url)!;

	const mime = mimeLookup(url);
	const result = URL.createObjectURL(new Blob([loadAsset(url)], { type: mime }));
	blobAssetCache.set(url, result);
	return result;
}

const textAssetCache = new Map<string, string>();
export function loadAssetAsText(url: string): string {
	url = normalizePath(url);
	if (textAssetCache.has(url))
		return textAssetCache.get(url)!;

	const result = utfDecoder.decode(loadAsset(url));
	textAssetCache.set(url, result);
	return result;
}

const audioBufferCache = new Map<string, AudioBuffer>();
export function loadAudioBuffer(url: string) {
	url = normalizePath(url);
	if (audioBufferCache.has(url))
		return audioBufferCache.get(url)!;
	else
		throw new Error(`could not load ${url} as audio`);
}

const imageCache = new Map<string, HTMLImageElement>();
export function loadImage(url: string) {
	url = normalizePath(url);
	if (imageCache.has(url))
		return imageCache.get(url)!;
	else
		throw new Error(`could not load ${url} as image`);
}

const textureCache = new Map<string, Texture>();
export function loadTexture(url: string) {
	url = normalizePath(url);
	if (textureCache.has(url))
		return textureCache.get(url)!;

	const texture = new Texture();
	texture.image = loadImage(url);
	texture.needsUpdate = true;
	textureCache.set(url, texture);
	return texture;
}

const mtlCache = new Map<string, any>();
const mtlLoader = new MTLLoader();

export function loadMTL(mtl: string): Material {
	mtl = normalizePath(mtl);
	if (mtlCache.has(mtl))
		return mtlCache.get(mtl)!;

	const material = mtlLoader.parse(loadAssetAsText(mtl), "/");
	material.loadTexture = loadTexture;
	material.preload();
	mtlCache.set(mtl, material);
	return material;
}

function recurseShadow(o: Object3D) {
	o.castShadow = true;
	o.receiveShadow = true;
	for (const child of o.children)
		recurseShadow(child);
}

function cloneWithMaterials<T extends Object3D>(o: T): T {
	const result = o.clone(false);
	if ("material" in result)
		result.material = (result.material as any).clone();

	for (const child of o.children)
		result.add(cloneWithMaterials(child));

	return result;
}

const objCache = new Map<string, Map<string, Group>>();
export function loadOBJ(mtl: string, obj: string, shadow: "shadow" | "no-shadow" = "shadow"): Group {
	mtl = normalizePath(mtl);
	obj = normalizePath(obj);
	if (!objCache.has(mtl))
		objCache.set(mtl, new Map());
	if (objCache.get(mtl)!.has(obj))
		return cloneWithMaterials(objCache.get(mtl)!.get(obj)!);

	const objLoader = new OBJLoader();
	objLoader.setMaterials(loadMTL(mtl));

	const res = objLoader.parse(loadAssetAsText(obj));

	if (shadow === "shadow")
		recurseShadow(res);

	objCache.get(mtl)!.set(obj, res);
	return cloneWithMaterials(res);
}
