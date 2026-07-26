import type { CollectionEntry } from 'astro:content';

export function isPublishedArticle(article: CollectionEntry<'articles'>) {
	return article.data.status === 'published';
}

export function sortArticlesByPublishDate(a: CollectionEntry<'articles'>, b: CollectionEntry<'articles'>) {
	return (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0);
}
