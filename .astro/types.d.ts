declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
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
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"posts": {
"24.md": {
	id: "24.md";
  slug: "reset";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"25.md": {
	id: "25.md";
  slug: "tentative-post-exploring-a-change-of-direction";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"26-30.md": {
	id: "26-30.md";
  slug: "strategy-avoid";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"31.md": {
	id: "31.md";
  slug: "public-mastication";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"32.md": {
	id: "32.md";
  slug: "officially-scheduled";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"33.md": {
	id: "33.md";
  slug: "33";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"34.md": {
	id: "34.md";
  slug: "hollowed-out";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"35.md": {
	id: "35.md";
  slug: "me-vs-mood";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 1.md": {
	id: "Day 1.md";
  slug: "day-1";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 11.md": {
	id: "Day 11.md";
  slug: "the-merry-go-round-of-doubt";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 12.md": {
	id: "Day 12.md";
  slug: "day-12";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 13.md": {
	id: "Day 13.md";
  slug: "design-first-think-later";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 15.md": {
	id: "Day 15.md";
  slug: "running-behind-in-small-steps";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 16.md": {
	id: "Day 16.md";
  slug: "the-cv-shuffle";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 17.md": {
	id: "Day 17.md";
  slug: "no-love-for-chores";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 18.md": {
	id: "Day 18.md";
  slug: "day-18";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 19.md": {
	id: "Day 19.md";
  slug: "day-19";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 2.md": {
	id: "Day 2.md";
  slug: "day-2";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 20.md": {
	id: "Day 20.md";
  slug: "day-20";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 21.md": {
	id: "Day 21.md";
  slug: "accruements";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 22.md": {
	id: "Day 22.md";
  slug: "meandering";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 23.md": {
	id: "Day 23.md";
  slug: "day-23";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 3.md": {
	id: "Day 3.md";
  slug: "day-3";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 4.md": {
	id: "Day 4.md";
  slug: "tiny-important-steps";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 5.md": {
	id: "Day 5.md";
  slug: "long-day";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 6.md": {
	id: "Day 6.md";
  slug: "blur";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 7.md": {
	id: "Day 7.md";
  slug: "before-the-almost";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 8.md": {
	id: "Day 8.md";
  slug: "fun-times-with-ux-and-capitalism";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"Day 9.md": {
	id: "Day 9.md";
  slug: "honest-cvs";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"a-pretty-bleak-view.md": {
	id: "a-pretty-bleak-view.md";
  slug: "a-pretty-bleak-view";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"before-a-meal.md": {
	id: "before-a-meal.md";
  slug: "before-a-meal";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"before-a-trip.md": {
	id: "before-a-trip.md";
  slug: "before-a-trip-prayer";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/Day 20-copy - frontend frustration.md": {
	id: "drafts/Day 20-copy - frontend frustration.md";
  slug: "Frontend-frustration";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/Lost.md": {
	id: "drafts/Lost.md";
  slug: "lost";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/a-longing.md": {
	id: "drafts/a-longing.md";
  slug: "a-longing";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/dearth and abundance.md": {
	id: "drafts/dearth and abundance.md";
  slug: "dearth";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/rap-strange-smell-swiss-clock.md": {
	id: "drafts/rap-strange-smell-swiss-clock.md";
  slug: "a-longing";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/the ant and the grasshoper.md": {
	id: "drafts/the ant and the grasshoper.md";
  slug: "ant";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"drafts/unrest.md": {
	id: "drafts/unrest.md";
  slug: "lost";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"hardening.md": {
	id: "hardening.md";
  slug: "hardening";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"very-mature.md": {
	id: "very-mature.md";
  slug: "very-mature";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"words-unsaid-at-10pm.md": {
	id: "words-unsaid-at-10pm.md";
  slug: "words-unsaid-at-10pm";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = never;
}
