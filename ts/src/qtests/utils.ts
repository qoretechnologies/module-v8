import type { Octokit } from '@octokit/rest';
import _sodium from 'libsodium-wrappers';

export const encryptGitHubSecret = (secret: string, publicKey: string): string => {
  const publicKeyBinary = Buffer.from(publicKey, 'base64');
  const encryptedMessage = _sodium.crypto_box_seal(Buffer.from(secret), publicKeyBinary);

  return Buffer.from(encryptedMessage).toString('base64');
};

/**
 * Creates an Octokit client for the test suites that refresh an OAuth token held as a GitHub Actions
 * secret.
 *
 * This is test infrastructure rather than application code: it lived in the GitHub app's helpers only
 * because that app happened to be where Octokit was already imported, and its only callers are the Canva
 * and Zendesk suites, which use it together with `encryptGitHubSecret` above. It moved here when the
 * GitHub app was removed in favour of the native Qore GitHubDataProvider module.
 */
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
