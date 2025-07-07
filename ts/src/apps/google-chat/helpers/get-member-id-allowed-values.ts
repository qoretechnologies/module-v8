import { chat_v1 } from '@googleapis/chat';
import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';

export const getGoogleChatMemberIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      showGroups: 'true',
      showInvited: 'true',
    };

    const response = await QorusRequest.get<{ data: chat_v1.Schema$ListMembershipsResponse }>(
      {
        path: `/v1/${spaceId}/members`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
    );

    const members = response?.data?.memberships || [];

    return members.map((member) => ({
      display_name: member.name!,
      value: member.name!,
      desc: `Role: ${member.role}\n State: ${member.state}`,
    }));
  } catch (error) {
    throw new GoogleChatError(`Failed to get Google Chat members: ${error}`);
  }
};
