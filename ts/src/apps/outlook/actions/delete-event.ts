import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookCalendarIdAllowedValues } from '../helpers/get-calendar-id-allowed-values';
import { getOutlookEventIdAllowedValues } from '../helpers/get-event-id-allowed-values';

const options = {
  calendarId: {
    type: 'string',
    get_allowed_values: getOutlookCalendarIdAllowedValues,
    required: true,
  },
  eventId: {
    type: 'string',
    depends_on: ['calendarId'],
    get_allowed_values: getOutlookEventIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const DeleteOutlookEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'delete-event',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const calendarId = data?.calendarId;
    const eventId = data?.eventId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!calendarId) missingValues.push('calendarId');
    if (!eventId) missingValues.push('eventId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to delete Outlook event`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      await client.api(`/me/calendars/${calendarId}/events/${eventId}`).delete();

      return {
        success: true,
        message: `Event ${eventId} has been successfully deleted from calendar ${calendarId}`,
      };
    } catch (error) {
      throw new Error(`Failed to delete Outlook event: ${error.message}`);
    }
  },
  options,
  response_type,
});
