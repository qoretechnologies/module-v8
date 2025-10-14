import { configDotenv } from 'dotenv';
import {
  CreateFirestoreDocument,
  DeleteFirestoreDocument,
  GetFirestoreCollection,
  ListFirestoreCollections,
  ListFirestoreDocuments,
  ListFirestoreProjects,
  UpdateFirestoreDocument,
} from '../apps/firestore/actions';
import {
  getFirestoreCollectionFieldAllowedValues,
  getFirestoreCollectionFieldOptions,
} from '../apps/firestore/helpers/get-collection-fields';
import { getFirestoreCollectionIdAllowedValues } from '../apps/firestore/helpers/get-collection-id-allowed-values';
import { getFirestoreCollectionPathAllowedValues } from '../apps/firestore/helpers/get-collection-path-allowed-values';
import { getFirestoreProjectIdAllowedValues } from '../apps/firestore/helpers/get-project-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getFirestoreDocumentIdAllowedValues } from '../apps/firestore/helpers/get-document-id-allowed-values';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Firestore', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  };

  beforeAll(async () => {
    const refreshToken = process.env.FIRESTORE_REFRESH_TOKEN;
    const clientId = process.env.FIRESTORE_CLIENT_ID;
    const clientSecret = process.env.FIRESTORE_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the FIRESTORE_REFRESH_TOKEN, FIRESTORE_CLIENT_ID, 
        and FIRESTORE_CLIENT_SECRET environment variables.
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

    baseContext.conn_opts.token = responseData.access_token;
  });

  describe('Should test allowed values', () => {
    let projectId: string | undefined;
    let collectionPath: string | undefined;

    it('Should get project allowed values', async () => {
      const allowedValues = await getFirestoreProjectIdAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();

      projectId = allowedValues[0].value;
    });

    it('Should get collection id allowed values', async () => {
      const allowedValues = await getFirestoreCollectionIdAllowedValues({
        ...baseContext,
        opts: {
          project_id: projectId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get collection path allowed values', async () => {
      const allowedValues = await getFirestoreCollectionPathAllowedValues({
        ...baseContext,
        opts: {
          project_id: projectId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();

      collectionPath = allowedValues[0].value;
    });

    it('Should get collection fields options', async () => {
      const options = await getFirestoreCollectionFieldOptions({
        ...baseContext,
        opts: {
          project_id: projectId,
          collection_path: collectionPath,
        },
      });

      expect(options).toBeDefined();
    });

    it('Should get collection fields allowed values', async () => {
      const allowedValues = await getFirestoreCollectionFieldAllowedValues({
        ...baseContext,
        opts: {
          project_id: projectId,
          collection_path: collectionPath,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get collection documents allowed values', async () => {
      const allowedValues = await getFirestoreDocumentIdAllowedValues({
        ...baseContext,
        opts: {
          project_id: projectId,
          collection_path: collectionPath,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let project: string | undefined;
    let collection: string | undefined;
    let createdDocumentId: string | undefined;

    it('Should list projects', async () => {
      const action = ListFirestoreProjects;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function(
        {
          name: 'qorus-testing',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.projects).toBeDefined();
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects[0].project_id).toBeDefined();
      project = result.projects[0].project_id;
    });

    it('Should list collections', async () => {
      const action = ListFirestoreCollections;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.count).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.collections).toBeDefined();
      expect(result.collections.length).toBeGreaterThan(0);
      expect(result.collections[0].collection_id).toBeDefined();

      collection = result.collections[0].path;
    });

    it('Should get a collection', async () => {
      const action = GetFirestoreCollection;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');
      if (!collection) throw new Error('No collection found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
          collection_id: collection,
          include_sample_documents: true,
          sample_limit: 2,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.collection_id).toBeDefined();
      expect(result.project_id).toBeDefined();
    });

    it('Should list documents', async () => {
      const action = ListFirestoreDocuments;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');
      if (!collection) throw new Error('No collection found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
          collection_path: collection,
          limit: 5,
          order_by: 'string',
          order_direction: 'DESCENDING',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.documents).toBeDefined();
      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.documents[0].document_id).toBeDefined();
    });

    it('Should create a document', async () => {
      const action = CreateFirestoreDocument;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');
      if (!collection) throw new Error('No collection found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
          collection_path: collection,
          data: {
            string: 'Test string',
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.document_id).toBeDefined();
      expect(result.path).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.string).toBe('Test string');

      createdDocumentId = result.document_id;
    });

    it('Should update a document', async () => {
      const action = UpdateFirestoreDocument;
      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');
      if (!collection) throw new Error('No collection found from previous test');
      if (!createdDocumentId) throw new Error('No document id found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
          collection_path: collection,
          document_id: createdDocumentId,
          data: {
            string: 'Updated test string',
            new_field: 123,
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.document_id).toBeDefined();
    });

    it('Should delete a document', async () => {
      const action = DeleteFirestoreDocument;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!project) throw new Error('No project found from previous test');
      if (!collection) throw new Error('No collection found from previous test');
      if (!createdDocumentId) throw new Error('No document id found from previous test');

      const result = await action.api_function(
        {
          project_id: project,
          collection_path: collection,
          document_id: createdDocumentId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });
  });
});
