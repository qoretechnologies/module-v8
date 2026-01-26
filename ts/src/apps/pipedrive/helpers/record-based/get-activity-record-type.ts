import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedriveActivityRequiredFields = ['subject'];

export const PipedriveActivityFields = {
  subject: { type: 'string', required: true, desc: 'The subject of the activity' },
  type: { type: 'string', desc: 'The type of the activity' },
  owner_id: { type: 'int', desc: 'The ID of the user who owns the activity' },
  deal_id: { type: 'int', desc: 'The ID of the deal linked to the activity' },
  lead_id: { type: 'string', desc: 'The ID of the lead linked to the activity' },
  person_id: { type: 'int', desc: 'The ID of the person linked to the activity' },
  org_id: { type: 'int', desc: 'The ID of the organization linked to the activity' },
  project_id: { type: 'int', desc: 'The ID of the project linked to the activity' },
  due_date: { type: 'string', desc: 'The due date of the activity' },
  due_time: { type: 'string', desc: 'The due time of the activity' },
  duration: { type: 'string', desc: 'The duration of the activity' },
  busy: {
    type: 'bool',
    desc: 'Whether the activity marks the assignee as busy or not in their calendar',
  },
  done: { type: 'bool', desc: 'Whether the activity is marked as done or not' },
  location: { type: 'hash', desc: 'Location of the activity' },
  participants: { type: 'list', desc: 'The participants of the activity' },
  attendees: { type: 'list', desc: 'The attendees of the activity' },
  public_description: { type: 'string', desc: 'The public description of the activity' },
  priority: {
    type: 'int',
    desc: 'The priority of the activity. Mappable to a specific string using activityFields API.',
  },
  note: { type: 'string', desc: 'Note for the activity' },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveActivityRecordType: TQoreGetDynamicTypeFunction = async (
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
      predefinedFields: PipedriveActivityFields,
      pathToObjectFields: '/activityFields',
      requiredFields: PipedriveActivityRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(
      `Failed to get Pipedrive activity record type: ${error.message || error}`
    );
  }
};
