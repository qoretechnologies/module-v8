import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridSenderAllowedValues } from '../helpers/get-sender-allowed-values';

const action = 'send_email';

const options = {
  toEmail: {
    type: 'string',
    required: true,
  },
  toName: {
    type: 'string',
    required: false,
  },
  fromEmail: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridSenderAllowedValues,
  },
  fromName: {
    type: 'string',
    required: false,
  },
  subject: {
    type: 'string',
    required: true,
  },
  textContent: {
    type: 'string',
    required_groups: ['content'],
  },
  htmlContent: {
    type: 'string',
    required_groups: ['content'],
  },
  replyToEmail: {
    type: 'string',
    required: false,
  },
  replyToName: {
    type: 'string',
    required: false,
  },
  ccEmails: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  bccEmails: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    statusCode: { type: 'integer' },
    messageId: { type: 'string' },
  },
} satisfies TQoreResponseType;

interface IEmailAddress {
  email: string;
  name?: string;
}

interface IPersonalization {
  to: IEmailAddress[];
  cc?: IEmailAddress[];
  bcc?: IEmailAddress[];
}

interface ISendGridMailRequest {
  personalizations: IPersonalization[];
  from: IEmailAddress;
  reply_to?: IEmailAddress;
  subject: string;
  content: Array<{ type: string; value: string }>;
}

const sendSendGridEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, toEmail, fromEmail, subject } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['toEmail', 'fromEmail', 'subject'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    const {
      toName,
      fromName,
      textContent,
      htmlContent,
      replyToEmail,
      replyToName,
      ccEmails,
      bccEmails,
    } = obj || {};

    if (!textContent && !htmlContent) {
      throw new SendGridError('Either text content or HTML content must be provided');
    }

    try {
      const personalization: IPersonalization = {
        to: [{ email: toEmail, ...(toName && { name: toName }) }],
      };

      if (ccEmails && ccEmails.length > 0) {
        personalization.cc = ccEmails.map((email: string) => ({ email }));
      }

      if (bccEmails && bccEmails.length > 0) {
        personalization.bcc = bccEmails.map((email: string) => ({ email }));
      }

      const content: Array<{ type: string; value: string }> = [];

      if (textContent) {
        content.push({ type: 'text/plain', value: textContent });
      }

      if (htmlContent) {
        content.push({ type: 'text/html', value: htmlContent });
      }

      const mailRequest: ISendGridMailRequest = {
        personalizations: [personalization],
        from: { email: fromEmail, ...(fromName && { name: fromName }) },
        subject,
        content,
      };

      if (replyToEmail) {
        mailRequest.reply_to = { email: replyToEmail, ...(replyToName && { name: replyToName }) };
      }

      const [response] = await client.request({
        url: '/v3/mail/send',
        method: 'POST',
        body: mailRequest,
      });

      const messageId = response.headers?.['x-message-id'] || '';

      return {
        success: response.statusCode === 202,
        statusCode: response.statusCode,
        messageId,
      };
    } catch (error) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default sendSendGridEmail;
