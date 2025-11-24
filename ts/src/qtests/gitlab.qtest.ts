import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { GetGitlabProjectIdByUrl } from '../apps/gitlab/actions';
import { getGitlabBranchAllowedValues } from '../apps/gitlab/helpers/get-branch-allowed-values';
import { getGitlabCommitAllowedValues } from '../apps/gitlab/helpers/get-commit-allowed-values';
import { getGitlabDeployKeyAllowedValues } from '../apps/gitlab/helpers/get-deploy-key-allowed-values';
import { getGitlabGroupAllowedValues } from '../apps/gitlab/helpers/get-group-allowed-values';
import { getGitlabIssueIdAllowedValues } from '../apps/gitlab/helpers/get-issue-allowed-values';
import { getGitlabMergeRequestIdAllowedValues } from '../apps/gitlab/helpers/get-merge-request-allowed-values';
import { getGitlabMilestoneIdAllowedValues } from '../apps/gitlab/helpers/get-milestone-allowed-values';
import { getGitlabProjectAllowedValues } from '../apps/gitlab/helpers/get-project-allowed-values';
import { getGitlabTopicAllowedValues } from '../apps/gitlab/helpers/get-topic-allowed-values';
import { getGitlabUserAllowedValues } from '../apps/gitlab/helpers/get-user-allowed-values';
import { getGitlabProjectVariableKeyAllowedValues } from '../apps/gitlab/helpers/get-variable-key-allowed-values';
import { getGitlabProjectWikiSlugAllowedValues } from '../apps/gitlab/helpers/get-wiki-slug-allowed-values';

configDotenv({ path: '.env' });

const checkAllowedValues = (allowedValues: IQoreAllowedValue<any>[]) => {
  expect(allowedValues).toBeDefined();
  expect(allowedValues.length).toBeGreaterThan(0);
  expect(allowedValues[0]).toHaveProperty('display_name');
  expect(allowedValues[0]).toHaveProperty('value');
  expect(allowedValues[0].value).toBeDefined();
  expect(allowedValues[0].display_name).toBeDefined();
};

describe('GitLab', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      url: 'https://gitlab.com',
    },
  } as any;

  let connection: string;

  beforeAll(() => {
    const token = process.env.GITLAB_TOKEN;

    if (!token) {
      throw new Error(`Please set the GITLAB_TOKEN environment variable.`);
    }
    connection = testApi.createConnection('gitlab', {
      opts: {
        token,
        hostname: 'https://gitlab.com',
      },
    });

    baseContext.conn_opts.token = token;

    expect(connection).toBeDefined();
  });

  let project: number | undefined;
  let parentGroupId: number | undefined;

  describe('Should test allowed values', () => {
    it('Should get project allowed values', async () => {
      const allowedValues = await getGitlabProjectAllowedValues(baseContext);

      checkAllowedValues(allowedValues);
      project =
        allowedValues.find((allowedValue) => allowedValue.display_name === 'Qorus / Qorus Dev')
          ?.value || allowedValues[0].value;
    });

    it('Should get branch allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabBranchAllowedValues({
        ...baseContext,
        opts: {
          id: project!,
        },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get commit allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabCommitAllowedValues({
        ...baseContext,
        opts: {
          id: project!,
        },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get deploy key allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabDeployKeyAllowedValues({
        ...baseContext,
        opts: {
          id: project!,
        },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get group allowed values', async () => {
      const allowedValues = await getGitlabGroupAllowedValues(baseContext);

      checkAllowedValues(allowedValues);

      parentGroupId =
        allowedValues.find((allowedValue) => allowedValue.display_name === 'Qorus')?.value ||
        allowedValues[0].value;
    });

    it('Should get user allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabUserAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get issue allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabIssueIdAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get merge request allowed values', async () => {
      expect(project).toBeDefined();

      const result = await getGitlabMergeRequestIdAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(result);
    });

    it('Should get milestone allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabMilestoneIdAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get topic allowed values', async () => {
      const allowedValues = await getGitlabTopicAllowedValues(baseContext);

      checkAllowedValues(allowedValues);
    });

    it('Should get project variable key allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabProjectVariableKeyAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get project wiki slug allowed values', async () => {
      expect(project).toBeDefined();

      const allowedValues = await getGitlabProjectWikiSlugAllowedValues({
        ...baseContext,
        opts: { id: project! },
      });

      checkAllowedValues(allowedValues);
    });
  });

  describe('Should test actions', () => {
    describe('Should test additional actions', () => {
      it('Should get project ID by URL', async () => {
        const action = GetGitlabProjectIdByUrl;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const projectUrl = 'https://gitlab.com/gitlab-org/gitlab';
        const result = await action.api_function(
          { project_url: projectUrl },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('encoded_path_with_namespace');
      });
    });

    let createdGroup: number | undefined;
    let createdProject: number | undefined;
    let createdGroupVariable: string | undefined;
    let createdProjectVariable: string | undefined;
    let createdIssue: number | undefined;
    let createdMergeRequest: number | undefined;
    let createdBranch: string | undefined;
    let createdCommit: string | undefined;
    let createdProjectWiki: string | undefined;

    describe('Groups Management', () => {
      it('Should list groups', async () => {
        const { body } = await testApi.execAppAction('gitlab', 'getApiV4Groups', connection, {});

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should create a group', async () => {
        const { body } = await testApi.execAppAction('gitlab', 'postApiV4Groups', connection, {
          name: `Test Group ${Date.now()}`,
          path: `test-group-${Date.now()}`,
          parent_id: parentGroupId,
          visibility: 'private',
        });

        expect(body).toBeDefined();
        expect(body.id).toBeDefined();

        createdGroup = body.id;
      });

      it('Should get a specific group', async () => {
        expect(createdGroup).toBeDefined();

        const { body } = await testApi.execAppAction('gitlab', 'getApiV4GroupsId', connection, {
          id: createdGroup!,
        });

        expect(body).toBeDefined();
        expect(body.id).toBe(createdGroup);
      });

      it('Should update a group', async () => {
        expect(createdGroup).toBeDefined();

        const { body } = await testApi.execAppAction('gitlab', 'putApiV4GroupsId', connection, {
          id: createdGroup!,
          description: 'Updated test group description',
        });

        expect(body).toBeDefined();
        expect(body.description).toBe('Updated test group description');
      });
    });

    describe('Group Variables Management', () => {
      it('Should create a group variable', async () => {
        expect(createdGroup).toBeDefined();

        const variableKey = `TEST_VAR_${Date.now()}`;

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4GroupsIdVariables',
          connection,
          {
            id: createdGroup!,
            key: variableKey,
            value: 'test_value',
          }
        );

        expect(body).toBeDefined();
        expect(body.key).toBe(variableKey);

        createdGroupVariable = variableKey;
      });

      it('Should list group variables', async () => {
        expect(createdGroup).toBeDefined();

        const response = await testApi.execAppAction(
          'gitlab',
          'getApiV4GroupsIdVariables',
          connection,
          {
            id: createdGroup!,
          }
        );

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBeTruthy();
      });

      it('Should get a specific group variable', async () => {
        expect(createdGroup).toBeDefined();
        expect(createdGroupVariable).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4GroupsIdVariablesKey',
          connection,
          {
            id: createdGroup!,
            key: createdGroupVariable!,
          }
        );

        expect(body).toBeDefined();
        expect(body.key).toBe(createdGroupVariable);
      });

      it('Should update a group variable', async () => {
        expect(createdGroup).toBeDefined();
        expect(createdGroupVariable).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'putApiV4GroupsIdVariablesKey',
          connection,
          {
            id: createdGroup!,
            key: createdGroupVariable!,
            value: 'updated_value',
          }
        );

        expect(body).toBeDefined();
        expect(body.value).toBe('updated_value');
      });

      it('Should delete a group variable', async () => {
        expect(createdGroup).toBeDefined();
        expect(createdGroupVariable).toBeDefined();

        await testApi.execAppAction('gitlab', 'deleteApiV4GroupsIdVariablesKey', connection, {
          id: createdGroup!,
          key: createdGroupVariable!,
        });

        createdGroupVariable = undefined;
      });
    });

    describe('Projects Management', () => {
      it('Should list projects', async () => {
        const { body } = await testApi.execAppAction('gitlab', 'getApiV4Projects', connection, {});

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should create a project', async () => {
        expect(createdGroup).toBeDefined();

        const { body } = await testApi.execAppAction('gitlab', 'postApiV4Projects', connection, {
          name: `Test Project ${Date.now()}`,
          namespace_id: createdGroup,
          visibility: 'private',
          initialize_with_readme: true,
        });

        expect(body).toBeDefined();
        expect(body.id).toBeDefined();

        createdProject = body.id;
      });

      it('Should get a specific project', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction('gitlab', 'getApiV4ProjectsId', connection, {
          id: createdProject!,
        });

        expect(body).toBeDefined();
        expect(body.id).toBe(createdProject);
      });

      it('Should update a project', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction('gitlab', 'putApiV4ProjectsId', connection, {
          id: createdProject!,
          description: 'Updated test project description',
        });

        expect(body).toBeDefined();
        expect(body.description).toBe('Updated test project description');
      });

      it('Should list project users', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdUsers',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });

    describe('Project Variables Management', () => {
      it('Should create a project variable', async () => {
        expect(createdProject).toBeDefined();

        const variableKey = `TEST_VAR_${Date.now()}`;

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdVariables',
          connection,
          {
            id: createdProject!,
            key: variableKey,
            value: 'test_value',
          }
        );

        expect(body).toBeDefined();
        expect(body.key).toBe(variableKey);

        createdProjectVariable = variableKey;
      });

      it('Should list project variables', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdVariables',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should get a specific project variable', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectVariable).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdVariablesKey',
          connection,
          {
            id: createdProject!,
            key: createdProjectVariable!,
          }
        );

        expect(body).toBeDefined();
        expect(body.key).toBe(createdProjectVariable);
      });

      it('Should update a project variable', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectVariable).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'putApiV4ProjectsIdVariablesKey',
          connection,
          {
            id: createdProject!,
            key: createdProjectVariable!,
            value: 'updated_value',
          }
        );

        expect(body).toBeDefined();
        expect(body.value).toBe('updated_value');
      });

      it('Should delete a project variable', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectVariable).toBeDefined();

        await testApi.execAppAction('gitlab', 'deleteApiV4ProjectsIdVariablesKey', connection, {
          id: createdProject!,
          key: createdProjectVariable!,
        });

        createdProjectVariable = undefined;
      });
    });

    describe('Repository Branches Management', () => {
      it('Should list repository branches', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdRepositoryBranches',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should create a repository branch', async () => {
        expect(createdProject).toBeDefined();

        const branchName = `test-branch-${Date.now()}`;

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdRepositoryBranches',
          connection,
          {
            id: createdProject!,
            branch: branchName,
            ref: 'main',
          }
        );

        expect(body).toBeDefined();
        expect(body.name).toBe(branchName);

        createdBranch = branchName;
      });

      it('Should get a specific branch', async () => {
        expect(createdProject).toBeDefined();
        expect(createdBranch).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdRepositoryBranchesBranch',
          connection,
          {
            id: createdProject!,
            branch: createdBranch!,
          }
        );

        expect(body).toBeDefined();
        expect(body.name).toBe(createdBranch);
      });

      it('Should delete a branch', async () => {
        expect(createdProject).toBeDefined();
        expect(createdBranch).toBeDefined();

        await testApi.execAppAction(
          'gitlab',
          'deleteApiV4ProjectsIdRepositoryBranchesBranch',
          connection,
          {
            id: createdProject!,
            branch: createdBranch!,
          }
        );

        createdBranch = undefined;
      });
    });

    describe('Repository Commits Management', () => {
      it('Should create a new branch for commits', async () => {
        expect(createdProject).toBeDefined();

        const branchName = `commit-test-branch-${Date.now()}`;

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdRepositoryBranches',
          connection,
          {
            id: createdProject!,
            branch: branchName,
            ref: 'main',
          }
        );

        expect(body).toBeDefined();
        createdBranch = branchName;
      });

      it('Should list repository commits', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdRepositoryCommits',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should create a commit', async () => {
        expect(createdProject).toBeDefined();
        expect(createdBranch).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdRepositoryCommits',
          connection,
          {
            id: createdProject!,
            branch: createdBranch!,
            commit_message: 'Test commit',
            actions: [
              {
                action: 'create',
                file_path: `test-file-${Date.now()}.txt`,
                content: 'Test content',
                execute_filemode: false,
              },
            ],
          }
        );

        expect(body).toBeDefined();
        expect(body.id).toBeDefined();

        createdCommit = body.id;
      });

      it('Should get a specific commit', async () => {
        expect(createdProject).toBeDefined();
        expect(createdCommit).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdRepositoryCommitsSha',
          connection,
          {
            id: createdProject!,
            sha: createdCommit!,
          }
        );

        expect(body).toBeDefined();
        expect(body.id).toBe(createdCommit);
      });

      it('Should create a commit comment', async () => {
        expect(createdProject).toBeDefined();
        expect(createdCommit).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdRepositoryCommitsShaComments',
          connection,
          {
            id: createdProject!,
            sha: createdCommit!,
            note: 'Test comment on commit',
          }
        );

        expect(body).toBeDefined();
        expect(body.note).toBe('Test comment on commit');
      });

      it('Should list commit comments', async () => {
        expect(createdProject).toBeDefined();
        expect(createdCommit).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdRepositoryCommitsShaComments',
          connection,
          {
            id: createdProject!,
            sha: createdCommit!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });
    });

    describe('Issues Management', () => {
      it('Should list all issues', async () => {
        const { body } = await testApi.execAppAction('gitlab', 'getApiV4Issues', connection, {});

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should create an issue', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdIssues',
          connection,
          {
            id: createdProject!,
            title: `Test Issue ${Date.now()}`,
            description: 'Test issue description',
          }
        );

        expect(body).toBeDefined();
        expect(body.iid).toBeDefined();

        createdIssue = body.iid;
      });

      it('Should list project issues', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdIssues',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should get a specific issue', async () => {
        expect(createdProject).toBeDefined();
        expect(createdIssue).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdIssuesIssueIid',
          connection,
          {
            id: createdProject!,
            issue_iid: createdIssue!,
          }
        );

        expect(body).toBeDefined();
        expect(body.iid).toBe(createdIssue);
      });

      it('Should update an issue', async () => {
        expect(createdProject).toBeDefined();
        expect(createdIssue).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'putApiV4ProjectsIdIssuesIssueIid',
          connection,
          {
            id: createdProject!,
            issue_iid: createdIssue!,
            description: 'Updated test issue description',
          }
        );

        expect(body).toBeDefined();
        expect(body.description).toContain('Updated');
      });

      it('Should get issue time stats', async () => {
        expect(createdProject).toBeDefined();
        expect(createdIssue).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdIssuesIssueIidTimeStats',
          connection,
          {
            id: createdProject!,
            issue_iid: createdIssue!,
          }
        );

        expect(body).toBeDefined();
      });

      it('Should delete an issue', async () => {
        expect(createdProject).toBeDefined();
        expect(createdIssue).toBeDefined();

        await testApi.execAppAction('gitlab', 'deleteApiV4ProjectsIdIssuesIssueIid', connection, {
          id: createdProject!,
          issue_iid: createdIssue!,
        });

        createdIssue = undefined;
      });
    });

    describe('Merge Requests Management', () => {
      it('Should create a merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdBranch).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdMergeRequests',
          connection,
          {
            id: createdProject!,
            source_branch: createdBranch!,
            target_branch: 'main',
            title: `Test MR ${Date.now()}`,
          }
        );

        expect(body).toBeDefined();
        expect(body.iid).toBeDefined();

        createdMergeRequest = body.iid;
      });

      it('Should list project merge requests', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdMergeRequests',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should get a specific merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdMergeRequest).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdMergeRequestsMergeRequestIid',
          connection,
          {
            id: createdProject!,
            merge_request_iid: createdMergeRequest!,
          }
        );

        expect(body).toBeDefined();
        expect(body.iid).toBe(createdMergeRequest);
      });

      it('Should update a merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdMergeRequest).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'putApiV4ProjectsIdMergeRequestsMergeRequestIid',
          connection,
          {
            id: createdProject!,
            merge_request_iid: createdMergeRequest!,
            description: 'Updated MR description',
          }
        );

        expect(body).toBeDefined();
        expect(body.description).toBe('Updated MR description');
      });

      it('Should approve a merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdMergeRequest).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdMergeRequestsMergeRequestIidApprove',
          connection,
          {
            id: createdProject!,
            merge_request_iid: createdMergeRequest!,
          }
        );

        expect(body).toBeDefined();
      });

      it('Should unapprove a merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdMergeRequest).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdMergeRequestsMergeRequestIidUnapprove',
          connection,
          {
            id: createdProject!,
            merge_request_iid: createdMergeRequest!,
          }
        );

        expect(body).toBeDefined();
      });

      it('Should delete a merge request', async () => {
        expect(createdProject).toBeDefined();
        expect(createdMergeRequest).toBeDefined();

        await testApi.execAppAction(
          'gitlab',
          'deleteApiV4ProjectsIdMergeRequestsMergeRequestIid',
          connection,
          {
            id: createdProject!,
            merge_request_iid: createdMergeRequest!,
          }
        );

        createdMergeRequest = undefined;
      });
    });

    describe('Project Wikis Management', () => {
      it('Should create a project wiki', async () => {
        expect(createdProject).toBeDefined();

        const wikiTitle = `Test Wiki ${Date.now()}`;

        const { body } = await testApi.execAppAction(
          'gitlab',
          'postApiV4ProjectsIdWikis',
          connection,
          {
            id: createdProject!,
            title: wikiTitle,
            content: 'Test wiki content',
          }
        );

        expect(body).toBeDefined();
        expect(body.slug).toBeDefined();

        createdProjectWiki = body.slug;
      });

      it('Should list project wikis', async () => {
        expect(createdProject).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdWikis',
          connection,
          {
            id: createdProject!,
          }
        );

        expect(body).toBeDefined();
        expect(Array.isArray(body)).toBeTruthy();
      });

      it('Should get a specific project wiki', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectWiki).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'getApiV4ProjectsIdWikisSlug',
          connection,
          {
            id: createdProject!,
            slug: createdProjectWiki!,
          }
        );

        expect(body).toBeDefined();
        expect(body.slug).toBe(createdProjectWiki);
      });

      it('Should update a project wiki', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectWiki).toBeDefined();

        const { body } = await testApi.execAppAction(
          'gitlab',
          'putApiV4ProjectsIdWikisSlug',
          connection,
          {
            id: createdProject!,
            slug: createdProjectWiki!,
            content: 'Updated wiki content',
          }
        );

        expect(body).toBeDefined();
        expect(body.content).toContain('Updated');
      });

      it('Should delete a project wiki', async () => {
        expect(createdProject).toBeDefined();
        expect(createdProjectWiki).toBeDefined();

        await testApi.execAppAction('gitlab', 'deleteApiV4ProjectsIdWikisSlug', connection, {
          id: createdProject!,
          slug: createdProjectWiki!,
        });

        createdProjectWiki = undefined;
      });
    });

    describe('Cleanup', () => {
      it('Should delete merged branches', async () => {
        if (!createdProject) {
          throw new Error('Skipping - no project to clean up');
        }

        await testApi.execAppAction(
          'gitlab',
          'deleteApiV4ProjectsIdRepositoryMergedBranches',
          connection,
          {
            id: createdProject!,
          }
        );
      });

      it('Should delete the test project', async () => {
        if (!createdProject) {
          throw new Error('Skipping - no project to delete');
        }

        await testApi.execAppAction('gitlab', 'deleteApiV4ProjectsId', connection, {
          id: createdProject!,
        });

        createdProject = undefined;
      });

      it('Should delete the test group', async () => {
        if (!createdGroup) {
          throw new Error('Skipping - no group to delete');
        }

        await testApi.execAppAction('gitlab', 'deleteApiV4GroupsId', connection, {
          id: createdGroup!,
        });

        createdGroup = undefined;
      });
    });
  });
});
