import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

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
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          ...(search && {
            'filters[search]': search.value,
            'filters[search_field]': search.field,
          }),
        },
        path: `deals`,
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
          element_type: {
            type: 'hash',
            fields: {
              owner: { type: 'string' },
              contact: { type: 'string' },
              organization: { type: 'string' },
              group: { type: 'string' },
              stage: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              percent: { type: 'string' },
              cdate: { type: 'string' },
              mdate: { type: 'string' },
              nextdate: { type: 'string' },
              nexttaskid: { type: 'string' },
              value: { type: 'string' },
              currency: { type: 'string' },
              winProbability: { type: 'number' },
              winProbabilityMdate: { type: 'string' },
              status: { type: 'string' },
              activitycount: { type: 'string' },
              nextdealid: { type: 'string' },
              edate: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    dealActivities: { type: 'string' },
                    contact: { type: 'string' },
                    contactDeals: { type: 'string' },
                    group: { type: 'string' },
                    nextTask: { type: 'string' },
                    notes: { type: 'string' },
                    account: { type: 'string' },
                    customerAccount: { type: 'string' },
                    organization: { type: 'string' },
                    owner: { type: 'string' },
                    scoreValues: { type: 'string' },
                    stage: { type: 'string' },
                    tasks: { type: 'string' },
                    dealCustomFieldData: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              isDisabled: { type: 'boolean' },
              account: { type: 'string' },
              customerAccount: { type: 'string' },
              hash: { type: 'string' },
              nextTask: { type: 'string' },
            },
          },
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
