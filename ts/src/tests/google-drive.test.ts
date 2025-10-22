import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';

import { configDotenv } from 'dotenv';
import {
  AddGoogleDriveFileSharingPreference,
  CopyGoogleDriveFile,
  CreateGoogleDriveFileFromText,
  CreateGoogleDriveFolder,
  CreateGoogleDriveShortcut,
  DeleteGoogleDriveFile,
  FindGoogleDriveFile,
  GetGoogleDriveFile,
  GetGoogleDriveFolder,
  ListGoogleDriveFiles,
  MoveGoogleDriveFile,
  ReplaceGoogleDriveFile,
  UploadGoogleDriveFile,
} from '../apps/google-drive/actions';
import { createGoogleDriveClient } from '../apps/google-drive/helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../apps/google-drive/helpers/get-file-id-allowed-values';
import { getGoogleDriveFolderIdAllowedValues } from '../apps/google-drive/helpers/get-folder-id-allowed-values';
import { getGoogleDriveUserDomainDefaultValue } from '../apps/google-drive/helpers/get-organization-domain-default-value';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Google Drive', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_INTEGRATIONS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_INTEGRATIONS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_INTEGRATIONS_REFRESH_TOKEN, GOOGLE_INTEGRATIONS_CLIENT_ID, 
        and GOOGLE_INTEGRATIONS_CLIENT_SECRET environment variables.
      `);
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

    const response = await fetch('https://oauth2.googleapis.com/token', {
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

    base_context.conn_opts.token = responseData.access_token;
  });

  let folder_id: string | undefined;
  let copied_file_id: string | undefined;
  let created_file_id: string | undefined;
  let created_folder_id: string | undefined;
  let created_shortcut_id: string | undefined;
  let uploaded_file_id: string | undefined;
  let found_file_id: string | undefined;

  describe('Should test google drive allowed values', () => {
    it('Should get file allowed values', async () => {
      const allowed_values = await getGoogleDriveFileIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get organization domain default value', async () => {
      const default_value = await getGoogleDriveUserDomainDefaultValue(base_context);
      expect(default_value).toBeDefined();
      expect(default_value).toBe('qoretechnologies.com');
    });

    it('Should get folder allowed values', async () => {
      const allowed_values = await getGoogleDriveFolderIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      folder_id = allowed_values.find(
        (folder) => folder.display_name === 'Qorus Test Folder'
      )?.value;
    });
  });

  describe('Should test google drive actions', () => {
    it('Should create a file from text', async () => {
      const action = CreateGoogleDriveFileFromText as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_name: 'test_file.txt',
          file_content: 'This is a test file',
          folder_id,
          convert_to_document: true,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_file_id = result.id;
    });

    it('Should copy a file to folder', async () => {
      const action = CopyGoogleDriveFile as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_id: created_file_id,
          folder_id,
          convert_to_document: true,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      copied_file_id = result.id;
    });

    it('Should add file sharing preference', async () => {
      const action = AddGoogleDriveFileSharingPreference as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_id: created_file_id,
          sharing_preference: 'org_link_view',
          organization_domain: 'qoretechnologies.com',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should delete a file', async () => {
      const action = DeleteGoogleDriveFile as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_id: copied_file_id,
          permanently_delete: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should create a folder', async () => {
      const action = CreateGoogleDriveFolder as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          folder_name: 'Child Test Folder',
          parent_folder_id: folder_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_folder_id = result.id;
    });

    it('Should create a shortcut', async () => {
      const action = CreateGoogleDriveShortcut as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_id: created_file_id,
          folder_id: created_folder_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_shortcut_id = result.id;
    });

    it('Should move a file', async () => {
      const action = MoveGoogleDriveFile as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_id: created_file_id,
          folder_id,
          keep_in_original_folders: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_file_id = result.id;
    });

    it('Should replace a file', async () => {
      const action = ReplaceGoogleDriveFile as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file_to_replace: created_file_id,
          file: {
            name: 'report.docx',
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            content: Buffer.from('Word doc content').toString('base64'),
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('report.docx');
    });

    it('Should search for files', async () => {
      const action = ListGoogleDriveFiles as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          filename: 'report.docx',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0].id).toBeDefined();
      expect(result.files[0].name).toBe('report.docx');
    });

    it('Should upload a file', async () => {
      const action = UploadGoogleDriveFile as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          file: {
            name: 'test_upload.txt',
            mime_type: 'text/plain',
            content: Buffer.from('This is a test upload').toString('base64'),
          },
          convert_to_document: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      uploaded_file_id = result.id;
    });

    it('Should find a file or create one', async () => {
      const action = FindGoogleDriveFile as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          folder: folder_id,
          filename: 'test_find_or_create.txt',
          file: {
            name: 'test_find_or_create.txt',
            mime_type: 'text/plain',
            content: Buffer.from('This is a test upload').toString('base64'),
          },
          create_if_not_exists: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.file).toBeDefined();
      expect(result.file.id).toBeDefined();

      found_file_id = result.file.id;
    });

    it('Should get a file by id', async () => {
      const action = GetGoogleDriveFile as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          file_id: found_file_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(found_file_id);
    });

    it('Should get a folder by id', async () => {
      const action = GetGoogleDriveFolder as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          folder_id: folder_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(folder_id);
    });
  });

  describe('Clean up', () => {
    beforeEach(async () => {
      await delay(1000);
    });

    it('Should delete created file', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: created_file_id,
      });
    });

    it('Should delete created shortcut', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: created_shortcut_id,
      });
    });

    it('Should delete uploaded file', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: uploaded_file_id,
      });
    });

    it('Should delete found file', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: found_file_id,
      });
    });

    it('Should delete created folder', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: created_folder_id,
      });
    });
  });
});
