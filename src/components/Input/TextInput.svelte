<script lang="ts">
	import type { TextInputComponentProps } from './types';

	const uid = $props.id();

	let {
		label = '',
		value = $bindable(''),
		placeholder = 'Enter text',
		disabled = false,
		error = '',
		ariaLabel,
		iconStart,
		iconEnd,
		secondaryActionText = '',
		variant = 'outlined',
		size = 'default',
		id,
		class: className,
		...rest
	}: TextInputComponentProps = $props();

	const inputId = $derived(id ?? `${uid}-text-input`);
	const hasError = $derived(Boolean(error));
	const showSecondaryAction = $derived(Boolean(secondaryActionText));
	const iconSize = $derived(size === 'small' ? '16px' : '24px');
</script>

<div class={`text-input ${className ?? ''}`}>
	{#if label}
		<label class="text-input__label" for={inputId}>{label}</label>
	{/if}

	<div
		class={`text-input__field text-input__field--${variant} text-input__field--${size}`}
		class:text-input__field--error={hasError}
		class:text-input__field--disabled={disabled}
	>
		{#if iconStart}
			<span class="text-input__icon text-input__icon--start">
				{@render iconStart({ width: iconSize, height: iconSize })}
			</span>
		{/if}

		<input
			{...rest}
			id={inputId}
			class="text-input__native"
			bind:value
			{placeholder}
			{disabled}
			aria-label={ariaLabel}
			aria-invalid={hasError}
		/>

		{#if showSecondaryAction}
			<span class="text-input__secondary-action">
				{secondaryActionText}
			</span>
		{/if}

		{#if iconEnd}
			<span class="text-input__icon text-input__icon--end">
				{@render iconEnd({ width: iconSize, height: iconSize })}
			</span>
		{/if}
	</div>

	{#if hasError}
		<p class="text-input__error">{error}</p>
	{/if}
</div>

<style>
	.text-input {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		width: 100%;
	}

	.text-input__label {
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-normal);
		color: var(--text-primary);
	}

	.text-input__field {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		border-radius: var(--radius-md);
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			background-color 0.2s;
	}

	.text-input__field--large {
		height: var(--size-7);
		padding: var(--size-3);
		gap: var(--size-3);
	}

	.text-input__field--default {
		height: 2.5rem;
		padding: var(--size-3);
		gap: var(--size-3);
	}

	.text-input__field--small {
		height: var(--size-6);
		padding: var(--size-3);
		gap: var(--size-3);
	}

	.text-input__field--outlined {
		border: 1px solid var(--border-subtle);
		background: var(--bg-base);
	}

	.text-input__field--outlined:hover:not(.text-input__field--disabled):not(
			.text-input__field--error
		),
	.text-input__field--outlined:focus-within:not(.text-input__field--disabled):not(
			.text-input__field--error
		) {
		border-color: var(--accent-primary);
		box-shadow:
			inset 0 0 0 1px var(--accent-primary),
			0 var(--size-1) var(--size-2) -2px rgba(0, 0, 0, 0.08),
			0 2px var(--size-1) -1px rgba(0, 0, 0, 0.04);
	}

	.text-input__field--error {
		border-color: var(--alert-error);
		box-shadow:
			inset 0 0 0 1px var(--alert-error),
			0 var(--size-1) var(--size-2) -2px rgba(0, 0, 0, 0.08),
			0 2px var(--size-1) -1px rgba(0, 0, 0, 0.04);
	}

	.text-input__field--disabled {
		border: 1px solid var(--border-subtle);
		background: var(--bg-surface);
		box-shadow: none;
		cursor: not-allowed;
	}

	.text-input__field--underlined {
		border: 0;
		border-bottom: 1px solid var(--border-subtle);
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		background: transparent;
	}

	.text-input__field--underlined:hover:not(.text-input__field--disabled):not(
			.text-input__field--error
		),
	.text-input__field--underlined:focus-within:not(.text-input__field--disabled):not(
			.text-input__field--error
		) {
		border-bottom-color: var(--accent-primary);
		box-shadow: inset 0 -1px 0 0 var(--accent-primary);
	}

	.text-input__field--underlined.text-input__field--error {
		border: 0;
		border-bottom: 1px solid var(--alert-error);
		box-shadow: inset 0 -1px 0 0 var(--alert-error);
	}

	.text-input__field--underlined.text-input__field--disabled {
		border: 0;
		border-bottom: 1px solid var(--border-subtle);
		box-shadow: none;
	}

	.text-input__field--tertiary {
		border: 1px solid var(--border-subtle);
		background: var(--bg-surface);
	}

	.text-input__field--tertiary:hover:not(.text-input__field--disabled):not(
			.text-input__field--error
		),
	.text-input__field--tertiary:focus-within:not(.text-input__field--disabled):not(
			.text-input__field--error
		) {
		border-color: var(--accent-primary);
		box-shadow:
			inset 0 0 0 1px var(--accent-primary),
			0 var(--size-1) var(--size-2) -2px rgba(0, 0, 0, 0.08),
			0 2px var(--size-1) -1px rgba(0, 0, 0, 0.04);
	}

	.text-input__field--tertiary.text-input__field--error {
		border-color: var(--alert-error);
		box-shadow:
			inset 0 0 0 1px var(--alert-error),
			0 var(--size-1) var(--size-2) -2px rgba(0, 0, 0, 0.08),
			0 2px var(--size-1) -1px rgba(0, 0, 0, 0.04);
	}

	.text-input__field--tertiary.text-input__field--disabled {
		border-color: var(--border-subtle);
		background: var(--bg-surface);
		box-shadow: none;
	}

	.text-input__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-muted);
	}

	.text-input__field--error .text-input__icon {
		color: var(--alert-error);
	}

	.text-input__field--disabled .text-input__icon {
		color: var(--text-muted);
		opacity: 0.6;
	}

	.text-input__native {
		flex: 1;
		min-width: 0;
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
		padding: 0;
		font-family: var(--font-sans);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-regular);
		line-height: var(--line-height-normal);
		color: var(--text-primary);
	}

	.text-input__field--small .text-input__native {
		font-size: var(--font-size-sm);
	}

	.text-input__native::placeholder {
		color: var(--text-muted);
	}

	.text-input__field--disabled .text-input__native,
	.text-input__field--disabled .text-input__native::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
	}

	.text-input__native:disabled {
		cursor: not-allowed;
	}

	.text-input__secondary-action {
		flex-shrink: 0;
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-normal);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.text-input__field--error .text-input__secondary-action {
		color: var(--alert-error);
	}

	.text-input__field--disabled .text-input__secondary-action {
		color: var(--text-muted);
		opacity: 0.6;
	}

	.text-input__error {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--font-size-base);
		line-height: var(--line-height-normal);
		color: var(--alert-error);
	}

	.text-input__field--small ~ .text-input__error {
		font-size: var(--font-size-sm);
	}
</style>
