const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

const fadeOut = {
	name: 'astroFadeOut',
	duration: '90ms',
	easing: EASE,
	fillMode: 'both',
} as const;

const fadeIn = {
	name: 'astroFadeIn',
	duration: '210ms',
	delay: '30ms',
	easing: EASE,
	fillMode: 'both',
} as const;

const move = (name: string) =>
	({
		name,
		duration: '220ms',
		easing: EASE,
		fillMode: 'both',
	}) as const;

/** Horizontal for top-level nav; vertical for blog post enter/exit. */
export const pageTransition = {
	forwards: {
		old: [fadeOut, move('slideToLeft')],
		new: [fadeIn, move('slideFromRight')],
	},
	backwards: {
		old: [fadeOut, move('slideToRight')],
		new: [fadeIn, move('slideFromLeft')],
	},
	/** Into a nested route (e.g. /blog → /blog/slug) */
	down: {
		old: [fadeOut, move('slideToTop')],
		new: [fadeIn, move('slideFromBottom')],
	},
	/** Out of a nested route (e.g. /blog/slug → /blog) */
	up: {
		old: [fadeOut, move('slideToBottom')],
		new: [fadeIn, move('slideFromTop')],
	},
};
