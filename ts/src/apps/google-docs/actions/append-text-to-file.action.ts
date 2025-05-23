import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';
import { createGoogleDocsClient } from '../helpers/constants';
import { getGoogleDocsDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';

const options = {
  document_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDocsDocumentIdAllowedValues,
  },
  text: {
    type: 'string',
    required: true,
  },
  insert_position: {
    type: 'string',
    required: false,
    default_value: 'end',
    allowed_values: [
      {
        display_name: 'End of Document',
        value: 'end',
      },
      {
        display_name: 'Beginning of Document',
        value: 'beginning',
      },
      {
        display_name: 'Specific Index',
        value: 'index',
      },
    ],
  },
  index: {
    type: 'integer',
    required: false,
  },
  add_line_break: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
  text_style: {
    type: {
      type: 'hash',
      fields: {
        bold: {
          type: 'boolean',
          required: false,
        },
        italic: {
          type: 'boolean',
          required: false,
        },
        underline: {
          type: 'boolean',
          required: false,
        },
        font_size: {
          type: 'integer',
          required: false,
        },
        font_family: {
          type: 'string',
          required: false,
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
    revision_id: {
      type: 'string',
    },
    inserted_text: {
      type: 'string',
    },
    insert_index: {
      type: 'integer',
    },
    success: {
      type: 'boolean',
    },
    message: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

export const appendTextToGoogleDocsDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'append_text_to_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type,
  api_function: async (data, _opts, context) => {
    const { token, document_id, text } = getQoreContextRequiredValues({
      context: { ...context, opts: data },
      optionFields: ['document_id', 'text'],
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    const insert_position = data?.insert_position;
    const index = data?.index;
    const add_line_break = data?.add_line_break;
    const text_style = data?.text_style;

    try {
      const docsClient = createGoogleDocsClient(token);

      const documentResponse = await docsClient.documents.get({
        documentId: document_id,
      });

      if (!documentResponse.data) {
        throw new GoogleDocsError('Failed to retrieve document information');
      }

      const document = documentResponse.data;
      const bodyContent = document.body?.content;

      if (!bodyContent) {
        throw new GoogleDocsError('Document has no content body');
      }

      let insertIndex: number;

      if (insert_position === 'beginning') {
        insertIndex = 1;
      } else if (insert_position === 'index' && typeof index === 'number') {
        insertIndex = Math.max(1, index);
      } else {
        let endIndex = 1;
        for (const element of bodyContent) {
          if (element.endIndex && element.endIndex > endIndex) {
            endIndex = element.endIndex;
          }
        }
        insertIndex = endIndex - 1;
      }

      let textToInsert = text;
      if (add_line_break && insert_position !== 'beginning') {
        textToInsert = '\n' + text;
      } else if (add_line_break && insert_position === 'beginning') {
        textToInsert = text + '\n';
      }

      const requests: any[] = [];

      requests.push({
        insertText: {
          location: {
            index: insertIndex,
          },
          text: textToInsert,
        },
      });

      if (text_style && Object.keys(text_style).length > 0) {
        const textStyleRequest: any = {
          updateTextStyle: {
            range: {
              startIndex: insertIndex,
              endIndex: insertIndex + textToInsert.length,
            },
            textStyle: {},
            fields: '',
          },
        };

        const styleFields: string[] = [];

        if (text_style.bold !== undefined) {
          textStyleRequest.updateTextStyle.textStyle.bold = text_style.bold;
          styleFields.push('bold');
        }

        if (text_style.italic !== undefined) {
          textStyleRequest.updateTextStyle.textStyle.italic = text_style.italic;
          styleFields.push('italic');
        }

        if (text_style.underline !== undefined) {
          textStyleRequest.updateTextStyle.textStyle.underline = text_style.underline;
          styleFields.push('underline');
        }

        if (text_style.font_size !== undefined) {
          textStyleRequest.updateTextStyle.textStyle.fontSize = {
            magnitude: text_style.font_size,
            unit: 'PT',
          };
          styleFields.push('fontSize');
        }

        if (text_style.font_family) {
          textStyleRequest.updateTextStyle.textStyle.weightedFontFamily = {
            fontFamily: text_style.font_family,
          };
          styleFields.push('weightedFontFamily');
        }

        if (styleFields.length > 0) {
          textStyleRequest.updateTextStyle.fields = styleFields.join(',');
          requests.push(textStyleRequest);
        }
      }

      const updateResponse = await docsClient.documents.batchUpdate({
        documentId: document_id,
        requestBody: {
          requests,
        },
      });

      return {
        document_id,
        revision_id: updateResponse.data.documentId || document_id,
        inserted_text: textToInsert,
        insert_index: insertIndex,
        success: true,
        message: `Successfully appended text to document ${document_id}`,
      };
    } catch (error: any) {
      if (error instanceof GoogleDocsError) {
        throw error;
      }

      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        throw new GoogleDocsError(
          `Google Docs API error: ${apiError.message || 'Unknown error'} (Code: ${apiError.code || 'unknown'})`
        );
      }

      throw new GoogleDocsError(
        `Failed to append text to document: ${error.message || 'Unknown error'}`
      );
    }
  },
});

export default appendTextToGoogleDocsDocument;
