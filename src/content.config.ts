import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
	loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx,mdoc}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			status: z.enum(['draft', 'published']).default('published'),
			description: z.string().default(''),
			pubDate: z.coerce.date().optional(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			tags: z.array(z.string()).default([]),
		}),
});

const about = defineCollection({
	loader: glob({ base: './src/content/about', pattern: '**/*.mdoc' }),
	schema: z.object({
		title: z.string(),
	}),
});

const uses = defineCollection({
	loader: glob({ base: './src/content/uses', pattern: '**/*.mdoc' }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { articles, about, uses };
