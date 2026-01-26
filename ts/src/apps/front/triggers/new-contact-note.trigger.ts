import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { FrontContactNoteResponseType } from '../response-types/contact-note';

const action = 'new_contact_note';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
} satisfies TQoreOptions;

const NewContactNote = QoreAppCreator.createLocalizedTrigger({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context,
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const getItems = () => {
      return fetchLatestRecords({ token, contactId });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `front_${action}`,
      uniqueField: 'created_at',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context,
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const records = await fetchLatestRecords({ token, contactId });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Front New Contact Note Trigger Event Info',
    type: FrontContactNoteResponseType,
  },
});

export default NewContactNote;

type TFetchRowsOptions = {
  token: string;
  contactId: string;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, contactId } = options;
  const limit = 20;

  try {
    const notes = await frontClient.fetchPaginated<Record<string, any>>({
      path: `contacts/${contactId}/notes`,
      token,
      maxResults: limit,
    });

    const sortedNotes = formatFrontResponse(notes).sort((a, b) => {
      return (b.created_at || 0) - (a.created_at || 0);
    });

    return sortedNotes;
  } catch (error) {
    throw new FrontError(`Failed to fetch latest contact notes: ${error.message || error}`);
  }
};
