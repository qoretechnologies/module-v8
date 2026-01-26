import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticSegmentsAllowedValues, getMauticContactsAllowedValues } from '../helpers';

const action = 'add_contact_to_segment';

const options = {
  segment: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticSegmentsAllowedValues,
  },
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    segmentId: { type: 'number' },
    contactId: { type: 'number' },
  },
} satisfies TQoreResponseType;

const addContactToSegment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, segment, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['segment', 'contact'],
      ErrorClass: MauticError,
    });

    try {
      await mauticClient.post(
        `segments/${segment}/contact/${contact}/add`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        segmentId: segment,
        contactId: contact,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default addContactToSegment;
