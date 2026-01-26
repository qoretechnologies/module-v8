import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedriveDealRequiredFields = ['title'];

export const PipedriveDealFields = {
  title: { type: 'string', required: true, desc: 'The title of the deal' },
  owner_id: { type: 'int', desc: 'The ID of the user who owns the deal' },
  person_id: { type: 'int', desc: 'The ID of the person linked to the deal' },
  org_id: { type: 'int', desc: 'The ID of the organization linked to the deal' },
  pipeline_id: { type: 'int', desc: 'The ID of the pipeline associated with the deal' },
  stage_id: { type: 'int', desc: 'The ID of the deal stage' },
  value: { type: 'number', desc: 'The value of the deal' },
  currency: { type: 'string', desc: 'The currency associated with the deal' },
  is_deleted: { type: 'bool', desc: 'Whether the deal is deleted or not' },
  is_archived: { type: 'bool', desc: 'Whether the deal is archived or not' },
  archive_time: {
    type: 'string',
    desc: 'The optional date and time of archiving the deal in UTC. Format: YYYY-MM-DD HH:MM:SS. If omitted and is_archived is true, it will be set to the current date and time.',
  },
  status: { type: 'string', desc: 'The status of the deal' },
  probability: { type: 'number', desc: 'The success probability percentage of the deal' },
  lost_reason: {
    type: 'string',
    desc: 'The reason for losing the deal. Can only be set if deal status is lost.',
  },
  visible_to: { type: 'int', desc: 'The visibility of the deal' },
  close_time: {
    type: 'string',
    desc: 'The date and time of closing the deal. Can only be set if deal status is won or lost.',
  },
  won_time: {
    type: 'string',
    desc: 'The date and time of changing the deal status as won. Can only be set if deal status is won.',
  },
  lost_time: {
    type: 'string',
    desc: 'The date and time of changing the deal status as lost. Can only be set if deal status is lost.',
  },
  expected_close_date: { type: 'date', desc: 'The expected close date of the deal' },
  label_ids: { type: 'list', desc: 'Label IDs associated with the deal' },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveDealRecordType: TQoreGetDynamicTypeFunction = async (
  context
): Promise<TQoreTypeObject> => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  try {
    const qoreOptions = await mapPipedriveFieldsToQoreOptions({
      token,
      predefinedFields: PipedriveDealFields,
      pathToObjectFields: '/dealFields',
      requiredFields: PipedriveDealRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(`Failed to get Pipedrive deal record type: ${error.message || error}`);
  }
};
