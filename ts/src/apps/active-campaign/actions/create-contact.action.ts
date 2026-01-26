import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { omit } from 'lodash';
import { mapActiveCampaignContactCustomFieldsToQoreOptions } from '../helpers/get-custom-field-type';
import { CreateUpdateContactResponseType } from '../response-types';

const action = 'create_contact';

const options = {
  email: {
    required: true,
    type: 'string',
  },
  firstName: {
    type: 'string',
    preselected: true,
    required: false,
  },
  lastName: {
    type: 'string',
    preselected: true,
    required: false,
  },
  phone: {
    type: 'string',
    preselected: true,
    required: false,
  },
  fieldValues: {
    type: 'hash',
    get_dynamic_type: async (context) => {
      const { token, instance_url } = getQoreContextRequiredValues({
        context,
        connectionFields: ['token', 'instance_url'],
        ErrorClass: ActiveCampaignError,
      });

      const mappedFields = await mapActiveCampaignContactCustomFieldsToQoreOptions({
        token,
        url: instance_url,
      });

      return {
        type: 'hash',
        fields: mappedFields,
      };
    },
  },
} satisfies TQoreOptions;

const createContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['email'],
      ErrorClass: ActiveCampaignError,
    });

    const { firstName, lastName, phone } = obj || {};

    const fieldValues: Record<string, any> = obj?.fieldValues || {};

    const fields = Object.keys(fieldValues).map((key) => ({
      customFieldId: key,
      fieldValue: fieldValues[key],
    }));

    try {
      const response = await activeCampaignClient.post<{
        fieldValues: Record<string, any>[];
        contact: { links: Record<string, any> };
      }>(`contacts`, {
        contact: {
          email,
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
          ...(fields?.length && { fields }),
        },
      }, {
        token,
        baseUrl: instance_url,
      });

      return {
        fieldValues: response.fieldValues,
        contact: omit(response.contact, ['links']),
      };
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: CreateUpdateContactResponseType,
});

export default createContact;
