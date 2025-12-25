import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { fetchFrontPaginatedRecords } from '../helpers/constants';
import { formatFrontResponse } from '../helpers/format-response';
import { FrontAccountResponseType } from '../response-types/account';

const action = 'list_accounts';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontAccountResponseType,
} satisfies TQoreResponseType;

const listFrontAccounts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { limit } = obj || {};

    try {
      const accounts = await fetchFrontPaginatedRecords<any, Record<string, any>>({
        token,
        path: 'accounts',
        method: 'GET',
        maxResults: limit || 50,
      });

      return formatFrontResponse(accounts);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontAccounts;
