import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { sortArticlesByPublishDate } from '../utils/articles';

export async function GET(context) {
	const posts = (await getCollection('articles', ({ data }) => data.status === 'published')).sort(
		sortArticlesByPublishDate,
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/articles/${post.id}/`,
		})),
	});
}
