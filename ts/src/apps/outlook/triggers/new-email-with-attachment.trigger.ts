import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { Message } from '@microsoft/microsoft-graph-types';
import { getOutlookMailFoldersAllowedValues } from '../helpers/get-email-folder-allowed-values';
import { OutlookAttachmentMimeTypeAllowedValues } from '../helpers/get-attachment-mime-type-allowed-values';
import { getOutlookEmailAllowedValues } from '../helpers/get-outlook-email-allowed-values';

const options = {
  senderFilter: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getOutlookEmailAllowedValues,
  },
  subjectFilter: {
    type: 'string',
    required: false,
  },
  filenameFilters: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  mimeTypeFilters: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: OutlookAttachmentMimeTypeAllowedValues,
    element_allowed_values_creatable: true,
    required: false,
  },
  action: {
    type: 'string',
    required: false,
    on_change: ['refetch'],
    allowed_values: [
      { display_name: 'None', value: 'none' },
      { display_name: 'Delete Email', value: 'delete' },
      { display_name: 'Move Email', value: 'move' },
    ],
    default_value: 'none',
    get_dependent_options: (context) => {
      const action = context?.opts?.action;

      return action === 'move' ? targetFolderOption : ({} as TQoreOptions);
    },
  },
} satisfies TQoreOptions;

const targetFolderOption = {
  targetFolderId: {
    type: 'string',
    required: true,
    get_allowed_values: getOutlookMailFoldersAllowedValues,
  },
} satisfies TQoreOptions;

const OutlookEmailAttachmentTrigger = QoreAppCreator.createLocalizedTrigger<
  typeof options & Partial<typeof targetFolderOption>
>({
  app: OUTLOOK_APP_NAME,
  action: 'new-email-with-attachment',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const senderFilter = context.opts?.senderFilter;
    const subjectFilter = context.opts?.subjectFilter;
    const filenameFilters = context.opts?.filenameFilters as string[] | undefined;
    const mimeTypeFilters = context.opts?.mimeTypeFilters as string[] | undefined;
    const action = context.opts?.action || 'none';
    const targetFolderId = context.opts?.targetFolderId;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (action === 'move' && !targetFolderId) missingValues.push('targetFolderId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')}` +
          `are required to start the new email attachment Outlook trigger`
      );
    }

    const customUpdate = async (email: Message) => {
      if (!email.hasAttachments) {
        return;
      }

      if (senderFilter && email.from?.emailAddress?.address !== senderFilter) {
        return;
      }

      if (subjectFilter && !email.subject?.includes(subjectFilter)) {
        return;
      }

      const attachments = await fetchEmailAttachments(token!, email.id!);

      if (!attachments || attachments.length === 0) {
        return;
      }

      const matchingAttachments = attachments.filter(
        (attachment: { name: string; contentType: string }) => {
          const filenameMatch =
            !filenameFilters?.length ||
            filenameFilters.some((filter) =>
              attachment.name?.toLowerCase().includes(filter.toLowerCase())
            );

          const mimeTypeMatch =
            !mimeTypeFilters?.length ||
            mimeTypeFilters.some((filter) =>
              attachment.contentType?.toLowerCase().includes(filter.toLowerCase())
            );

          return filenameMatch && mimeTypeMatch;
        }
      );

      for (const attachment of matchingAttachments) {
        const emailWithAttachment = {
          ...email,
          attachment,
        };

        update(emailWithAttachment);
      }

      if (matchingAttachments.length > 0) {
        if (action === 'delete') {
          await deleteEmail(token!, email.id!);
        } else if (action === 'move' && targetFolderId) {
          await moveEmail(token!, email.id!, targetFolderId);
        }
      }
    };

    const getItems = () => {
      return getLastOutlookEmails(token!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'outlook_new_email_with_attachment',
      uniqueField: 'id',
      getItems,
      update: customUpdate,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('The token is required to get the new email attachment example data');
    }

    const emails = await getLastOutlookEmails(token);

    const emailWithAttachments = emails.find((email) => email.hasAttachments);

    if (!emailWithAttachments) {
      return null;
    }

    const attachments = await fetchEmailAttachments(token, emailWithAttachments.id!);

    if (attachments && attachments.length > 0) {
      return {
        ...emailWithAttachments,
        attachment: attachments[0],
      };
    }

    return emailWithAttachments;
  },
  event_info: {
    desc: 'Outlook New Email With Attachment Trigger Event Info',
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
        attachment: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              contentType: { type: 'string' },
              size: { type: 'number' },
              contentBytes: { type: 'string' },
            },
          },
        },
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
      .filter('hasAttachments eq true')
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .get();

    return response.value as Message[];
  } catch (error) {
    throw new Error(`Failed to fetch Outlook emails with attachments: ${error.message}`);
  }
};

const fetchEmailAttachments = async (token: string, emailId: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    const response = await client.api(`/me/messages/${emailId}/attachments`).get();

    return response.value;
  } catch (error) {
    throw new Error(`Failed to fetch email attachments: ${error.message}`);
  }
};

const deleteEmail = async (token: string, emailId: string): Promise<void> => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    await client.api(`/me/messages/${emailId}`).delete();
  } catch (error) {
    throw new Error(`Failed to delete email: ${error.message}`);
  }
};

const moveEmail = async (token: string, emailId: string, targetFolderId: string): Promise<void> => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    await client.api(`/me/messages/${emailId}/move`).post({
      destinationId: targetFolderId,
    });
  } catch (error) {
    throw new Error(`Failed to move email: ${error.message}`);
  }
};

export default OutlookEmailAttachmentTrigger;
