import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME, OUTLOOK_DATE_FORMAT } from '../constants';
import { getOutlookCalendarIdAllowedValues } from '../helpers/get-calendar-id-allowed-values';
import { getOutlookTimezonesAllowedValues } from '../helpers/get-timezone-allowed-values';
import dayjs from 'dayjs';
import {
  getOutlookRecipientsAllowedValues,
  IOutlookRecipient,
  mapOutlookRecipientToAddress,
} from '../helpers/get-recepient-allowed-values';

const options = {
  calendarId: {
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getOutlookCalendarIdAllowedValues,
    required: true,
  },
  title: {
    type: 'string',
    required: true,
  },
  start: {
    type: 'date',
    required: true,
  },
  timezone: {
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getOutlookTimezonesAllowedValues,
    required: true,
  },
  end: {
    type: 'date',
    required: false,
  },
  location: {
    type: 'string',
    required: false,
    preselected: true,
  },
  attendees: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          address: {
            type: 'string',
            required: true,
          },
          name: {
            type: 'string',
            required: false,
          },
        },
      },
    },
    get_allowed_values: getOutlookRecipientsAllowedValues,
    allowed_values_creatable: true,
  },
  body: {
    type: 'string',
    required: false,
  },
  bodyContentType: {
    type: 'string',
    required: false,
    default_value: 'Text',
    allowed_values: [
      { display_name: 'Plain Text', value: 'Text' },
      { display_name: 'HTML', value: 'HTML' },
    ],
  },
  isOnlineMeeting: {
    type: 'boolean',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    createdDateTime: { type: 'string' },
    lastModifiedDateTime: { type: 'string' },
    subject: { type: 'string' },
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
    onlineMeeting: {
      type: {
        type: 'hash',
        fields: {
          joinUrl: { type: 'string' },
        },
      },
    },
    isOnlineMeeting: { type: 'boolean' },
    onlineMeetingProvider: { type: 'string' },
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
} satisfies TQoreResponseType;

export const CreateOutlookEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-event',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const calendarId = data?.calendarId;
    let start = data?.start;
    let end = data?.end;
    const timezone = data?.timezone;
    const title = data?.title;
    const location = data?.location;
    const attendees = (data?.attendees || []) as IOutlookRecipient[];
    const body = data?.body;
    const bodyContentType = data?.bodyContentType || 'Text';
    const isOnlineMeeting = data?.isOnlineMeeting || false;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!calendarId) missingValues.push('calendarId');
    if (!start) missingValues.push('start');
    if (!timezone) missingValues.push('timezone');
    if (!title) missingValues.push('title');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create Outlook event`
      );
    }

    start = dayjs(start).format(OUTLOOK_DATE_FORMAT);
    end = end
      ? dayjs(end).format(OUTLOOK_DATE_FORMAT)
      : dayjs(start).add(1, 'hour').format(OUTLOOK_DATE_FORMAT);

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const itemInput = {
      subject: title,
      start: {
        dateTime: start,
        timeZone: timezone,
      },
      end: {
        dateTime: end,
        timeZone: timezone,
      },
      ...(location && {
        location: {
          displayName: location,
        },
      }),
      ...(attendees.length > 0 && { attendees: attendees.map(mapOutlookRecipientToAddress) }),
      ...(body && {
        body: {
          contentType: bodyContentType,
          content: body,
        },
      }),
      isOnlineMeeting,
    };

    try {
      const result = await client.api(`/me/calendars/${calendarId}/events`).post(itemInput);

      return result;
    } catch (error) {
      throw new Error(`Failed to create Outlook event: ${error.message}`);
    }
  },
  options,
  response_type,
});
