import { Client, PageCollection } from '@microsoft/microsoft-graph-client';

export const fetchOutlookEmails = async (
  client: Client,
  options: {
    folderPath: string;
    selectFields: string[];
    filter?: string;
    sort?: { field: string; order: string };
    limit: number;
  }
): Promise<any[]> => {
  let allEmails: any[] = [];
  let nextLink: string | undefined = undefined;
  const pageSize = 50;

  let request = client.api(options.folderPath).select(options.selectFields.join(',')).top(pageSize);

  if (options.sort) {
    const sortField = options.sort.field;
    const sortOrder = options.sort.order || 'desc';
    request = request.orderby(`${sortField} ${sortOrder}`);
  }

  if (options.filter) {
    request = request.filter(options.filter);
  }

  let response: PageCollection = await request.get();

  allEmails = allEmails.concat(response.value);
  nextLink = response['@odata.nextLink'];

  while (allEmails.length < options.limit && nextLink) {
    try {
      response = await client.api(nextLink).get();
      allEmails = allEmails.concat(response.value);
      nextLink = response['@odata.nextLink'];
    } catch (error) {
      console.error('Error during pagination:', error);
      break;
    }
  }

  return allEmails.slice(0, options.limit);
};

export const fetchOutlookAttachments = async (client: Client, emails: any[]): Promise<any[]> => {
  const emailsWithAttachments = emails.filter((email) => email.hasAttachments);

  await Promise.all(
    emailsWithAttachments.map(async (email) => {
      try {
        const attachmentsResponse = await client.api(`/me/messages/${email.id}/attachments`).get();
        email.attachments = attachmentsResponse.value;
      } catch (error) {
        console.error(`Error fetching attachments for email ${email.id}:`, error);
        email.attachments = [];
      }
    })
  );

  return emails;
};

export const fetchOutlookAttachmentContent = async (
  client: Client,
  emails: any[]
): Promise<any[]> => {
  const attachmentContentPromises = [];

  for (const email of emails) {
    if (email.hasAttachments && email.attachments && email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        if (!attachment.contentBytes) {
          attachmentContentPromises.push(
            client
              .api(`/me/messages/${email.id}/attachments/${attachment.id}`)
              .get()
              .then((response) => {
                Object.assign(attachment, response);
              })
              .catch((error) => {
                console.error(`Error fetching attachment content for ${attachment.id}:`, error);
              })
          );
        }
      }
    }
  }

  if (attachmentContentPromises.length > 0) {
    await Promise.all(attachmentContentPromises);
  }

  return emails;
};

export const buildOutlookEmailFilter = (options: {
  startDateTime?: Date;
  endDateTime?: Date;
  subject?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
}): string | undefined => {
  const filterConditions: string[] = [];

  if (options.startDateTime) {
    const start = new Date(options.startDateTime).toISOString();
    filterConditions.push(`receivedDateTime ge ${start}`);
  }

  if (options.endDateTime) {
    const end = new Date(options.endDateTime).toISOString();
    filterConditions.push(`receivedDateTime le ${end}`);
  }

  if (options.subject) {
    const escapedSubject = options.subject.replace(/'/g, "''");
    filterConditions.push(`contains(subject, '${escapedSubject}')`);
  }

  if (options.hasAttachments !== undefined) {
    filterConditions.push(`hasAttachments eq ${options.hasAttachments}`);
  }

  if (options.isRead !== undefined) {
    filterConditions.push(`isRead eq ${options.isRead}`);
  }

  return filterConditions.length > 0 ? filterConditions.join(' and ') : undefined;
};

export const filterOutlookEmails = (
  emails: any[],
  options: {
    fromSender?: string;
    toRecipient?: string;
    bodyContains?: string;
  }
): any[] => {
  return emails.filter((email) => {
    let matches = true;

    if (options.fromSender && matches) {
      matches =
        email.from?.emailAddress?.address?.toLowerCase() === options.fromSender.toLowerCase();
    }

    if (options.toRecipient && matches) {
      matches = email.toRecipients?.some(
        (recipient: { emailAddress: { address: string } }) =>
          recipient.emailAddress?.address?.toLowerCase() === options.toRecipient?.toLowerCase()
      );
    }

    if (options.bodyContains && matches) {
      matches = email.body?.content?.toLowerCase().includes(options.bodyContains.toLowerCase());
    }

    return matches;
  });
};

export const filterOutlookEmailsByAttachments = (
  emails: any[],
  options: {
    attachmentNames?: string[];
    attachmentFilenamePattern?: string;
    attachmentMimeTypes?: string[];
    attachmentMinSize?: number;
    attachmentMaxSize?: number;
  }
): any[] => {
  let filteredEmails = [...emails];

  if (options.attachmentNames?.length) {
    const attachmentNameSet = new Set(options.attachmentNames.map((name) => name.toLowerCase()));
    filteredEmails = filteredEmails.filter((email) => {
      if (!email.attachments || email.attachments.length === 0) return false;

      return email.attachments.some((attachment: { name: string }) =>
        attachmentNameSet.has(attachment.name.toLowerCase())
      );
    });
  }

  if (options.attachmentFilenamePattern) {
    try {
      const regex = new RegExp(options.attachmentFilenamePattern, 'i');
      filteredEmails = filteredEmails.filter((email) => {
        if (!email.attachments || email.attachments.length === 0) return false;

        return email.attachments.some((attachment: { name: string }) =>
          regex.test(attachment.name)
        );
      });
    } catch (error) {
      throw new Error(`Invalid regex pattern for attachment filename: ${error.message}`);
    }
  }

  if (options.attachmentMimeTypes?.length) {
    const mimeTypeSet = new Set(options.attachmentMimeTypes.map((type) => type.toLowerCase()));

    filteredEmails = filteredEmails.filter((email) => {
      if (!email.attachments || email.attachments.length === 0) return false;

      return email.attachments.some((attachment: { contentType: string }) =>
        mimeTypeSet.has((attachment.contentType || '').toLowerCase())
      );
    });
  }

  if (options.attachmentMinSize !== undefined || options.attachmentMaxSize !== undefined) {
    filteredEmails = filteredEmails.filter((email) => {
      if (!email.attachments || email.attachments.length === 0) return false;

      return email.attachments.some((attachment: { size: number }) => {
        const size = attachment.size;
        const meetsMinSize =
          options.attachmentMinSize === undefined || size >= options.attachmentMinSize;
        const meetsMaxSize =
          options.attachmentMaxSize === undefined || size <= options.attachmentMaxSize;

        return meetsMinSize && meetsMaxSize;
      });
    });
  }

  return filteredEmails;
};
