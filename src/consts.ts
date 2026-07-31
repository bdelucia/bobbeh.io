// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Bobby DeLucia";
export const SITE_DESCRIPTION = "Personal website of Bobby DeLucia";

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
