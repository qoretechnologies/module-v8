import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { BrevoContactFilterOption } from '../helpers/get-contact-attributes-allowed-values';
import { getBrevoContactsListResponseType } from '../helpers/get-contacts-dynamic-response-type';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'list_contacts';

const options = {
  limit: {
    type: 'number',
    required: false,
  },
  offset: {
    type: 'number',
    required: false,
  },
  sort: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'desc', display_name: 'Newest first' },
      { value: 'asc', display_name: 'Oldest first' },
    ],
  },
  listIds: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoListAllowedValues,
  },
  filter: BrevoContactFilterOption,
} satisfies TQoreOptions;

const listContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const { limit = 10, offset = 0, sort = 'desc', listIds, filter } = obj || {};

    let filterString: string | undefined = undefined;

    if (filter) {
      filterString = `equals(${filter.field},${filter.value})`;
    }

    const client = createBrevoClient(token);

    try {
      const response = await client.contactsClient.getContacts(
        limit,
        offset,
        undefined,
        undefined,
        sort as 'desc' | 'asc',
        undefined,
        listIds,
        filterString
      );

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: getBrevoContactsListResponseType,
  response_type: {
    type: 'hash',
    fields: {
      count: { type: 'number' },
      contacts: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'number' },
              emailBlacklisted: { type: 'bool' },
              smsBlacklisted: { type: 'bool' },
              createdAt: { type: 'string' },
              modifiedAt: { type: 'string' },
              listIds: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'number',
                  },
                },
              },
              attributes: {
                type: {
                  type: 'hash',
                  fields: {},
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listContacts;
