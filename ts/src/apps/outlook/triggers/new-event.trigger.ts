import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Event } from '@microsoft/microsoft-graph-types';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookCalendarIdAllowedValues } from '../helpers/get-calendar-id-allowed-values';

const options = {
  calendarId: {
    type: 'string',
    get_allowed_values: getOutlookCalendarIdAllowedValues,
    required: false,
  },
} satisfies TQoreOptions;

const OutlookNewEventTrigger = QoreAppCreator.createLocalizedTrigger({
  app: OUTLOOK_APP_NAME,
  action: 'new-event',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const calendarId = context.opts?.calendarId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new event Outlook trigger`
      );
    }

    const getItems = () => {
      return getLastOutlookEvents(token!, calendarId);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'outlook_new_event',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const calendarId = context.opts?.calendarId;

    if (!token) {
      throw new Error('The token is required to get the new event example data');
    }

    const events = await getLastOutlookEvents(token, calendarId);

    return events?.length > 0 ? events[0] : null;
  },
  event_info: {
    desc: 'Outlook New Event Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdDateTime: { type: 'string' },
        lastModifiedDateTime: { type: 'string' },
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
            },
          },
        },
        isAllDay: { type: 'boolean' },
        isCancelled: { type: 'boolean' },
        isOnlineMeeting: { type: 'boolean' },
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
        attendees: {
          type: {
            type: 'list',
            element_type: {
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
                status: {
                  type: {
                    type: 'hash',
                    fields: {
                      response: { type: 'string' },
                      time: { type: 'string' },
                    },
                  },
                },
                type: { type: 'string' },
              },
            },
          },
        },
        webLink: { type: 'string' },
        body: {
          type: {
            type: 'hash',
            fields: {
              contentType: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const getLastOutlookEvents = async (token: string, calendarId?: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  try {
    const endpoint = calendarId ? `/me/calendars/${calendarId}/events` : '/me/events';

    const response: PageCollection = await client
      .api(endpoint)
      .select(
        [
          'id',
          'createdDateTime',
          'lastModifiedDateTime',
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
          'attendees',
          'webLink',
          'body',
        ].join(',')
      )
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .orderby('createdDateTime desc')
      .get();

    return response.value as Event[];
  } catch (error) {
    throw new Error(`Failed to fetch Outlook events: ${error.message}`);
  }
};

export default OutlookNewEventTrigger;
