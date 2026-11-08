import { useState } from 'react';

import { useCursorStack } from '~/lib/useCursorStack';

export function useCursorPages<Filter>(initialFilter: Filter) {
  const [filter, filterBy] = useState(initialFilter);
  const stack = useCursorStack(JSON.stringify(filter));

  return { ...stack, filter, filterBy };
}
