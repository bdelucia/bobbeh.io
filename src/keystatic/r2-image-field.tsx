import { useId, useState, type CSSProperties } from "react";
import type { BasicFormField, FormFieldInputProps } from "@keystatic/core";

type R2ImageValue = string | null;

type R2ImageOptions = {
	label: string;
	description?: string;
	/** Object key prefix inside the R2 bucket, e.g. "articles" or "trips". */
	folder?: string;
};

export async function uploadToR2(file: File, folder: string) {
	// Prefer direct-to-R2 for large files (avoids host body-size limits).
	// Falls back to server upload when CORS isn't configured yet.
	if (file.size > 3.5 * 1024 * 1024) {
		try {
			return await uploadViaPresign(file, folder);
		} catch (error) {
			console.warn("Presigned R2 upload failed, falling back to server upload:", error);
		}
	}

	return uploadViaServer(file, folder);
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
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onFileChange = async (file: File | undefined) => {
		if (!file) return;
		setError(null);
		setUploading(true);
		try {
			const url = await uploadToR2(file, props.folder);
			props.onChange(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div style={styles.field}>
			<label htmlFor={inputId} style={styles.label}>
				{props.label}
			</label>
			{props.description ? (
				<p style={styles.description}>{props.description}</p>
			) : null}

			{props.value ? (
				<div style={styles.previewWrap}>
					<img src={props.value} alt="" style={styles.preview} />
					<div style={styles.actions}>
						<label style={styles.button}>
							{uploading ? "Uploading…" : "Replace"}
							<input
								id={inputId}
								type="file"
								accept="image/*"
								disabled={uploading}
								style={styles.hiddenInput}
								onChange={(event) => {
									void onFileChange(event.target.files?.[0]);
									event.target.value = "";
								}}
							/>
						</label>
						<button
							type="button"
							style={styles.buttonSecondary}
							disabled={uploading}
							onClick={() => props.onChange(null)}
						>
							Remove
						</button>
					</div>
					<p style={styles.url}>{props.value}</p>
				</div>
			) : (
				<label style={styles.dropzone}>
					{uploading ? "Uploading to Cloudflare R2…" : "Choose image"}
					<input
						id={inputId}
						type="file"
						accept="image/*"
						disabled={uploading}
						style={styles.hiddenInput}
						onChange={(event) => {
							void onFileChange(event.target.files?.[0]);
							event.target.value = "";
						}}
					/>
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

const styles: Record<string, CSSProperties> = {
	field: {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
	},
	label: {
		fontWeight: 600,
		fontSize: "0.875rem",
	},
	description: {
		margin: 0,
		color: "#6b7280",
		fontSize: "0.8125rem",
	},
	dropzone: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "8rem",
		border: "1px dashed #c4c4c4",
		borderRadius: "0.5rem",
		cursor: "pointer",
		background: "#fafafa",
		fontSize: "0.875rem",
	},
	previewWrap: {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
	},
	preview: {
		display: "block",
		maxWidth: "100%",
		maxHeight: "16rem",
		objectFit: "contain",
		borderRadius: "0.5rem",
		border: "1px solid #e5e5e5",
		background: "#f5f5f5",
	},
	actions: {
		display: "flex",
		gap: "0.5rem",
	},
	button: {
		display: "inline-flex",
		alignItems: "center",
		padding: "0.375rem 0.75rem",
		borderRadius: "0.375rem",
		border: "1px solid #d1d5db",
		background: "#fff",
		cursor: "pointer",
		fontSize: "0.8125rem",
	},
	buttonSecondary: {
		padding: "0.375rem 0.75rem",
		borderRadius: "0.375rem",
		border: "1px solid #d1d5db",
		background: "#fff",
		cursor: "pointer",
		fontSize: "0.8125rem",
	},
	hiddenInput: {
		display: "none",
	},
	url: {
		margin: 0,
		fontSize: "0.75rem",
		color: "#6b7280",
		wordBreak: "break-all",
	},
	error: {
		margin: 0,
		color: "#b91c1c",
		fontSize: "0.8125rem",
	},
};
