import { configDotenv } from 'dotenv';
import {
  GetSentryProject,
  ListSentryProjectEvents,
  ListSentryProjectIssues,
  ListSentryProjects,
  ListSentryTeams,
} from '../apps/sentry/actions';
import { getSentryIssueAllowedValues } from '../apps/sentry/helpers/get-issue-allowed-values';
import { getSentryProjectAllowedValues } from '../apps/sentry/helpers/get-project-allowed-values';
import { getSentryTeamAllowedValues } from '../apps/sentry/helpers/get-team-allowed-values';
import { NewSentryOrganizationIssue } from '../apps/sentry/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Sentry', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      organization: 'qorus-dev',
    },
  };

  let projectId: string | undefined;
  beforeAll(() => {
    const token = process.env.SENTRY_TOKEN;

    if (!token) throw new Error('No SENTRY_TOKEN env variable found');

    baseContext.conn_opts.token = token;
  });

  describe('Should test allowed values', () => {
    it('Should get project allowed values', async () => {
      const allowedValues = await getSentryProjectAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();

      projectId = allowedValues[0].value;
    });

    it('Should get team allowed values', async () => {
      const allowedValues = await getSentryTeamAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get issue allowed values', async () => {
      if (!projectId) throw new Error('No projectId found from previous test');

      const allowedValues = await getSentryIssueAllowedValues({
        ...baseContext,
        opts: { projectId },
      });

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    it('Should list projects', async () => {
      const action = ListSentryProjects;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
    });

    it('Should get project', async () => {
      if (!projectId) throw new Error('No projectId found from previous test');

      const action = GetSentryProject;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          projectId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(projectId);
    });

    it('Should list project events', async () => {
      if (!projectId) throw new Error('No projectId found from previous test');

      const action = ListSentryProjectEvents;
      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          projectId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('Should list project issues', async () => {
      if (!projectId) throw new Error('No projectId found from previous test');

      const action = ListSentryProjectIssues;
      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          projectId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('Should list teams', async () => {
      const action = ListSentryTeams;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.teams)).toBe(true);
      expect(result.teams.length).toBeGreaterThan(0);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new organization issue trigger', async () => {
      const trigger = NewSentryOrganizationIssue;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
