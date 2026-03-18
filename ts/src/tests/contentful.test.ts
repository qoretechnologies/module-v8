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
import { getContentfulScopedClient } from '../apps/contentful/client';
import { delay } from '../global/helpers';
import { checkAllowedValues, skipOnTransientError } from './utils';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Should test Contentful actions', () => {
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const hasCredentials = !!(accessToken && spaceId);

  const baseContext = {
    conn_opts: {
      access_token: accessToken || '',
    } as Record<string, unknown>,
  };

  const baseOpts = {
    space_id: spaceId || '',
    environment_id: 'master',
  };

  let testContentTypeId: string | undefined;
  let testEntryId: string | undefined;

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
      const result = await SearchContentTypes.api_function!(
        { ...baseOpts, limit: 5 },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should get a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const result = await GetContentType.api_function!(
        { ...baseOpts, content_type_id: testContentTypeId },
        undefined,
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
      const result = await CreateContentType.api_function!(
        {
          ...baseOpts,
          name: uniqueName,
          description: 'Test content type created by integration tests',
          fields: [
            { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
            { id: 'body', name: 'Body', type: 'Text', required: false, localized: false },
          ],
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(uniqueName);
      expect(result.fields).toBeDefined();
      expect(result.fields.length).toBe(2);
      createdContentTypeId = result.id;
    }));

    it('Should update a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const updatedName = `Updated CT ${Date.now()}`;
      const result = await UpdateContentType.api_function!(
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          name: updatedName,
          description: 'Updated description',
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.name).toBe(updatedName);
    }));

    it('Should add a field to a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await AddField.api_function!(
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
          field_name: 'Test Number',
          field_type: 'Integer',
          required: false,
          localized: false,
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.fields.length).toBe(3);
      expect(result.fields.some((f: Record<string, unknown>) => f.id === 'testNumber')).toBe(true);
    }));

    it('Should update a field of a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await UpdateField.api_function!(
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
          field_name: 'Updated Number Field',
          required: true,
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      const updatedField = result.fields.find((f: Record<string, unknown>) => f.id === 'testNumber');
      expect(updatedField).toBeDefined();
      expect(updatedField.name).toBe('Updated Number Field');
    }));

    it('Should activate a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await ActivateContentType.api_function!(
        { ...baseOpts, content_type_id: createdContentTypeId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContentTypeId);
    }));

    it('Should deactivate a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await DeactivateContentType.api_function!(
        { ...baseOpts, content_type_id: createdContentTypeId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContentTypeId);
    }));

    it('Should delete a field from a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await DeleteField.api_function!(
        {
          ...baseOpts,
          content_type_id: createdContentTypeId,
          field_id: 'testNumber',
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.fields.every((f: Record<string, unknown>) => f.id !== 'testNumber')).toBe(true);
    }));

    it('Should delete a content type', skipOnTransientError(async () => {
      if (!hasCredentials || !createdContentTypeId) {
        return;
      }
      const result = await DeleteContentType.api_function!(
        { ...baseOpts, content_type_id: createdContentTypeId },
        undefined,
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
          if ((entry.sys as Record<string, unknown>).archivedVersion) {
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
      const result = await SearchEntries.api_function!(
        { ...baseOpts, content_type_id: testContentTypeId, limit: 5 },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should create an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !testContentTypeId) {
        return;
      }
      const result = await CreateEntry.api_function!(
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          fields: { title: `Test Entry ${Date.now()}` },
          publish: false,
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdEntryId = result.id;
      testEntryId = result.id;
    }));

    it('Should get an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await GetEntry.api_function!(
        { ...baseOpts, content_type_id: testContentTypeId, entry_id: createdEntryId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
    }));

    it('Should update an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const updatedTitle = `Updated Entry ${Date.now()}`;
      const result = await UpdateEntry.api_function!(
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          entry_id: createdEntryId,
          fields: { title: updatedTitle },
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.title).toBe(updatedTitle);
    }));

    it('Should get an entry with replacement', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await GetEntryWithReplacement.api_function!(
        {
          ...baseOpts,
          content_type_id: testContentTypeId,
          entry_id: createdEntryId,
          replacements: [{ tag: 'Updated', value: 'Replaced' }],
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
      if (typeof result.title === 'string') {
        expect(result.title).toContain('Replaced');
      }
    }));

    it('Should publish an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await PublishEntry.api_function!(
        { ...baseOpts, entry_id: createdEntryId },
        undefined,
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
      const result = await UnpublishEntry.api_function!(
        { ...baseOpts, entry_id: createdEntryId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEntryId);
    }));

    it('Should archive an entry', skipOnTransientError(async () => {
      if (!hasCredentials || !createdEntryId) {
        return;
      }
      const result = await ArchiveEntry.api_function!(
        { ...baseOpts, entry_id: createdEntryId, archive: true },
        undefined,
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
      const result = await ArchiveEntry.api_function!(
        { ...baseOpts, entry_id: createdEntryId, archive: false },
        undefined,
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
      const result = await DeleteEntry.api_function!(
        { ...baseOpts, content_type_id: testContentTypeId, entry_id: createdEntryId },
        undefined,
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
          if ((asset.sys as Record<string, unknown>).archivedVersion) {
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
      const result = await SearchAssets.api_function!(
        { ...baseOpts, limit: 5 },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }));

    it('Should create an asset', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      const result = await CreateAsset.api_function!(
        {
          ...baseOpts,
          title: `Test Asset ${Date.now()}`,
          description: 'Test asset created by integration tests',
          file_name: 'test-image.png',
          file_url:
            'https://images.ctfassets.net/fo9twyrwpveg/6wsHKoGRMQ2WYCUaYmoKeY/d3e8e4e9f34eed9df3b4ab29cc6a5bd5/hedgehog.jpg',
          content_type: 'image/jpeg',
          publish: false,
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdAssetId = result.id;
    }), 30000);

    it('Should get an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await GetAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId },
        undefined,
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
      const result = await UpdateAsset.api_function!(
        {
          ...baseOpts,
          asset_id: createdAssetId,
          title: updatedTitle,
        },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.title).toBe(updatedTitle);
    }));

    it('Should publish an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await PublishAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
    }));

    it('Should unpublish an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await UnpublishAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId },
        undefined,
        baseContext as unknown as Record<string, unknown>
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssetId);
    }));

    it('Should archive an asset', skipOnTransientError(async () => {
      if (!hasCredentials || !createdAssetId) {
        return;
      }
      const result = await ArchiveAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId, archive: true },
        undefined,
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
      const result = await ArchiveAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId, archive: false },
        undefined,
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
      const result = await DeleteAsset.api_function!(
        { ...baseOpts, asset_id: createdAssetId },
        undefined,
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

      const eventInfoFields = Object.keys(trigger.event_info!.type.fields);
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
          access_token: 'invalid-token-12345',
        } as Record<string, unknown>,
      };

      await expect(
        GetEntry.api_function!(
          { space_id: spaceId || 'test', entry_id: 'nonexistent' },
          undefined,
          invalidContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    });

    it('Should throw error when entry does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        GetEntry.api_function!(
          { ...baseOpts, content_type_id: testContentTypeId, entry_id: 'nonexistent-entry-id' },
          undefined,
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when asset does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        GetAsset.api_function!(
          { ...baseOpts, asset_id: 'nonexistent-asset-id' },
          undefined,
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when content type does not exist', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        GetContentType.api_function!(
          { ...baseOpts, content_type_id: 'nonexistent-content-type-id' },
          undefined,
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow(ContentfulError);
    }));

    it('Should throw error when required fields are missing', skipOnTransientError(async () => {
      if (!hasCredentials) {
        return;
      }
      await expect(
        CreateEntry.api_function!(
          { space_id: spaceId } as Record<string, unknown>,
          undefined,
          baseContext as unknown as Record<string, unknown>
        )
      ).rejects.toThrow();
    }));
  });
});
