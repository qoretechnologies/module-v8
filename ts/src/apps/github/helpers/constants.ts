export const GITHUB_ALLOWED_VALUES_TIMEOUT = 30_000;

export const createGitHubClient = async (token: string) => {
  const { Octokit } = await import('@octokit/rest');

  return new Octokit({
    auth: token,
  });
};
