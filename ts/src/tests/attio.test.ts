import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
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
import { createAttioRecords } from '../apps/attio/helpers/record-based/create-records';
import { deleteAttioRecords } from '../apps/attio/helpers/record-based/delete-records';
import { getAttioRecordType } from '../apps/attio/helpers/record-based/get-record-type';
import { getAttioTableList } from '../apps/attio/helpers/record-based/get-table-list';
import { searchAttioRecords } from '../apps/attio/helpers/record-based/search-records';
import { updateAttioRecords } from '../apps/attio/helpers/record-based/update-records';
import { upsertAttioRecords } from '../apps/attio/helpers/record-based/upsert-records';
import attioListEntryCreatedTrigger from '../apps/attio/triggers/list-entry-created.trigger';
import attioListEntryDeletedTrigger from '../apps/attio/triggers/list-entry-deleted.trigger';
import attioListEntryUpdatedTrigger from '../apps/attio/triggers/list-entry-updated.trigger';
import attioObjectRecordCreatedTrigger from '../apps/attio/triggers/object-record-created.trigger';
import attioObjectRecordDeletedTrigger from '../apps/attio/triggers/object-record-deleted.trigger';
import attioObjectRecordUpdatedTrigger from '../apps/attio/triggers/object-record-updated.trigger';
import attioTaskCreatedTrigger from '../apps/attio/triggers/task-created.trigger';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

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
  describe('Should test Attio allowed values', () => {
    it('Should get list attributes allowed values', async () => {
      const allowedValues = await getAttioListAttributesAllowedValues({
        ...baseContext,
        opts: {
          list: 'recruiting',
        },
      });
      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });
  });

  describe('Should test attio object attributes functions', () => {
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

  describe('Should test attio record based helpers', () => {
    const table = 'test_objects';

    it('Should get table list', async () => {
      const result = await getAttioTableList(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should get record type', async () => {
      const result = await getAttioRecordType(baseContext, table);

      expect(result).toBeDefined();
    });

    const phoneNumbers = ['+380501111111', '+380502222222', '+380503333333', '+380504444444'];

    it('Should create records', async () => {
      const result = await createAttioRecords(
        baseContext,
        {
          test_text: ['Task Alpha', 'Task Beta', 'Task Gamma', 'Task Delta'],
          number_field: [100, 200, 300, 400],
          checkbox_field: [false, true, false, true],
          rating_field: [2, 3, 4, 5],
          phone_number: phoneNumbers,
          date_field: ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05'],
          currency_field: [50.5, 100.75, 75.25, 125.0],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result!.test_text)).toBe(true);
      expect(result!.test_text.length).toBe(4);
    });

    it('Should verify created records', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '||',
          args: phoneNumbers.map((phone) => ({
            exp: '==',
            args: [{ field: 'phone_number' }, { value: phone }],
          })),
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.phone_number.length).toBe(4);

      const alphaIndex = result!.phone_number.indexOf('+380501111111');
      expect(result!.test_text[alphaIndex]).toBe('Task Alpha');
      expect(result!.number_field[alphaIndex]).toBe(100);
      expect(result!.rating_field[alphaIndex]).toBe(2);

      const betaIndex = result!.phone_number.indexOf('+380502222222');
      expect(result!.test_text[betaIndex]).toBe('Task Beta');
      expect(result!.checkbox_field[betaIndex]).toBe(true);
      expect(result!.rating_field[betaIndex]).toBe(3);
    });

    it('Should search records with simple expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'test_text' }, { value: 'Task Alpha' }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.test_text.length).toBeGreaterThan(0);
      expect(result!.test_text[0]).toBe('Task Alpha');
    });

    it('Should search records with OR expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'phone_number' }, { value: '+380503333333' }] },
            { exp: '==', args: [{ field: 'phone_number' }, { value: '+380504444444' }] },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.phone_number.length).toBe(2);
      result!.phone_number.forEach((phone: string) => {
        expect(['+380503333333', '+380504444444']).toContain(phone);
      });
    });

    it('Should search records with AND expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'checkbox_field' }, { value: true }] },
            { exp: '>=', args: [{ field: 'rating_field' }, { value: 3 }] },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.checkbox_field.forEach((checked: boolean) => {
          expect(checked).toBe(true);
        });
        result.rating_field.forEach((rating: number) => {
          expect(rating).toBeGreaterThanOrEqual(3);
        });
      }
    });

    it('Should search records with comparison operators', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '>', args: [{ field: 'rating_field' }, { value: 4 }] },
            { exp: '<', args: [{ field: 'number_field' }, { value: 350 }] },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.rating_field.forEach((rating: number) => {
          expect(rating).toBeGreaterThan(4);
        });
        result.number_field.forEach((num: number) => {
          expect(num).toBeLessThan(350);
        });
      }
    });

    it('Should search records with contains expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: 'contains',
          args: [{ field: 'test_text' }, { value: 'Task' }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.test_text.forEach((text: string) => {
          expect(text).toContain('Task');
        });
      }
    });

    it('Should search records with starts_with expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: 'starts_with',
          args: [{ field: 'test_text' }, { value: 'Task' }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.test_text.forEach((text: string) => {
          expect(text.startsWith('Task')).toBe(true);
        });
      }
    });

    it('Should search records with ends_with expression', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: 'ends_with',
          args: [{ field: 'test_text' }, { value: 'Alpha' }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.test_text.forEach((text: string) => {
          expect(text.endsWith('Alpha')).toBe(true);
        });
      }
    });

    it('Should search records with deeply nested expression (3 levels)', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Alpha' }] },
                { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Beta' }] },
                { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Gamma' }] },
              ],
            },
            {
              exp: '||',
              args: [
                {
                  exp: '&&',
                  args: [
                    { exp: '>=', args: [{ field: 'rating_field' }, { value: 2 }] },
                    { exp: '==', args: [{ field: 'checkbox_field' }, { value: true }] },
                  ],
                },
                {
                  exp: '&&',
                  args: [
                    { exp: '<=', args: [{ field: 'number_field' }, { value: 200 }] },
                    { exp: '==', args: [{ field: 'checkbox_field' }, { value: false }] },
                  ],
                },
              ],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.test_text.forEach((text: string) => {
          expect(['Task Alpha', 'Task Beta', 'Task Gamma']).toContain(text);
        });

        for (let i = 0; i < result.id.length; i++) {
          const rating = result.rating_field[i];
          const checked = result.checkbox_field[i];
          const numberField = result.number_field[i];

          const matchesFirstCondition = rating >= 2 && checked === true;
          const matchesSecondCondition = numberField <= 200 && checked === false;

          expect(matchesFirstCondition || matchesSecondCondition).toBe(true);
        }
      }
    });

    it('Should update records', async () => {
      const result = await updateAttioRecords(
        baseContext,
        {
          rating_field: 5,
        },
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Gamma' }] },
            { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Delta' }] },
          ],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(result).toBe(2);
    });

    it('Should verify updated records', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Gamma' }] },
            { exp: '==', args: [{ field: 'test_text' }, { value: 'Task Delta' }] },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.rating_field.forEach((rating: number) => {
          expect(rating).toBe(5);
        });
      }
    });

    it('Should handle pagination with filters', async () => {
      const iterator = await searchAttioRecords(
        baseContext,
        {
          exp: 'contains',
          args: [{ field: 'phone_number' }, { value: '+380' }],
        },
        { table }
      );

      const firstPage = await iterator(baseContext, 2);

      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBeLessThanOrEqual(2);

      const secondPage = await iterator(baseContext, 2);
      if (secondPage && secondPage.id.length > 0) {
        const firstIds = new Set(firstPage!.id);
        secondPage.id.forEach((id: string) => {
          expect(firstIds.has(id)).toBe(false);
        });
      }
    });

    it('Should upsert records', async () => {
      const result = await upsertAttioRecords(
        baseContext,
        {
          phone_number: ['+380501111111'],
          rating_field: [3],
          test_text: ['Task Alpha Updated'],
        },
        {
          table,
          matching_attribute: 'phone_number',
        }
      );

      expect(result).toBeDefined();
    });

    it('Should clean up all test records', async () => {
      const result = await deleteAttioRecords(
        baseContext,
        {
          exp: '||',
          args: phoneNumbers.map((phone) => ({
            exp: '==',
            args: [{ field: 'phone_number' }, { value: phone }],
          })),
        },
        { table }
      );

      expect(result).toBe(4);
    });
  });
});
