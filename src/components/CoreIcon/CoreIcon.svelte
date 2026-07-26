<script module lang="ts">
	/** Trim optional icon strings for Iconify. */
	function trimIcon(value?: string | null): string {
		if (value == null) return '';
		return String(value).trim();
	}
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { CoreIconProps } from './types';

	let {
		icon,
		style: styleAttr = undefined,
		class: className = undefined,
		width = undefined,
		height = undefined
	}: CoreIconProps = $props();

	const resolvedIcon = $derived(trimIcon(icon));

	/** Unitless numeric strings (e.g. "24") become px so CSS is valid. */
	function toCssLength(value: string | number): string {
		if (typeof value === 'number') return `${value}px`;
		const s = String(value).trim();
		if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
		return value;
	}

	/**
	 * Reserve a fixed box (width/height + matching mins) so layout stays stable while Iconify loads the SVG.
	 * If only one dimension is set, the placeholder is square using that edge.
	 */
	const placeholderStyle = $derived.by(() => {
		const wRaw = width != null ? toCssLength(width) : null;
		const hRaw = height != null ? toCssLength(height) : null;
		const w = wRaw ?? hRaw ?? '1em';
		const h = hRaw ?? wRaw ?? '1em';
		const parts: string[] = [`width: ${w}`, `height: ${h}`, `min-width: ${w}`, `min-height: ${h}`];
		if (styleAttr) parts.push(styleAttr);
		return parts.join('; ');
	});
</script>

{#if resolvedIcon}
	<span class="core-icon {className ?? ''}" style={placeholderStyle} aria-hidden="true">
		<Icon icon={resolvedIcon} width="100%" height="100%" />
	</span>
{/if}

<style>
	.core-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		box-sizing: border-box;
		line-height: 0;
		vertical-align: middle;
		color: currentColor;
	}

	.core-icon :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
