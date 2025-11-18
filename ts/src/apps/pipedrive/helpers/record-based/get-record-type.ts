import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { extractPipedriveError, PipedriveError } from '../../constants';
import { TPipedriveTable } from './constants';
import { getPipedriveActivityRecordType } from './get-activity-record-type';
import { getPipedriveDealRecordType } from './get-deal-record-type';
import { getPipedriveLeadRecordType } from './get-lead-record-type';
import { getPipedriveNoteRecordType } from './get-note-record-type';
import { getPipedriveOrganizationRecordType } from './get-organization-record-type';
import { getPipedrivePersonRecordType } from './get-person-record-type';
import { getPipedriveProductRecordType } from './get-product-record-type';
import { getPipedriveTaskRecordType } from './get-task-record-type';

export const getPipedriveRecordType: TQoreGetRecordTypeFunction = async (
  context,
  tableName: TPipedriveTable
) => {
  try {
    switch (tableName) {
      case 'products':
        return (await getPipedriveProductRecordType(context)) as TQoreTypeObject;
      case 'organizations':
        return (await getPipedriveOrganizationRecordType(context)) as TQoreTypeObject;
      case 'deals':
        return (await getPipedriveDealRecordType(context)) as TQoreTypeObject;
      case 'persons':
        return (await getPipedrivePersonRecordType(context)) as TQoreTypeObject;
      case 'activities':
        return (await getPipedriveActivityRecordType(context)) as TQoreTypeObject;
      case 'leads':
        return (await getPipedriveLeadRecordType(context)) as TQoreTypeObject;
      case 'notes':
        return (await getPipedriveNoteRecordType(context)) as TQoreTypeObject;
      case 'tasks':
        return (await getPipedriveTaskRecordType(context)) as TQoreTypeObject;
      default:
        throw new PipedriveError(`Unknown table: ${tableName}`);
    }
  } catch (error) {
    if (error instanceof PipedriveError) {
      throw error;
    }
    throw new PipedriveError(
      `Failed to get Pipedrive record type for table ${tableName}: ${extractPipedriveError(error)}`
    );
  }
};
