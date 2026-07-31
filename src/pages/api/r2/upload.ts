import type { APIRoute } from "astro";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
	buildObjectKey,
	getPublicObjectUrl,
	getR2Bucket,
	getR2Client,
} from "../../../lib/r2";

export const prerender = false;

const ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
	"image/svg+xml",
]);

function isAuthorized(request: Request) {
	if (import.meta.env.DEV) return true;
	const cookie = request.headers.get("cookie") ?? "";
	return /keystatic/i.test(cookie);
}

export const POST: APIRoute = async ({ request }) => {
	if (!isAuthorized(request)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return new Response(JSON.stringify({ error: "Expected multipart form data" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const file = formData.get("file");
	const folder = String(formData.get("folder") || "uploads");

	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: "file is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const contentType = file.type || "application/octet-stream";
	if (!ALLOWED_TYPES.has(contentType)) {
		return new Response(JSON.stringify({ error: "Unsupported image type" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const key = buildObjectKey(file.name, folder);
		const body = new Uint8Array(await file.arrayBuffer());

		await getR2Client().send(
			new PutObjectCommand({
				Bucket: getR2Bucket(),
				Key: key,
				Body: body,
				ContentType: contentType,
			}),
		);

		return new Response(
			JSON.stringify({
				key,
				publicUrl: getPublicObjectUrl(key),
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("R2 upload failed:", error);
		return new Response(JSON.stringify({ error: "Failed to upload image" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
