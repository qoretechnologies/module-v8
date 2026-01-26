let connection: string;

import { getBitbucketCommitAllowedValues } from '../apps/bitbucket/helpers/get-commit-allowed-values';
import { getBitbucketPullRequestAllowedValues } from '../apps/bitbucket/helpers/get-pull-request-allowed-values';
import { getBitbucketPullRequestCommentAllowedValues } from '../apps/bitbucket/helpers/get-pull-request-comment-allowed-values';
import { getBitbucketRepositoryAllowedValues } from '../apps/bitbucket/helpers/get-repository-allowed-values';
import { getBitbucketWorkspaceIdAllowedValues } from '../apps/bitbucket/helpers/get-workspace-allowed-values';

describe('Tests Bitbucket Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.BITBUCKET_REFRESH_TOKEN;
    const clientId = process.env.BITBUCKET_CLIENT_ID;
    const clientSecret = process.env.BITBUCKET_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `BITBUCKET_REFRESH_TOKEN, BITBUCKET_CLIENT_ID, and BITBUCKET_CLIENT_SECRET environment variables.`
      );
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://bitbucket.org/site/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    connection = testApi.createConnection('bitbucket', {
      opts: {
        oauth2_grant_type: 'none',
        token: responseData.access_token,
      } as any,
    });

    base_context.conn_opts.token = responseData.access_token;
  });

  let workspaceId: string | undefined;
  let repositorySlug: string | undefined;
  let pullRequestId: string | undefined;
  describe('Should test Bitbucket allowed values', () => {
    it('Should get workspace allowed values', async () => {
      const allowed_values = await getBitbucketWorkspaceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      workspaceId = allowed_values[0].value;
    });

    it('Should get repository allowed values', async () => {
      const allowed_values = await getBitbucketRepositoryAllowedValues({
        ...base_context,
        opts: { workspace: workspaceId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      repositorySlug = allowed_values[0].value;
    });

    it('Should get commit allowed values', async () => {
      const allowed_values = await getBitbucketCommitAllowedValues({
        ...base_context,
        opts: { workspace: workspaceId, repo_slug: repositorySlug },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get pull request allowed values', async () => {
      const allowed_values = await getBitbucketPullRequestAllowedValues({
        ...base_context,
        opts: { workspace: workspaceId, repo_slug: repositorySlug },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      pullRequestId = allowed_values[0].value;
    });

    it('Should get pull request comments allowed values', async () => {
      const allowed_values = await getBitbucketPullRequestCommentAllowedValues({
        ...base_context,
        opts: { workspace: workspaceId, repo_slug: repositorySlug, pull_request_id: pullRequestId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Bitbucket actions', () => {
    let commit: string | undefined;
    let pullRequest: string | undefined;
    let pullRequestComment: string | undefined;
    let createdRepositorySlug: string | undefined;

    it('Should get repo commits', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commits_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
        }
      );

      expect(body).toBeDefined();
      expect(body.values).toBeDefined();
      expect(body.values.length).toBeGreaterThan(0);
      commit = body.values[0].hash;
    });

    it('Should get commit details', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commit_commit_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          commit,
        }
      );

      expect(body).toBeDefined();
      expect(body.hash).toBeDefined();
    });

    it('Should approve a commit', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commit_commit_approve_post',
        connection,
        {
          commit,
          workspace: workspaceId,
          repo_slug: repositorySlug,
        }
      );

      expect(body).toBeDefined();
      expect(body.approved).toBe(true);
    });

    it('Should remove commit approval', async () => {
      const response = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commit_commit_approve_delete',
        connection,
        {
          commit,
          workspace: workspaceId,
          repo_slug: repositorySlug,
        }
      );

      expect(response).toBeDefined();
    });

    it('Should add a commit comment', async () => {
      const commentText = 'This is a test commit comment';
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commit_commit_comments_post',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          commit,
          content: {
            raw: commentText,
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.content.raw).toBe(commentText);
    });

    it('Should get commit comments', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_commit_commit_comments_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          commit,
        }
      );

      expect(body).toBeDefined();
      expect(body.values).toBeDefined();
    });

    it('Should get repository pull requests', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
        }
      );

      expect(body).toBeDefined();
      expect(body.values).toBeDefined();
      expect(body.values.length).toBeGreaterThan(0);
      pullRequest = body.values[0].id;
    });

    it('Should get pull request details', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
    });

    it('Should add a pull request comment', async () => {
      const commentText = 'This is a test pull request comment';
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_comments_post',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
          content: {
            raw: commentText,
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.content.raw).toBe(commentText);
      pullRequestComment = body.id;
    });

    it('Should get pull request comments', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_comments_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
        }
      );

      expect(body).toBeDefined();
      expect(body.values).toBeDefined();
    });

    it('Should get pull request comment details', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_comments_comment_id_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
          comment_id: pullRequestComment,
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
    });

    it('Should update a pull request comment', async () => {
      const updatedCommentText = 'This is an updated test pull request comment';
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_comments_comment_id_put',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
          comment_id: pullRequestComment,
          content: {
            raw: updatedCommentText,
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.content.raw).toBe(updatedCommentText);
    });

    it('Should delete a pull request comment', async () => {
      const response = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_pullrequests_pull_request_id_comments_comment_id_delete',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
          pull_request_id: pullRequest,
          comment_id: pullRequestComment,
        }
      );

      expect(response).toBeDefined();
    });

    it('Should get repositories', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_get',
        connection,
        {
          workspace: workspaceId,
        }
      );

      expect(body).toBeDefined();
      expect(body.values).toBeDefined();
      expect(body.values.length).toBeGreaterThan(0);
    });

    it('Should get repository details', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_get',
        connection,
        {
          workspace: workspaceId,
          repo_slug: repositorySlug,
        }
      );

      expect(body).toBeDefined();
      expect(body.slug).toBe(repositorySlug);
    });

    it('Should create a new repository', async () => {
      const { body } = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_post',
        connection,
        {
          workspace: workspaceId,
          repo_slug: 'new-repo',
          name: 'New Repository',
          is_private: true,
        }
      );

      expect(body).toBeDefined();
      expect(body.slug).toBe('new-repo');
      createdRepositorySlug = body.slug;
    });

    it('Should delete the created repository', async () => {
      if (!createdRepositorySlug) {
        throw new Error('No repository slug to delete');
      }

      const response = await testApi.execAppAction(
        'bitbucket',
        'repositories_workspace_repo_slug_delete',
        connection,
        {
          workspace: workspaceId,
          repo_slug: createdRepositorySlug,
        }
      );

      expect(response).toBeDefined();
    });
  });
});
