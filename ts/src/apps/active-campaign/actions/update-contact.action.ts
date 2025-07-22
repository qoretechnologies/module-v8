import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { mapActiveCampaignContactCustomFieldsToQoreOptions } from '../helpers/get-custom-field-type';

const action = 'update_contact';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
  email: {
    required: false,
    preselected: true,
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

const updateContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['id'],
      ErrorClass: ActiveCampaignError,
    });

    const { firstName, lastName, phone, email } = obj || {};

    const fieldValues: Record<string, any> = obj?.fieldValues || {};

    const fields = Object.keys(fieldValues).map((key) => ({
      customFieldId: key,
      fieldValue: fieldValues[key],
    }));

    try {
      const response = await activeCampaignApiClient<{
        fieldValues: Record<string, any>[];
        contact: { links: Record<string, any> };
      }>({
        token,
        url: instance_url,
        method: 'PUT',
        path: `contacts/${id}`,
        body: {
          contact: {
            ...(email && { email }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(fields?.length && { fields }),
          },
        },
      });

      return {
        fieldValues: response.fieldValues,
        contact: omit(response.contact, ['links']),
      };
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      fieldValues: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              contact: { type: 'string' },
              field: { type: 'string' },
              value: { type: 'string' },
              cdate: { type: 'string' },
              udate: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    owner: { type: 'string' },
                    field: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              owner: { type: 'string' },
            },
          },
        },
      },
      contact: {
        type: {
          type: 'hash',
          fields: {
            email: { type: 'string' },
            cdate: { type: 'string' },
            udate: { type: 'string' },
            orgid: { type: 'string' },
            id: { type: 'string' },
            organization: { type: 'string' },
          },
        },
      },
    },
  },
});

export default updateContact;
