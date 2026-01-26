import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactCustomFieldDynamicResponseType } from '../helpers/get-custom-fields';
import { FrontContactResponseType } from '../response-types/contact';

const action = 'new_contact';

const options = {} satisfies TQoreOptions;

const NewContact = QoreAppCreator.createLocalizedTrigger({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const getItems = () => {
      return fetchLatestRecords({ token });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `front_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const records = await fetchLatestRecords({ token });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Front New Contact Trigger Event Info',
    type: FrontContactResponseType,
  },
  get_dynamic_type: async (context) => {
    const customFields = await getFrontContactCustomFieldDynamicResponseType(context);

    return {
      type: 'hash',
      fields: {
        ...FrontContactResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewContact;

type TFetchRowsOptions = {
  token: string;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token } = options;
  const limit = 20;

  try {
    const contacts = await frontClient.fetchPaginated<Record<string, any>>({
      path: 'contacts',
      token,
      maxResults: limit,
      params: {
        sort_by: 'created_at',
        sort_order: 'desc',
      },
    });

    return formatFrontResponse(contacts);
  } catch (error) {
    throw new FrontError(`Failed to fetch latest contacts: ${error.message || error}`);
  }
};
