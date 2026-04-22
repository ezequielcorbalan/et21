import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(50).max(160),
    category: z.enum(['Ingreso', 'Construcción', 'Tecnología', 'Nocturno', 'Vida escolar', 'Institucional']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string(),   // path under /images/... — not image() since we reference public/
    heroAlt: z.string(),
    readingMinutes: z.number().int().positive(),
    author: z.string().default('Equipo ET21'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
