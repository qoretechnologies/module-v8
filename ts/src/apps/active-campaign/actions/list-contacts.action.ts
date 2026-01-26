import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignFormAllowedValues } from '../helpers/get-form-id-allowed-values';
import { getActiveCampaignListAllowedValues } from '../helpers/get-list-id-allowed-values';
import { ContactListItemResponseType, MetaResponseType } from '../response-types';

const action = 'list_contacts';

const options = {
  email: {
    type: 'string',
    required: false,
  },
  email_like: {
    type: 'string',
    required: false,
  },
  phone: {
    type: 'string',
    required: false,
  },
  search: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'number',
    required: false,
    allowed_values: [
      { value: -1, display_name: 'Any' },
      { value: 0, display_name: 'Unconfirmed' },
      { value: 1, display_name: 'Active' },
      { value: 2, display_name: 'Unsubscribed' },
      { value: 3, display_name: 'Bounced' },
    ],
  },
  formid: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveCampaignFormAllowedValues,
  },
  listid: {
    type: 'string',
    required: false,
    get_allowed_values: getActiveCampaignListAllowedValues,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'id', display_name: 'ID' },
            { value: 'email', display_name: 'Email' },
            { value: 'cdate', display_name: 'Created Date' },
            { value: 'first_name', display_name: 'First Name' },
            { value: 'last_name', display_name: 'Last Name' },
            { value: 'name', display_name: 'Name' },
            { value: 'score', display_name: 'Score' },
          ],
        },
        order: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
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

const listContacts = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const {
      limit = 20,
      offset = 0,
      sort = { field: 'cdate', order: 'desc' },
      email,
      email_like,
      formid,
      listid,
      phone,
      search,
      status,
    } = obj || {};

    try {
      const response = await activeCampaignClient.get(`contacts`, {
        token,
        baseUrl: instance_url,
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          [`orders[${sort.field}]`]: sort.order,
          ...(email && { email }),
          ...(email_like && { email_like }),
          ...(formid && { formid }),
          ...(listid && { listid }),
          ...(phone && { phone }),
          ...(search && { search }),
          ...(status !== undefined && { status }),
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
      contacts: {
        type: {
          type: 'list',
          element_type: ContactListItemResponseType,
        },
      },
      meta: { type: MetaResponseType },
    },
  },
});

export default listContacts;
