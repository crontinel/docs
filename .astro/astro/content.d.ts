declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"cron-monitoring-for-laravel-developers.md": {
	id: "cron-monitoring-for-laravel-developers.md";
  slug: "cron-monitoring-for-laravel-developers";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"laravel-queue-monitoring-catch-failures.md": {
	id: "laravel-queue-monitoring-catch-failures.md";
  slug: "laravel-queue-monitoring-catch-failures";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
};
"docs": {
"alerts/channels.md": {
	id: "alerts/channels.md";
  slug: "alerts/channels";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"alerts/cli.md": {
	id: "alerts/cli.md";
  slug: "alerts/cli";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"faq.md": {
	id: "faq.md";
  slug: "faq";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"installation.md": {
	id: "installation.md";
  slug: "installation";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"introduction.md": {
	id: "introduction.md";
  slug: "introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"mcp/claude-code.md": {
	id: "mcp/claude-code.md";
  slug: "mcp/claude-code";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"mcp/overview.md": {
	id: "mcp/overview.md";
  slug: "mcp/overview";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"mcp/tools.md": {
	id: "mcp/tools.md";
  slug: "mcp/tools";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"monitors/cron.md": {
	id: "monitors/cron.md";
  slug: "monitors/cron";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"monitors/horizon.md": {
	id: "monitors/horizon.md";
  slug: "monitors/horizon";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"monitors/queues.md": {
	id: "monitors/queues.md";
  slug: "monitors/queues";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"quick-start.md": {
	id: "quick-start.md";
  slug: "quick-start";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"reference/api.md": {
	id: "reference/api.md";
  slug: "reference/api";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"reference/configuration.md": {
	id: "reference/configuration.md";
  slug: "reference/configuration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"security.md": {
	id: "security.md";
  slug: "security";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"self-hosting.md": {
	id: "self-hosting.md";
  slug: "self-hosting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"status-page.md": {
	id: "status-page.md";
  slug: "status-page";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"troubleshooting.md": {
	id: "troubleshooting.md";
  slug: "troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"upgrading.md": {
	id: "upgrading.md";
  slug: "upgrading";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
