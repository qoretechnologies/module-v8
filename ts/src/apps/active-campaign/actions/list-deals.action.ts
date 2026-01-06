import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { DealListItemResponseType } from '../response-types';

const action = 'list_deals';

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
  search: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'all', display_name: 'All' },
            { value: 'title', display_name: 'Title' },
            { value: 'contact', display_name: 'Contact' },
            { value: 'org', display_name: 'Organization' },
          ],
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const listDeals = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const response = await activeCampaignClient.get(`deals`, {
        token,
        baseUrl: instance_url,
        params: {
          limit,
          offset,
          search,
        },
      });
      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      deals: {
        type: {
          type: 'list',
          element_type: DealListItemResponseType,
        },
      },
      meta: {
        type: {
          type: 'hash',
          fields: {
            currencies: {
              type: {
                type: 'hash',
                fields: {
                  USD: {
                    type: {
                      type: 'hash',
                      fields: {
                        currency: { type: 'string' },
                        total: { type: 'string' },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            total: { type: 'number' },
          },
        },
      },
    },
  },
});

export default listDeals;
