import { Client } from '@microsoft/microsoft-graph-client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { OutlookAttachmentMimeTypeAllowedValues } from '../helpers/get-attachment-mime-type-allowed-values';
import { getOutlookMailFoldersAllowedValues } from '../helpers/get-email-folder-allowed-values';
import { OutlookEmailSortFieldAllowedValues } from '../helpers/get-email-sort-field-allowed-values';
import { getOutlookEmailAllowedValues } from '../helpers/get-outlook-email-allowed-values';
import {
  buildOutlookEmailFilter,
  fetchOutlookAttachmentContent,
  fetchOutlookAttachments,
  fetchOutlookEmails,
  filterOutlookEmails,
  filterOutlookEmailsByAttachments,
} from '../helpers/search-emails.helpers';
import { OutlookSearchEmailResponseType } from './response-types/search-email.response-type';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
  startDateTime: {
    type: 'date',
    required: false,
  },
  endDateTime: {
    type: 'date',
    required: false,
  },
  fromSender: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getOutlookEmailAllowedValues,
  },
  toRecipient: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getOutlookEmailAllowedValues,
  },
  subject: {
    type: 'string',
    required: false,
  },
  hasAttachments: {
    type: 'boolean',
    required: false,
  },
  isRead: {
    type: 'boolean',
    required: false,
  },
  attachmentNames: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  attachmentFilenamePattern: {
    type: 'string',
    required: false,
  },
  attachmentMimeTypes: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    element_allowed_values: OutlookAttachmentMimeTypeAllowedValues,
    required: false,
  },
  attachmentMinSize: {
    type: 'number',
    required: false,
  },
  attachmentMaxSize: {
    type: 'number',
    required: false,
  },
  bodyContains: {
    type: 'string',
    required: false,
  },
  includeAttachments: {
    type: 'boolean',
    required: false,
    default_value: false,
  },
  folder: {
    type: 'string',
    required: false,
    default_value: 'inbox',
    allowed_values_creatable: true,
    get_allowed_values: getOutlookMailFoldersAllowedValues,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: OutlookEmailSortFieldAllowedValues,
        },
        order: {
          type: 'string',
          required: true,
          allowed_values: [
            { display_name: 'Ascending', value: 'asc' },
            { display_name: 'Descending', value: 'desc' },
          ],
          default_value: 'desc',
        },
      },
    },
  },
} satisfies TQoreOptions;

const SearchOutlookEmails = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'search-emails',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('Token is required to search Outlook emails');
    }

    const searchOptions = {
      limit: data?.limit || 50,
      startDateTime: data?.startDateTime,
      endDateTime: data?.endDateTime,
      fromSender: data?.fromSender,
      toRecipient: data?.toRecipient,
      subject: data?.subject,
      hasAttachments: data?.hasAttachments,
      isRead: data?.isRead,
      attachmentNames: data?.attachmentNames,
      attachmentFilenamePattern: data?.attachmentFilenamePattern,
      attachmentMimeTypes: data?.attachmentMimeTypes,
      attachmentMinSize: data?.attachmentMinSize,
      attachmentMaxSize: data?.attachmentMaxSize,
      bodyContains: data?.bodyContains,
      includeAttachments: data?.includeAttachments || false,
      folder: data?.folder || 'inbox',
      sort: data?.sort,
    };

    const hasAttachmentFilters = !!(
      searchOptions.attachmentNames?.length ||
      searchOptions.attachmentFilenamePattern ||
      searchOptions.attachmentMimeTypes?.length ||
      searchOptions.attachmentMinSize !== undefined ||
      searchOptions.attachmentMaxSize !== undefined
    );

    const needAttachments = hasAttachmentFilters || searchOptions.includeAttachments;

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token),
      },
    });

    const filter = buildOutlookEmailFilter({
      startDateTime: searchOptions.startDateTime,
      endDateTime: searchOptions.endDateTime,
      subject: searchOptions.subject,
      hasAttachments: searchOptions.hasAttachments,
      isRead: searchOptions.isRead,
    });

    let folderPath = '/me/messages';
    if (searchOptions.folder && searchOptions.folder !== 'all') {
      folderPath = `/me/mailFolders/${searchOptions.folder}/messages`;
    }

    const selectFields = [
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
      'from',
      'toRecipients',
      'ccRecipients',
      'bccRecipients',
      'webLink',
    ];

    if (searchOptions.bodyContains) {
      selectFields.push('body');
    }

    try {
      let emails = await fetchOutlookEmails(client, {
        folderPath,
        selectFields,
        filter,
        sort: searchOptions.sort,
        limit: searchOptions.limit,
      });

      emails = filterOutlookEmails(emails, {
        fromSender: searchOptions.fromSender,
        toRecipient: searchOptions.toRecipient,
        bodyContains: searchOptions.bodyContains,
      });

      if (needAttachments && emails.length > 0) {
        emails = await fetchOutlookAttachments(client, emails);

        if (hasAttachmentFilters) {
          emails = filterOutlookEmailsByAttachments(emails, {
            attachmentNames: searchOptions.attachmentNames,
            attachmentFilenamePattern: searchOptions.attachmentFilenamePattern,
            attachmentMimeTypes: searchOptions.attachmentMimeTypes,
            attachmentMinSize: searchOptions.attachmentMinSize,
            attachmentMaxSize: searchOptions.attachmentMaxSize,
          });
        }

        if (searchOptions.includeAttachments) {
          emails = await fetchOutlookAttachmentContent(client, emails);
        }
      }

      return emails.slice(0, searchOptions.limit);
    } catch (error) {
      throw new Error(`Failed to search Outlook emails: ${error.message}`);
    }
  },
  options,
  response_type: OutlookSearchEmailResponseType,
});

export default SearchOutlookEmails;
