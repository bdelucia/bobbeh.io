import { config, fields, collection, singleton } from "@keystatic/core";
import {
	contentImageComponents,
	heroImageField,
} from "./src/keystatic/components";

export default config({
	storage: {
		kind: "github",
		repo: {
			owner: "bdelucia",
			name: "bobbeh.io",
		},
	},

	collections: {
		articles: collection({
			label: "Articles",
			slugField: "title",
			path: "src/content/articles/*",
			format: { contentField: "content" },
			columns: ["title", "status", "pubDate"],
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					description: "Short summary shown under the title on the article page",
					multiline: true,
				}),
				status: fields.select({
					label: "Status",
					options: [
						{ label: "Draft", value: "draft" },
						{ label: "Published", value: "published" },
					],
					defaultValue: "draft",
				}),
				pubDate: fields.date({
					label: "Published date",
					description: "Set when publishing this article",
					defaultValue: { kind: "today" },
				}),
				tags: fields.array(fields.text({ label: "Tag" }), {
					label: "Tags",
					itemLabel: (props) => props.value || "New tag",
				}),
				heroImage: heroImageField("articles"),
				content: fields.markdoc({
					label: "Content",
					options: {
						// Disable repo-backed image uploads; use the Image component (R2) instead.
						image: false,
					},
					components: contentImageComponents("articles"),
				}),
			},
		}),
		trips: collection({
			label: "Trips",
			slugField: "title",
			path: "src/content/trips/*",
			format: { contentField: "content" },
			columns: ["title", "status", "startDate"],
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					description: "Short summary used for SEO and the trip page",
					multiline: true,
				}),
				status: fields.select({
					label: "Status",
					options: [
						{ label: "Draft", value: "draft" },
						{ label: "Published", value: "published" },
					],
					defaultValue: "draft",
				}),
				startDate: fields.date({
					label: "Start date",
					defaultValue: { kind: "today" },
				}),
				endDate: fields.date({
					label: "End date",
				}),
				heroImage: heroImageField("trips"),
				content: fields.markdoc({
					label: "Content",
					options: {
						image: false,
					},
					components: contentImageComponents("trips"),
				}),
			},
		}),
	},
	singletons: {
		uses: singleton({
			label: "Uses",
			path: "src/content/uses/",
			format: { contentField: "content" },
			schema: {
				title: fields.text({ label: "Title" }),
				description: fields.text({
					label: "Description",
					description: "Short summary used for SEO",
					multiline: true,
				}),
				content: fields.markdoc({
					label: "Content",
				}),
			},
		}),
	},
});
