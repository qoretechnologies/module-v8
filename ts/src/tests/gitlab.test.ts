import { configDotenv } from 'dotenv';
import { getGitlabProjectAllowedValues } from '../apps/gitlab/helpers/get-project-allowed-values';
import { getGitlabBranchAllowedValues } from '../apps/gitlab/helpers/get-branch-allowed-values';
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { getGitlabCommitAllowedValues } from '../apps/gitlab/helpers/get-commit-allowed-values';
import { getGitlabDeployKeyAllowedValues } from '../apps/gitlab/helpers/get-deploy-key-allowed-values';
import { getGitlabGroupAllowedValues } from '../apps/gitlab/helpers/get-group-allowed-values';
import { getGitlabUserAllowedValues } from '../apps/gitlab/helpers/get-user-allowed-values';
import { getGitlabIssueIdAllowedValues } from '../apps/gitlab/helpers/get-issue-allowed-values';
import { getGitlabMergeRequestIdAllowedValues } from '../apps/gitlab/helpers/get-merge-request-allowed-values';
import { getGitlabMilestoneIdAllowedValues } from '../apps/gitlab/helpers/get-milestone-allowed-values';
import { getGitlabTopicAllowedValues } from '../apps/gitlab/helpers/get-topic-allowed-values';
import { GetGitlabProjectIdByUrl } from '../apps/gitlab/actions';
import { getGitlabProjectVariableKeyAllowedValues } from '../apps/gitlab/helpers/get-variable-key-allowed-values';
import { getGitlabProjectWikiSlugAllowedValues } from '../apps/gitlab/helpers/get-wiki-slug-allowed-values';
import { createSwaggerPaths } from '../global/helpers';
import { GITLAB_ALLOWED_PATHS } from '../apps/gitlab/allowed-paths';

configDotenv({ path: '.env' });

describe('GitLab', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      url: 'https://gitlab.com',
    },
  } as any;

  beforeAll(() => {
    const token = process.env.GITLAB_TOKEN;

    if (!token) {
      throw new Error(`Please set the GITLAB_TOKEN environment variable.`);
    }

    baseContext.conn_opts.token = token;
  });

  let project: number | undefined;

  project = 29465968;

  describe('Should test allowed values', () => {
    it('Should get allowed paths', () => {
      const allowedPaths = createSwaggerPaths(GITLAB_ALLOWED_PATHS);

      console.dir(allowedPaths, { depth: null });
    });
    it('Should get project allowed values', async () => {
      const allowedValues = await getGitlabProjectAllowedValues(baseContext);

      checkAllowedValues(allowedValues);

      project = allowedValues[0].value;
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
    it('Should get project ID by URL', async () => {
      const action = GetGitlabProjectIdByUrl;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('Action api_function is not defined');

      const projectUrl = 'https://gitlab.com/gitlab-org/gitlab';
      const result = await action.api_function({ project_url: projectUrl }, undefined, baseContext);

      console.dir(result, { depth: null });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('encoded_path_with_namespace');
    });
  });
});

const checkAllowedValues = (allowedValues: IQoreAllowedValue<any>[]) => {
  console.dir(allowedValues, { depth: null });
  expect(allowedValues).toBeDefined();
  expect(allowedValues.length).toBeGreaterThan(0);
  expect(allowedValues[0]).toHaveProperty('display_name');
  expect(allowedValues[0]).toHaveProperty('value');
  expect(allowedValues[0].value).toBeDefined();
  expect(allowedValues[0].display_name).toBeDefined();
};
