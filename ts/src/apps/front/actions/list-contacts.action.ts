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
import { FrontContactResponseType } from '../response-types/contact';

const action = 'list_contacts';

export const FrontContactSortFieldAllowedValues = [
  { display_name: 'Created At', value: 'created_at' },
  { display_name: 'Updated At', value: 'updated_at' },
];

export const FrontSortOrderAllowedValues = [
  { display_name: 'Descending', value: 'desc' },
  { display_name: 'Ascending', value: 'asc' },
];

const options = {
  sortBy: {
    type: 'string',
    required: false,
    allowed_values: FrontContactSortFieldAllowedValues,
  },
  sortOrder: {
    type: 'string',
    required: false,
    allowed_values: FrontSortOrderAllowedValues,
    default_value: 'desc',
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontContactResponseType,
} satisfies TQoreResponseType;

const listFrontContacts = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { sortBy, sortOrder, limit } = obj || {};

    try {
      const params: Record<string, string> = {};

      if (sortBy) params.sort_by = sortBy;
      if (sortOrder) params.sort_order = sortOrder;

      const contacts = await fetchFrontPaginatedRecords<any, Record<string, any>>({
        token,
        path: 'contacts',
        method: 'GET',
        params,
        maxResults: limit || 50,
      });

      return formatFrontResponse(contacts);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontContacts;
