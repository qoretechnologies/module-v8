import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Message } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookMessageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const limit = context?.opts?.limit || 50;
  const folderId = context?.opts?.folderId;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook message id allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    const endpoint = folderId ? `/me/mailFolders/${folderId}/messages` : '/me/messages';

    let response: PageCollection = await client
      .api(endpoint)
      .select('id,subject,from,receivedDateTime,hasAttachments,importance,isRead')
      .top(Math.min(limit, 100))
      .orderby('receivedDateTime desc')
      .get();

    while (response.value.length > 0 && allowedValues.length < limit) {
      for (const message of response.value as Message[]) {
        if (allowedValues.length >= limit) break;

        const fromName =
          message.from?.emailAddress?.name || message.from?.emailAddress?.address || 'Unknown';
        const subject = message.subject || '(No subject)';
        const receivedDate = message.receivedDateTime
          ? new Date(message.receivedDateTime).toLocaleString()
          : 'Unknown date';

        allowedValues.push({
          display_name: `${subject} - ${fromName}`,
          value: message.id!,
          short_desc:
            `From: ${fromName}\n` +
            `Received: ${receivedDate}\n` +
            `Status: ${message.isRead ? 'Read' : 'Unread'}\n` +
            `Importance: ${message.importance || 'Normal'}\n` +
            `Has Attachments: ${message.hasAttachments ? 'Yes' : 'No'}\n`,
        });
      }

      if (allowedValues.length >= limit || !response['@odata.nextLink']) {
        break;
      }

      response = await client.api(response['@odata.nextLink']).get();
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to fetch Outlook messages: ${error.message}`);
  }
};
