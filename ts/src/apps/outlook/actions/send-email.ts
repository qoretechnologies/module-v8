import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookRecipientsAllowedValues } from '../helpers/get-recepient-allowed-values';

const options = {
  toRecipients: {
    required: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getOutlookRecipientsAllowedValues,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          emailAddress: {
            type: {
              type: 'hash',
              fields: {
                address: {
                  type: 'string',
                  required: true,
                },
                name: {
                  type: 'string',
                  required: false,
                },
              },
            },
          },
        },
      },
    },
  },
  ccRecipients: {
    required: false,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getOutlookRecipientsAllowedValues,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          emailAddress: {
            type: {
              type: 'hash',
              fields: {
                address: {
                  type: 'string',
                  required: true,
                },
                name: {
                  type: 'string',
                  required: false,
                },
              },
            },
          },
        },
      },
    },
  },
  bccRecipients: {
    required: false,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getOutlookRecipientsAllowedValues,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          emailAddress: {
            type: {
              type: 'hash',
              fields: {
                address: {
                  type: 'string',
                  required: true,
                },
                name: {
                  type: 'string',
                  required: false,
                },
              },
            },
          },
        },
      },
    },
  },
  subject: {
    type: 'string',
    required: true,
  },
  body: {
    type: 'string',
    required: true,
  },
  bodyContentType: {
    type: 'string',
    required: false,
    default_value: 'Text',
    allowed_values: [
      { display_name: 'Plain Text', value: 'Text' },
      { display_name: 'HTML', value: 'HTML' },
    ],
  },
  saveToSentItems: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SendOutlookEmail = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'send-email',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const toRecipients = data?.toRecipients as
      | Array<{
          emailAddress: { address: string; name?: string };
        }>
      | undefined;
    const ccRecipients = data?.ccRecipients;
    const bccRecipients = data?.bccRecipients;
    const subject = data?.subject;
    const body = data?.body;
    const bodyContentType = data?.bodyContentType || 'Text';
    const saveToSentItems = data?.saveToSentItems !== false;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!toRecipients || !toRecipients.length) missingValues.push('toRecipients');
    if (!subject) missingValues.push('subject');
    if (!body) missingValues.push('body');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to send Outlook email`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const emailMessage = {
      message: {
        subject,
        body: {
          contentType: bodyContentType,
          content: body,
        },
        toRecipients,
        ccRecipients,
        bccRecipients,
      },
      saveToSentItems,
    };

    try {
      await client.api('/me/sendMail').post(emailMessage);

      return {
        success: true,
        message: `Email with subject "${subject}" has been sent successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to send Outlook email: ${error.message}`);
    }
  },
  options,
  response_type,
});
