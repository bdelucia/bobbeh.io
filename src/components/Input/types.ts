import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type InputVariant = 'outlined' | 'underlined' | 'tertiary';
export type InputSize = 'large' | 'default' | 'small';

export type InputIconSnippet = Snippet<[{ width: string; height: string }]>;

export interface TextInputProps {
	label?: string;
	variant?: InputVariant;
	size?: InputSize;
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	ariaLabel?: string;
	iconStart?: InputIconSnippet;
	iconEnd?: InputIconSnippet;
	/** Optional tiny inline content rendered near the trailing side. */
	secondaryActionText?: string;
}

export type TextInputComponentProps = TextInputProps & Omit<HTMLInputAttributes, 'value' | 'size'>;

export interface InputGroupProps {
	label?: string;
	variant?: InputVariant;
	size?: InputSize;
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	ariaLabel?: string;
	/** Leading segment options (e.g. currency codes). First item is shown by default. */
	prefixTextGroup?: string[];
	/** Iconify icon id for the prefix dropdown trigger (e.g. `bx:chevron-down`). Omit or pass whitespace-only to hide. */
	prefixIcon?: string;
}

export type InputGroupComponentProps = InputGroupProps &
	Omit<HTMLInputAttributes, 'value' | 'size'>;

export interface TextAreaProps {
	label?: string;
	variant?: InputVariant;
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	ariaLabel?: string;
}

export type TextAreaComponentProps = TextAreaProps & Omit<HTMLTextareaAttributes, 'value'>;
