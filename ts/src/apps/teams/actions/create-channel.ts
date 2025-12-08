import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';
import { TeamsChannelMembershipAllowedValues } from '../helpers/channel-membership-allowed-values';

const options = {
  teamId: {
    type: 'string',
    required: true,
    get_allowed_values: getTeamsTeamIdAllowedValues,
  },
  displayName: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
  },
  membershipType: {
    type: 'string',
    required: false,
    allowed_values: TeamsChannelMembershipAllowedValues,
    default_value: 'standard',
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    displayName: {
      type: 'string',
    },
    success: {
      type: 'bool',
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const CreateTeamsChannel = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-channel',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const teamId = data?.teamId;
    const displayName = data?.displayName;
    const description = data?.description;
    const membershipType = data?.membershipType;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!teamId) missingValues.push('teamId');
    if (!displayName) missingValues.push('displayName');
    if (!membershipType) missingValues.push('membershipType');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create Teams channel`
      );
    }

    if (
      !TeamsChannelMembershipAllowedValues.map((allowedValue) => allowedValue.value).includes(
        membershipType!
      )
    ) {
      throw new Error(`Invalid membership type: ${membershipType}`);
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      const channelBody = {
        displayName,
        description: description || '',
        membershipType,
      };

      const response = await client.api(`/teams/${teamId}/channels`).post(channelBody);

      return {
        id: response.id,
        displayName: response.displayName,
        success: true,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to create Teams channel: ${error.message}`);
    }
  },
  options,
  response_type,
});

export default CreateTeamsChannel;
