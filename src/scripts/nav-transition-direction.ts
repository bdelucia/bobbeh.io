import { NAV_ROUTES } from '../consts';

function normalizePath(pathname: string) {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}
	return pathname || '/';
}

function isHome(pathname: string) {
	return normalizePath(pathname) === '/';
}

function isNestedNavPost(pathname: string) {
	const path = normalizePath(pathname);
	return NAV_ROUTES.some((route) => {
		const routePath = normalizePath(route.href);
		return routePath !== '/' && path.startsWith(`${routePath}/`);
	});
}

/** Index in NAV_ROUTES, or -1. Nested paths (e.g. /articles/slug) match their parent nav item. */
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
	const fromHome = isHome(from);
	const toHome = isHome(to);
	const fromPost = isNestedNavPost(from);
	const toPost = isNestedNavPost(to);

	// Home sits above the nav — use a vertical slide.
	if (fromHome && !toHome) {
		event.direction = 'down';
		return;
	}
	if (!fromHome && toHome) {
		event.direction = 'up';
		return;
	}

	// Nested nav routes (e.g. /articles/slug, /trips/slug) — use a vertical slide.
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
