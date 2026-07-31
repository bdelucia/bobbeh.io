import type { APIRoute } from "astro";
import { getObject } from "../../lib/r2";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const key = params.key;
	if (!key) {
		return new Response("Not found", { status: 404 });
	}

	try {
		const object = await getObject(key);
		if (!object.Body) {
			return new Response("Not found", { status: 404 });
		}

		const bytes = await object.Body.transformToByteArray();
		const headers = new Headers();
		headers.set(
			"Content-Type",
			object.ContentType ?? "application/octet-stream",
		);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		if (object.ETag) headers.set("ETag", object.ETag);
		if (object.ContentLength != null) {
			headers.set("Content-Length", String(object.ContentLength));
		}

		return new Response(Buffer.from(bytes), { status: 200, headers });
	} catch (error) {
		console.error("R2 media fetch failed:", error);
		return new Response("Not found", { status: 404 });
	}
};
