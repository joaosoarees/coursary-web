import { describe, expect, it } from 'vitest';

import { checkMaterial } from '~/instructor/lesson/materialRules';

const file = (name: string, size = 10) =>
  Object.defineProperty(new File(['x'], name), 'size', { value: size });

describe('checkMaterial', () => {
  it('should take the type from the extension', async () => {
    await expect(checkMaterial(file('Guia.PDF'))).resolves.toEqual({
      type: 'application/pdf',
    });
    await expect(checkMaterial(file('notas.md'))).resolves.toEqual({
      type: 'text/markdown',
    });
  });

  it('should refuse another type and a file over 50 MB', async () => {
    await expect(checkMaterial(file('foto.png'))).resolves.toMatchObject({
      problem: expect.stringContaining('não entra no material') as string,
    });
    await expect(
      checkMaterial(file('grande.zip', 50 * 1024 * 1024 + 1)),
    ).resolves.toEqual({ problem: 'Escolha um arquivo de até 50 MB.' });
  });
});
