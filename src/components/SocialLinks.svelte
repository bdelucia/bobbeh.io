<script>
	import IconTwitterX from '~icons/bxl/twitter-x';
	import IconLinkedin from '~icons/bxl/linkedin-square';
	import IconGithub from '~icons/bxl/github';
	import { SOCIAL_LINKS } from '../consts';

	const icons = {
		x: IconTwitterX,
		linkedin: IconLinkedin,
		github: IconGithub,
	};
</script>

<div class="social-links">
	{#each SOCIAL_LINKS as { href, label, platform } (platform)}
		{@const Icon = icons[platform]}
		<a {href} target="_blank" rel="noopener noreferrer">
			<span class="sr-only">{label}</span>
			<Icon width="32" height="32" aria-hidden="true" />
		</a>
	{/each}
</div>

<style>
	.social-links {
		display: flex;
		justify-content: center;
		gap: var(--size-4, 1rem);
	}
	.social-links a {
		text-decoration: none;
		color: var(--text-muted, #55545f);
	}
	.social-links a:hover {
		color: var(--accent-primary, #00ffff);
	}
</style>
