import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

export type InputVariant = 'outlined' | 'underlined' | 'tertiary';
export type InputSize = 'large' | 'default' | 'small';

export interface TextInputProps {
	label?: string;
	variant?: InputVariant;
	size?: InputSize;
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	ariaLabel?: string;
	/** Leading Iconify icon id (e.g. `bx:search`, `material-symbols:search-rounded`). Whitespace-only hides the icon. */
	iconStart?: string;
	/** Trailing Iconify icon id. Whitespace-only hides the icon. */
	iconEnd?: string;
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
