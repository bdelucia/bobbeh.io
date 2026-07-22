// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Bobby DeLucia";
export const SITE_DESCRIPTION = "Personal website of Bobby DeLucia";

/** Left-to-right nav order; used for route-relative view transition direction. */
export const NAV_ROUTES = [
	{ href: "/", label: "Home" },
	{ href: "/blog", label: "Blog" },
	{ href: "/about", label: "About" },
	{ href: "/uses", label: "Uses" },
] as const;
