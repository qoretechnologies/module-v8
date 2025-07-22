import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

const action = 'list_users';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  offset: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const listUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      ErrorClass: ActiveCampaignError,
    });

    const { limit = 20, offset = 0 } = obj || {};

    try {
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
        },
        path: `users`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      users: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              username: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              signature: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    lists: { type: 'string' },
                    userGroup: { type: 'string' },
                    dealGroupTotals: { type: 'string' },
                    dealGroupUsers: { type: 'string' },
                    configs: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
            },
          },
        },
      },
      meta: {
        type: {
          type: 'hash',
          fields: {
            total: { type: 'string' },
          },
        },
      },
    },
  },
});

export default listUsers;
