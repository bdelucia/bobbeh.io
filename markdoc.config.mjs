import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	tags: {
		Image: {
			render: component("./src/components/ContentImage.astro"),
			attributes: {
				src: { type: String, required: true },
				alt: { type: String },
			},
		},
	},
});
