<script lang="ts">
	import IconSearch from '~icons/material-symbols/search-rounded';
	import TextInput from './Input/TextInput.svelte';

	interface Props {
		gridId?: string;
	}

	let { gridId = 'article-list-grid' }: Props = $props();

	let searchQuery = $state('');

	function applyFilters() {
		const grid = document.getElementById(gridId);
		if (!grid) return;

		const query = searchQuery.trim().toLowerCase();

		grid.querySelectorAll<HTMLElement>('[data-article-item]').forEach((item) => {
			const title = item.dataset.articleTitle?.toLowerCase() ?? '';
			item.hidden = Boolean(query) && !title.includes(query);
		});
	}

	$effect(() => {
		searchQuery;
		applyFilters();
	});

	$effect(() => {
		const handlePageLoad = () => applyFilters();
		document.addEventListener('astro:page-load', handlePageLoad);
		return () => document.removeEventListener('astro:page-load', handlePageLoad);
	});
</script>

<div class="articles-toolbar">
	<TextInput
		bind:value={searchQuery}
		placeholder="Search articles..."
		ariaLabel="Search articles"
	>
		{#snippet iconStart({ width, height })}
			<IconSearch {width} {height} aria-hidden="true" />
		{/snippet}
	</TextInput>
</div>

<style>
	.articles-toolbar {
		margin-bottom: var(--size-6);
	}
</style>
