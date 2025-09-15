import type { Octokit } from '@octokit/rest';

export const GITHUB_ALLOWED_VALUES_TIMEOUT = 30_000;

export const createGitHubClient = async (token: string): Promise<Octokit> => {
  const isJestEnvironment =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || typeof (global as any).__coverage__ !== 'undefined');

  if (isJestEnvironment) {
    const importOctokit = new Function('return import("@octokit/rest")') as () => Promise<
      typeof import('@octokit/rest')
    >;
    const { Octokit } = await importOctokit();
    return new Octokit({ auth: token });
  } else {
    const { Octokit } = await import('@octokit/rest');
    return new Octokit({ auth: token });
  }
};
