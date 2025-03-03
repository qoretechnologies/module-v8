import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { Message } from '@microsoft/microsoft-graph-types';

const OutlookNewEmailTrigger = QoreAppCreator.createLocalizedTrigger({
  app: OUTLOOK_APP_NAME,
  action: 'new-email',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new email Outlook trigger`
      );
    }

    const getItems = () => {
      return getLastOutlookEmails(token!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'outlook_new_email',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('The token is required to get the new email example data');
    }

    const emails = await getLastOutlookEmails(token);

    return emails?.length > 0 ? emails[0] : null;
  },
  event_info: {
    desc: 'Outlook New Email Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdDateTime: { type: 'string' },
        lastModifiedDateTime: { type: 'string' },
        receivedDateTime: { type: 'string' },
        sentDateTime: { type: 'string' },
        subject: { type: 'string' },
        bodyPreview: { type: 'string' },
        importance: { type: 'string' },
        hasAttachments: { type: 'boolean' },
        isRead: { type: 'boolean' },
        isDraft: { type: 'boolean' },
        body: {
          type: {
            type: 'hash',
            fields: {
              contentType: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
        from: {
          type: {
            type: 'hash',
            fields: {
              emailAddress: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        toRecipients: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                emailAddress: {
                  type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      address: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        ccRecipients: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                emailAddress: {
                  type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      address: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        bccRecipients: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                emailAddress: {
                  type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      address: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        webLink: { type: 'string' },
      },
    },
  },
});

const getLastOutlookEmails = async (token: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  try {
    const response: PageCollection = await client
      .api('/me/messages')
      .select(
        [
          'id',
          'createdDateTime',
          'lastModifiedDateTime',
          'receivedDateTime',
          'sentDateTime',
          'subject',
          'bodyPreview',
          'importance',
          'hasAttachments',
          'isRead',
          'isDraft',
          'body',
          'from',
          'toRecipients',
          'ccRecipients',
          'bccRecipients',
          'webLink',
        ].join(',')
      )
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .orderby('receivedDateTime desc')
      .get();

    return response.value as Message[];
  } catch (error) {
    throw new Error(`Failed to fetch Outlook emails: ${error.message}`);
  }
};

export default OutlookNewEmailTrigger;
