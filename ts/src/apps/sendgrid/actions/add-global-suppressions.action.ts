import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';

const action = 'add_global_suppressions';

const options = {
  emails: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    recipient_emails: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;

interface ISendGridGlobalSuppressionResponse {
  recipient_emails: string[];
}

const addSendGridGlobalSuppressions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, emails } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['emails'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    if (!emails || emails.length === 0) {
      throw new SendGridError('At least one email address must be provided');
    }

    try {
      const [response] = await client.request({
        url: '/v3/asm/suppressions/global',
        method: 'POST',
        body: {
          recipient_emails: emails,
        },
      });

      const data = response.body as ISendGridGlobalSuppressionResponse;

      return {
        success: true,
        recipient_emails: data.recipient_emails || emails,
      };
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addSendGridGlobalSuppressions;
