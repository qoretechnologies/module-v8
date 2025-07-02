import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from '../helpers/constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';
import { getAirtableRecordResponseType } from '../helpers/get-record-type';
import { getAirtableTableIdAllowedValues } from '../helpers/get-table-id-allowed-values';
import { getAirtableViewsAllowedValues } from '../helpers/get-view-id-allowed-values';

const AirtableNewRecordTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AIRTABLE_APP_NAME,
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    base_id: {
      type: 'string',
      required: true,
      get_allowed_values: getAirtableBaseIdAllowedValues,
    },
    table_id: {
      type: 'string',
      required: true,
      get_allowed_values: getAirtableTableIdAllowedValues,
    },
    view: {
      type: 'string',
      required: false,
      get_allowed_values: getAirtableViewsAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, base_id, table_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const view = context.opts?.view;

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const getItems = () => {
      return fetchLatestRecords(token, {
        baseId: base_id,
        tableId: table_id,
        lastPollTime,
        view,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'airtable_new_record',
      uniqueField: 'id',
      getItems,
      updateLastPollTime,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, base_id, table_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const view = context.opts?.view;

    const records = await fetchLatestRecords(token, {
      baseId: base_id,
      tableId: table_id,
      view,
    });

    return records?.length ? records[0] : null;
  },
  event_info: {
    desc: 'Airtable New Record Trigger Event Info',
    type: {
      type: 'hash',
    },
  },

  get_dynamic_type: async (context) => {
    const { base_id, table_id, token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const fieldsType = await getAirtableRecordResponseType({
      base_id,
      table_id,
      token,
    });

    return {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        fields: {
          type: fieldsType,
        },
      },
    };
  },
});

const fetchLatestRecords = async (
  token: string,
  options: {
    baseId: string;
    tableId: string;
    view?: string;
    lastPollTime?: string;
  }
) => {
  const pageSize = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  try {
    const client = createAirtableClient(token).base(options.baseId).table(options.tableId);

    const records: any[] = [];

    await client
      .select({
        ...(options.view && { view: options.view }),
        ...(options.lastPollTime && {
          filterByFormula: `CREATED_TIME() > "${options.lastPollTime}"`,
        }),
        maxRecords: pageSize,
        pageSize,
      })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords.map((record) => omit(record, ['_table', '_rawJson'])));
        fetchNextPage();
      });

    return records;
  } catch (error) {
    throw new AirtableError(`Failed to fetch latest records: ${error.message || error}`);
  }
};

export default AirtableNewRecordTrigger;
