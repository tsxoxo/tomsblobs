// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
import { convertGermanToISODate } from '../utils'

// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        isDraft: z.boolean().default(false),
        title: z.coerce.string().trim().min(1).refine((value) => value !== "null", 'title shouldnt be empty')
        ,
        image: z.object({
            url: z.string(),
            alt: z.string()
        }).optional(),
        description: z.string().optional(),
        author: z.string().default('Tom'),
        tags: z.array(z.coerce.string()),
        footnote: z.string().optional(),
        pubDate: z.coerce.string().transform(convertGermanToISODate).pipe(z.date())
    })
});
// Export a single `collections` object to register your collection(s)
export const collections = {
    posts: postsCollection,
};