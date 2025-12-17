import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZENDESK_APP_NAME } from '../app-constants';
import { ZendeskError } from '../constants';
import { zendeskApiClient } from '../helpers/constants';
import { getZendeskFieldDynamicTypeFunction } from '../helpers/get-object-custom-fields';
import { getCustomObjectAllowedValues } from '../helpers/get-custom-object-allowed-values';
import { TZendeskCustomObjectSearchResponse } from '../helpers/record-based/types';

const action = 'new_custom_object_record';

const options = {
  custom_object: {
    type: 'string',
    required: true,
    get_allowed_values: getCustomObjectAllowedValues,
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

type TCustomObjectRecord = {
  id: string;
  name: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
  custom_object_fields: Record<string, any>;
  [key: string]: any;
};

const NewCustomObjectRecord = QoreAppCreator.createLocalizedTrigger({
  app: ZENDESK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url, custom_object } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['custom_object'],
      ErrorClass: ZendeskError,
    });

    const getItems = () => {
      return fetchLatestCustomObjectRecords({
        token,
        url,
        customObjectKey: custom_object,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `zendesk_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, url, custom_object } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['custom_object'],
      ErrorClass: ZendeskError,
    });

    const records = await fetchLatestCustomObjectRecords({
      token,
      url,
      customObjectKey: custom_object,
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Zendesk New Custom Object Record Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        external_id: { type: 'string' },
        created_at: { type: 'softdate' },
        updated_at: { type: 'softdate' },
      },
    },
  },
  get_dynamic_type: async (context) => {
    const customObject = context?.opts?.custom_object;

    if (!customObject) {
      return {
        type: 'hash',
        fields: {
          id: { type: 'string', desc: 'The unique identifier for the record' },
          name: { type: 'string', desc: 'The name of the record' },
          external_id: { type: 'string', desc: 'External identifier for the record' },
          created_at: { type: 'softdate', desc: 'When the record was created' },
          updated_at: { type: 'softdate', desc: 'When the record was last updated' },
        },
      };
    }

    return getZendeskFieldDynamicTypeFunction(customObject)(context);
  },
});

export default NewCustomObjectRecord;

type TFetchCustomObjectRecordsOptions = {
  token: string;
  url: string;
  customObjectKey: string;
};

const fetchLatestCustomObjectRecords = async (
  options: TFetchCustomObjectRecordsOptions
): Promise<TCustomObjectRecord[]> => {
  const { token, url, customObjectKey } = options;
  const limit = 20;

  try {
    const response = await zendeskApiClient<TZendeskCustomObjectSearchResponse>({
      path: `custom_objects/${customObjectKey}/records/search`,
      method: 'POST',
      token,
      url,
      params: {
        'page[size]': String(limit),
        sort: '-created_at',
      },
      body: {},
    });

    const records = response?.custom_object_records || [];

    return records.map((record) => ({
      ...record,
      ...(record.custom_object_fields || {}),
    }));
  } catch (error) {
    throw new ZendeskError(`Failed to fetch latest custom object records: ${error}`);
  }
};
