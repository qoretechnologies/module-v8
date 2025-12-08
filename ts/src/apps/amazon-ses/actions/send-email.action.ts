import { SendEmailCommand } from '@aws-sdk/client-ses';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SES_APP_NAME, AmazonSESError } from '../constants';
import { createSESClient, isValidEmail, parseEmailList } from '../helpers/constants';
import { getAmazonSESVerifiedEmailAllowedValues } from '../helpers/get-verified-email-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  from_email: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonSESVerifiedEmailAllowedValues,
    depends_on: ['region'],
  },
  to_emails: {
    required: true,
    type: 'string',
  },
  cc_emails: {
    required: false,
    type: 'string',
  },
  bcc_emails: {
    required: false,
    type: 'string',
  },
  reply_to_addresses: {
    required: false,
    type: 'string',
  },
  subject: {
    required: true,
    type: 'string',
  },
  body_text: {
    required_groups: ['send_email'],
    type: 'string',
  },
  body_html: {
    required_groups: ['send_email'],
    type: 'string',
  },
  charset: {
    required: false,
    type: 'string',
    default_value: 'UTF-8',
    allowed_values: [
      { value: 'UTF-8', display_name: 'UTF-8' },
      { value: 'ISO-8859-1', display_name: 'ISO-8859-1' },
      { value: 'US-ASCII', display_name: 'US-ASCII' },
    ],
  },
  return_path: {
    required: false,
    type: 'string',
  },
  configuration_set: {
    required: false,
    type: 'string',
  },
  tags: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: { type: 'string', required: true },
          value: { type: 'string', required: true },
        },
      },
    },
  },
} satisfies TQoreOptions;

const sendEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SES_APP_NAME,
  action: 'send_email',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, from_email, to_emails, subject } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['from_email', 'to_emails', 'subject'],
        ErrorClass: AmazonSESError,
      });

    const {
      cc_emails,
      bcc_emails,
      reply_to_addresses,
      body_text,
      body_html,
      charset,
      return_path,
      configuration_set,
      tags,
    } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    if (!body_text && !body_html) {
      throw new AmazonSESError('Either body_text or body_html must be provided');
    }

    if (!isValidEmail(from_email)) {
      throw new AmazonSESError('Invalid from_email address format');
    }

    const toEmailList = parseEmailList(to_emails);
    if (toEmailList.length === 0) {
      throw new AmazonSESError('At least one valid email address must be provided in to_emails');
    }

    try {
      const sesClient = createSESClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const destination: any = {
        ToAddresses: toEmailList,
      };

      if (cc_emails) {
        const ccEmailList = parseEmailList(cc_emails);
        if (ccEmailList.length > 0) {
          destination.CcAddresses = ccEmailList;
        }
      }

      if (bcc_emails) {
        const bccEmailList = parseEmailList(bcc_emails);
        if (bccEmailList.length > 0) {
          destination.BccAddresses = bccEmailList;
        }
      }

      const message: any = {
        Subject: {
          Data: subject,
          Charset: charset || 'UTF-8',
        },
        Body: {},
      };

      if (body_text) {
        message.Body.Text = {
          Data: body_text,
          Charset: charset || 'UTF-8',
        };
      }

      if (body_html) {
        message.Body.Html = {
          Data: body_html,
          Charset: charset || 'UTF-8',
        };
      }

      const sendParams: any = {
        Source: from_email,
        Destination: destination,
        Message: message,
      };

      if (reply_to_addresses) {
        const replyToList = parseEmailList(reply_to_addresses);
        if (replyToList.length > 0) {
          sendParams.ReplyToAddresses = replyToList;
        }
      }

      if (return_path) {
        sendParams.ReturnPath = return_path;
      }

      if (configuration_set) {
        sendParams.ConfigurationSetName = configuration_set;
      }

      if (tags && tags.length > 0) {
        sendParams.Tags = tags.map((tag) => ({
          Name: tag.name,
          Value: tag.value,
        }));
      }

      const command = new SendEmailCommand(sendParams);
      const response = await sesClient.send(command);

      return {
        message_id: response.MessageId || '',
        from_email,
        to_emails: toEmailList,
        cc_emails: cc_emails ? parseEmailList(cc_emails) : [],
        bcc_emails: bcc_emails ? parseEmailList(bcc_emails) : [],
        subject,
        body_text: body_text || '',
        body_html: body_html || '',
        charset: charset || 'UTF-8',
        reply_to_addresses: reply_to_addresses ? parseEmailList(reply_to_addresses) : [],
        return_path: return_path || '',
        configuration_set: configuration_set || '',
        tags: tags || [],
        sent_at: new Date().toISOString(),
        region: region || 'us-east-1',
        success: true,
      };
    } catch (error) {
      throw new AmazonSESError(`Failed to send email: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'string' },
      from_email: { type: 'string' },
      to_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      cc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      bcc_emails: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      subject: { type: 'string' },
      body_text: { type: 'string' },
      body_html: { type: 'string' },
      charset: { type: 'string' },
      reply_to_addresses: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      return_path: { type: 'string' },
      configuration_set: { type: 'string' },
      tags: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
      sent_at: { type: 'string' },
      region: { type: 'string' },
      success: { type: 'bool' },
    },
  },
});

export default sendEmail;
