import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryTeamAllowedValues } from '../helpers/get-team-allowed-values';

const action = 'get_team';

const options = {
  teamId: {
    type: 'string',
    required: true,
    get_allowed_values: getSentryTeamAllowedValues,
  },
} satisfies TQoreOptions;

const getTeam = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization, teamId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'organization'],
      optionFields: ['teamId'],
      ErrorClass: SentryError,
    });

    try {
      const response = await sentryApiClient<Record<string, any>>({
        path: `/api/0/teams/${organization}/${teamId}/`,
        method: 'GET',
        token,
      });

      return response;
    } catch (error) {
      throw new SentryError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      slug: { type: 'string' },
      name: { type: 'string' },
      dateCreated: { type: 'string' },
      isMember: { type: 'boolean' },
      teamRole: { type: 'string' },
      flags: {
        type: {
          type: 'hash',
          fields: {
            'idp:provisioned': { type: 'boolean' },
          },
        },
      },
      access: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      hasAccess: { type: 'boolean' },
      isPending: { type: 'boolean' },
      memberCount: { type: 'integer' },
      avatar: {
        type: {
          type: 'hash',
          fields: {
            avatarType: { type: 'string' },
            avatarUuid: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
      },
      orgRole: { type: 'string' },
      organization: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            slug: { type: 'string' },
            status: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            name: { type: 'string' },
            dateCreated: { type: 'string' },
            isEarlyAdopter: { type: 'boolean' },
            require2FA: { type: 'boolean' },
            avatar: {
              type: {
                type: 'hash',
                fields: {
                  avatarType: { type: 'string' },
                  avatarUuid: { type: 'string' },
                },
              },
            },
          },
        },
      },
      externalTeams: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              teamId: { type: 'string' },
              externalName: { type: 'string' },
              integrationId: { type: 'string' },
              provider: { type: 'string' },
            },
          },
        },
      },
      projects: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              slug: { type: 'string' },
              name: { type: 'string' },
              platform: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default getTeam;
