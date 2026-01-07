import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontAccountCustomFieldDynamicType } from '../helpers/get-custom-fields';
import { FrontAccountResponseType } from '../response-types/account';

const action = 'create_account';

const options = {
  name: {
    type: 'string',
    required: true,
    preselected: true,
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

const responseType = FrontAccountResponseType;

const createFrontAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { description, domains, externalId, customFields } = obj || {};

    try {
      const body: Record<string, any> = {
        name,
        ...(description && { description }),
        ...(domains?.length && { domains }),
        ...(externalId && { external_id: externalId }),
        ...(customFields && { custom_fields: customFields }),
      };

      const account = await frontClient.post<Record<string, any>>('accounts', body, { token });

      return formatFrontResponse(account);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createFrontAccount;
