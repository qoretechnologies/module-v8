import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';

const action = 'find_mailbox';

type THelpScoutMailbox = {
  id: number;
  name: string;
  slug: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const options = {
  name: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    slug: { type: 'string' },
    email: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
} satisfies TQoreResponseType;

const findHelpScoutMailbox = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    try {
      const mailboxes = await fetchHelpScoutPaginatedRecords<any, THelpScoutMailbox>({
        token,
        path: 'mailboxes',
        method: 'GET',
        object: 'mailboxes',
      });

      const searchName = name.toLowerCase();
      const mailbox = mailboxes.find(
        (m) =>
          m.name.toLowerCase() === searchName ||
          m.name.toLowerCase().includes(searchName) ||
          m.slug.toLowerCase() === searchName
      );

      if (!mailbox) {
        throw new HelpScoutError(`Mailbox with name "${name}" not found`);
      }

      return mailbox;
    } catch (error) {
      if (error instanceof HelpScoutError) {
        throw error;
      }
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default findHelpScoutMailbox;
