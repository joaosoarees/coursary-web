import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { OutlineService } from '~/services/OutlineService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 200) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

const calls = () =>
  adapter.mock.calls.map(([config]): unknown[] => {
    const data: unknown = config.data;

    return [config.method, config.url, data];
  });

describe('OutlineService', () => {
  it('should create, rename and delete a module', async () => {
    const module = { id: 'm1', title: 'Escolhendo', position: 0 };
    answer(module, 201);
    answer({ ...module, title: 'Escolhendo o gráfico' });
    answer(undefined, 204);

    await expect(
      OutlineService.createModule('c1', 'Escolhendo'),
    ).resolves.toEqual(module);
    await OutlineService.renameModule('c1', 'm1', 'Escolhendo o gráfico');
    await OutlineService.deleteModule('c1', 'm1');

    expect(calls()).toEqual([
      ['post', '/courses/c1/modules', JSON.stringify({ title: 'Escolhendo' })],
      [
        'patch',
        '/courses/c1/modules/m1',
        JSON.stringify({ title: 'Escolhendo o gráfico' }),
      ],
      ['delete', '/courses/c1/modules/m1', undefined],
    ]);
  });

  it('should create and delete a lesson in its module', async () => {
    const lesson = {
      id: 'l1',
      moduleId: 'm1',
      title: 'Barras ou linhas?',
      body: '',
      durationMinutes: 12,
      position: 0,
    };
    answer(lesson, 201);
    answer(undefined, 204);

    await expect(
      OutlineService.createLesson('c1', 'm1', {
        title: 'Barras ou linhas?',
        durationMinutes: 12,
      }),
    ).resolves.toMatchObject({ id: 'l1', moduleId: 'm1' });
    await OutlineService.deleteLesson('c1', 'm1', 'l1');

    expect(calls().map((call) => call.slice(0, 2))).toEqual([
      ['post', '/courses/c1/modules/m1/lessons'],
      ['delete', '/courses/c1/modules/m1/lessons/l1'],
    ]);
  });

  it('should send the whole order and read the outline back', async () => {
    const modules = [
      {
        id: 'm1',
        title: 'Escolhendo',
        position: 0,
        lessons: [
          { id: 'l2', title: 'B', durationMinutes: 5, position: 0 },
          { id: 'l1', title: 'A', durationMinutes: 5, position: 1 },
        ],
      },
    ];
    answer({ courseId: 'c1', modules });
    const order = { modules: [{ id: 'm1', lessonIds: ['l2', 'l1'] }] };

    await expect(OutlineService.reorder('c1', order)).resolves.toEqual(modules);
    expect(calls()).toEqual([
      ['put', '/courses/c1/outline', JSON.stringify(order)],
    ]);
  });
});
