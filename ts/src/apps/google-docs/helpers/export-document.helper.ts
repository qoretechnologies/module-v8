import { drive_v3 } from '@googleapis/drive';
import { Readable } from 'stream';
import { GoogleDocsError } from '../constants';
import { GOOGLE_DOCS_EXPORT_CONFIGS } from './export-format-allowed-values';

export const exportGoogleDocsDocument = async (
  driveClient: drive_v3.Drive,
  documentId: string,
  documentName: string,
  exportFormat: string,
  destinationFolderId?: string
) => {
  const config = GOOGLE_DOCS_EXPORT_CONFIGS[exportFormat];
  if (!config) {
    throw new GoogleDocsError(`Invalid export format: ${exportFormat}`);
  }

  const exportFileName = `${documentName}${config.extension}`;

  try {
    const exportResponse = await driveClient.files.export(
      {
        fileId: documentId,
        mimeType: config.mimeType,
      },
      { responseType: 'stream' }
    );

    const createResponse = await driveClient.files.create({
      requestBody: {
        name: exportFileName,
        parents: destinationFolderId ? [destinationFolderId] : undefined,
      },
      media: {
        mimeType: config.mimeType,
        body: Readable.from(exportResponse.data),
      },
      fields: 'id,name,webViewLink',
    });

    if (!createResponse.data.id) {
      throw new Error('Failed to create exported file');
    }

    return {
      file_id: createResponse.data.id,
      file_name: exportFileName,
      file_url:
        createResponse.data.webViewLink ||
        `https://drive.google.com/file/d/${createResponse.data.id}/view`,
      format: exportFormat,
    };
  } catch (error) {
    console.error('Error exporting file:', error);
    throw new GoogleDocsError(`Failed to export document as ${exportFormat}: ${error.message}`);
  }
};
