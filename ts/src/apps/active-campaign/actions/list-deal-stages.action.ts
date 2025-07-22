import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

const action = 'list_deal_stages';

const options = {
  title: {
    type: 'string',
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

const listDealStages = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit = 20, offset = 0, title } = obj || {};

    try {
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          ...(title && { ['filters[title]']: title }),
        },
        path: `dealStages`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      dealStages: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              cardRegion1: { type: 'string' },
              cardRegion2: { type: 'string' },
              cardRegion3: { type: 'string' },
              cardRegion4: { type: 'string' },
              cardRegion5: { type: 'string' },
              cdate: { type: 'string' },
              color: { type: 'string' },
              dealOrder: { type: 'string' },
              group: { type: 'string' },
              id: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    group: { type: 'string' },
                  },
                },
              },
              order: { type: 'string' },
              title: { type: 'string' },
              udate: { type: 'string' },
              width: { type: 'string' },
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

export default listDealStages;
