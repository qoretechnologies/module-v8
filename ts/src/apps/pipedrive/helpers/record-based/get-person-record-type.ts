import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedrivePersonRequiredFields = ['name'];

export const PipedrivePersonFields = {
  name: { type: 'string', required: true, desc: 'The name of the person' },
  owner_id: { type: 'int', desc: 'The ID of the user who owns the person' },
  org_id: { type: 'int', desc: 'The ID of the organization linked to the person' },
  add_time: { type: 'string', desc: 'The creation date and time of the person' },
  update_time: { type: 'string', desc: 'The last updated date and time of the person' },
  emails: { type: 'list', desc: 'The emails of the person' },
  phones: { type: 'list', desc: 'The phones of the person' },
  visible_to: { type: 'int', desc: 'The visibility of the person' },
  label_ids: { type: 'list', desc: 'The IDs of labels assigned to the person' },
  marketing_status: {
    type: 'string',
    desc: 'The marketing status of the person',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedrivePersonRecordType: TQoreGetDynamicTypeFunction = async (
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
      predefinedFields: PipedrivePersonFields,
      pathToObjectFields: '/personFields',
      requiredFields: PipedrivePersonRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(
      `Failed to get Pipedrive person record type: ${error.message || error}`
    );
  }
};
