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
import { FrontContactListResponseType } from '../response-types/contact-list';

const action = 'list_contact_lists';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontContactListResponseType,
} satisfies TQoreResponseType;

const listFrontContactLists = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const contactLists = await fetchFrontPaginatedRecords<any, Record<string, any>>({
        token,
        path: 'contact_lists',
        method: 'GET',
        maxResults: limit || 50,
      });

      return formatFrontResponse(contactLists);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontContactLists;
