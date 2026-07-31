import type { APIRoute } from "astro";
import { createPresignedUploadUrl, ensureR2Cors } from "../../../lib/r2";

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
	// Keystatic GitHub mode sets auth cookies after OAuth.
	// In local/dev, allow uploads without requiring those cookies.
	if (import.meta.env.DEV) return true;
	const cookie = request.headers.get("cookie") ?? "";
	return /keystatic/i.test(cookie);
}

export const POST: APIRoute = async ({ request, url }) => {
	if (!isAuthorized(request)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	let body: {
		filename?: string;
		contentType?: string;
		folder?: string;
	};

	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const filename = body.filename?.trim();
	const contentType = body.contentType?.trim();
	const folder = body.folder?.trim() || "uploads";

	if (!filename || !contentType) {
		return new Response(
			JSON.stringify({ error: "filename and contentType are required" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	if (!ALLOWED_TYPES.has(contentType)) {
		return new Response(JSON.stringify({ error: "Unsupported image type" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const origin = url.origin;
		await ensureR2Cors([
			origin,
			"http://localhost:4321",
			"http://127.0.0.1:4321",
		]);

		const result = await createPresignedUploadUrl({
			filename,
			contentType,
			folder,
		});

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("R2 presign failed:", error);
		return new Response(JSON.stringify({ error: "Failed to create upload URL" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
