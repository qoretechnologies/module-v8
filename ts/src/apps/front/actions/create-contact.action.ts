import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { frontApiClient } from '../helpers/constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactCustomFieldDynamicType } from '../helpers/get-custom-fields';
import { FrontContactResponseType } from '../response-types/contact';

const action = 'create_contact';

const options = {
  name: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },
  handles: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          handle: { type: 'string' },
          source: {
            type: 'string',
            allowed_values: [
              { value: 'email', display_name: 'Email' },
              { value: 'phone', display_name: 'Phone' },
              { value: 'twitter', display_name: 'Twitter' },
              { value: 'facebook', display_name: 'Facebook' },
              { value: 'intercom', display_name: 'Intercom' },
              { value: 'front_chat', display_name: 'Front Chat' },
              { value: 'custom', display_name: 'Custom' },
            ],
          },
        },
      },
    },
    required: true,
    preselected: true,
  },
  links: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  groupNames: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  customFields: {
    type: 'any',
    required: false,
    get_dynamic_type: getFrontContactCustomFieldDynamicType,
  },
} satisfies TQoreOptions;

const responseType = FrontContactResponseType;

const createFrontContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, handles } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['handles'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { name, description, links, groupNames, customFields } = obj || {};

    try {
      const body: Record<string, any> = {
        handles,
        ...(name && { name }),
        ...(description && { description }),
        ...(links?.length && { links }),
        ...(groupNames?.length && { group_names: groupNames }),
        ...(customFields && { custom_fields: customFields }),
      };

      const contact = await frontApiClient<Record<string, any>>({
        token,
        path: 'contacts',
        method: 'POST',
        body,
      });

      return formatFrontResponse(contact);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createFrontContact;
