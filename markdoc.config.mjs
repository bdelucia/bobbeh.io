import { defineMarkdocConfig, component, nodes } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	nodes: {
		fence: {
			...nodes.fence,
			render: component("./src/components/CodeBlock.astro"),
			attributes: {
				...nodes.fence.attributes,
				content: { type: String, required: true },
				language: { type: String },
			},
		},
	},
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
