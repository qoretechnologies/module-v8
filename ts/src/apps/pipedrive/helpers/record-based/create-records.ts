// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { extractPipedriveError, PipedriveError } from '../../constants';
import { pipedriveApiClient } from '../client';
import { pipedriveRecordBody, pipedriveTablePath } from './constants';
import { omit } from 'lodash';
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

  const path = pipedriveTablePath(table);

  try {
    const responses: Record<string, any>[] = [];

    for (const record of recordsArray) {
      try {
        const response = await pipedriveApiClient<Record<string, any>>({
          token,
          method: 'POST',
          body: pipedriveRecordBody(table, record),
          object: 'data',
          path,
        });
        responses.push(response);
      } catch (error) {
        if (!responses.length) {
          throw error;
        } else {
          Debugger.log(`Failed to create record for Pipedrive: ${extractPipedriveError(error)}`);
          responses.push({});
        }
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
