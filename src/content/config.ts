// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        isDraft: z.boolean(),
        title: z.string(),
        image: z.object({
            url: z.string(),
            alt: z.string()
        }).optional(),
        description: z.string().optional(),
        author: z.string().default('Tom'),
        tags: z.array(z.string()),
        footnote: z.string().optional(),
        pubDate: z.date()
    })
});
// Export a single `collections` object to register your collection(s)
export const collections = {
    posts: postsCollection,
};