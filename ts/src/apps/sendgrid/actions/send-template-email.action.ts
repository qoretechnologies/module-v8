import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridSenderAllowedValues } from '../helpers/get-sender-allowed-values';
import { getSendGridTemplateAllowedValues } from '../helpers/get-template-allowed-values';

const action = 'send_template_email';

type TSendgridTemplate = {
  versions: {
    id: string;
    active: number;
    plain_content: string;
  }[];
};

const getTemplateValues: TQoreGetDynamicTypeFunction = async (context) => {
  const { templateId, token } = getQoreContextRequiredValues({
    context,
    optionFields: ['templateId'],
    connectionFields: ['token'],
    ErrorClass: SendGridError,
  });

  const client = createSendGridClient(token);
  try {
    const [response] = await client.request({
      url: `/v3/templates/${templateId}`,
      method: 'GET',
    });

    const template = response.body as TSendgridTemplate;
    const version = template.versions.find((v) => v.active === 1);

    if (!version?.plain_content) {
      return {
        type: 'hash',
      };
    }

    const regex = /\{\{\{?\s*([^{}\s]+)\s*\}?\}\}/g;
    const fields = [...version.plain_content.matchAll(regex)].map((m) => m[1]);

    const fieldsOptions: TQoreOptions = {};

    fields.forEach((field) => {
      fieldsOptions[field] = {
        type: 'any',
        required: false,
      };
    });

    return {
      type: 'hash',
      options: fieldsOptions,
    };
  } catch (error) {
    throw new SendGridError(`Failed to fetch template values: ${error.message || error}`);
  }
};

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
  templateId: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridTemplateAllowedValues,
    on_change: ['refetch'],
  },
  values: {
    type: 'hash',
    required: false,
    preselected: true,
    depends_on: ['templateId'],
    get_dynamic_type: getTemplateValues,
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

interface IEmailAddress {
  email: string;
  name?: string;
}

interface IPersonalization {
  to: IEmailAddress[];
  cc?: IEmailAddress[];
  bcc?: IEmailAddress[];
  dynamic_template_data?: Record<string, any>;
}

interface ISendGridMailRequest {
  personalizations: IPersonalization[];
  from: IEmailAddress;
  reply_to?: IEmailAddress;
  template_id: string;
}

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    statusCode: { type: 'integer' },
    messageId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const sendSendGridTemplateEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, toEmail, fromEmail, templateId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['toEmail', 'fromEmail', 'templateId'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    const { toName, fromName, replyToEmail, replyToName, ccEmails, bccEmails, values } = obj || {};

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

      if (values && Object.keys(values).length > 0) {
        personalization['dynamic_template_data'] = values;
      }

      const mailRequest: ISendGridMailRequest = {
        personalizations: [personalization],
        from: { email: fromEmail, ...(fromName && { name: fromName }) },
        template_id: templateId,
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
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default sendSendGridTemplateEmail;
