import { fields } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";
import { r2Image } from "./r2-image-field";

export function contentImageComponents(folder: string) {
	return {
		Image: block({
			label: "Image",
			description: "Upload an image to Cloudflare R2",
			schema: {
				src: r2Image({
					label: "Image",
					description: "Uploaded to Cloudflare R2 (not GitHub)",
					folder,
				}),
				alt: fields.text({
					label: "Alt text",
					defaultValue: "",
				}),
			},
			ContentView(props) {
				const src = props.value.src as string | null | undefined;
				if (!src) {
					return <span style={{ color: "#6b7280" }}>No image selected</span>;
				}
				return (
					<img
						src={src}
						alt={(props.value.alt as string | undefined) || ""}
						style={{
							display: "block",
							maxWidth: "100%",
							maxHeight: "20rem",
							objectFit: "contain",
							borderRadius: "0.5rem",
						}}
					/>
				);
			},
		}),
	};
}

export function heroImageField(folder: string) {
	return r2Image({
		label: "Hero Image",
		description: "Uploaded to Cloudflare R2 (not GitHub)",
		folder,
	});
}
