import { docs_v1 } from '@googleapis/docs';
import { drive_v3 } from '@googleapis/drive';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../../google-drive/helpers/get-folder-id-allowed-values';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';
import { createGoogleDocsClient } from '../helpers/constants';
import { exportGoogleDocsDocument } from '../helpers/export-document.helper';
import { googleDocsExportFormatAllowedValues } from '../helpers/export-format-allowed-values';
import { getGoogleDocsDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';
import {
  getGoogleDocsPlaceholdersWithIndex,
  getGoogleDocsTemplatePlaceholderAllowedValues,
} from '../helpers/get-template-placeholders';

interface Replacement {
  placeholder: string;
  replacement_text: string;
  match_case?: boolean;
}

interface Image {
  placeholder: string;
  image_url: string;
  width?: number;
  height?: number;
}

interface ProcessedImage extends Image {
  index?: number;
}

const DEFAULT_IMAGE_SIZE = 200;
const BATCH_SIZE = 50;

const options = {
  template_id: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getGoogleDocsDocumentIdAllowedValues,
  },
  new_document_name: {
    type: 'string',
    required: true,
  },
  destination_folder_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  replacements: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          placeholder: {
            type: 'string',
            get_allowed_values: getGoogleDocsTemplatePlaceholderAllowedValues,
            allowed_values_creatable: true,
            required: true,
          },
          replacement_text: {
            type: 'string',
            required: true,
          },
          match_case: {
            type: 'bool',
            required: false,
            default_value: false,
          },
        },
      },
    },
    required: false,
  },
  remove_unused_fields: {
    required: true,
    default_value: true,
    type: 'bool',
  },
  share_with_template_collaborators: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  export_format: {
    type: 'string',
    required: false,
    allowed_values: googleDocsExportFormatAllowedValues,
  },
  images: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          placeholder: {
            type: 'string',
            get_allowed_values: getGoogleDocsTemplatePlaceholderAllowedValues,
            allowed_values_creatable: true,
            required: true,
          },
          image_url: {
            type: 'string',
            required: true,
          },
          width: {
            type: 'number',
            required: false,
            default_value: DEFAULT_IMAGE_SIZE,
          },
          height: {
            type: 'number',
            required: false,
            default_value: DEFAULT_IMAGE_SIZE,
          },
        },
      },
    },
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    document_id: {
      type: 'string',
    },
    document_name: {
      type: 'string',
    },
    document_url: {
      type: 'string',
    },
    template_id: {
      type: 'string',
    },
    replacements_made: {
      type: 'integer',
    },
    created_at: {
      type: 'string',
    },
    success: {
      type: 'bool',
    },
    message: {
      type: 'string',
    },
    exported_file: {
      type: {
        type: 'hash',
        fields: {
          file_id: {
            type: 'string',
          },
          file_name: {
            type: 'string',
          },
          file_url: {
            type: 'string',
          },
          format: {
            type: 'string',
          },
        },
      },
    },
    images_inserted: {
      type: 'integer',
    },
  },
} satisfies TQoreResponseType;

export const createDocumentFromTemplate = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'create_document_from_template',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type,
  api_function: async (data, _opts, context) => {
    const { token, template_id, new_document_name, remove_unused_fields } =
      getQoreContextRequiredValues({
        context: { ...context, opts: data },
        optionFields: ['template_id', 'new_document_name', 'remove_unused_fields'],
        connectionFields: ['token'],
        ErrorClass: GoogleDocsError,
      });

    const destination_folder_id = data?.destination_folder_id;
    const replacements: Replacement[] = data?.replacements || [];
    const export_format = data?.export_format;
    const share_with_template_collaborators = data?.share_with_template_collaborators ?? false;
    const images: Image[] = data?.images || [];

    try {
      const docsClient = createGoogleDocsClient(token);
      const driveClient = createGoogleDriveClient(token);

      const [templateResponse] = await Promise.all([
        docsClient.documents.get({ documentId: template_id }),
      ]);

      const template = templateResponse.data;
      if (!template.body?.content) {
        throw new GoogleDocsError('Template document has no content');
      }

      const templatePlaceholders = getGoogleDocsPlaceholdersWithIndex(template.body.content);
      const usedPlaceholderNames = new Set([
        ...replacements.map((r) => r.placeholder),
        ...images.map((i) => i.placeholder),
      ]);

      const unusedPlaceholders = templatePlaceholders.filter(
        (p) => !usedPlaceholderNames.has(p.placeholder)
      );

      const processedImages: ProcessedImage[] = images
        .map((image) => ({
          ...image,
          index: templatePlaceholders.find((p) => p.placeholder === image.placeholder)?.index,
        }))
        .filter((image) => image.index)
        .sort((a, b) => b.index! - a.index!);

      const copyRequestBody: drive_v3.Schema$File = {
        name: new_document_name,
      };

      if (destination_folder_id) {
        copyRequestBody.parents = [destination_folder_id];
      }

      const copyResponse = await driveClient.files.copy({
        fileId: template_id,
        requestBody: copyRequestBody,
        fields: 'id,name,webViewLink,createdTime',
      });

      if (!copyResponse.data.id) {
        throw new GoogleDocsError('Failed to copy template document');
      }

      const newDocumentId = copyResponse.data.id;
      const newDocumentUrl =
        copyResponse.data.webViewLink || `https://docs.google.com/document/d/${newDocumentId}/edit`;
      const createdAt = copyResponse.data.createdTime || new Date().toISOString();

      const replaceRequests = buildReplaceRequests(
        replacements,
        processedImages,
        unusedPlaceholders,
        remove_unused_fields
      );

      let replacementsMade = 0;
      const imagesInserted = processedImages.length;

      if (replaceRequests?.length && replaceRequests.length > 0) {
        const chunks = [];
        for (let i = 0; i < replaceRequests.length; i += BATCH_SIZE) {
          chunks.push(replaceRequests.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of chunks) {
          const batchUpdateResponse = await docsClient.documents.batchUpdate({
            documentId: newDocumentId,
            requestBody: {
              requests: chunk,
            },
          });

          if (batchUpdateResponse.data.replies) {
            replacementsMade += batchUpdateResponse.data.replies
              .filter((reply) => reply.replaceAllText)
              .reduce((count, reply) => count + (reply.replaceAllText?.occurrencesChanged || 0), 0);
          }
        }
      }

      const parallelOperations: Promise<any>[] = [];

      let exportedFile = null;
      if (export_format) {
        parallelOperations.push(
          exportGoogleDocsDocument(
            driveClient,
            newDocumentId,
            new_document_name,
            export_format,
            destination_folder_id
          )
            .then((result) => {
              exportedFile = result;
            })
            .catch((error) => {
              console.error('Export failed:', error);
            })
        );
      }

      let shareResults: { email: string; success: boolean }[] = [];
      if (share_with_template_collaborators) {
        parallelOperations.push(
          shareWithCollaborators(driveClient, template_id, newDocumentId)
            .then((results) => {
              shareResults = results;
            })
            .catch((error) => {
              console.error('Sharing failed:', error);
            })
        );
      }

      if (parallelOperations.length > 0) {
        await Promise.allSettled(parallelOperations);
      }

      const messageParts = [
        `Successfully created document "${new_document_name}" from template`,
        `with ${replacementsMade} replacements`,
      ];

      if (imagesInserted > 0) {
        messageParts.push(`and ${imagesInserted} images inserted`);
      }

      if (exportedFile) {
        messageParts.push(`and exported as ${export_format}`);
      }

      if (shareResults) {
        const successCount = shareResults.filter((r) => r.success).length;
        if (successCount > 0) {
          messageParts.push(`and shared with ${successCount} collaborators`);
        }
      }

      return {
        document_id: newDocumentId,
        document_name: new_document_name,
        document_url: newDocumentUrl,
        template_id,
        replacements_made: replacementsMade,
        images_inserted: imagesInserted,
        created_at: createdAt,
        success: true,
        message: messageParts.join(' '),
        ...(exportedFile ? { exported_file: exportedFile } : {}),
      };
    } catch (error: any) {
      if (error instanceof GoogleDocsError) {
        throw error;
      }

      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        throw new GoogleDocsError(
          `Google API error: ${apiError.message || 'Unknown error'} (Code: ${apiError.code || 'unknown'})`
        );
      }

      throw new GoogleDocsError(
        `Failed to create document from template: ${error.message || 'Unknown error'}`
      );
    }
  },
});

const buildReplaceRequests = (
  replacements: Replacement[],
  images: ProcessedImage[],
  unusedPlaceholders: Array<{ placeholder: string }>,
  removeUnused: boolean
): docs_v1.Schema$BatchUpdateDocumentRequest['requests'] => {
  const requests: docs_v1.Schema$BatchUpdateDocumentRequest['requests'] = [];

  for (const image of images) {
    if (!image.index) continue;

    requests.push({
      replaceAllText: {
        containsText: {
          text: image.placeholder,
          matchCase: false,
        },
        replaceText: '',
      },
    });

    requests.push({
      insertInlineImage: {
        location: {
          index: image.index,
        },
        uri: image.image_url,
        objectSize: {
          height: {
            magnitude: image.height || DEFAULT_IMAGE_SIZE,
            unit: 'PT',
          },
          width: {
            magnitude: image.width || DEFAULT_IMAGE_SIZE,
            unit: 'PT',
          },
        },
      },
    });
  }

  for (const replacement of replacements) {
    if (!replacement.placeholder || !replacement.replacement_text) {
      continue;
    }

    requests.push({
      replaceAllText: {
        containsText: {
          text: replacement.placeholder,
          matchCase: replacement.match_case || false,
        },
        replaceText: replacement.replacement_text,
      },
    });
  }

  if (removeUnused && unusedPlaceholders.length > 0) {
    for (const placeholder of unusedPlaceholders) {
      requests.push({
        replaceAllText: {
          containsText: {
            text: placeholder.placeholder,
            matchCase: false,
          },
          replaceText: '',
        },
      });
    }
  }

  return requests;
};

const shareWithCollaborators = async (
  driveClient: drive_v3.Drive,
  templateId: string,
  newDocumentId: string
) => {
  try {
    const permissionsResponse = await driveClient.permissions.list({
      fileId: templateId,
      fields: 'permissions(emailAddress,role,type)',
    });

    const permissions = permissionsResponse.data.permissions || [];
    const shareResults = [];

    for (const permission of permissions) {
      if (permission.type === 'user' && permission.emailAddress && permission.role !== 'owner') {
        try {
          await driveClient.permissions.create({
            fileId: newDocumentId,
            requestBody: {
              type: 'user',
              role: permission.role,
              emailAddress: permission.emailAddress,
            },
          });
          shareResults.push({ email: permission.emailAddress, success: true });
        } catch (error) {
          console.error(`Error sharing with ${permission.emailAddress}:`, error);
          shareResults.push({ email: permission.emailAddress, success: false });
        }
      }
    }

    return shareResults;
  } catch (error) {
    console.error('Error getting template permissions:', error);
    throw new GoogleDocsError(`Failed to retrieve template permissions: ${error.message}`);
  }
};

export default createDocumentFromTemplate;
