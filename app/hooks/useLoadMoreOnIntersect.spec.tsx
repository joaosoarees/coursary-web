import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLoadMoreOnIntersect } from '~/hooks/useLoadMoreOnIntersect';

type Report = (entries: { isIntersecting: boolean }[], self: Stub) => void;

class Stub {
  static all: Stub[] = [];
  disconnected = false;

  constructor(readonly report: Report) {
    Stub.all.push(this);
  }

  observe() {
    return undefined;
  }

  disconnect() {
    this.disconnected = true;
  }

  enter() {
    this.report([{ isIntersecting: true }], this);
  }
}

beforeEach(() => {
  Stub.all = [];
  vi.stubGlobal('IntersectionObserver', Stub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function List(props: {
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}) {
  const sentinelRef = useLoadMoreOnIntersect(props);

  return <div ref={sentinelRef} />;
}

const live = () => Stub.all.filter((stub) => !stub.disconnected);

describe('useLoadMoreOnIntersect', () => {
  it('should load more once when the end comes into range', () => {
    const loadMore = vi.fn();
    render(<List loadMore={loadMore} hasMore isLoadingMore={false} />);

    act(() => {
      live().at(-1)?.enter();
    });

    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(live()).toHaveLength(0);
  });

  it('should watch nothing while loading or when there is no more', () => {
    const { rerender } = render(
      <List loadMore={vi.fn()} hasMore isLoadingMore />,
    );
    expect(live()).toHaveLength(0);

    rerender(<List loadMore={vi.fn()} hasMore={false} isLoadingMore={false} />);
    expect(live()).toHaveLength(0);
  });

  it('should watch again once a load has finished', () => {
    const { rerender } = render(
      <List loadMore={vi.fn()} hasMore isLoadingMore />,
    );

    rerender(<List loadMore={vi.fn()} hasMore isLoadingMore={false} />);

    expect(live()).toHaveLength(1);
  });
});
