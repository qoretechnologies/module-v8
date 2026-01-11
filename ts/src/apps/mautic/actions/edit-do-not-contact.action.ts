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

const action = 'edit_do_not_contact';

const options = {
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
  channel: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'email', display_name: 'Email' },
      { value: 'sms', display_name: 'SMS' },
    ],
  },
  operation: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'add', display_name: 'Add to DNC List' },
      { value: 'remove', display_name: 'Remove from DNC List' },
    ],
  },
  reason: {
    type: 'number',
    required: false,
    allowed_values: [
      { value: 1, display_name: 'Unsubscribed' },
      { value: 2, display_name: 'Bounced' },
      { value: 3, display_name: 'Manual' },
    ],
  },
  comments: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    contactId: { type: 'number' },
    channel: { type: 'string' },
    operation: { type: 'string' },
  },
} satisfies TQoreResponseType;

const editDoNotContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, contact, channel, operation } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['contact', 'channel', 'operation'],
      ErrorClass: MauticError,
    });

    const { reason, comments } = obj || {};

    try {
      const endpoint =
        operation === 'add'
          ? `contacts/${contact}/dnc/${channel}/add`
          : `contacts/${contact}/dnc/${channel}/remove`;

      await mauticClient.post(
        endpoint,
        {
          ...(reason && { reason }),
          ...(comments && { comments }),
        },
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        contactId: contact,
        channel,
        operation,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default editDoNotContact;
