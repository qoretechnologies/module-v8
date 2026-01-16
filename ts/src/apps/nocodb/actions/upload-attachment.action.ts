import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fromV3Response, nocodbClient, NocoDBV3Record } from '../client';
import { NOCODB_APP_NAME, NocoDBError } from '../constants';
import { getNocoDBAttachmentFieldAllowedValues } from '../helpers/get-attachment-field-allowed-values';
import { getNocoDBBaseAllowedValues } from '../helpers/get-base-allowed-values';
import { getNocoDBRecordAllowedValues } from '../helpers/get-record-allowed-values';
import { getNocoDBTableIdAllowedValues } from '../helpers/get-table-allowed-values';
import { getNocoDBTableColumnsResponseType } from '../helpers/get-table-columns';
import { getNocoDBWorkspaceAllowedValues } from '../helpers/get-workspace-allowed-values';

const action = 'upload_attachment';

type TQoreFile = {
  name: string;
  mime_type: string;
  content: string; // Base64 encoded
};

const options = {
  workspaceId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBWorkspaceAllowedValues,
    on_change: ['refetch'],
  },
  baseId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBBaseAllowedValues,
    on_change: ['refetch'],
  },
  table: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBTableIdAllowedValues,
    on_change: ['refetch'],
  },
  recordId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBRecordAllowedValues,
  },
  attachmentField: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBAttachmentFieldAllowedValues,
  },
  file: {
    type: 'file',
    required: true,
  },
} satisfies TQoreOptions;

const UploadAttachment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOCODB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      fields: { type: 'any' },
    },
  },
  get_dynamic_response_type: getNocoDBTableColumnsResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, url, baseId, table, recordId, attachmentField, file } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token', 'url'],
        optionFields: ['baseId', 'table', 'recordId', 'attachmentField', 'file'],
        ErrorClass: NocoDBError,
      });

    const typedFile = file as TQoreFile;

    try {
      // v3 API endpoint: POST /api/v3/data/{baseId}/{tableId}/records/{recordId}/fields/{fieldId}/upload
      // Request body: { contentType, file (base64), filename }
      const response = await nocodbClient.post<NocoDBV3Record>(
        `data/${baseId}/${table}/records/${recordId}/fields/${attachmentField}/upload`,
        {
          contentType: typedFile.mime_type,
          file: typedFile.content,
          filename: typedFile.name,
        },
        {
          token,
          connectionOptions: { url },
        }
      );

      // Transform v3 response format
      if (response) {
        const [flattened] = fromV3Response([response]);
        return flattened;
      }

      return { id: recordId, fields: {} };
    } catch (error) {
      if (error instanceof NocoDBError) {
        throw error;
      }
      throw new NocoDBError(
        `Failed to upload attachment: ${error instanceof Error ? error.message : error}`
      );
    }
  },
});

export default UploadAttachment;
