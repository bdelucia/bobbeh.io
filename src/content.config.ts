import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
	loader: glob({
		base: './src/content/articles',
		pattern: '**/*.{md,mdx,mdoc}',
		generateId: ({ entry }) =>
			entry.replace(/\.(md|mdx|mdoc)$/, '').replace(/\/index$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		status: z.enum(['draft', 'published']).default('published'),
		description: z.string().default(''),
		pubDate: z.coerce.date().optional(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).default([]),
	}),
});

const trips = defineCollection({
	loader: glob({
		base: './src/content/trips',
		pattern: '**/*.{md,mdx,mdoc}',
		generateId: ({ entry }) =>
			entry.replace(/\.(md|mdx|mdoc)$/, '').replace(/\/index$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		status: z.enum(['draft', 'published']).default('published'),
		description: z.string().default(''),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const uses = defineCollection({
	loader: glob({ base: './src/content/uses', pattern: '**/*.mdoc' }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { articles, trips, uses };
