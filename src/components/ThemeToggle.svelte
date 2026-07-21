<script>
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	/** @typedef {'light' | 'dark'} Theme */

	let theme = $state(/** @type {Theme} */ ('light'));

	const icon = $derived(theme === 'dark' ? 'boxicons:moon' : 'boxicons:sun');
	const label = $derived(
		theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
	);

	/**
	 * @param {Theme} next
	 */
	function applyTheme(next) {
		theme = next;
		document.documentElement.dataset.theme = next;
		localStorage.setItem('theme', next);
	}

	function toggle() {
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	}

	onMount(() => {
		const stored = localStorage.getItem('theme');
		const fromDom = document.documentElement.dataset.theme;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		/** @type {Theme} */
		const initial =
			fromDom === 'light' || fromDom === 'dark'
				? fromDom
				: stored === 'light' || stored === 'dark'
					? stored
					: prefersDark
						? 'dark'
						: 'light';

		applyTheme(initial);
	});
</script>

<button type="button" class="theme-toggle" onclick={toggle} aria-label={label}>
	<Icon {icon} width="1.25em" height="1.25em" aria-hidden="true" />
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5em;
		margin: 0;
		border: none;
		background: transparent;
		color: rgb(var(--black));
		cursor: pointer;
		border-radius: 0.25em;
	}

	.theme-toggle:hover {
		color: var(--accent);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
