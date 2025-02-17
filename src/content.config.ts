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
            // slug sanitizado basado en el link o GUID
            const idSource = item.guid || item.link || '';
            const sanitizedId = idSource
                .replace(/https?:\/\//, '') // Elimina el "http://" o "https://"
                .replace(/\//g, '-') // Reemplaza "/" con "-"
                .replace(/[^a-zA-Z0-9\-]/g, ''); // Elimina caracteres no válidos
            return  {
                id: sanitizedId,
                title: item.title,
                description: item.contentSnippet || item.content || '',
                pubDate: new Date(item?.pubDate || ''),
                updatedDate: new Date(item?.isoDate || ''),
                tags: item.categories || [],
                websiteUrl: item.link,
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
