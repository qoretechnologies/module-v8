import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';

const action = 'list_projects';

const options = {
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listProjects = QoreAppCreator.createLocalizedAction<typeof options>({
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
        path: `/api/0/organizations/${organization}/projects/`,
        method: 'GET',
        params: {
          ...(cursor && { cursor }),
        },
        token,
      });

      return {
        projects: response.items,
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
              dateCreated: { type: 'string' },
              isBookmarked: { type: 'bool' },
              isMember: { type: 'bool' },
              hasAccess: { type: 'bool' },
              isInternal: { type: 'bool' },
              isPublic: { type: 'bool' },
              color: { type: 'string' },
              status: { type: 'string' },
              firstEvent: { type: 'string' },
              features: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              avatar: {
                type: {
                  type: 'hash',
                  fields: {
                    avatarType: { type: 'string' },
                    avatarUuid: { type: 'string' },
                  },
                },
              },
              organization: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    slug: { type: 'string' },
                    name: { type: 'string' },
                    dateCreated: { type: 'string' },
                    isEarlyAdopter: { type: 'bool' },
                    require2FA: { type: 'bool' },
                    avatar: {
                      type: {
                        type: 'hash',
                        fields: {
                          avatarType: { type: 'string' },
                          avatarUuid: { type: 'string' },
                        },
                      },
                    },
                    status: {
                      type: {
                        type: 'hash',
                        fields: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
      previous_cursor: { type: 'string' },
    },
  },
});

export default listProjects;
