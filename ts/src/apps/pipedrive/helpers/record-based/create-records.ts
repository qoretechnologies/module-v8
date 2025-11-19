import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  delay,
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { extractPipedriveError, PipedriveError } from '../../constants';
import { pipedriveApiClient } from '../client';
import { isPipedriveCustomField } from '../constants';
import { omit, pick } from 'lodash';
import { Debugger } from '../../../../utils/Debugger';

export const createPipedriveRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  const table = opts?.table;
  const recordsArray = mapColumnFormatToObject(records);

  if (!table) {
    throw new PipedriveError('The table is required to create Pipedrive records');
  }

  const record = recordsArray[0];

  const customFields = Object.keys(record).filter((key) => isPipedriveCustomField(key));

  try {
    const responses: Record<string, any>[] = [];

    for (const record of recordsArray) {
      try {
        const response = await pipedriveApiClient<Record<string, any>>({
          token,
          method: 'POST',
          body: { ...omit(record, customFields), custom_fields: pick(record, customFields) },
          object: 'data',
          path: table,
        });
        responses.push(response);
      } catch (error) {
        if (!responses.length) {
          throw error;
        } else {
          Debugger.log(`Failed to create record for Pipedrive: ${extractPipedriveError(error)}`);
          responses.push({});
        }
      } finally {
        await delay(300);
      }
    }

    const formattedRecords = responses.map((data) => ({
      ...omit(data, 'custom_fields'),
      ...data.custom_fields,
    }));

    return mapObjectToColumnFormat(formattedRecords);
  } catch (error) {
    if (error instanceof PipedriveError) {
      throw error;
    }

    throw new PipedriveError(`Failed to create Pipedrive records: ${extractPipedriveError(error)}`);
  }
};
