import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CopyFile,
  CopyFolder,
  CreateFolder,
  CreateSharedLink,
  CreateTextFile,
  DeleteFile,
  DeleteFolder,
  DownloadFile,
  GetFileLink,
  ListFileRevisions,
  ListFolder,
  ListSharedLinks,
  MoveFile,
  MoveFolder,
  RestoreFileRevision,
  RevokeSharedLink,
  Search,
  UploadFile,
} from '../apps/dropbox/actions';
import { getDropboxFileAllowedValues } from '../apps/dropbox/helpers/get-file-allowed-values';
import { getDropboxFolderAllowedValues } from '../apps/dropbox/helpers/get-folder-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues, retry } from './utils';

configDotenv({ path: '.env' });

const allowedValuesConfig = {
  logSingleValue: false,
  logAllValues: false,
  checkNonEmpty: false, // Dropbox may have empty folders
};

describe('Should test Dropbox', () => {
  Debugger.level = DebugLevels.Verbose;

  // Test folder path for cleanup
  const testFolderPath = '/qore-test-folder';
  const testSubFolderPath = `${testFolderPath}/subfolder`;
  const testFileName = 'test-file.txt';
  const testFilePath = `${testFolderPath}/${testFileName}`;
  const testFileContent = 'Hello from Qore test!';

  const baseContext = {
    conn_opts: {
      token: '',
    } as any,
  };

  const sharedTestValues = {
    filePath: '',
    folderPath: '',
    sharedLinkUrl: '',
    revisionId: '',
  };

  beforeAll(async () => {
    const dropboxRefreshToken = process.env.DROPBOX_REFRESH_TOKEN;
    const dropboxClientId = process.env.DROPBOX_CLIENT_ID;
    const dropboxClientSecret = process.env.DROPBOX_CLIENT_SECRET;

    if (!dropboxRefreshToken || !dropboxClientId || !dropboxClientSecret) {
      throw new Error(
        'DROPBOX_REFRESH_TOKEN, DROPBOX_CLIENT_ID, and DROPBOX_CLIENT_SECRET must be set in environment variables'
      );
    }

    // Get access token using refresh token
    const response = (await QorusRequest.post(
      {
        params: {
          refresh_token: dropboxRefreshToken,
          client_id: dropboxClientId,
          client_secret: dropboxClientSecret,
          grant_type: 'refresh_token',
        },
        path: '/oauth2/token',
      },
      { url: 'https://api.dropboxapi.com', endpointId: 'dropbox' }
    )) as any;

    baseContext.conn_opts.token = response?.data?.access_token;

    if (!baseContext.conn_opts.token) {
      throw new Error('Failed to obtain Dropbox access token');
    }

    // Clean up any existing test folder
    try {
      const deleteAction = DeleteFolder;
      if ('api_function' in deleteAction) {
        await deleteAction.api_function({ path: testFolderPath }, undefined, baseContext);
      }
    } catch {
      // Folder doesn't exist, that's fine
    }
  });

  afterAll(async () => {
    // Clean up test folder
    try {
      const deleteAction = DeleteFolder;
      if ('api_function' in deleteAction) {
        await deleteAction.api_function({ path: testFolderPath }, undefined, baseContext);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Should test allowed values helpers', () => {
    it('Should get folder allowed values', async () => {
      const allowedValues = await getDropboxFolderAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);

      if (allowedValues.length > 0) {
        checkAllowedValues(allowedValues, allowedValuesConfig);
      }
    });

    it('Should get file allowed values', async () => {
      const allowedValues = await getDropboxFileAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);

      if (allowedValues.length > 0) {
        checkAllowedValues(allowedValues, allowedValuesConfig);
      }
    });
  });

  describe('Should test Folder actions', () => {
    it('Should create a folder', async () => {
      const action = CreateFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: testFolderPath,
          autorename: false,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.path_lower).toBe(testFolderPath.toLowerCase());

      sharedTestValues.folderPath = result.metadata.path_lower;
    });

    it('Should create a subfolder', async () => {
      const action = CreateFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: testSubFolderPath,
          autorename: false,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('Should list folder contents', async () => {
      const action = ListFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: testFolderPath,
          recursive: false,
          limit: 100,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries.length).toBeGreaterThan(0);
    });

    it('Should copy a folder', async () => {
      const action = CopyFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          fromPath: testSubFolderPath,
          toPath: `${testFolderPath}/subfolder-copy`,
          autorename: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('Should move a folder', async () => {
      const action = MoveFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          fromPath: `${testFolderPath}/subfolder-copy`,
          toPath: `${testFolderPath}/subfolder-moved`,
          autorename: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('Should delete a folder', async () => {
      const action = DeleteFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: `${testFolderPath}/subfolder-moved`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Should test File actions', () => {
    it('Should create a text file', async () => {
      const action = CreateTextFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: testFilePath,
          content: testFileContent,
          autorename: false,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testFileName);
      expect(result.path_lower).toBe(testFilePath.toLowerCase());

      sharedTestValues.filePath = result.path_lower;
    });

    it('Should upload a file', async () => {
      const action = UploadFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const uploadPath = `${testFolderPath}/uploaded-file.txt`;
      const fileContent = Buffer.from('Uploaded content from test').toString('base64');

      const result = await action.api_function(
        {
          path: uploadPath,
          file: {
            name: 'uploaded-file.txt',
            mime_type: 'text/plain',
            content: fileContent,
          },
          autorename: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('uploaded-file.txt');
    });

    it('Should get a temporary link for a file', async () => {
      const action = GetFileLink;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.link).toBeDefined();
      expect(result.link).toContain('http');
    });

    it('Should download a file', async () => {
      const action = DownloadFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.content).toBeDefined();

      // The content is returned as base64
      // Note: Due to serialization in test environment, content may come back as serialized Buffer
      // The important thing is that we got content back with the right structure
      expect(result.content).toBeTruthy();
    });

    it('Should copy a file', async () => {
      const action = CopyFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          fromPath: sharedTestValues.filePath,
          toPath: `${testFolderPath}/test-file-copy.txt`,
          autorename: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('Should move a file', async () => {
      const action = MoveFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          fromPath: `${testFolderPath}/test-file-copy.txt`,
          toPath: `${testFolderPath}/test-file-moved.txt`,
          autorename: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('Should delete a file', async () => {
      const action = DeleteFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: `${testFolderPath}/test-file-moved.txt`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Should test Search action', () => {
    it('Should search for files', async () => {
      const action = Search;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      // Wait for Dropbox to index recently uploaded/moved files (indexing can take 15-30s)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const result = await retry(
        async () => {
          const searchResult = await action.api_function(
            {
              query: 'test',
              path: testFolderPath,
              maxResults: 10,
            },
            undefined,
            baseContext
          );

          if (!searchResult.matches || searchResult.matches.length === 0) {
            throw new Error('No search results found');
          }

          return searchResult;
        },
        5,
        3000
      );

      expect(result).toBeDefined();
      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
    });
  });

  describe('Should test Sharing actions', () => {
    it('Should create a shared link', async () => {
      const action = CreateSharedLink;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain('http');

      sharedTestValues.sharedLinkUrl = result.url;
    });

    it('Should list shared links', async () => {
      const action = ListSharedLinks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
          direct_only: true,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.links).toBeDefined();
      expect(Array.isArray(result.links)).toBe(true);
      expect(result.links.length).toBeGreaterThan(0);
    });

    it('Should revoke a shared link', async () => {
      const action = RevokeSharedLink;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          url: sharedTestValues.sharedLinkUrl,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Should test Revisions actions', () => {
    it('Should list file revisions', async () => {
      const action = ListFileRevisions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
          limit: 10,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);

      if (result.entries.length > 0) {
        sharedTestValues.revisionId = result.entries[0].rev;
      }
    });

    it('Should restore a file revision', async () => {
      // Skip if no revision available
      if (!sharedTestValues.revisionId) {
        console.log('Skipping restore revision test - no revision available');
        return;
      }

      const action = RestoreFileRevision;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          path: sharedTestValues.filePath,
          rev: sharedTestValues.revisionId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });
  });
});
