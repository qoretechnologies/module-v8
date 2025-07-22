import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

const action = 'list_accounts';

const options = {
  search: {
    type: 'string',
    required: false,
    preselected: true,
  },
  count_deals: {
    type: 'boolean',
    required: false,
  },
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

const listAccounts = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit = 20, offset = 0, search } = obj || {};
    const count_deals = obj?.count_deals === true ? 'true' : 'false';

    try {
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          ...(search && { search }),
          count_deals,
          limit: limit.toString(),
          offset: offset.toString(),
        },
        path: `accounts`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      accounts: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              accountUrl: { type: 'string' },
              createdTimestamp: { type: 'string' },
              updatedTimestamp: { type: 'string' },
              contactCount: { type: 'string' },
              dealCount: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    notes: { type: 'string' },
                    accountCustomFieldData: { type: 'string' },
                    accountContacts: { type: 'string' },
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

export default listAccounts;
