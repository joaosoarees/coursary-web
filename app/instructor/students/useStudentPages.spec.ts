import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStudentPages } from '~/instructor/students/useStudentPages';

describe('useStudentPages', () => {
  it('should start on the first page, newest first', () => {
    const { result } = renderHook(() => useStudentPages());

    expect(result.current).toMatchObject({
      order: 'desc',
      cursor: undefined,
      index: 0,
    });
  });

  it('should go forward with each cursor and back to the one before', () => {
    const { result } = renderHook(() => useStudentPages());

    act(() => {
      result.current.next('n1');
    });
    act(() => {
      result.current.next('n2');
    });
    expect(result.current).toMatchObject({ cursor: 'n2', index: 2 });

    act(() => {
      result.current.previous();
    });
    expect(result.current).toMatchObject({ cursor: 'n1', index: 1 });
  });

  it('should stay on the first page when going back from it', () => {
    const { result } = renderHook(() => useStudentPages());

    act(() => {
      result.current.previous();
    });

    expect(result.current).toMatchObject({ cursor: undefined, index: 0 });
  });

  it('should return to the first page when the order changes', () => {
    const { result } = renderHook(() => useStudentPages());

    act(() => {
      result.current.next('n1');
    });
    act(() => {
      result.current.sortBy('asc');
    });

    expect(result.current).toMatchObject({
      order: 'asc',
      cursor: undefined,
      index: 0,
    });
  });
});
