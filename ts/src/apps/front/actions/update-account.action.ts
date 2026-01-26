import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontAccountAllowedValues } from '../helpers/get-account-allowed-values';
import { getFrontAccountCustomFieldDynamicType } from '../helpers/get-custom-fields';

const action = 'update_account';

const options = {
  accountId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontAccountAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },
  domains: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  externalId: {
    type: 'string',
    required: false,
  },
  customFields: {
    type: 'any',
    required: false,
    get_dynamic_type: getFrontAccountCustomFieldDynamicType,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    accountId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const updateFrontAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, accountId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['accountId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { name, description, domains, externalId, customFields } = obj || {};

    try {
      const body: Record<string, any> = {};

      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description;
      if (domains !== undefined) body.domains = domains;
      if (externalId !== undefined) body.external_id = externalId;
      if (customFields !== undefined) body.custom_fields = customFields;

      if (Object.keys(body).length === 0) {
        throw new FrontError('At least one field must be provided to update');
      }

      await frontClient.patch(`accounts/${accountId}`, body, { token });

      return {
        success: true,
        accountId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateFrontAccount;
