import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BREVO_APP_NAME, BrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';

const BrevoNewCompanyTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BREVO_APP_NAME,
  action: 'new_company',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    linkedContactsId: {
      type: 'number',
      required: false,
      get_allowed_values: getBrevoContactAllowedValues,
    },
    linkedDealsId: {
      type: 'string',
      required: false,
      get_allowed_values: getBrevoDealAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const linkedContactsId = context?.opts?.linkedContactsId;
    const linkedDealsId = context?.opts?.linkedDealsId;

    const getItems = () => {
      return fetchLatestCompanies(token, linkedContactsId, linkedDealsId);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'brevo_new_company',
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
    const linkedDealsId = context?.opts?.linkedDealsId;
    const companies = await fetchLatestCompanies(token, linkedContactsId, linkedDealsId);

    return companies?.length > 0 ? companies[0] : null;
  },
  event_info: {
    desc: 'Brevo New Company Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        attributes: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              industry: { type: 'string' },
              website: { type: 'string' },
              phone: { type: 'string' },
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
        linkedDealsIds: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
      },
    },
  },
});

const fetchLatestCompanies = async (
  token: string,
  linkedContactsId?: number,
  linkedDealsId?: string
) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createBrevoClient(token);

    const response = await client.companiesClient.companiesGet(
      undefined,
      linkedContactsId,
      linkedDealsId,
      1,
      limit,
      'desc',
      'attributes.created_at'
    );

    return response.body.items || [];
  } catch (error) {
    throw new BrevoError(`Failed to fetch latest companies: ${error.message || error}`);
  }
};

export default BrevoNewCompanyTrigger;
