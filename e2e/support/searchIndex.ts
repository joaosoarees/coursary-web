import { aws } from './aws';

const parameter = (name: string) => {
  const found = aws(
    'ssm',
    'get-parameter',
    '--with-decryption',
    '--name',
    `/coursary-api/dev/algolia/${name}`,
  ) as { Parameter: { Value: string } } | undefined;

  if (!found) {
    throw new Error(`The parameter ${name} is missing.`);
  }

  return found.Parameter.Value;
};

// Algolia keeps the answer to an exact query for minutes, even after the index changes: a search
// made before the course is indexed would keep finding nothing. So the record is awaited here,
// by its id, and the page searches once, after it.
export async function waitForIndex(courseId: string, timeout = 60_000) {
  const appId = parameter('app-id');
  const headers = {
    'x-algolia-application-id': appId,
    'x-algolia-api-key': parameter('search-key'),
  };
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const response = await fetch(
      `https://${appId}-dsn.algolia.net/1/indexes/dev_courses/${courseId}`,
      { headers },
    );

    if (response.ok) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`The course ${courseId} did not reach the search index.`);
}
