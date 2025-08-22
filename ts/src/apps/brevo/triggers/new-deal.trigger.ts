import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BREVO_APP_NAME, BrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';

const BrevoNewDealTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BREVO_APP_NAME,
  action: 'new_deal',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    linkedContactsId: {
      type: {
        type: 'list',
        element_type: 'number',
      },
      get_element_allowed_values: getBrevoContactAllowedValues,
      required: false,
    },
    linkedCompaniesId: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      get_element_allowed_values: getBrevoCompanyAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const linkedContactsId = context?.opts?.linkedContactsId;
    const linkedCompaniesId = context?.opts?.linkedCompaniesId;

    const getItems = () => {
      return fetchLatestDeals(token, linkedContactsId, linkedCompaniesId);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'brevo_new_deal',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const linkedContactsId = context?.opts?.linkedContactsId;
    const linkedCompaniesId = context?.opts?.linkedCompaniesId;
    const deals = await fetchLatestDeals(token, linkedContactsId, linkedCompaniesId);

    return deals?.length > 0 ? deals[0] : null;
  },
  event_info: {
    desc: 'Brevo New Deal Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        attributes: {
          type: {
            type: 'hash',
            fields: {
              deal_name: { type: 'string' },
              deal_stage: { type: 'string' },
              deal_amount: { type: 'number' },
              deal_currency: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
            },
          },
        },
        linkedContactsIds: {
          type: {
            type: 'list',
            element_type: 'integer',
          },
        },
        linkedCompaniesIds: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
      },
    },
  },
});

const fetchLatestDeals = async (
  token: string,
  linkedContactsId?: number[],
  linkedCompaniesId?: string[]
) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createBrevoClient(token);

    const response = await client.dealsClient.crmDealsGet(
      undefined,
      linkedCompaniesId?.join(','),
      linkedContactsId?.map(String).join(','),
      0,
      limit,
      'desc'
    );

    return response.body.items || [];
  } catch (error) {
    throw new BrevoError(`Failed to fetch latest deals: ${error.message || error}`);
  }
};

export default BrevoNewDealTrigger;
