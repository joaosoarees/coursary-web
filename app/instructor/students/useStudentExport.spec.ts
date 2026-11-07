import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  EXPORT_MESSAGES,
  useStudentExport,
} from '~/instructor/students/useStudentExport';
import { ExportService, type StudentExport } from '~/services/ExportService';
import { apiError } from '~/test/renderRoutes';

const pending: StudentExport = {
  id: 'e1',
  courseId: 'c1',
  status: 'PENDING',
  createdAt: '2026-11-07T12:00:00.000Z',
  rowCount: null,
};

const ready: StudentExport = {
  ...pending,
  status: 'READY',
  rowCount: 47,
  downloadUrl: 'https://bucket.example/exports/c1/e1.csv',
  expiresIn: 300,
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const startExport = () => {
  const hook = renderHook(() => useStudentExport('c1'));
  let started: Promise<void> | undefined;

  act(() => {
    started = hook.result.current.start();
  });

  return { hook, finish: () => act(() => started) };
};

describe('useStudentExport', () => {
  it('should prepare the CSV and offer it until its address expires', async () => {
    vi.spyOn(ExportService, 'request').mockResolvedValue(pending);
    vi.spyOn(ExportService, 'get')
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(ready);
    const { hook, finish } = startExport();

    expect(hook.result.current.phase).toEqual({ step: 'preparing' });

    await act(() => vi.advanceTimersByTimeAsync(4_000));
    await finish();

    expect(hook.result.current.phase).toMatchObject({
      step: 'ready',
      url: ready.downloadUrl,
      rowCount: 47,
      expiresIn: 300,
    });

    await act(() => vi.advanceTimersByTimeAsync(290_000));

    expect(hook.result.current.phase).toEqual({ step: 'idle' });
  });

  it('should say another CSV of the course is already on its way', async () => {
    vi.spyOn(ExportService, 'request').mockRejectedValue(
      apiError(409, 'EXPORT_PENDING'),
    );
    const { hook, finish } = startExport();
    await finish();

    expect(hook.result.current).toMatchObject({
      phase: { step: 'idle' },
      notice: EXPORT_MESSAGES.pending,
      problem: undefined,
    });
  });

  it('should say a CSV that failed', async () => {
    vi.spyOn(ExportService, 'request').mockResolvedValue(pending);
    vi.spyOn(ExportService, 'get').mockResolvedValue({
      ...pending,
      status: 'FAILED',
    });
    const { hook, finish } = startExport();

    await act(() => vi.advanceTimersByTimeAsync(2_000));
    await finish();

    expect(hook.result.current).toMatchObject({
      phase: { step: 'idle' },
      problem: EXPORT_MESSAGES.failed,
    });
  });

  it('should stop waiting after a minute and say it is still on its way', async () => {
    vi.spyOn(ExportService, 'request').mockResolvedValue(pending);
    vi.spyOn(ExportService, 'get').mockResolvedValue(pending);
    const { hook, finish } = startExport();

    await act(() => vi.advanceTimersByTimeAsync(60_000));
    await finish();

    expect(hook.result.current).toMatchObject({
      phase: { step: 'idle' },
      notice: EXPORT_MESSAGES.slow,
    });
  });

  it('should pick up its own export after it stopped waiting', async () => {
    const request = vi
      .spyOn(ExportService, 'request')
      .mockResolvedValue(pending);
    const get = vi.spyOn(ExportService, 'get').mockResolvedValue(pending);
    const { hook, finish } = startExport();

    await act(() => vi.advanceTimersByTimeAsync(60_000));
    await finish();
    get.mockResolvedValue(ready);

    await act(() => hook.result.current.start());

    expect(request).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenLastCalledWith('e1');
    expect(hook.result.current.phase).toMatchObject({ step: 'ready' });
  });

  it('should take a ready export without its address as failed', async () => {
    vi.spyOn(ExportService, 'request').mockResolvedValue(pending);
    vi.spyOn(ExportService, 'get').mockResolvedValue({
      ...ready,
      downloadUrl: undefined,
    });
    const { hook, finish } = startExport();

    await act(() => vi.advanceTimersByTimeAsync(2_000));
    await finish();

    expect(hook.result.current.problem).toBe(EXPORT_MESSAGES.failed);
  });
});
