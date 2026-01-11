import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticContactsAllowedValues } from '../helpers';

const action = 'edit_contact_points';

const options = {
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
  operation: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'add', display_name: 'Add Points' },
      { value: 'subtract', display_name: 'Subtract Points' },
    ],
  },
  points: {
    type: 'number',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    modifiedPoints: { type: 'number' },
  },
} satisfies TQoreResponseType;

const editContactPoints = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, contact, operation, points } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['contact', 'operation', 'points'],
      ErrorClass: MauticError,
    });

    try {
      const modifier = operation === 'subtract' ? 'minus' : 'plus';
      await mauticClient.post(
        `contacts/${contact}/points/${modifier}/${points}`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        modifiedPoints: operation === 'subtract' ? -points : points,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default editContactPoints;
