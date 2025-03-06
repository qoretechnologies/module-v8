import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getTeamsMeetingIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get meetings allowed values');
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let response: PageCollection = await client
      .api('/me/events')
      .select('id,subject,start,end,onlineMeeting,organizer')
      .top(50)
      .get();

    while (response.value && response.value.length > 0) {
      for (const meeting of response.value) {
        const startDate = new Date(meeting.start?.dateTime);
        let formattedDate = 'Unknown date';

        if (!isNaN(startDate.getTime())) {
          formattedDate = startDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }

        const organizer =
          meeting.organizer?.emailAddress?.name ||
          meeting.organizer?.emailAddress?.address ||
          'Unknown';

        allowedValues.push({
          display_name: meeting.subject || 'Untitled Meeting',
          value: meeting.id,
          short_desc:
            `Date: ${formattedDate}\n` +
            `Organizer: ${organizer}\n` +
            `Online Meeting: ${meeting.onlineMeeting ? 'Yes' : 'No'}`,
        });
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to get meetings allowed values: ${error.message}`);
  }
};
