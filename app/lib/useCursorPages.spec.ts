import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCursorPages } from '~/lib/useCursorPages';

describe('useCursorPages', () => {
  it('should go forward with each cursor and back to the page before', () => {
    const { result } = renderHook(() => useCursorPages('desc'));

    act(() => {
      result.current.next('n2');
    });
    act(() => {
      result.current.next('n3');
    });

    expect(result.current).toMatchObject({ cursor: 'n3', index: 2 });

    act(() => {
      result.current.previous();
    });

    expect(result.current).toMatchObject({ cursor: 'n2', index: 1 });
  });

  it('should stay on the first page when asked for the one before it', () => {
    const { result } = renderHook(() => useCursorPages('desc'));

    act(() => {
      result.current.previous();
    });

    expect(result.current).toMatchObject({ cursor: undefined, index: 0 });
  });

  it('should start again from the first page with a new filter', () => {
    const { result } = renderHook(() => useCursorPages('desc'));

    act(() => {
      result.current.next('n2');
    });
    act(() => {
      result.current.filterBy('asc');
    });

    expect(result.current).toMatchObject({
      filter: 'asc',
      cursor: undefined,
      index: 0,
    });
  });
});
