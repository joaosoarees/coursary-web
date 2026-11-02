import { describe, expect, it } from 'vitest';

import { LocationState } from '~/auth/LocationState';

describe('LocationState.from', () => {
  it('should give back a path inside the app, query and hash included', () => {
    expect(LocationState.from({ from: '/cursos?pagina=2#topo' })).toBe(
      '/cursos?pagina=2#topo',
    );
  });

  it.each([
    '//evil.example/x',
    '/\\evil.example',
    'https://evil.example',
    '/\t/evil.example',
    '/ /evil.example',
    'cursos',
  ])('should refuse %j', (from) => {
    expect(LocationState.from({ from })).toBeUndefined();
  });

  it('should ignore state of any other shape', () => {
    expect(LocationState.from(null)).toBeUndefined();
    expect(LocationState.from('/cursos')).toBeUndefined();
    expect(LocationState.from({ from: 42 })).toBeUndefined();
  });
});

describe('LocationState.email', () => {
  it('should read the e-mail a page passed on', () => {
    expect(LocationState.email({ email: 'ana@exemplo.com' })).toBe(
      'ana@exemplo.com',
    );
  });

  it('should have none when it is missing or empty', () => {
    expect(LocationState.email(undefined)).toBeUndefined();
    expect(LocationState.email({ email: '' })).toBeUndefined();
    expect(LocationState.email({ email: 1 })).toBeUndefined();
  });
});
