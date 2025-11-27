import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../apps/attio/constants';
import { getAttioListAttributesAllowedValues } from '../apps/attio/helpers/get-attio-list-attribute-allowed-values';
import {
  getAttioListApiSlugAllowedValues,
  getAttioListIdAllowedValues,
} from '../apps/attio/helpers/get-list-allowed-values';
import { getAttioListEntryIdAllowedValues } from '../apps/attio/helpers/get-list-entry-id-allowed-values';
import { getAttioListParentRecordIdAllowedValues } from '../apps/attio/helpers/get-list-parent-record-id-allowed-values';
import {
  getAttioObjectApiSlugAllowedValues,
  getAttioObjectIdAllowedValues,
} from '../apps/attio/helpers/get-object-allowed-values';
import { getAttioObjectAttributesAllowedValues } from '../apps/attio/helpers/get-object-attribute-allowed-values';
import { getAttioObjectRecordIdAllowedValues } from '../apps/attio/helpers/get-object-record-id-allowed-values';
import { getAttioTaskIdAllowedValues } from '../apps/attio/helpers/get-task-id-allowed-values';
import {
  getAttioWorkspaceMemberEmailAllowedValues,
  getAttioWorkspaceMemberIdAllowedValues,
} from '../apps/attio/helpers/get-workspace-member-allowed-values';
import attioListEntryCreatedTrigger from '../apps/attio/triggers/list-entry-created.trigger';
import attioListEntryDeletedTrigger from '../apps/attio/triggers/list-entry-deleted.trigger';
import attioListEntryUpdatedTrigger from '../apps/attio/triggers/list-entry-updated.trigger';
import attioObjectRecordCreatedTrigger from '../apps/attio/triggers/object-record-created.trigger';
import attioObjectRecordDeletedTrigger from '../apps/attio/triggers/object-record-deleted.trigger';
import attioObjectRecordUpdatedTrigger from '../apps/attio/triggers/object-record-updated.trigger';
import attioTaskCreatedTrigger from '../apps/attio/triggers/task-created.trigger';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { configDotenv } from 'dotenv';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Should test attio actions', () => {
  const token = process.env.ATTIO_TOKEN!;

  if (!token) {
    throw new AttioError('Missing ATTIO_TOKEN environment variable');
  }

  const baseContext = {
    conn_opts: {
      token,
    } as any,
  };

  let listId: string | undefined;
  let objectId: string | undefined;
  describe('Should test attio object attirbutes functions', () => {
    afterEach(async () => {
      await delay(2000);
    });

    it('Should get attio task id allowed values', async () => {
      const allowed_values = await getAttioTaskIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list api slug allowed values', async () => {
      const allowed_values = await getAttioListApiSlugAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list id allowed values', async () => {
      const allowed_values = await getAttioListIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      listId = allowed_values[0].value;
    });

    it('Should get attio list atrribute allowed values', async () => {
      const allowed_values = await getAttioListAttributesAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list entry id allowed values', async () => {
      const allowed_values = await getAttioListEntryIdAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list parent record id allowed values', async () => {
      const allowed_values = await getAttioListParentRecordIdAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object api slug allowed values', async () => {
      const allowed_values = await getAttioObjectApiSlugAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object id allowed values', async () => {
      const allowed_values = await getAttioObjectIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      objectId = allowed_values[0].value;
    });

    it('Should get attio object atrribute allowed values', async () => {
      const allowed_values = await getAttioObjectAttributesAllowedValues({
        ...baseContext,
        opts: { object: objectId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object record id allowed values', async () => {
      const allowed_values = await getAttioObjectRecordIdAllowedValues({
        ...baseContext,
        opts: { object: objectId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio workspace member allowed values', async () => {
      const allowed_values = await getAttioWorkspaceMemberIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio workspace member allowed values', async () => {
      const allowed_values = await getAttioWorkspaceMemberEmailAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test attio trigger registration', () => {
    describe('Should test attio list entry triggers', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register List Entry Created trigger', async () => {
        const trigger = attioListEntryCreatedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              list: listId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });

      it('Should deregister List Entry Created trigger', async () => {
        const trigger = attioListEntryCreatedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });

      it('Should register List Entry Deleted trigger', async () => {
        const trigger = attioListEntryDeletedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              list: listId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister List Entry Deleted trigger', async () => {
        const trigger = attioListEntryDeletedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });

      it('Should register List Entry Updated trigger', async () => {
        const trigger = attioListEntryUpdatedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              list: listId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister List Entry Updated trigger', async () => {
        const trigger = attioListEntryUpdatedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });
    });

    describe('Should test attio object record triggers', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register Object Record Created trigger', async () => {
        const trigger = attioObjectRecordCreatedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              object: objectId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister Object Record Created trigger', async () => {
        const trigger = attioObjectRecordCreatedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });

      it('Should register Object Record Deleted trigger', async () => {
        const trigger = attioObjectRecordDeletedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              object: objectId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister Object Record Deleted trigger', async () => {
        const trigger = attioObjectRecordDeletedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });

      it('Should register Object Record Updated trigger', async () => {
        const trigger = attioObjectRecordUpdatedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              object: objectId,
            },
          },
          'https://example.com/webhook'
        );

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister Object Record Updated trigger', async () => {
        const trigger = attioObjectRecordUpdatedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });
    });

    describe('Should test attio task triggers', () => {
      let regInfo: Record<string, any> | undefined | void;

      it('Should register New Task Created trigger', async () => {
        const trigger = attioTaskCreatedTrigger as TQoreAppActionWithWebhook;

        regInfo = await trigger.webhook_register(baseContext, 'https://example.com/webhook');

        expect(regInfo).toBeDefined();
        expect(regInfo!.webhook).toBeDefined();
        expect(regInfo!.webhook.id).toBeDefined();
      });
      it('Should deregister Task Created trigger', async () => {
        const trigger = attioTaskCreatedTrigger as TQoreAppActionWithWebhook;
        await trigger.webhook_deregister(baseContext, 'https://example.com/webhook', regInfo!);
        regInfo = undefined;
      });
    });
  });
});
