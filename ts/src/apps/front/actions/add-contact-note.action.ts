import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { FrontContactNoteResponseType } from '../response-types/contact-note';
import { getFrontTeammateAllowedValues } from '../helpers/get-teammate-allowed-values';

const action = 'add_contact_note';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
  body: {
    type: 'string',
    required: true,
  },
  authorId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontTeammateAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = FrontContactNoteResponseType;

const addFrontContactNote = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactId, body, authorId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactId', 'body', 'authorId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const note = await frontClient.post<Record<string, any>>(
        `contacts/${contactId}/notes`,
        {
          body,
          author_id: authorId,
        },
        { token }
      );

      return formatFrontResponse(note);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addFrontContactNote;
