import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { GoogleDocsError } from '../constants';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  owners: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  webViewLink: string;
}

const mapGoogleDocsFileToAllowedValue = (file: GoogleDriveFile): IQoreAllowedValue<string> => {
  const ownerInfo = file.owners?.[0]
    ? `${file.owners[0].displayName} (${file.owners[0].emailAddress})`
    : 'Unknown owner';

  const modifiedDate = file.modifiedTime
    ? new Date(file.modifiedTime).toLocaleDateString()
    : 'Unknown date';

  return {
    display_name: file.name || 'Untitled Document',
    value: file.id,
    desc:
      `Document ID: ${file.id}\n` +
      `Owner: ${ownerInfo}\n` +
      `Last Modified: ${modifiedDate}\n` +
      `Type: Google Docs Document`,
    ...(file.webViewLink && {
      short_desc: `Last modified: ${modifiedDate} | Owner: ${file.owners?.[0]?.displayName || 'Unknown'}`,
    }),
  };
};

export const getGoogleDocsDocumentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleDocsError('Authentication token is required to fetch Google Docs documents');
  }

  try {
    const allowedValues: IQoreAllowedValue<string>[] = [];
    let pageToken: string | undefined | null;
    const maxResults = 1000;
    let totalFetched = 0;

    do {
      const client = createGoogleDriveClient(token);

      const response = await client.files.list({
        q: "mimeType='application/vnd.google-apps.document' and trashed=false",
        fields: '*',
        pageSize: maxResults,
      });

      const responseData = response?.data;

      if (!responseData?.files) {
        break;
      }

      const docsFiles = responseData.files.filter(
        (file) => file.mimeType === 'application/vnd.google-apps.document'
      );

      allowedValues.push(...docsFiles.map(mapGoogleDocsFileToAllowedValue));

      pageToken = responseData.nextPageToken;
      totalFetched += docsFiles.length;

      if (totalFetched >= maxResults) {
        break;
      }
    } while (pageToken);

    return allowedValues;
  } catch (error: any) {
    throw new GoogleDocsError(
      `Failed to fetch Google Docs documents: ${error.message || `Unknown error: ${error}`}`
    );
  }
};
