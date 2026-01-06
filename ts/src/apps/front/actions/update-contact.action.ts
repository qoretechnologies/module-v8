import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getFrontContactCustomFieldDynamicType } from '../helpers/get-custom-fields';

const action = 'update_contact';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },
  links: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  customFields: {
    type: 'any',
    required: false,
    get_dynamic_type: getFrontContactCustomFieldDynamicType,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    contactId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const updateFrontContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { name, description, links, customFields } = obj || {};

    try {
      const body: Record<string, any> = {};

      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description;
      if (links !== undefined) body.links = links;
      if (customFields !== undefined) body.custom_fields = customFields;

      if (Object.keys(body).length === 0) {
        throw new FrontError('At least one field must be provided to update');
      }

      await frontClient.patch(`contacts/${contactId}`, body, { token });

      return {
        success: true,
        contactId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateFrontContact;
