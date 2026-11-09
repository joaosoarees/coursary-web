import { join } from 'node:path';

import type { FileChooser, Page } from '@playwright/test';

export const fixture = (name: string) =>
  join(import.meta.dirname, '..', 'fixtures', name);

// The pickers are hidden inputs that their button opens, as a person would.
export async function chooseFiles(
  page: Page,
  button: string,
  files: Parameters<FileChooser['setFiles']>[0],
) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: button }).click();
  await (await chooser).setFiles(files);
}
