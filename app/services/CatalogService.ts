import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const catalogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  instructorName: z.string(),
  lessonCount: z.number(),
  enrollmentCount: z.number(),
  ratingCount: z.number(),
  ratingAverage: z.number().nullable(),
  publishedAt: z.string(),
  coverUrl: z.record(z.string(), z.string()).optional(),
});

const catalogPageSchema = z.object({
  items: z.array(catalogItemSchema),
  nextCursor: z.string().nullable(),
});

const searchPageSchema = z.object({
  items: z.array(catalogItemSchema),
  page: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CatalogPage = z.infer<typeof catalogPageSchema>;
export type SearchPage = z.infer<typeof searchPageSchema>;

export interface SearchInput {
  query: string;
  page: number;
  perPage: number;
}

export class CatalogService {
  static async list(
    { cursor, limit }: { cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<CatalogPage> {
    const { data } = await httpClient.get<unknown>('/courses', {
      params: { cursor, limit },
      signal,
    });

    return catalogPageSchema.parse(data);
  }

  static async search(
    { query, page, perPage }: SearchInput,
    signal?: AbortSignal,
  ): Promise<SearchPage> {
    const { data } = await httpClient.get<unknown>('/search', {
      params: { q: query, page, perPage },
      signal,
    });

    return searchPageSchema.parse(data);
  }
}
