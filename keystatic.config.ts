import { config, fields, collection, singleton } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
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
        tags: fields.multiselect({
          label: "Tags",
          options: [
            { label: "Tutorial", value: "Tutorial" },
            { label: "Opinion", value: "Opinion" },
            { label: "AI", value: "AI" },
          ],
        }),
        heroImage: fields.image({
          label: "Hero Image",
        }),
        content: fields.markdoc({
          label: "Content",
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
        content: fields.markdoc({
          label: "Content",
        }),
      },
    }),
    about: singleton({
      label: "About",
      path: "src/content/about/",
      format: { contentField: "content" },
      schema: {
        title: fields.text({ label: "Title" }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
