import { parseArgs } from 'node:util';

import { loadEnv } from 'vite';
import { z } from 'zod';

import { envSchema } from '../app/lib/envSchema.ts';

const { values } = parseArgs({
  options: { mode: { type: 'string', default: 'production' } },
});

const result = envSchema.safeParse(loadEnv(values.mode, process.cwd(), ''));

if (!result.success) {
  console.error(
    `Environment variables for mode "${values.mode}" are invalid:\n${z.prettifyError(result.error)}`,
  );
  process.exit(1);
}

console.log(`Environment variables for mode "${values.mode}": ok`);
