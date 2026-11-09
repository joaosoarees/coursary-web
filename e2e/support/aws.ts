import { execFileSync } from 'node:child_process';

export const region = 'sa-east-1';

export const service = 'coursary-api-dev';
export const table = `${service}-MainTable`;

// The CLI takes the credential from AWS_PROFILE, read from .env by playwright.config.ts.
export function aws(...args: string[]): unknown {
  const output = execFileSync(
    'aws',
    [...args, '--region', region, '--output', 'json'],
    // stderr goes into the thrown error: a resource already gone prints nothing.
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  return output.trim() ? JSON.parse(output) : undefined;
}

const resources = new Map<string, string>();

export function stackResource(logicalId: string): string {
  const known = resources.get(logicalId);

  if (known) {
    return known;
  }

  const found = aws(
    'cloudformation',
    'describe-stack-resource',
    '--stack-name',
    service,
    '--logical-resource-id',
    logicalId,
  ) as { StackResourceDetail: { PhysicalResourceId: string } } | undefined;

  if (!found) {
    throw new Error(`The stack ${service} has no ${logicalId}.`);
  }

  resources.set(logicalId, found.StackResourceDetail.PhysicalResourceId);

  return found.StackResourceDetail.PhysicalResourceId;
}
