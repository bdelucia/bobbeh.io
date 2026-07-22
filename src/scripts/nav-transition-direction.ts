import { NAV_ROUTES } from '../consts';

function normalizePath(pathname: string) {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}
	return pathname || '/';
}

function isBlogPost(pathname: string) {
	const path = normalizePath(pathname);
	return path.startsWith('/blog/');
}

/** Index in NAV_ROUTES, or -1. Nested paths (e.g. /blog/slug) match their parent nav item. */
function routeIndex(pathname: string) {
	const path = normalizePath(pathname);
	let best = -1;
	let bestLen = -1;

	for (let i = 0; i < NAV_ROUTES.length; i++) {
		const route = normalizePath(NAV_ROUTES[i].href);
		const matches =
			path === route || (route !== '/' && path.startsWith(`${route}/`));
		if (matches && route.length > bestLen) {
			best = i;
			bestLen = route.length;
		}
	}

	return best;
}

document.addEventListener('astro:before-preparation', (event) => {
	const from = normalizePath(event.from.pathname);
	const to = normalizePath(event.to.pathname);
	const fromPost = isBlogPost(from);
	const toPost = isBlogPost(to);

	// Blog posts are nested under /blog — use a vertical slide.
	if (!fromPost && toPost) {
		event.direction = 'down';
		return;
	}
	if (fromPost && !toPost) {
		event.direction = 'up';
		return;
	}

	const fromIdx = routeIndex(from);
	const toIdx = routeIndex(to);
	if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
	event.direction = toIdx > fromIdx ? 'forward' : 'back';
});
