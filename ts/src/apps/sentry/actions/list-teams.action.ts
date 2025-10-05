import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';

const action = 'list_teams';

const options = {
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listTeams = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'organization'],
      ErrorClass: SentryError,
    });

    const { cursor } = obj || {};

    try {
      const response = await sentryApiClient<{
        items: Record<string, any>[];
        links: {
          next?: { url: string; cursor: string; results: string };
          previous?: { url: string; cursor: string; results: string };
        };
      }>({
        path: `/api/0/organizations/${organization}/teams/`,
        method: 'GET',
        params: {
          ...(cursor && { cursor }),
        },
        token,
      });

      return {
        teams: response.items,
        next_cursor: response.links.next?.cursor,
        previous_cursor: response.links.previous?.cursor,
      };
    } catch (error) {
      throw new SentryError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      teams: {
        type: {
          type: 'list',
          element_type: {
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
            },
          },
        },
      },
      next_cursor: { type: 'string' },
      previous_cursor: { type: 'string' },
    },
  },
});

export default listTeams;
