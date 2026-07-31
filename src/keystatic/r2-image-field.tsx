import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { BasicFormField, FormFieldInputProps } from "@keystatic/core";

type R2ImageValue = string | null;

type R2ImageOptions = {
	label: string;
	description?: string;
	/** Object key prefix inside the R2 bucket, e.g. "articles" or "trips". */
	folder?: string;
};

/** Survives dialog/component unmount so uploads can finish and notify listeners. */
type PendingUpload = {
	promise: Promise<string>;
	previewUrl: string;
	listeners: Set<(result: { url?: string; error?: string }) => void>;
};

const pendingUploads = new Map<string, PendingUpload>();

export function getPendingUpload(id: string) {
	return pendingUploads.get(id);
}

function notify(
	pending: PendingUpload,
	result: { url?: string; error?: string },
) {
	for (const listener of pending.listeners) {
		listener(result);
	}
	pending.listeners.clear();
}

export async function uploadToR2(file: File, folder: string) {
	// Prefer direct-to-R2 for large files (avoids host body-size limits).
	// Falls back to server upload when CORS isn't configured yet.
	if (file.size > 3.5 * 1024 * 1024) {
		try {
			return await uploadViaPresign(file, folder);
		} catch (error) {
			console.warn(
				"Presigned R2 upload failed, falling back to server upload:",
				error,
			);
		}
	}

	return uploadViaServer(file, folder);
}

/**
 * Starts an upload that continues even if the React tree unmounts (e.g. Done).
 * `onSuccess` / `onError` are kept on the pending upload (not tied to React mount).
 */
export function startBackgroundUpload(
	file: File,
	folder: string,
	callbacks?: {
		onSuccess?: (url: string) => void;
		onError?: (message: string) => void;
	},
) {
	const id = crypto.randomUUID();
	const previewUrl = URL.createObjectURL(file);
	const listeners = new Set<(result: { url?: string; error?: string }) => void>();

	const promise = uploadToR2(file, folder)
		.then((url) => {
			callbacks?.onSuccess?.(url);
			const pending = pendingUploads.get(id);
			if (pending) {
				notify(pending, { url });
				URL.revokeObjectURL(pending.previewUrl);
				pendingUploads.delete(id);
			}
			return url;
		})
		.catch((error) => {
			const message = error instanceof Error ? error.message : "Upload failed";
			callbacks?.onError?.(message);
			const pending = pendingUploads.get(id);
			if (pending) {
				notify(pending, { error: message });
				URL.revokeObjectURL(pending.previewUrl);
				pendingUploads.delete(id);
			}
			throw error;
		});

	pendingUploads.set(id, { promise, previewUrl, listeners });
	return { id, previewUrl, promise };
}

export function watchUpload(
	id: string,
	listener: (result: { url?: string; error?: string }) => void,
) {
	const pending = pendingUploads.get(id);
	if (!pending) return () => {};
	pending.listeners.add(listener);
	return () => {
		pending.listeners.delete(listener);
	};
}

async function uploadViaServer(file: File, folder: string) {
	const body = new FormData();
	body.append("file", file);
	body.append("folder", folder);

	const response = await fetch("/api/r2/upload", {
		method: "POST",
		credentials: "include",
		body,
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error ?? "Failed to upload image");
	}

	const { publicUrl } = (await response.json()) as { publicUrl: string };
	return publicUrl;
}

async function uploadViaPresign(file: File, folder: string) {
	const presignResponse = await fetch("/api/r2/presign", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			filename: file.name,
			contentType: file.type || "application/octet-stream",
			folder,
		}),
	});

	if (!presignResponse.ok) {
		const err = await presignResponse.json().catch(() => ({}));
		throw new Error(err.error ?? "Failed to prepare upload");
	}

	const { uploadUrl, publicUrl } = (await presignResponse.json()) as {
		uploadUrl: string;
		publicUrl: string;
	};

	const uploadResponse = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type || "application/octet-stream" },
		body: file,
	});

	if (!uploadResponse.ok) {
		throw new Error(`Upload failed (${uploadResponse.status})`);
	}

	return publicUrl;
}

function R2ImageInput(
	props: FormFieldInputProps<R2ImageValue> & {
		label: string;
		description?: string;
		folder: string;
	},
) {
	const inputId = useId();
	const onChangeRef = useRef(props.onChange);
	onChangeRef.current = props.onChange;

	const [uploadId, setUploadId] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const uploading = uploadId !== null;
	const displaySrc = previewUrl ?? props.value;

	useEffect(() => {
		if (!uploadId) return;
		return watchUpload(uploadId, (result) => {
			setUploadId(null);
			setPreviewUrl(null);
			if (result.url) {
				onChangeRef.current(result.url);
				setError(null);
			} else if (result.error) {
				setError(result.error);
			}
		});
	}, [uploadId]);

	const onFileChange = (file: File | undefined) => {
		if (!file) return;
		setError(null);
		const { id, previewUrl: preview } = startBackgroundUpload(
			file,
			props.folder,
			{
				onSuccess: (url) => onChangeRef.current(url),
				onError: (message) => setError(message),
			},
		);
		setUploadId(id);
		setPreviewUrl(preview);
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div style={styles.field}>
			<div style={styles.labelBlock}>
				<label htmlFor={inputId} style={styles.label}>
					{props.label}
				</label>
				{props.description ? (
					<p style={styles.description}>{props.description}</p>
				) : null}
			</div>

			<input
				ref={fileInputRef}
				id={inputId}
				type="file"
				accept="image/*"
				disabled={uploading}
				style={styles.hiddenInput}
				onChange={(event) => {
					onFileChange(event.target.files?.[0]);
					event.target.value = "";
				}}
			/>

			{displaySrc ? (
				<div style={styles.previewWrap}>
					<div style={styles.previewFrame}>
						<img src={displaySrc} alt="" style={styles.preview} />
						{uploading ? (
							<div style={styles.overlay}>
								<span style={styles.overlayText}>Uploading to R2…</span>
							</div>
						) : null}
					</div>
					<div style={styles.actions}>
						<button
							type="button"
							style={styles.button}
							disabled={uploading}
							onClick={() => fileInputRef.current?.click()}
						>
							{uploading ? "Uploading…" : "Replace"}
						</button>
						<button
							type="button"
							style={styles.button}
							disabled={uploading}
							onClick={() => {
								setPreviewUrl(null);
								setUploadId(null);
								props.onChange(null);
							}}
						>
							Remove
						</button>
					</div>
					{props.value && !props.value.startsWith("blob:") ? (
						<code style={styles.url}>{props.value}</code>
					) : null}
				</div>
			) : (
				<label style={styles.dropzone} htmlFor={inputId}>
					<span style={styles.dropzoneTitle}>
						{uploading ? "Uploading…" : "Choose image"}
					</span>
					{!uploading ? (
						<span style={styles.dropzoneHint}>PNG, JPG, WebP, or GIF</span>
					) : null}
				</label>
			)}

			{error ? <p style={styles.error}>{error}</p> : null}
			{props.forceValidation && !props.value ? (
				<p style={styles.error}>{props.label} is required</p>
			) : null}
		</div>
	);
}

export function r2Image(options: R2ImageOptions): BasicFormField<R2ImageValue> {
	const folder = options.folder ?? "uploads";

	return {
		kind: "form",
		label: options.label,
		Input(props) {
			return (
				<R2ImageInput
					{...props}
					label={options.label}
					description={options.description}
					folder={folder}
				/>
			);
		},
		defaultValue() {
			return null;
		},
		parse(value) {
			if (value === undefined || value === null) return null;
			if (typeof value !== "string") return null;
			return value === "" ? null : value;
		},
		serialize(value) {
			return { value: value === null ? undefined : value };
		},
		validate(value) {
			return value;
		},
		reader: {
			parse(value) {
				if (typeof value !== "string") return null;
				return value === "" ? null : value;
			},
		},
	};
}

/** Match Keystatic's Inter UI; form controls don't inherit font-family by default. */
const font =
	'Inter, "Inter var", ui-sans-serif, system-ui, -apple-system, sans-serif';

/** Theme-aware styles that work on Keystatic's dark (and light) UI. */
const styles: Record<string, CSSProperties> = {
	field: {
		display: "flex",
		flexDirection: "column",
		gap: "0.75rem",
		color: "inherit",
		fontFamily: font,
	},
	labelBlock: {
		display: "flex",
		flexDirection: "column",
		gap: "0.25rem",
	},
	label: {
		fontFamily: font,
		fontWeight: 600,
		fontSize: "0.875rem",
		lineHeight: 1.4,
		color: "inherit",
	},
	description: {
		margin: 0,
		opacity: 0.65,
		fontFamily: font,
		fontSize: "0.8125rem",
		lineHeight: 1.4,
		color: "inherit",
	},
	dropzone: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "0.35rem",
		minHeight: "9rem",
		padding: "1.25rem",
		border: "1px dashed color-mix(in srgb, currentColor 35%, transparent)",
		borderRadius: "0.75rem",
		cursor: "pointer",
		background: "color-mix(in srgb, currentColor 6%, transparent)",
		color: "inherit",
		fontFamily: font,
		textAlign: "center",
	},
	dropzoneTitle: {
		fontFamily: font,
		fontSize: "0.875rem",
		fontWeight: 600,
		color: "inherit",
	},
	dropzoneHint: {
		fontFamily: font,
		fontSize: "0.75rem",
		opacity: 0.6,
		color: "inherit",
	},
	previewWrap: {
		display: "flex",
		flexDirection: "column",
		gap: "0.75rem",
	},
	previewFrame: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: "0.75rem",
		border: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
		background: "color-mix(in srgb, currentColor 6%, transparent)",
		overflow: "hidden",
		minHeight: "8rem",
	},
	preview: {
		display: "block",
		maxWidth: "100%",
		maxHeight: "16rem",
		width: "auto",
		height: "auto",
		objectFit: "contain",
	},
	overlay: {
		position: "absolute",
		inset: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		background: "color-mix(in srgb, black 45%, transparent)",
	},
	overlayText: {
		fontFamily: font,
		color: "#fff",
		fontSize: "0.875rem",
		fontWeight: 600,
	},
	actions: {
		display: "flex",
		flexWrap: "wrap",
		gap: "0.5rem",
	},
	button: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		boxSizing: "border-box",
		margin: 0,
		padding: "0.375rem 0.75rem",
		borderRadius: "0.5rem",
		border: "1px solid color-mix(in srgb, currentColor 22%, transparent)",
		background: "color-mix(in srgb, currentColor 8%, transparent)",
		color: "inherit",
		cursor: "pointer",
		fontFamily: font,
		fontSize: "0.8125rem",
		fontWeight: 500,
		lineHeight: 1.25,
		WebkitAppearance: "none",
		appearance: "none",
	},
	hiddenInput: {
		display: "none",
	},
	url: {
		display: "block",
		boxSizing: "border-box",
		margin: 0,
		padding: "0.4rem 0.6rem",
		borderRadius: "0.375rem",
		border: "1px solid color-mix(in srgb, currentColor 14%, transparent)",
		background: "color-mix(in srgb, currentColor 6%, transparent)",
		fontFamily:
			'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
		fontSize: "0.6875rem",
		lineHeight: 1.45,
		opacity: 0.7,
		color: "inherit",
		wordBreak: "break-all",
	},
	error: {
		margin: 0,
		fontFamily: font,
		color: "#f87171",
		fontSize: "0.8125rem",
	},
};
