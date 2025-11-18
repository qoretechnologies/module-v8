import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedriveOrganizationRequiredFields = ['name'];

export const PipedriveOrganizationFields = {
  name: { type: 'string', required: true, desc: 'The name of the organization' },
  owner_id: { type: 'int', desc: 'The ID of the user who owns the organization' },
  add_time: { type: 'string', desc: 'The creation date and time of the organization' },
  update_time: { type: 'string', desc: 'The last updated date and time of the organization' },
  visible_to: { type: 'int', desc: 'The visibility of the organization' },
  label_ids: { type: 'list', desc: 'The IDs of labels assigned to the organization' },
  address: { type: 'hash', desc: 'The address of the organization' },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveOrganizationRecordType: TQoreGetDynamicTypeFunction = async (
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
      predefinedFields: PipedriveOrganizationFields,
      pathToObjectFields: '/organizationFields',
      requiredFields: PipedriveOrganizationRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(
      `Failed to get Pipedrive organization record type: ${error.message || error}`
    );
  }
};
