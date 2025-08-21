import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { cloneDeep, set } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoContactAttributesResponseType } from '../helpers/get-contacts-dynamic-response-type';

const action = 'get_contact';

const response_type = {
  type: 'hash',
  fields: {
    email: { type: 'string' },
    id: { type: 'integer' },
    emailBlacklisted: { type: 'boolean' },
    smsBlacklisted: { type: 'boolean' },
    createdAt: { type: 'string' },
    modifiedAt: { type: 'string' },
    attributes: {
      type: {
        type: 'hash',
      },
    },
    listIds: {
      type: {
        type: 'list',
        element_type: 'integer',
      },
    },
    statistics: {
      type: {
        type: 'hash',
        fields: {
          messagesSent: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  campaignId: { type: 'integer' },
                  eventTime: { type: 'string' },
                },
              },
            },
          },
          opened: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  campaignId: { type: 'integer' },
                  count: { type: 'integer' },
                  eventTime: { type: 'string' },
                  ip: { type: 'string' },
                },
              },
            },
          },
          clicked: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  campaignId: { type: 'integer' },
                  links: {
                    type: {
                      type: 'list',
                      element_type: {
                        type: 'hash',
                        fields: {
                          count: { type: 'integer' },
                          eventTime: { type: 'string' },
                          ip: { type: 'string' },
                          url: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          delivered: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  campaignId: { type: 'integer' },
                  count: { type: 'integer' },
                  eventTime: { type: 'string' },
                  ip: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const options = {
  identifier: {
    type: 'string',
    required: true,
    get_allowed_values: async (context) => {
      const allowedValues = await getBrevoContactAllowedValues(context);

      return allowedValues.map((contact) => {
        return { ...contact, value: contact.value.toString() };
      });
    },
  },
} satisfies TQoreOptions;

const getContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, identifier } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['identifier'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.getContactInfo(identifier);

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const attributes = await getBrevoContactAttributesResponseType(token);

    const responseType = cloneDeep(response_type);

    set(responseType, 'fields.attributes', attributes);

    return responseType;
  },
  response_type,
});

export default getContact;
