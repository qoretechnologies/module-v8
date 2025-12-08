import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Event } from '@microsoft/microsoft-graph-types';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookCalendarIdAllowedValues } from '../helpers/get-calendar-id-allowed-values';

const options = {
  calendarId: {
    type: 'string',
    get_allowed_values: getOutlookCalendarIdAllowedValues,
    required: true,
  },
  startDateTime: {
    type: 'date',
    required: false,
  },
  endDateTime: {
    type: 'date',
    required: false,
  },
  limit: {
    type: 'number',
    required: false,
    default_value: 50,
    preselected: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      subject: { type: 'string' },
      bodyPreview: { type: 'string' },
      importance: { type: 'string' },
      sensitivity: { type: 'string' },
      start: {
        type: {
          type: 'hash',
          fields: {
            dateTime: { type: 'string' },
            timeZone: { type: 'string' },
          },
        },
      },
      end: {
        type: {
          type: 'hash',
          fields: {
            dateTime: { type: 'string' },
            timeZone: { type: 'string' },
          },
        },
      },
      location: {
        type: {
          type: 'hash',
          fields: {
            displayName: { type: 'string' },
            address: {
              type: {
                type: 'hash',
                fields: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  countryOrRegion: { type: 'string' },
                  postalCode: { type: 'string' },
                },
              },
            },
          },
        },
      },
      isAllDay: { type: 'bool' },
      isCancelled: { type: 'bool' },
      isOnlineMeeting: { type: 'bool' },
      onlineMeetingUrl: { type: 'string' },
      organizer: {
        type: {
          type: 'hash',
          fields: {
            emailAddress: {
              type: {
                type: 'hash',
                fields: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
      },
      webLink: { type: 'string' },
    },
  },
} satisfies TQoreResponseType;

const ListOutlookEvents = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'list-events',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const calendarId = data?.calendarId;
    const startDateTime = data?.startDateTime;
    const endDateTime = data?.endDateTime;
    const limit = data?.limit || 50;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!calendarId) missingValues.push('calendarId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to list Outlook events`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const result: Event[] = [];

    try {
      let request = client
        .api(`/me/calendars/${calendarId}/events`)
        .select(
          [
            'id',
            'subject',
            'bodyPreview',
            'importance',
            'sensitivity',
            'start',
            'end',
            'location',
            'isAllDay',
            'isCancelled',
            'isOnlineMeeting',
            'onlineMeetingUrl',
            'organizer',
            'webLink',
          ].join(',')
        )
        .top(Math.min(limit, 100))
        .orderby('start/dateTime');

      if (startDateTime && endDateTime) {
        const start = startDateTime.toISOString();
        const end = endDateTime.toISOString();
        request = request.filter(`start/dateTime ge '${start}' and end/dateTime le '${end}'`);
      } else if (startDateTime) {
        const start = startDateTime.toISOString();
        request = request.filter(`start/dateTime ge '${start}'`);
      } else if (endDateTime) {
        const end = endDateTime.toISOString();
        request = request.filter(`end/dateTime le '${end}'`);
      }

      let response: PageCollection = await request.get();

      while (response.value.length > 0 && result.length < limit) {
        result.push(...(response.value as Event[]));

        if (result.length < limit && response['@odata.nextLink']) {
          response = await client.api(response['@odata.nextLink']).get();
        } else {
          break;
        }
      }

      return result.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch Outlook events: ${error.message}`);
    }
  },
  options,
  response_type,
});

export default ListOutlookEvents;
