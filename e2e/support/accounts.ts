import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

import { aws, region, service, stackResource, table } from './aws';
import { type Account, SITE_URL } from './run';

type Key = Record<'PK' | 'SK', { S: string }>;
type Items = { Items?: Record<string, { S: string }>[] } | undefined;

export const apiUrl = () => {
  const url = process.env.VITE_API_URL;

  if (!url) {
    throw new Error('VITE_API_URL is missing from .env.');
  }

  return url;
};

async function call<T>(
  method: string,
  path: string,
  { token, body }: { token?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      // The API refuses a sign-in from an origin other than the site's.
      origin: SITE_URL,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${method} ${path} answered ${String(response.status)}.`);
  }

  return (await response.json()) as T;
}

export async function createAccount(name: string): Promise<Account> {
  const email = `success+e2e-web-${randomBytes(6).toString('hex')}@simulator.amazonses.com`;
  const password = `E2e${randomBytes(9).toString('hex')}1`;
  const { accountId } = await call<{ accountId: string }>(
    'POST',
    '/auth/sign-up',
    { body: { name, email, password } },
  );

  aws(
    'cognito-idp',
    'admin-confirm-sign-up',
    '--user-pool-id',
    stackResource('UserPool'),
    '--username',
    email,
  );
  // The confirmation route needs the code sent by e-mail; this writes what it
  // writes: the account ACTIVE and both items without expiresAt.
  aws(
    'dynamodb',
    'update-item',
    '--table-name',
    table,
    '--key',
    JSON.stringify(key(`ACCOUNT#${accountId}`)),
    '--update-expression',
    'SET #status = :active REMOVE expiresAt',
    '--expression-attribute-names',
    JSON.stringify({ '#status': 'status' }),
    '--expression-attribute-values',
    JSON.stringify({ ':active': { S: 'ACTIVE' } }),
  );
  aws(
    'dynamodb',
    'update-item',
    '--table-name',
    table,
    '--key',
    JSON.stringify(key(`EMAIL_CLAIM#${email}`)),
    '--update-expression',
    'REMOVE expiresAt',
  );

  return { name, email, password, accountId };
}

export function promoteToAdmin(account: Account) {
  aws(
    'lambda',
    'invoke',
    '--function-name',
    `${service}-promoteAdmin`,
    '--cli-binary-format',
    'raw-in-base64-out',
    '--payload',
    JSON.stringify({ email: account.email }),
    '/dev/null',
  );
}

export async function makeInstructor(admin: Account, account: Account) {
  const { accessToken } = await call<{ accessToken: string }>(
    'POST',
    '/auth/sign-in',
    { body: { email: admin.email, password: admin.password } },
  );

  await call('PUT', `/admin/users/${account.accountId}/role`, {
    token: accessToken,
    body: { role: 'instructor' },
  });
}

const key = (pk: string, sk = pk): Key => ({ PK: { S: pk }, SK: { S: sk } });

const partition = (pk: string, ...projection: string[]) =>
  (
    aws(
      'dynamodb',
      'query',
      '--table-name',
      table,
      '--key-condition-expression',
      'PK = :pk',
      '--expression-attribute-values',
      JSON.stringify({ ':pk': { S: pk } }),
      '--projection-expression',
      ['PK', 'SK', ...projection].join(', '),
      ...(projection.length > 0
        ? ['--expression-attribute-names', JSON.stringify({ '#type': 'type' })]
        : []),
    ) as Items
  )?.Items ?? [];

const keyOf = (item: Record<string, { S: string }>): Key =>
  key(item.PK?.S ?? '', item.SK?.S ?? '');

// Tolerates what is already gone: it also cleans up after a setup that stopped halfway.
export function deleteAccount({ email, accountId }: Account) {
  try {
    aws(
      'cognito-idp',
      'admin-delete-user',
      '--user-pool-id',
      stackResource('UserPool'),
      '--username',
      email,
    );
  } catch {
    // Already gone.
  }

  const courseIds = (
    (
      aws(
        'dynamodb',
        'query',
        '--table-name',
        table,
        '--index-name',
        'GSI1',
        '--key-condition-expression',
        'GSI1PK = :pk',
        '--expression-attribute-values',
        JSON.stringify({ ':pk': { S: `INSTRUCTOR#${accountId}` } }),
        '--projection-expression',
        'PK',
      ) as Items
    )?.Items ?? []
  ).map((course) => (course.PK?.S ?? '').slice('COURSE#'.length));
  const courseItems = courseIds.flatMap((id) =>
    partition(`COURSE#${id}`, '#type', 'id'),
  );
  const lessonIds = courseItems
    .filter((item) => item.type?.S === 'Lesson')
    .map((item) => item.id?.S ?? '');
  const keys = [
    ...partition(`ACCOUNT#${accountId}`).map(keyOf),
    ...partition(`INBOX#${accountId}`).map(keyOf),
    ...courseItems.map(keyOf),
    ...lessonIds.flatMap((id) => partition(`LESSON#${id}`).map(keyOf)),
    key(`EMAIL_CLAIM#${email}`),
  ];

  for (const itemKey of keys) {
    aws(
      'dynamodb',
      'delete-item',
      '--table-name',
      table,
      '--key',
      JSON.stringify(itemKey),
    );
  }

  const prefixes = [
    `account/${accountId}/`,
    ...lessonIds.map((id) => `lesson/${id}/`),
    ...courseIds.flatMap((id) => [`course/${id}/`, `exports/${id}/`]),
  ];

  for (const bucket of [
    stackResource('PrivateFilesBucket'),
    stackResource('PublicAssetsBucket'),
  ]) {
    for (const prefix of prefixes) {
      execFileSync(
        'aws',
        [
          's3',
          'rm',
          `s3://${bucket}/${prefix}`,
          '--recursive',
          '--region',
          region,
        ],
        { stdio: 'ignore' },
      );
    }
  }
}
