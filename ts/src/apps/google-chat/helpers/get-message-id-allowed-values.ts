import { chat_v1 } from '@googleapis/chat';
import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { formatDateReadable, getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';

export const getGoogleChatMessageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, spaceId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['spaceId'],
    ErrorClass: GoogleChatError,
  });

  try {
    const params = {
      pageSize: '1000',
      fields: '*',
    };

    const response = await QorusRequest.get<{ data: chat_v1.Schema$ListMessagesResponse }>(
      {
        path: `/v1/${spaceId}/messages`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
    );

    const messages = response?.data?.messages || [];

    return messages.map((message) => {
      const date = formatDateReadable(message.createTime!);
      const messageText =
        message.text?.length && message.text.length > 25
          ? `${message.text.slice(0, 25)}...`
          : message.text;

      return {
        display_name: `[${date}] ${messageText || 'No text'}`,
        value: message.name!,
      };
    });
  } catch (error) {
    throw new GoogleChatError(`Failed to get Google Chat messages: ${error}`);
  }
};
