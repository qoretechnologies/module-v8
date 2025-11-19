import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedriveNoteRequiredFields = ['content'];

export const PipedriveNoteFields = {
  content: {
    type: 'string',
    required: true,
    desc: 'The content of the note in HTML format. Subject to sanitization on the back-end.',
  },
  lead_id: {
    type: 'string',
    desc: 'The ID of the lead the note will be attached to. This property is required unless one of (deal_id/person_id/org_id/project_id) is specified.',
  },
  deal_id: {
    type: 'int',
    desc: 'The ID of the deal the note will be attached to. This property is required unless one of (lead_id/person_id/org_id/project_id) is specified.',
  },
  person_id: {
    type: 'int',
    desc: 'The ID of the person this note will be attached to. This property is required unless one of (deal_id/lead_id/org_id/project_id) is specified.',
  },
  org_id: {
    type: 'int',
    desc: 'The ID of the organization this note will be attached to. This property is required unless one of (deal_id/lead_id/person_id/project_id) is specified.',
  },
  project_id: {
    type: 'int',
    desc: 'The ID of the project the note will be attached to. This property is required unless one of (deal_id/lead_id/person_id/org_id) is specified.',
  },
  user_id: {
    type: 'int',
    desc: 'The ID of the user who will be marked as the author of the note. Only an admin can change the author.',
  },
  add_time: {
    type: 'string',
    desc: 'The optional creation date & time of the note in UTC. Can be set in the past or in the future. Format: YYYY-MM-DD HH:MM:SS',
  },
  pinned_to_lead_flag: {
    type: 'int',
    desc: 'If set, the results are filtered by note to lead pinning state (lead_id is also required). Values: 0 or 1',
  },
  pinned_to_deal_flag: {
    type: 'int',
    desc: 'If set, the results are filtered by note to deal pinning state (deal_id is also required). Values: 0 or 1',
  },
  pinned_to_organization_flag: {
    type: 'int',
    desc: 'If set, the results are filtered by note to organization pinning state (org_id is also required). Values: 0 or 1',
  },
  pinned_to_person_flag: {
    type: 'int',
    desc: 'If set, the results are filtered by note to person pinning state (person_id is also required). Values: 0 or 1',
  },
  pinned_to_project_flag: {
    type: 'int',
    desc: 'If set, the results are filtered by note to project pinning state (project_id is also required). Values: 0 or 1',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveNoteRecordType: TQoreGetDynamicTypeFunction = async (
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
      predefinedFields: PipedriveNoteFields,
      pathToObjectFields: '/noteFields',
      requiredFields: PipedriveNoteRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(`Failed to get Pipedrive note record type: ${error.message || error}`);
  }
};
