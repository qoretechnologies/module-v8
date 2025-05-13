import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Event } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookEventIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const calendarId = context?.opts?.calendarId;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!calendarId) missingValues.push('calendarId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook event ID allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let response: PageCollection = await client
      .api(`/me/calendars/${calendarId}/events`)
      .select('id,subject,start,end,organizer')
      .top(50)
      .orderby('createdDateTime DESC')
      .get();

    while (response.value.length > 0) {
      for (const event of response.value as Event[]) {
        const startDate = event.start?.dateTime ? new Date(event.start.dateTime) : null;
        const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : null;

        const dateRangeDisplay =
          startDate && endDate
            ? `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`
            : 'Date not available';

        allowedValues.push({
          display_name: event.subject || 'Untitled Event',
          value: event.id!,
          short_desc:
            `When: ${dateRangeDisplay}\n` +
            `Organizer: ${
              event.organizer?.emailAddress?.name ||
              event.organizer?.emailAddress?.address ||
              'Unknown'
            }\n` +
            `Location: ${event.location?.displayName || 'Not specified'}`,
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
    throw new Error(`Failed to fetch Outlook events: ${error.message}`);
  }
};
