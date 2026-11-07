import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';

const studentExportSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  status: z.enum(['PENDING', 'READY', 'FAILED']),
  createdAt: z.string(),
  rowCount: z.number().nullable(),
  downloadUrl: z.url().optional(),
  expiresIn: z.number().optional(),
});

export type StudentExport = z.infer<typeof studentExportSchema>;

export class ExportService {
  static async request(courseId: string): Promise<StudentExport> {
    const { data } = await httpClient.post<unknown>(
      `${courseUrl(courseId)}/exports`,
    );

    return studentExportSchema.parse(data);
  }

  static async get(exportId: string): Promise<StudentExport> {
    const { data } = await httpClient.get<unknown>(
      `/exports/${encodeURIComponent(exportId)}`,
    );

    return studentExportSchema.parse(data);
  }
}
