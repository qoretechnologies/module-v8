import {
  IQoreAppActionWithWebhookBase,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
} from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { getPipedriveActivityIdAllowedValues } from '../apps/pipedrive/helpers/get-activity-id-allowed-values';
import { getPipedriveAttendeeAllowedValues } from '../apps/pipedrive/helpers/get-attendee-allowed-values';
import { getPipedriveDealIdAllowedValues } from '../apps/pipedrive/helpers/get-deal-id-allowed-values';
import { getPipedriveDealFilterIdAllowedValues } from '../apps/pipedrive/helpers/get-filter-id-allowed-values';
import { getPipedriveLeadIdAllowedValues } from '../apps/pipedrive/helpers/get-lead-id-allowed-values';
import { getPipedriveLeadLabelIdAllowedValues } from '../apps/pipedrive/helpers/get-lead-label-allowed-values';
import { getPipedriveLeadSourceIdAllowedValues } from '../apps/pipedrive/helpers/get-lead-source-allowed-values';
import { getPipedriveNoteIdAllowedValues } from '../apps/pipedrive/helpers/get-note-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../apps/pipedrive/helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../apps/pipedrive/helpers/get-person-id-allowed-values';
import { getPipedrivePipelineIdAllowedValues } from '../apps/pipedrive/helpers/get-pipeline-allowed-values';
import { getPipedriveStageIdAllowedValues } from '../apps/pipedrive/helpers/get-stage-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../apps/pipedrive/helpers/get-user-id-allowed-values';
import { createPipedriveRecords } from '../apps/pipedrive/helpers/record-based/create-records';
import { deletePipedriveRecords } from '../apps/pipedrive/helpers/record-based/delete-records';
import { getPipedriveDealRecordType } from '../apps/pipedrive/helpers/record-based/get-deal-record-type';
import { searchPipedriveRecords } from '../apps/pipedrive/helpers/record-based/search-records';
import { updatePipedriveRecords } from '../apps/pipedrive/helpers/record-based/update-records';
import { Debugger, DebugLevels } from '../utils/Debugger';
import {
  PipedriveActivityTrigger,
  PipedriveDealTrigger,
  PipedriveLeadTrigger,
  PipedriveNoteTrigger,
} from '../apps/pipedrive/triggers';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Pipedrive', () => {
  const refreshToken = process.env.PIPEDRIVE_REFRESH_TOKEN;
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;

  let token: string;
  let baseContext: TQoreAppActionFunctionContext<TCustomConnOptions> = {};

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Pipedrive credentials are not provided');
    }

    const data: {
      grant_type: string;
      redirect_uri: string;
      refresh_token: string;
    } = {
      grant_type: 'refresh_token',
      redirect_uri: 'https://qorebase.io',
      refresh_token: refreshToken,
    };

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://oauth.pipedrive.com/oauth/token', {
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

    token = responseData.access_token;

    baseContext = {
      conn_opts: {
        token,
      } as any,
    };
  });

  describe('Should test allowed values', () => {
    it('Should get persons allowed values', async () => {
      const result = await getPipedrivePersonIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get stage allowed values', async () => {
      const result = await getPipedriveStageIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get user allowed values', async () => {
      const result = await getPipedriveUserIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get organization allowed values', async () => {
      const result = await getPipedriveOrganizationIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get deal allowed values', async () => {
      const result = await getPipedriveDealIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get activity allowed values', async () => {
      const result = await getPipedriveActivityIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get attendee allowed values', async () => {
      const result = await getPipedriveAttendeeAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get filter allowed values', async () => {
      const result = await getPipedriveDealFilterIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get lead allowed values', async () => {
      const result = await getPipedriveLeadIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get lead label allowed values', async () => {
      const result = await getPipedriveLeadLabelIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get lead source allowed values', async () => {
      const result = await getPipedriveLeadSourceIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get note allowed values', async () => {
      const result = await getPipedriveNoteIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });

    it('Should get pipeline allowed values', async () => {
      const result = await getPipedrivePipelineIdAllowedValues(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('display_name');
      expect(result[0]).toHaveProperty('value');
    });
  });

  describe('Should test record based helpers', () => {
    it('Should get record type for deal', async () => {
      const result = await getPipedriveDealRecordType(baseContext);

      expect(result).toBeDefined();
    });

    const titles = ['Q4 Enterprise Deal - Acme Corp', 'Q4 SMB Deal - Beta LLC'];

    it('Should create a deal record', async () => {
      const result = await createPipedriveRecords(
        baseContext,
        {
          title: titles,
          value: [50000, 10000],
          currency: ['USD', 'PLN'],
          probability: [75, 50],
          org_id: [1, 1],
          person_id: [1, 1],
          stage_id: [1, 1],
          status: ['open', 'open'],
          won_time: ['2025-11-17T18:03:10+02:00'],
          close_time: ['2025-11-17T18:03:10+02:00'],
          visible_to: [3],
          expected_close_date: ['2025-11-17'],
          is_archived: [false],
        },
        { table: 'deals' }
      );

      expect(result).toBeDefined();
      expect(result!.id).toBeDefined();
      expect(result!.id.length).toBe(2);
    });

    it('Should search the created deal records', async () => {
      const getRecordsIterator = await searchPipedriveRecords(
        baseContext,
        {
          exp: '||',
          args: titles.map((title) => ({
            exp: '==',
            args: [{ field: 'title' }, { value: title }],
          })),
        },
        { table: 'deals' }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
    });

    it('Should update records', async () => {
      const result = await updatePipedriveRecords(
        baseContext,
        {
          value: 60000,
        },
        {
          exp: '==',
          args: [{ field: 'title' }, { value: 'Q4 Enterprise Deal - Acme Corp' }],
        },
        { table: 'deals' }
      );

      expect(result).toBe(1);
    });

    it('Should delete records', async () => {
      const result = await deletePipedriveRecords(
        baseContext,
        {
          exp: '||',
          args: titles.map((title) => ({
            exp: '==',
            args: [{ field: 'title' }, { value: title }],
          })),
        },
        { table: 'deals' }
      );
      expect(result).toBe(2);
    });
  });

  describe('Should test Pipedrive webhook actions', () => {
    describe('Should test new activity trigger registration', () => {
      let webhook: void | Record<string, any>;
      it('Should register new activity trigger', async () => {
        const trigger = PipedriveActivityTrigger as IQoreAppActionWithWebhookBase;

        const webhookData = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              action: 'create',
            },
          },
          'https://example.com'
        );
        webhook = webhookData?.webhook;

        expect(webhook).toBeDefined();
        expect(webhook?.id).toBeDefined();
      });

      it('Should deregister new activity trigger', async () => {
        expect(webhook).toBeDefined();

        const trigger = PipedriveActivityTrigger as IQoreAppActionWithWebhookBase;

        await trigger.webhook_deregister(baseContext, 'https://example.com', { webhook });
      });
    });

    describe('Should test deal trigger registration', () => {
      let webhook: void | Record<string, any>;

      it('Should register deal trigger', async () => {
        const trigger = PipedriveDealTrigger as IQoreAppActionWithWebhookBase;

        const webhookData = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              action: 'change',
            },
          },
          'https://example.com'
        );

        webhook = webhookData?.webhook;

        expect(webhook).toBeDefined();
        expect(webhook?.id).toBeDefined();
      });

      it('Should deregister deal trigger', async () => {
        expect(webhook).toBeDefined();

        const trigger = PipedriveDealTrigger as IQoreAppActionWithWebhookBase;

        await trigger.webhook_deregister(baseContext, 'https://example.com', { webhook });
      });
    });

    describe('Should test lead trigger registration', () => {
      let webhook: void | Record<string, any>;

      it('Should register lead trigger', async () => {
        const trigger = PipedriveLeadTrigger as IQoreAppActionWithWebhookBase;

        const webhookData = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              action: 'delete',
            },
          },
          'https://example.com'
        );

        webhook = webhookData?.webhook;

        expect(webhook).toBeDefined();
        expect(webhook?.id).toBeDefined();
      });

      it('Should deregister lead trigger', async () => {
        expect(webhook).toBeDefined();

        const trigger = PipedriveLeadTrigger as IQoreAppActionWithWebhookBase;

        await trigger.webhook_deregister(baseContext, 'https://example.com', { webhook });
      });
    });

    describe('Should test note trigger registration', () => {
      let webhook: void | Record<string, any>;

      it('Should register note trigger', async () => {
        const trigger = PipedriveNoteTrigger as IQoreAppActionWithWebhookBase;

        const webhookData = await trigger.webhook_register(
          {
            ...baseContext,
            opts: {
              action: '*',
            },
          },
          'https://example.com'
        );

        webhook = webhookData?.webhook;

        expect(webhook).toBeDefined();
        expect(webhook?.id).toBeDefined();
      });

      it('Should deregister note trigger', async () => {
        expect(webhook).toBeDefined();

        const trigger = PipedriveNoteTrigger as IQoreAppActionWithWebhookBase;

        await trigger.webhook_deregister(baseContext, 'https://example.com', { webhook });
      });
    });
  });
});
