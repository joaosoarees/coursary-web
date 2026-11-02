import { describe, expect, it } from 'vitest';

import { clientLoader } from '~/routes/home';

describe('the home route', () => {
  it('should send the reader to the catalog', () => {
    const response = clientLoader();

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/cursos');
  });
});
