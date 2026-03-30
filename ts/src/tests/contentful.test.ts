import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { ContentfulError } from '../apps/contentful/constants';
import { getContentfulSpaceAllowedValues } from '../apps/contentful/helpers/get-space-allowed-values';
import { getContentfulEnvironmentAllowedValues } from '../apps/contentful/helpers/get-environment-allowed-values';
import { getContentfulContentTypeAllowedValues } from '../apps/contentful/helpers/get-content-type-allowed-values';
import { getContentfulEntryAllowedValues } from '../apps/contentful/helpers/get-entry-allowed-values';
import { getContentfulFieldAllowedValues } from '../apps/contentful/helpers/get-field-allowed-values';
import { getContentfulAssetAllowedValues } from '../apps/contentful/helpers/get-asset-allowed-values';
import GetEntry from '../apps/contentful/actions/entries/get-entry.action';
import GetEntryWithReplacement from '../apps/contentful/actions/entries/get-entry-with-replacement.action';
import CreateEntry from '../apps/contentful/actions/entries/create-entry.action';
import UpdateEntry from '../apps/contentful/actions/entries/update-entry.action';
import DeleteEntry from '../apps/contentful/actions/entries/delete-entry.action';
import PublishEntry from '../apps/contentful/actions/entries/publish-entry.action';
import UnpublishEntry from '../apps/contentful/actions/entries/unpublish-entry.action';
import ArchiveEntry from '../apps/contentful/actions/entries/archive-entry.action';
import SearchEntries from '../apps/contentful/actions/entries/search-entries.action';
import GetAsset from '../apps/contentful/actions/assets/get-asset.action';
import CreateAsset from '../apps/contentful/actions/assets/create-asset.action';
import UpdateAsset from '../apps/contentful/actions/assets/update-asset.action';
import DeleteAsset from '../apps/contentful/actions/assets/delete-asset.action';
import PublishAsset from '../apps/contentful/actions/assets/publish-asset.action';
import UnpublishAsset from '../apps/contentful/actions/assets/unpublish-asset.action';
import ArchiveAsset from '../apps/contentful/actions/assets/archive-asset.action';
import SearchAssets from '../apps/contentful/actions/assets/search-assets.action';
import GetContentType from '../apps/contentful/actions/content-types/get-content-type.action';
import CreateContentType from '../apps/contentful/actions/content-types/create-content-type.action';
import UpdateContentType from '../apps/contentful/actions/content-types/update-content-type.action';
import DeleteContentType from '../apps/contentful/actions/content-types/delete-content-type.action';
import ActivateContentType from '../apps/contentful/actions/content-types/activate-content-type.action';
import DeactivateContentType from '../apps/contentful/actions/content-types/deactivate-content-type.action';
import AddField from '../apps/contentful/actions/content-types/add-field.action';
import UpdateField from '../apps/contentful/actions/content-types/update-field.action';
import DeleteField from '../apps/contentful/actions/content-types/delete-field.action';
import SearchContentTypes from '../apps/contentful/actions/content-types/search-content-types.action';
import WatchEvent from '../apps/contentful/triggers/watch-event.trigger';
import { getContentfulEntryFieldOptions, getContentfulEntryDynamicResponseType } from '../apps/contentful/helpers/get-dynamic-entry-type';
import { getContentfulScopedClient } from '../apps/contentful/client';
import { CONTENTFUL_API_URL } from '../apps/contentful/constants';
import { delay } from '../global/helpers';
import { checkAllowedValues, skipOnTransientError } from './utils';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

/**
 * Safely call api_function on an action, narrowing the type via `in` check.
 */
const callAction = async (
  action: Record<string, unknown>,
  opts: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  if (!('api_function' in action) || typeof action.api_function !== 'function') {
    throw new Error('api_function not found in action');
  }
  return action.api_function(opts, undefined, context);
};

describe('Should test Contentful actions', () => {
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const hasCredentials = !!(accessToken);

  const baseContext = {
    conn_opts: {
      token: accessToken || '',
    } as Record<string, unknown>,
  };

  const baseOpts = {
    space_id: spaceId || '',
    environment_id: 'master',
  };

  let testContentTypeId: string | undefined;

  // ==================== Ping URL Test ====================
  describe('Should test Contentful ping URL', () => {
    it('Should successfully ping the Contentful API', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const response = await fetch(`${CONTENTFUL_API_URL}/spaces`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    }));

    it('Should fail to ping with invalid credentials', async () => {
      const response = await fetch(`${CONTENTFUL_API_URL}/spaces`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  // ==================== Allowed Values Tests ====================
  describe('Should test Contentful allowed values', () => {
    afterEach(async () => {
      await delay(500);
    });

    it('Should return space allowed values', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const allowedValues = await getContentfulSpaceAllowedValues(baseContext);
      checkAllowedValues(allowedValues, { checkNonEmpty: true });
      if(!baseOpts.space_id && spaceId) {
        expect(allowedValues.some(av => av.value === spaceId)).toBe(true);
        baseOpts.space_id = spaceId;
      }
    }));

    it('Should return empty space allowed values when connection options are missing', async () => {
      const allowedValues = await getContentfulSpaceAllowedValues({});
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return environment allowed values', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const allowedValues = await getContentfulEnvironmentAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    }));

    it('Should return empty environment allowed values when space_id is missing', async () => {
      const allowedValues = await getContentfulEnvironmentAllowedValues(baseContext);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return content type allowed values', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const allowedValues = await getContentfulContentTypeAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: true });
      testContentTypeId = allowedValues[0]?.value as string;
    }));

    it('Should return empty content type allowed values when space_id is missing', async () => {
      const allowedValues = await getContentfulContentTypeAllowedValues(baseContext);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return entry allowed values', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const allowedValues = await getContentfulEntryAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId, content_type_id: testContentTypeId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    }));

    it('Should return empty entry allowed values when space_id is missing', async () => {
      const allowedValues = await getContentfulEntryAllowedValues(baseContext);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return field allowed values', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const allowedValues = await getContentfulFieldAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId, content_type_id: testContentTypeId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    }));

    it('Should return empty field allowed values when content_type_id is missing', async () => {
      const allowedValues = await getContentfulFieldAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return asset allowed values', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const allowedValues = await getContentfulAssetAllowedValues({
        ...baseContext,
        opts: { space_id: spaceId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    }));

    it('Should return empty asset allowed values when space_id is missing', async () => {
      const allowedValues = await getContentfulAssetAllowedValues(baseContext);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });
  });

  // ==================== Dynamic Type Tests ====================
  describe('Should test Contentful dynamic types', () => {
    afterEach(async () => {
      await delay(500);
    });

    it('Should return dynamic field options for a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const dynamicType = await getContentfulEntryFieldOptions({
        ...baseContext,
        opts: { space_id: spaceId, content_type_id: testContentTypeId },
      } as unknown as Record<string, unknown>) as unknown as Record<string, unknown>;
      expect(dynamicType).toBeDefined();
      expect(dynamicType.type).toBe('hash');
      expect(dynamicType.fields).toBeDefined();
      const fields = dynamicType.fields as Record<string, unknown>;
      expect(Object.keys(fields).length).toBeGreaterThan(0);
      // The 'test' content type has a 'something' field of type Symbol
      expect(fields.something).toBeDefined();
    }));

    it('Should return dynamic response type for a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const dynamicType = await getContentfulEntryDynamicResponseType({
        ...baseContext,
        opts: { space_id: spaceId, content_type_id: testContentTypeId },
      } as unknown as Record<string, unknown>) as unknown as Record<string, unknown>;
      expect(dynamicType).toBeDefined();
      expect(dynamicType.type).toBe('hash');
      expect(dynamicType.fields).toBeDefined();
      const fields = dynamicType.fields as Record<string, unknown>;
      // Should include system fields
      expect(fields.id).toBeDefined();
      expect(fields.content_type).toBeDefined();
      expect(fields.created_at).toBeDefined();
      expect(fields.updated_at).toBeDefined();
      expect(fields.version).toBeDefined();
      // Should include content type-specific fields
      expect(fields.something).toBeDefined();
    }));

    it('Should return fallback hash type when content_type_id is missing', async () => {
      try {
        await getContentfulEntryFieldOptions({
          ...baseContext,
          opts: { space_id: spaceId },
        } as unknown as Record<string, unknown>);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ContentfulError);
      }
    });
  });

  // ==================== Content Type Actions Tests ====================
  describe('Should test Contentful content type actions', () => {
    let createdContentTypeId: string | undefined;

    afterEach(async () => {
      await delay(1000);
    });

    afterAll(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      try {
        const client = getContentfulScopedClient(baseContext, spaceId!, 'master');
        try {
          await client.contentType.unpublish({ contentTypeId: createdContentTypeId });
        } catch {
          // May already be unpublished
        }
        await client.contentType.delete({ contentTypeId: createdContentTypeId });
      } catch {
        // Best-effort cleanup
      }
    });

    it('Should search content types', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const result = await callAction(
        SearchContentTypes as unknown as Record<string, unknown>,
        { ...baseOpts, limit: 5 },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should get a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const result = await callAction(
        GetContentType as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: testContentTypeId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(testContentTypeId);
      expect(result.name).toBeDefined();
      expect(result.fields).toBeDefined();
    }));

    it('Should create a content type', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const uniqueName = `Test CT ${Date.now()}`;
      const result = await callAction(
        CreateContentType as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          name: uniqueName,
          description: 'Test content type created by integration tests',
          fields: [
            { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
            { id: 'body', name: 'Body', type: 'Text', required: false, localized: false },
          ],
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(uniqueName);
      expect(result.fields).toBeDefined();
      expect((result.fields as unknown[]).length).toBe(2);
      createdContentTypeId = result.id as string;
    }));

    it('Should update a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const updatedName = `Updated CT ${Date.now()}`;
      const result = await callAction(
        UpdateContentType as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          name: updatedName,
          description: 'Updated description',
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.name).toBe(updatedName);
    }));

    it('Should add a field to a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        AddField as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
          field_name: 'Test Number',
          field_type: 'Integer',
          required: false,
          localized: false,
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      const fields = result.fields as Record<string, unknown>[];
      expect(fields.length).toBe(3);
      expect(fields.some((f) => f.id === 'testNumber')).toBe(true);
    }));

    it('Should update a field of a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        UpdateField as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
          field_name: 'Updated Number Field',
          required: true,
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      const fields = result.fields as Record<string, unknown>[];
      const updatedField = fields.find((f) => f.id === 'testNumber');
      expect(updatedField).toBeDefined();
      expect(updatedField!.name).toBe('Updated Number Field');
    }));

    it('Should activate a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        ActivateContentType as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: createdContentTypeId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContentTypeId);
    }));

    it('Should deactivate a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        DeactivateContentType as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: createdContentTypeId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContentTypeId);
    }));

    it('Should delete a field from a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        DeleteField as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      const fields = result.fields as Record<string, unknown>[];
      expect(fields.every((f) => f.id !== 'testNumber')).toBe(true);
    }));

    it('Should delete a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await callAction(
        DeleteContentType as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: createdContentTypeId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContentTypeId);
      expect(result.deleted).toBe(true);
      createdContentTypeId = undefined;
    }));
  });

  // ==================== Entry Actions Tests ====================
  describe('Should test Contentful entry actions', () => {
    let createdEntryId: string | undefined;

    afterEach(async () => {
      await delay(1000);
    });

    afterAll(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      try {
        const client = getContentfulScopedClient(baseContext, spaceId!, 'master');
        try {
          await client.entry.unpublish({ entryId: createdEntryId });
        } catch {
          // May already be unpublished
        }
        try {
          const entry = await client.entry.get({ entryId: createdEntryId });
          if ((entry.sys as unknown as Record<string, unknown>).archivedVersion) {
            await client.entry.unarchive({ entryId: createdEntryId });
          }
        } catch {
          // May not exist
        }
        await client.entry.delete({ entryId: createdEntryId });
      } catch {
        // Best-effort cleanup
      }
    });

    it('Should search entries', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const result = await callAction(
        SearchEntries as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: testContentTypeId, limit: 5 },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should create an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const result = await callAction(
        CreateEntry as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          fields: { something: `Test Entry ${Date.now()}` },
          publish: false,
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdEntryId = result.id as string;
    }));

    it('Should get an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        GetEntry as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: testContentTypeId, entry_id: createdEntryId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
    }));

    it('Should update an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const updatedValue = `Updated Entry ${Date.now()}`;
      const result = await callAction(
        UpdateEntry as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          entry_id: createdEntryId,
          fields: { something: updatedValue },
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.something).toBe(updatedValue);
    }));

    it('Should get an entry with replacement', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        GetEntryWithReplacement as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          entry_id: createdEntryId,
          replacements: [{ tag: 'Updated', value: 'Replaced' }],
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      if (typeof result.something === 'string') {
        expect(result.something).toContain('Replaced');
      }
    }));

    it('Should publish an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        PublishEntry as unknown as Record<string, unknown>,
        { ...baseOpts, entry_id: createdEntryId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      expect(result.version).toBeDefined();
    }));

    it('Should unpublish an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        UnpublishEntry as unknown as Record<string, unknown>,
        { ...baseOpts, entry_id: createdEntryId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
    }));

    it('Should archive an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        ArchiveEntry as unknown as Record<string, unknown>,
        { ...baseOpts, entry_id: createdEntryId, archive: true },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      expect(result.archived).toBe(true);
    }));

    it('Should unarchive an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        ArchiveEntry as unknown as Record<string, unknown>,
        { ...baseOpts, entry_id: createdEntryId, archive: false },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      expect(result.archived).toBe(false);
    }));

    it('Should delete an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await callAction(
        DeleteEntry as unknown as Record<string, unknown>,
        { ...baseOpts, content_type_id: testContentTypeId, entry_id: createdEntryId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      expect(result.deleted).toBe(true);
      createdEntryId = undefined;
    }));
  });

  // ==================== Asset Actions Tests ====================
  describe('Should test Contentful asset actions', () => {
    let createdAssetId: string | undefined;

    afterEach(async () => {
      await delay(1000);
    });

    afterAll(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      try {
        const client = getContentfulScopedClient(baseContext, spaceId!, 'master');
        try {
          await client.asset.unpublish({ assetId: createdAssetId });
        } catch {
          // May already be unpublished
        }
        try {
          const asset = await client.asset.get({ assetId: createdAssetId });
          if ((asset.sys as unknown as Record<string, unknown>).archivedVersion) {
            await client.asset.unarchive({ assetId: createdAssetId });
          }
        } catch {
          // May not exist
        }
        await client.asset.delete({ assetId: createdAssetId });
      } catch {
        // Best-effort cleanup
      }
    });

    it('Should search assets', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const result = await callAction(
        SearchAssets as unknown as Record<string, unknown>,
        { ...baseOpts, limit: 5 },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should create an asset', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const result = await callAction(
        CreateAsset as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          title: `Test Asset ${Date.now()}`,
          description: 'Test asset created by integration tests',
          file_name: 'test-image.png',
          file_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/100px-PNG_transparency_demonstration_1.png',
          content_type: 'image/png',
          publish: false,
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdAssetId = result.id as string;
    }), 60000);

    it('Should get an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        GetAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
    }));

    it('Should update an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const updatedTitle = `Updated Asset ${Date.now()}`;
      const result = await callAction(
        UpdateAsset as unknown as Record<string, unknown>,
        {
          ...baseOpts,
          asset_id: createdAssetId,
          title: updatedTitle,
        },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.title).toBe(updatedTitle);
    }));

    it('Should publish an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        PublishAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
    }));

    it('Should unpublish an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        UnpublishAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
    }));

    it('Should archive an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        ArchiveAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId, archive: true },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
      expect(result.archived).toBe(true);
    }));

    it('Should unarchive an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        ArchiveAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId, archive: false },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
      expect(result.archived).toBe(false);
    }));

    it('Should delete an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await callAction(
        DeleteAsset as unknown as Record<string, unknown>,
        { ...baseOpts, asset_id: createdAssetId },
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
      expect(result.deleted).toBe(true);
      createdAssetId = undefined;
    }));
  });

  // ==================== Trigger Tests ====================
  describe('Should test Contentful trigger', () => {
    it('Should return example data matching event_info schema', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const trigger = WatchEvent as TQoreAppActionWithWebhook;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data(
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();

      const eventInfo = trigger.event_info!;
      const eventType = eventInfo.type as { fields: Record<string, unknown> };
      const eventInfoFields = Object.keys(eventType.fields);
      const exampleFields = Object.keys(result);

      const missingFields = eventInfoFields.filter((f) => !exampleFields.includes(f));
      expect(missingFields).toEqual([]);

      const extraFields = exampleFields.filter((f) => !eventInfoFields.includes(f));
      expect(extraFields).toEqual([]);
    }));
  });

  // ==================== Negative Tests ====================
  describe('Should test Contentful negative cases', () => {
    it('Should throw error with invalid access token', async () => {
      const invalidContext = {
        conn_opts: {
          token: 'invalid-token-12345',
        } as Record<string, unknown>,
      };

      await expect(
        callAction(
          GetEntry as unknown as Record<string, unknown>,
          { space_id: spaceId || 'test', entry_id: 'nonexistent' },
          invalidContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    });

    it('Should throw error when entry does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        callAction(
          GetEntry as unknown as Record<string, unknown>,
          { ...baseOpts, content_type_id: testContentTypeId, entry_id: 'nonexistent-entry-id' },
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when asset does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        callAction(
          GetAsset as unknown as Record<string, unknown>,
          { ...baseOpts, asset_id: 'nonexistent-asset-id' },
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when content type does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        callAction(
          GetContentType as unknown as Record<string, unknown>,
          { ...baseOpts, content_type_id: 'nonexistent-content-type-id' },
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when required fields are missing', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        callAction(
          CreateEntry as unknown as Record<string, unknown>,
          { space_id: spaceId } as Record<string, unknown>,
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow();
    }));
  });
});
