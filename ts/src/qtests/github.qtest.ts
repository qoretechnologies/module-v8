import { IQoreAppActionWithWebhookBase } from '@qoretechnologies/ts-toolkit';
import { GITHUB_ACTIONS } from '../apps/github';
import * as GITHUB_TRIGGERS from '../apps/github/triggers';
import { delay } from '../global/helpers';

let connection: string;

describe('Tests Github Actions', () => {
  let repository: { name: string; owner: string };
  let issueNumber: number;
  let pullNumber: number;
  let sha: string;
  let fileSha: string;
  const token = process.env.GH_PAT;

  beforeAll(() => {
    connection = testApi.createConnection('github', {
      opts: {
        token,
      },
    });

    expect(connection).toBeDefined();
  });

  it('Should create a repository for user', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-create-for-authenticated-user');

    expect(action).toBeDefined();
    const repoName = `test-repo`;
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      body: {
        name: repoName,
        private: true,
      },
    });

    expect(body).toBeDefined();
    expect(body.name).toBe(repoName);
    repository = { name: body.name, owner: body.owner.login };
  });

  describe('Should test webhook creation for repository', () => {
    it('Should create new branch webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubBranch'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new commit comment webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubCommitComment'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new commit webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubCommit'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new issue webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubRepositoryIssue'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new pull request webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubPullRequest'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new release webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubRelease'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });

    it('Should create new review request webhook', async () => {
      const trigger = GITHUB_TRIGGERS['NewGitHubReviewRequest'] as IQoreAppActionWithWebhookBase;

      expect(trigger).toBeDefined();
      expect(trigger.webhook_register).toBeDefined();
      expect(trigger.webhook_deregister).toBeDefined();
      expect(repository?.name).toBeDefined();
      expect(repository?.owner).toBeDefined();

      const response = await trigger.webhook_register!(
        {
          conn_opts: { token },
          opts: { owner: repository.owner, repo: repository.name },
        },
        'https://webhook.site/'
      );

      expect(response).toBeDefined();

      if (response) {
        await trigger.webhook_deregister!(
          {
            conn_opts: { token },
            opts: { owner: repository.owner, repo: repository.name },
          },
          '',
          response
        );
      }
    });
  });

  it('Should list repositories for user', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-for-authenticated-user');

    expect(action).toBeDefined();

    const { body } = await testApi.execAppAction('github', action!.action, connection);

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should update a repository', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-update');

    expect(action).toBeDefined();
    expect(repository?.owner).toBeDefined();
    expect(repository?.name).toBeDefined();
    const description = 'Test Repo Description';
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      body: {
        description,
      },
    });

    expect(body).toBeDefined();
    expect(body.description).toBe(description);
  });

  it('Should get a repository', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-get');

    expect(action).toBeDefined();
    expect(repository?.owner).toBeDefined();
    expect(repository?.name).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
  });

  it('Should search for a repository', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'search-repos');

    expect(action).toBeDefined();
    expect(repository?.name).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      q: repository?.name,
      query: {
        q: repository?.name,
      },
    });

    expect(body).toBeDefined();
    expect(body.total_count).toBeGreaterThan(0);
    expect(body.items.length).toBeGreaterThan(0);
  });

  // it('Should create repository secret', async () => {
  //   const getPublicKeyAction = GITHUB_ACTIONS.find(
  //     (a) => a.action === 'actions-get-repo-public-key'
  //   );

  //   expect(getPublicKeyAction).toBeDefined();
  //   expect(repository).toBeDefined();
  //   const { body: publicKey } = await testApi.execAppAction(
  //     'github',
  //     getPublicKeyaction!.action,
  //     connection,
  //     {
  //       owner: repository?.owner,
  //       repo: repository?.name,
  //     }
  //   );

  //   expect(publicKey).toBeDefined();
  //   expect(publicKey.key).toBeDefined();

  //   const createSecretAction = GITHUB_ACTIONS.find(
  //     (a) => a.action === 'actions-create-or-update-repo-secret'
  //   );
  //   expect(createSecretAction).toBeDefined();

  //   await testApi.execAppAction('github', createSecretaction!.action, connection, {
  //     owner: repository?.owner,
  //     repo: repository?.name,
  //     secret_name: 'TESTING_SECRET',
  //     body: {
  //       encrypted_value: 'test',
  //       key_id: publicKey.key_id,
  //     },
  //   });
  // });

  // Contents
  it('Should create a file', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-create-or-update-file-contents');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      path: 'TEST.md',
      body: {
        message: 'Create TEST.md',
        content: Buffer.from('Hello World').toString('base64'),
      },
    });

    expect(body).toBeDefined();
    expect(body.content).toBeDefined();
    fileSha = body.content.sha;
  });

  it('Should get contents', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-get-content');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      path: 'TEST.md',
    });

    expect(body).toBeDefined();
    expect(body.content).toBeDefined();
  });

  // Releases
  it('Should create a release', async () => {
    const createReleaseAction = GITHUB_ACTIONS.find((a) => a.action === 'repos-create-release');

    expect(createReleaseAction).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction(
      'github',
      createReleaseAction!.action,
      connection,
      {
        owner: repository?.owner,
        repo: repository?.name,
        body: {
          tag_name: 'v1.0.0',
          name: 'v1.0.0',
          body: 'Release v1.0.0',
        },
      }
    );

    expect(body).toBeDefined();

    const listReleasesAction = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-releases');

    expect(listReleasesAction).toBeDefined();
    expect(repository).toBeDefined();
    const releases = await testApi.execAppAction('github', listReleasesAction!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });
    expect(releases).toBeDefined();
  });

  // Issues
  it('Should create an issue', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'issues-create');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      body: {
        title: 'Found a bug',
        body: "I'm having a problem with this.",
      },
    });

    expect(body).toBeDefined();
    issueNumber = body.number;
  });

  it('Should update an issue', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'issues-update');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const issueBody = "I'm having a problem with this. Edited";
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      issue_number: issueNumber,
      body: {
        title: 'Found a bug',
        body: issueBody,
      },
    });

    expect(body).toBeDefined();
    expect(body.number).toBe(issueNumber);
    expect(body.body).toBe(issueBody);
  });

  it('Should get an issue', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'issues-get');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      issue_number: issueNumber,
    });

    expect(body).toBeDefined();
    expect(body.number).toBe(issueNumber);
  });

  it('Should get all issues', () => {
    const { body } = testApi.execAppAction('github', 'issues-list', connection, {
      query: {
        filter: 'all',
      },
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should list repository issues', async () => {
    await delay(5000);
    const action = GITHUB_ACTIONS.find((a) => a.action === 'issues-list-for-repo');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const response = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    console.dir(response, { depth: null });

    expect(response).toBeDefined();
    // expect(body.length).toBe(1);
  });

  // Refs
  it('Should get the latest commit SHA', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-get-branch');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      branch: 'main',
    });

    expect(body).toBeDefined();
    sha = body.commit.sha;
  });

  it('Should create a ref', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'git-create-ref');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      body: {
        ref: 'refs/heads/test',
        sha,
      },
    });

    expect(body).toBeDefined();
  });

  // Pull Requests
  it('Should create a pull request', async () => {
    const createFileAction = GITHUB_ACTIONS.find(
      (a) => a.action === 'repos-create-or-update-file-contents'
    );

    expect(createFileAction).toBeDefined();

    const { body: updatedFileBody } = await testApi.execAppAction(
      'github',
      createFileAction!.action,
      connection,
      {
        owner: repository?.owner,
        repo: repository?.name,
        path: 'TEST.md',
        body: {
          branch: 'test',
          sha: fileSha,
          message: 'Update TEST.md',
          content: Buffer.from('Hello World Updated').toString('base64'),
        },
      }
    );

    expect(updatedFileBody).toBeDefined();

    const action = GITHUB_ACTIONS.find((a) => a.action === 'pulls-create');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      body: {
        title: 'New pull request',
        head: `${repository?.owner}:test`,
        base: 'main',
        body: 'This is a pull request for testing.',
      },
    });

    expect(body).toBeDefined();
    expect(body.title).toBe('New pull request');
    expect(body.number).toBeDefined();
    pullNumber = body.number;
  });

  it('Should list pull requests for repository', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'pulls-list');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should update a pull request', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'pulls-update');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const updatedTitle = 'Updated pull request title';
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      pull_number: pullNumber,
      body: {
        title: updatedTitle,
      },
    });

    expect(body).toBeDefined();
    expect(body.title).toBe(updatedTitle);
  });

  it('Should get a pull request', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'pulls-get');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
      pull_number: pullNumber,
    });

    expect(body).toBeDefined();
    expect(body.title).toBeDefined();
  });

  it('Should list repository branches', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-branches');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should list repository collaborators', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-collaborators');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should list repository commits', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-commits');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should list repository contributors', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-list-contributors');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const { body } = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(body).toBeDefined();
    expect(body.length).toBeGreaterThan(0);
  });

  it('Should delete a repository', async () => {
    const action = GITHUB_ACTIONS.find((a) => a.action === 'repos-delete');

    expect(action).toBeDefined();
    expect(repository).toBeDefined();
    const response = await testApi.execAppAction('github', action!.action, connection, {
      owner: repository?.owner,
      repo: repository?.name,
    });

    expect(response).toBeDefined();
  });
});
