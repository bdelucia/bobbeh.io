import { useEffect, useId, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { fields } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";
import {
	r2Image,
	startBackgroundUpload,
	uploadToR2,
	watchUpload,
} from "./r2-image-field";

type ImageValue = {
	src: string | null;
	alt: string;
};

function ImageNodeView(props: {
	value: ImageValue;
	onChange: (value: ImageValue) => void;
	onRemove: () => void;
	isSelected: boolean;
	folder: string;
}) {
	const inputId = useId();
	const altId = useId();
	const onChangeRef = useRef(props.onChange);
	const valueRef = useRef(props.value);
	const altDraftRef = useRef(props.value.alt);
	const altFocusedRef = useRef(false);
	onChangeRef.current = props.onChange;
	valueRef.current = props.value;

	const [altDraft, setAltDraft] = useState(props.value.alt);
	const [uploadId, setUploadId] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const uploading = uploadId !== null;
	const displaySrc = previewUrl ?? props.value.src;
	altDraftRef.current = altDraft;

	// Sync alt from editor state only while the field isn't being edited.
	// Writing on every keystroke dispatches a ProseMirror transaction that steals focus.
	useEffect(() => {
		if (!altFocusedRef.current) {
			setAltDraft(props.value.alt);
		}
	}, [props.value.alt]);

	const commitAlt = (alt: string) => {
		const current = valueRef.current;
		if (alt === current.alt) return;
		onChangeRef.current({ src: current.src, alt });
	};

	useEffect(() => {
		if (!uploadId) return;
		return watchUpload(uploadId, (result) => {
			setUploadId(null);
			setPreviewUrl(null);
			if (result.url) {
				onChangeRef.current({ src: result.url, alt: altDraftRef.current });
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
				onSuccess: (url) => {
					onChangeRef.current({ src: url, alt: altDraftRef.current });
				},
				onError: (message) => setError(message),
			},
		);
		setUploadId(id);
		setPreviewUrl(preview);
	};

	// Keep interactive controls outside ProseMirror's contenteditable selection.
	const stopEditorEvents = (event: SyntheticEvent) => {
		event.stopPropagation();
	};

	return (
		<div
			contentEditable={false}
			data-ignore-content=""
			style={{
				...styles.shell,
				outline: props.isSelected
					? "2px solid color-mix(in srgb, currentColor 45%, transparent)"
					: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
			}}
			onMouseDown={stopEditorEvents}
		>
			{displaySrc ? (
				<div style={styles.previewFrame}>
					<img src={displaySrc} alt={altDraft || ""} style={styles.preview} />
					{uploading ? (
						<div style={styles.overlay}>
							<span style={styles.overlayText}>Uploading to R2…</span>
						</div>
					) : null}
				</div>
			) : (
				<label style={styles.dropzone} htmlFor={inputId}>
					<span style={styles.dropzoneTitle}>
						{uploading ? "Uploading…" : "Choose image"}
					</span>
					<span style={styles.dropzoneHint}>Uploads to Cloudflare R2</span>
				</label>
			)}

			{displaySrc && altDraft.trim() ? (
				<p style={styles.captionPreview}>{altDraft.trim()}</p>
			) : null}

			<div style={styles.toolbar}>
				<label style={styles.button} htmlFor={inputId}>
					{uploading ? "Uploading…" : displaySrc ? "Replace" : "Upload"}
				</label>
				<input
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
				<div style={styles.altLabel}>
					<label htmlFor={altId}>Alt / caption</label>
					<input
						id={altId}
						type="text"
						value={altDraft}
						placeholder="Describe the image (shown under it on the site)"
						style={styles.altInput}
						onMouseDown={stopEditorEvents}
						onKeyDown={stopEditorEvents}
						onFocus={() => {
							altFocusedRef.current = true;
						}}
						onChange={(event) => {
							setAltDraft(event.target.value);
						}}
						onBlur={(event) => {
							altFocusedRef.current = false;
							const alt = event.currentTarget.value;
							setAltDraft(alt);
							commitAlt(alt);
						}}
					/>
				</div>
				<button type="button" style={styles.button} onClick={props.onRemove}>
					Remove
				</button>
			</div>

			{error ? <p style={styles.error}>{error}</p> : null}
		</div>
	);
}

export function contentImageComponents(folder: string) {
	return {
		Image: Object.assign(
			block({
				label: "Image",
				description:
					"Upload an image to Cloudflare R2. Alt text is also shown as a caption under the image.",
				schema: {
					src: fields.text({ label: "Image URL" }),
					alt: fields.text({
						label: "Alt text / caption",
						description:
							"Used for accessibility and shown as a figcaption under the image",
						defaultValue: "",
					}),
				},
				NodeView(props) {
					return (
						<ImageNodeView
							value={{
								src: (props.value.src as string | null) || null,
								alt: (props.value.alt as string) || "",
							}}
							onChange={(value) =>
								props.onChange({
									src: value.src ?? "",
									alt: value.alt,
								})
							}
							onRemove={props.onRemove}
							isSelected={props.isSelected}
							folder={folder}
						/>
					);
				},
			}),
			{
				async handleFile(file: File) {
					if (!file.type.startsWith("image/")) return false as const;
					const src = await uploadToR2(file, folder);
					return { src, alt: "" };
				},
			},
		),
	};
}

export function heroImageField(folder: string) {
	return r2Image({
		label: "Hero Image",
		folder,
	});
}

const font =
	'Inter, "Inter var", ui-sans-serif, system-ui, -apple-system, sans-serif';

const styles: Record<string, CSSProperties> = {
	shell: {
		display: "flex",
		flexDirection: "column",
		gap: "0.75rem",
		padding: "0.75rem",
		borderRadius: "0.75rem",
		background: "color-mix(in srgb, currentColor 5%, transparent)",
		color: "inherit",
		fontFamily: font,
		userSelect: "none",
	},
	previewFrame: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: "0.5rem",
		overflow: "hidden",
		background: "color-mix(in srgb, currentColor 8%, transparent)",
		minHeight: "8rem",
	},
	preview: {
		display: "block",
		maxWidth: "100%",
		maxHeight: "20rem",
		width: "auto",
		height: "auto",
		objectFit: "contain",
	},
	captionPreview: {
		margin: "0.25rem 0 0",
		color: "color-mix(in srgb, currentColor 65%, transparent)",
		fontSize: "0.8125rem",
		lineHeight: 1.4,
		textAlign: "center",
		fontFamily: font,
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
	dropzone: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "0.35rem",
		minHeight: "8rem",
		borderRadius: "0.5rem",
		border: "1px dashed color-mix(in srgb, currentColor 35%, transparent)",
		background: "color-mix(in srgb, currentColor 6%, transparent)",
		cursor: "pointer",
		color: "inherit",
		fontFamily: font,
	},
	dropzoneTitle: {
		fontFamily: font,
		fontWeight: 600,
		fontSize: "0.875rem",
		color: "inherit",
	},
	dropzoneHint: {
		fontFamily: font,
		fontSize: "0.75rem",
		opacity: 0.6,
		color: "inherit",
	},
	toolbar: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
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
	altLabel: {
		display: "flex",
		alignItems: "center",
		gap: "0.4rem",
		flex: "1 1 12rem",
		fontFamily: font,
		fontSize: "0.8125rem",
		fontWeight: 600,
		color: "inherit",
		userSelect: "none",
	},
	altInput: {
		flex: 1,
		minWidth: 0,
		padding: "0.4rem 0.6rem",
		borderRadius: "0.5rem",
		border: "1px solid color-mix(in srgb, currentColor 28%, transparent)",
		background: "color-mix(in srgb, currentColor 8%, transparent)",
		color: "inherit",
		fontFamily: font,
		fontSize: "0.8125rem",
		fontWeight: 400,
		userSelect: "text",
	},
	hiddenInput: {
		display: "none",
	},
	error: {
		margin: 0,
		fontFamily: font,
		color: "#f87171",
		fontSize: "0.8125rem",
	},
};
