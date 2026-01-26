import { chat_v1 } from '@googleapis/chat';
import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';

export const getGoogleChatSpaceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GoogleChatError,
  });

  try {
    const params = {
      pageSize: '1000',
      fields: '*',
    };

    const response = await QorusRequest.get<{ data: chat_v1.Schema$ListSpacesResponse }>(
      {
        path: '/v1/spaces',
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
    );

    const spaces = response?.data?.spaces || [];

    return spaces.map((space) => ({
      display_name: space.displayName!,
      value: space.name!,
    }));
  } catch (error) {
    throw new GoogleChatError(`Failed to get Google Chat spaces: ${error}`);
  }
};
