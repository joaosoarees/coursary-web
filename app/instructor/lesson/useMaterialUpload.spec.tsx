import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMaterialUpload } from '~/instructor/lesson/useMaterialUpload';
import { lessonQuery } from '~/queries/lesson';
import type { Attachment, LessonContent } from '~/services/LessonService';
import { LessonService } from '~/services/LessonService';
import { MaterialService } from '~/services/MaterialService';
import { S3Upload } from '~/services/S3Upload';
import { apiError } from '~/test/renderRoutes';

const kept: Attachment = {
  id: 'f1',
  name: 'a.pdf',
  contentType: 'application/pdf',
  size: 10,
};
const moved: Attachment = { ...kept, id: 'f2', name: 'b.pdf' };
const added: Attachment = { ...kept, id: 'f3', name: 'guia.pdf' };
const shown: LessonContent = {
  lessonId: 'l1',
  courseId: 'c1',
  body: '',
  attachments: [moved, kept],
};
const key = lessonQuery('c1', 'l1').queryKey;
const pdf = new File(['x'], 'guia.pdf');

let queryClient: QueryClient;

const renderUpload = () =>
  renderHook(() => useMaterialUpload('c1', 'l1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

beforeEach(() => {
  vi.useFakeTimers();
  queryClient = new QueryClient();
  queryClient.setQueryData(key, shown);
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:file'),
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(S3Upload, 'post').mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useMaterialUpload', () => {
  it('should wait until the lesson lists the file and add only that file', async () => {
    vi.spyOn(MaterialService, 'requestUpload').mockResolvedValue({
      fileId: 'f3',
      url: 'https://bucket.test/',
      fields: {},
    });
    vi.spyOn(LessonService, 'open')
      .mockResolvedValueOnce({ ...shown, attachments: [kept, moved] })
      .mockResolvedValueOnce({ ...shown, attachments: [kept, moved, added] });
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(pdf);
      await vi.advanceTimersByTimeAsync(4_000);
      await done;
    });

    expect(result.current.name).toBe('guia.pdf');
    expect(result.current.problem).toBeUndefined();
    expect(
      queryClient
        .getQueryData<LessonContent>(key)
        ?.attachments.map((file) => file.id),
    ).toEqual(['f2', 'f1', 'f3']);
  });

  it('should say the lesson is full when the API refuses a 21st file', async () => {
    vi.spyOn(MaterialService, 'requestUpload').mockRejectedValue(
      apiError(409, 'ATTACHMENT_LIMIT'),
    );
    const { result } = renderUpload();

    await act(async () => {
      await result.current.upload(pdf);
    });

    expect(result.current.problem).toBe(
      'A aula já tem 20 arquivos. Apague um para enviar outro.',
    );
  });
});
