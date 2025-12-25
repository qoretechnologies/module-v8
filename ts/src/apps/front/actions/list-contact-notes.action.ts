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
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { FrontContactNoteResponseType } from '../response-types/contact-note';

const action = 'list_contact_notes';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontContactNoteResponseType,
} satisfies TQoreResponseType;

const listFrontContactNotes = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit } = obj || {};

    try {
      const notes = await fetchFrontPaginatedRecords<any, Record<string, any>>({
        token,
        path: `contacts/${contactId}/notes`,
        method: 'GET',
        maxResults: limit || 50,
      });

      return formatFrontResponse(notes);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontContactNotes;
