import {
	GetObjectCommand,
	PutBucketCorsCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const accountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = import.meta.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucket = import.meta.env.CLOUDFLARE_R2_BUCKET ?? "bobbeh-io-assets";

function requireEnv(value: string | undefined, name: string): string {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

let client: S3Client | undefined;
let corsConfigured = false;

export function getR2Bucket() {
	return bucket;
}

export function getR2Client() {
	if (!client) {
		client = new S3Client({
			region: "auto",
			endpoint: `https://${requireEnv(accountId, "CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: requireEnv(accessKeyId, "CLOUDFLARE_ACCESS_KEY_ID"),
				secretAccessKey: requireEnv(
					secretAccessKey,
					"CLOUDFLARE_SECRET_ACCESS_KEY",
				),
			},
		});
	}
	return client;
}

/** Public CDN base for R2 objects. Override with CLOUDFLARE_R2_PUBLIC_URL if needed. */
const DEFAULT_PUBLIC_URL = "https://cdn.bobbeh.io";

/**
 * Canonical public URL for an uploaded object (original bytes as stored in R2).
 * Format conversion (WebP/AVIF) and resizing happen at delivery via
 * Cloudflare Image Transformations (`/cdn-cgi/image/...`) — R2 does not convert on upload.
 */
export function getPublicObjectUrl(key: string) {
	const publicBase = (
		import.meta.env.CLOUDFLARE_R2_PUBLIC_URL || DEFAULT_PUBLIC_URL
	).replace(/\/$/, "");
	return `${publicBase}/${key}`;
}

function sanitizeFilename(filename: string) {
	return filename
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function buildObjectKey(filename: string, folder = "uploads") {
	const safe = sanitizeFilename(filename) || "image";
	const cleanFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
	return `${cleanFolder}/${randomUUID()}-${safe}`;
}

export async function ensureR2Cors(origins: string[]) {
	if (corsConfigured) return;
	const uniqueOrigins = [...new Set(origins.filter(Boolean))];
	if (uniqueOrigins.length === 0) return;

	try {
		await getR2Client().send(
			new PutBucketCorsCommand({
				Bucket: bucket,
				CORSConfiguration: {
					CORSRules: [
						{
							AllowedOrigins: uniqueOrigins,
							AllowedMethods: ["GET", "PUT", "HEAD"],
							AllowedHeaders: ["*"],
							ExposeHeaders: ["ETag", "Content-Type"],
							MaxAgeSeconds: 3600,
						},
					],
				},
			}),
		);
		corsConfigured = true;
	} catch (error) {
		// Object Read & Write tokens often cannot change bucket CORS.
		// Configure CORS once in the Cloudflare R2 dashboard if uploads fail in-browser.
		console.warn("Unable to auto-configure R2 CORS:", error);
		corsConfigured = true;
	}
}

export async function createPresignedUploadUrl(options: {
	filename: string;
	contentType: string;
	folder?: string;
}) {
	const key = buildObjectKey(options.filename, options.folder);
	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentType: options.contentType,
	});
	const uploadUrl = await getSignedUrl(getR2Client(), command, {
		expiresIn: 60 * 10,
	});
	return {
		key,
		uploadUrl,
		publicUrl: getPublicObjectUrl(key),
	};
}

export async function getObject(key: string) {
	return getR2Client().send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	);
}
