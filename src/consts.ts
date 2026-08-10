// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Bobby DeLucia";
export const SITE_DESCRIPTION =
	"Personal website of Bobby DeLucia — articles on web development and Linux, trip notes, and the tools I use.";
export const SITE_NAME = "bobbeh.io";

export const ARTICLES_DESCRIPTION =
	"Tutorials and notes on web development, Linux customization, and cooking.";
export const TRIPS_DESCRIPTION =
	"Photo essays and notes from places I've traveled.";
export const USES_DESCRIPTION =
	"Hardware, software, and everyday tools I use for development and daily life.";

/** Build a unique document title; omit `page` for the home page. */
export function pageTitle(page?: string) {
	return page ? `${page} · ${SITE_TITLE}` : SITE_TITLE;
}

/** Left-to-right nav order; used for route-relative view transition direction. */
export const NAV_ROUTES = [
	{ href: "/articles", label: "Articles" },
	{ href: "/trips", label: "Trips" },
	{ href: "/uses", label: "Uses" },
] as const;

export const SOCIAL_LINKS = [
	{
		href: "https://x.com/bibborto",
		label: "X (Twitter)",
		platform: "x",
	},
	{
		href: "https://www.linkedin.com/in/bdeluciajr",
		label: "LinkedIn",
		platform: "linkedin",
	},
	{
		href: "https://github.com/bdelucia",
		label: "GitHub",
		platform: "github",
	},
] as const;
