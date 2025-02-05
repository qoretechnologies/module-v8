import {
  IQoreAppActionWithFunction,
  QorusRequest,
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
} from '@qoretechnologies/ts-toolkit';
import { PiecesAppCatalogue } from '../pieces/piecesCatalogue';
import { validateResponseProperties } from './utils';

describe('DropboxPieceTest', () => {
  let dropboxApp: TQoreAppWithActions | null = null;
  let folder: { path_lower: string; id: string; name: string } | null = null;
  let uploadedFile: { path_lower: string; id: string } | null = null;
  let copiedFolder: { path_lower: string; id: string } | null = null;
  let createdTextFile: { path_lower: string; id: string } | null = null;

  const actionContext = {
    conn_name: 'dropbox',
    conn_opts: {
      token: '',
    },
    opts: {},
  } satisfies TQoreAppActionFunctionContext;

  beforeAll(async () => {
    const dropboxRefreshToken = process.env.DROPBOX_REFRESH_TOKEN;
    const dropboxClientId = process.env.DROPBOX_CLIENT_ID;
    const dropboxClientSecret = process.env.DROPBOX_CLIENT_SECRET;

    expect(dropboxRefreshToken).toBeDefined();
    expect(dropboxClientId).toBeDefined();
    expect(dropboxClientSecret).toBeDefined;

    const response = (await QorusRequest.post(
      {
        params: {
          refresh_token: dropboxRefreshToken!,
          client_id: dropboxClientId!,
          client_secret: dropboxClientSecret!,
          grant_type: 'refresh_token',
        },
        path: '/oauth2/token',
      },
      { url: 'https://api.dropboxapi.com', endpointId: 'dropbox' }
    )) as any;
    actionContext.conn_opts.token = response?.data?.access_token;
    PiecesAppCatalogue.registerApps();
    dropboxApp = PiecesAppCatalogue.apps['Dropbox'];
  });

  it('should register Dropbox app', () => {
    expect(dropboxApp).not.toBeDefined();
    expect(dropboxApp!.actions).toBeDefined();
    expect(dropboxApp!.actions.length).toBeGreaterThan(0);
  });

  it('should create new folder', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'create_new_dropbox_folder'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction) {
      try {
        const result = await actionFunction(
          { path: '/testing', autorename: true },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        folder = result.metadata;
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error getting users', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should create a text file', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'create_new_dropbox_text_file'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          {
            path: folder.path_lower + '/test.txt',
            text: 'testing file creation',
            mute: true,
            autorename: true,
          },
          {},
          actionContext
        );

        expect(result).toBeTruthy();
        createdTextFile = result;
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error creating file', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should upload a file', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'upload_dropbox_file'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction) {
      try {
        const result = await actionFunction(
          {
            path: '/testing',
            autorename: true,
            mute: true,
            file: 'data:text/plain;base64,SGVsbG8gV29ybGQh',
          },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        uploadedFile = result;
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error uploading file', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should get file link', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'get_dropbox_file_link'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        expect(uploadedFile?.path_lower).toBeDefined();
        const result = await actionFunction({ path: uploadedFile!.path_lower }, {}, actionContext);
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error getting file link', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should copy file', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'copy_dropbox_file'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          {
            from_path: uploadedFile?.path_lower,
            to_path: folder.path_lower + '/copied-test-file.txt',
            autorename: true,
          },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error copying file', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should copy folder', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'copy_dropbox_folder'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          {
            from_path: folder.path_lower,
            to_path: `/copied-test-folder`,
            autorename: true,
          },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        copiedFolder = result.metadata;
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error copying folder', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should move file', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'move_dropbox_file'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          {
            from_path: uploadedFile?.path_lower,
            to_path: folder.path_lower + '/moved-test-file.txt',
            autorename: true,
          },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error moving file', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should move folder', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'move_dropbox_folder'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;
    expect(copiedFolder).toBeDefined();
    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          {
            from_path: copiedFolder!.path_lower,
            to_path: `${folder.path_lower}/moved-test-folder`,
            autorename: true,
          },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error moving folder', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should delete file', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'delete_dropbox_file'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    expect(createdTextFile).toBeDefined();

    if (actionFunction && folder) {
      try {
        const result = await actionFunction(
          { path: createdTextFile!.path_lower },
          {},
          actionContext
        );
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error deleting file', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should list folder', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'list_dropbox_folder'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction({ path: folder.path_lower }, {}, actionContext);
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error listing folder', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should search', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'search_dropbox'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction({ query: folder.name }, {}, actionContext);
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error searching', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should delete folder', async () => {
    const action = dropboxApp!.actions.find(
      (action) => action.action === 'delete_dropbox_folder'
    ) as IQoreAppActionWithFunction;

    const actionFunction = action?.api_function;

    if (actionFunction && folder) {
      try {
        const result = await actionFunction({ path: folder.path_lower }, {}, actionContext);
        expect(result).toBeTruthy();
        const expectedResponseType = action.response_type;

        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error deleting folder', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });
});
