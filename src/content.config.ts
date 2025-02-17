import { glob } from 'astro/loaders';
import Parser from 'rss-parser';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const medium = defineCollection({
    loader: async () => {
        const parser = new Parser();
        const feed = await parser.parseURL('https://medium.com/feed/@juan.martin.ruiz');

        return feed.items.map((item) =>{ 
            // sanitized slug based on link or GUID
            const idSource = item.link || '';
            const urlObj = new URL(idSource);
            const pathSegments = urlObj.pathname.split('/');
            const lastSegment = pathSegments.pop() || '';

            // We remove the final hexadecimal part and generate the slug
            const slug = lastSegment.replace(/-[a-f0-9]+$/i, '');

            return  {
                id: slug,
                title: item.title,
                description: item.contentSnippet || item.content || '',
                pubDate: new Date(item?.pubDate || ''),
                updatedDate: new Date(item?.isoDate || ''),
                tags: item.categories || [],
                websiteUrl: item.link,
                author: {
                    name: feed.title || 'Unknown Author',
                },
                content: item['content:encoded'] || item.content || '',
                heroImage: (item['content:encoded'] || '').match(/<img[^>]*src="([^"]*)"/)?.[1] || null, // Extrae la URL de la imagen del contenido
            }
        });
    },
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()),
        websiteUrl: z.string(),
        content: z.string().optional(),
        heroImage: z.string().optional(),
    }),
});

export const collections = { blog, medium };
