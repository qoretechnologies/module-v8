import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getSegmentEmailsAllowedValues } from '../helpers';

const action = 'send_email_to_segment';

const options = {
  email: {
    type: 'number',
    required: true,
    get_allowed_values: getSegmentEmailsAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    emailId: { type: 'number' },
    messagesSent: { type: 'number' },
  },
} satisfies TQoreResponseType;

const sendEmailToSegment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['email'],
      ErrorClass: MauticError,
    });

    try {
      const response = await mauticClient.post<{ success?: number; sentCount?: number }>(
        `emails/${email}/send`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        emailId: email,
        messagesSent: response?.sentCount || response?.success || 0,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default sendEmailToSegment;
