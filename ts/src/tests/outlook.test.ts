import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { CreateOutlookEvent, SearchOutlookEmails } from '../apps/outlook/actions';
import { CreateOutlookContact } from '../apps/outlook/actions/create-contact';
import { DeleteOutlookContact } from '../apps/outlook/actions/delete-contact';
import { DeleteOutlookEvent } from '../apps/outlook/actions/delete-event';
import { ListOutlookContacts } from '../apps/outlook/actions/list-contacts';
import { UpdateOutlookContact } from '../apps/outlook/actions/update-contact';
import { getOutlookCalendarIdAllowedValues } from '../apps/outlook/helpers/get-calendar-id-allowed-values';
import { getOutlookContactIdAllowedValues } from '../apps/outlook/helpers/get-contact-id-allowed-values';
import { getOutlookEventIdAllowedValues } from '../apps/outlook/helpers/get-event-id-allowed-values';
import { getOutlookRecipientsAllowedValues } from '../apps/outlook/helpers/get-recepient-allowed-values';
import { getOutlookMailFoldersAllowedValues } from '../apps/outlook/helpers/get-email-folder-allowed-values';
import { getOutlookEmailAllowedValues } from '../apps/outlook/helpers/get-outlook-email-allowed-values';
import { configDotenv } from 'dotenv';
configDotenv({ path: '.env' });

describe('Should test Outlook actions', () => {
  const refreshToken = process.env.OUTLOOK_REFRESH_TOKEN;
  const clientId = process.env.OUTLOOK_CLIENT_ID;
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;

  let token: string;
  let contactId: string;
  let calendarId: string;
  let eventId: string;

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Outlook credentials are not provided');
    }

    const data: {
      client_id: string;
      client_secret: string;
      refresh_token: string;
      grant_type: string;
    } = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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

    token = responseData.access_token;
  });

  describe('Should test Outlook allowed values', () => {
    it('Should get Outlook calendar ID allowed values', async () => {
      const allowed_values = await getOutlookCalendarIdAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      calendarId = allowed_values[0].value;
    });

    it('Should get Outlook email folder allowed values', async () => {
      const allowed_values = await getOutlookMailFoldersAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Outlook email allowed values', async () => {
      const allowed_values = await getOutlookEmailAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get Outlook Contact ID allowed values', async () => {
      const allowed_values = await getOutlookContactIdAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
    });

    it('Should get Outlook event ID allowed values', async () => {
      const allowed_values = await getOutlookEventIdAllowedValues({
        opts: {
          calendarId,
        },
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
    });

    it('Should get Outlook recipients allowed values', async () => {
      const allowed_values = await getOutlookRecipientsAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
    });

    it('Should get Outlook timezone allowed values', async () => {
      const allowed_values = await getOutlookRecipientsAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
    });
  });

  describe('Should test Outlook actions', () => {
    it('Should create an outlook contact', async () => {
      const action = CreateOutlookContact as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          givenName: 'Testing contact',
          emailAddresses: [
            {
              address: 'test@test.com',
              name: 'Test Contact',
            },
          ],
        },
        undefined,
        {
          conn_opts: { token } as any,
        }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      contactId = result?.id;
    });

    it('Should create an outlook event', async () => {
      const allowedValues = await getOutlookRecipientsAllowedValues({
        conn_opts: { token } as any,
      });

      const action = CreateOutlookEvent as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          calendarId,
          title: 'Test Event',
          start: new Date(),
          timezone: 'UTC-11',
          attendees: [allowedValues[0].value],
        },
        undefined,
        {
          conn_opts: { token } as any,
        }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      eventId = result?.id;
    });

    it('Should list Outlook contacts', async () => {
      const action = ListOutlookContacts as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          limit: 5,
        },
        undefined,
        { conn_opts: { token } as any }
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list Outlook events', async () => {
      const action = ListOutlookContacts as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          calendarId,
          limit: 5,
        },
        undefined,
        { conn_opts: { token } as any }
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should update an Outlook contact', async () => {
      const action = UpdateOutlookContact as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          contactId,
          givenName: 'Updated contact',
        },
        undefined,
        { conn_opts: { token } as any }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.givenName).toBe('Updated contact');
    });

    // The following test requires a valid recipient email address
    // it('Should send an email', async () => {
    //   const allowedValues = await getOutlookRecipientsAllowedValues({
    //     conn_opts: { token } as any,
    //   });

    //   const recipient = allowedValues[0].value;
    //   const action = SendOutlookEmail as IQoreAppActionWithFunction;
    //   const result = await action.api_function(
    //     {
    //       subject: 'Test email',
    //       body: 'This is a test email',
    //       toRecipients: [recipient],
    //       attachments: [
    //         {
    //           name: 'test.txt',
    //           mime_type: 'text/plain',
    //           content: 'SnVzdCBhIHRlc3QgZmlsZQ==',
    //         },
    //       ],
    //     },
    //     undefined,
    //     { conn_opts: { token } as any }
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.success).toBe(true);
    // });

    it('Should search search outlook emails', async () => {
      const action = SearchOutlookEmails as IQoreAppActionWithFunction;
      const result = await action.api_function({ limit: 3 }, undefined, {
        conn_opts: { token } as any,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should delete an Outlook contact', async () => {
      const action = DeleteOutlookContact as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          contactId,
        },
        undefined,
        { conn_opts: { token } as any }
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should delete an Outlook event', async () => {
      const action = DeleteOutlookEvent as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          calendarId,
          eventId,
        },
        undefined,
        { conn_opts: { token } as any }
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
