import { configDotenv } from 'dotenv';
import {
  CreateFigmaComment,
  ListFigmaComments,
  ListFigmaFileVersionHistory,
  ListFigmaProjectFiles,
  ListFigmaProjects,
} from '../apps/figma/actions';
import { getFigmaProjectAllowedValues } from '../apps/figma/helpers/get-project-allowed-values';
import { getFigmaProjectFilesAllowedValues } from '../apps/figma/helpers/get-project-files-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Figma', () => {
  const team = '1536880832699212833';

  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.FIGMA_REFRESH_TOKEN;
    const clientId = process.env.FIGMA_CLIENT_ID;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the FIGMA_REFRESH_TOKEN, FIGMA_CLIENT_ID, 
        and FIGMA_CLIENT_SECRET environment variables.
      `);
    }

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const data = {
      redirect_uri: 'https://api.qoretechnologies.com/qorus-oauth2-redirect',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://api.figma.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
      body: formBody,
    });

    const responseData = await response.json();

    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let project: string | undefined;
  let file: string | undefined;
  describe('Should test allowed values', () => {
    it('Should get project allowed values', async () => {
      const allowed_values = await getFigmaProjectAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      project = allowed_values[0].value;
    });

    it('Should get project files allowed values', async () => {
      if (!project) throw new Error('Project is not defined');

      const allowed_values = await getFigmaProjectFilesAllowedValues({
        opts: { project },
        ...base_context,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      file = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list projects', async () => {
      const action = ListFigmaProjects;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          team,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list project files', async () => {
      const action = ListFigmaProjectFiles;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          project,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list file version history', async () => {
      const action = ListFigmaFileVersionHistory;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          key: file,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.versions.length).toBeGreaterThan(0);
    });

    it('Should create a comment', async () => {
      const action = CreateFigmaComment;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          key: file,
          message: 'This is a test comment',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list file comments', async () => {
      const action = ListFigmaComments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          key: file,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
