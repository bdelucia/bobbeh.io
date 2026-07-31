/** Hostname for the R2 public custom domain. */
const CDN_HOST = "cdn.bobbeh.io";

/**
 * Set `CLOUDFLARE_IMAGES=true` after enabling Image Transformations on the
 * Cloudflare zone that owns cdn.bobbeh.io. Until then, URLs stay as originals
 * (`/cdn-cgi/image/...` 404s when the product is off).
 */
const transformsEnabled =
	import.meta.env.CLOUDFLARE_IMAGES === "true" ||
	import.meta.env.CLOUDFLARE_IMAGES === "1";

export type CdnImageOptions = {
	width?: number;
	height?: number;
	/** 1–100. Cloudflare default is 85. */
	quality?: number;
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
	/**
	 * `auto` serves AVIF/WebP when the browser supports it (recommended).
	 * Does not change the file stored in R2 — conversion happens on delivery.
	 */
	format?: "auto" | "webp" | "avif" | "jpeg" | "png";
};

function isCdnUrl(src: string): boolean {
	try {
		return new URL(src).hostname === CDN_HOST;
	} catch {
		return false;
	}
}

/** Strip an existing `/cdn-cgi/image/<opts>/` prefix so options can be reapplied. */
function sourcePath(pathname: string): string {
	const match = pathname.match(/^\/cdn-cgi\/image\/[^/]+\/(.+)$/);
	return match ? `/${match[1]}` : pathname;
}

/**
 * Optionally rewrite a CDN object URL through Cloudflare Image Transformations.
 * Originals stay as uploaded in R2; format/size conversion is on-the-fly.
 *
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */
export function optimizeCdnImageUrl(
	src: string,
	options: CdnImageOptions = {},
): string {
	if (!src || !isCdnUrl(src) || !transformsEnabled) {
		// If transforms were previously baked into a URL, strip them so the
		// object path still resolves while Images is disabled.
		if (src && isCdnUrl(src) && src.includes("/cdn-cgi/image/")) {
			const url = new URL(src);
			return `${url.origin}${sourcePath(url.pathname)}`;
		}
		return src;
	}

	const {
		width,
		height,
		quality = 80,
		fit = "scale-down",
		format = "auto",
	} = options;

	const parts = [
		`format=${format}`,
		`quality=${quality}`,
		`fit=${fit}`,
		width != null ? `width=${Math.round(width)}` : null,
		height != null ? `height=${Math.round(height)}` : null,
	].filter(Boolean);

	const url = new URL(src);
	const path = sourcePath(url.pathname).replace(/^\//, "");
	return `${url.origin}/cdn-cgi/image/${parts.join(",")}/${path}`;
}
