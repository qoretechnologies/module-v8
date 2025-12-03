import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftDocumentAllowedValues } from '../helpers/get-document-allowed-values';

const action = 'insert_block';

const options = {
  markdown: {
    required: true,
    type: 'string',
  },
  position: {
    required: true,
    type: {
      type: 'hash',
      fields: {
        position: {
          required: true,
          type: 'string',
          allowed_values: [
            { value: 'start', display_name: 'Start' },
            { value: 'end', display_name: 'End' },
          ],
        },
        pageId: {
          required: true,
          type: 'string',
          get_allowed_values: getCraftDocumentAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

type TInsertBlockRequest = {
  markdown: string;
  position?: {
    position: string;
    pageId?: string;
  };
};

type TInsertBlockResponse = {
  items: Array<{
    id: string;
    [key: string]: any;
  }>;
};

const InsertBlock = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, markdown, position } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['markdown', 'position'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    const requestBody: TInsertBlockRequest = {
      markdown,
      position,
    };

    try {
      const response = await craftApiClient<TInsertBlockResponse>({
        url,
        token,
        method: 'POST',
        path: 'blocks',
        body: requestBody,
      });

      const item = response.items?.[0];

      return item;
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      textStyle: { type: 'string' },
      textAlignment: { type: 'string' },
      font: { type: 'string' },
      cardLayout: { type: 'string' },
      markdown: { type: 'string' },
      indentationLevel: { type: 'number' },
      listStyle: { type: 'string' },
      decorations: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      color: { type: 'string' },
      taskInfo: {
        type: {
          type: 'hash',
          fields: {
            state: { type: 'string' },
            scheduleDate: { type: 'string' },
            deadlineDate: { type: 'string' },
          },
        },
      },
      metadata: {
        type: {
          type: 'hash',
          fields: {
            lastModifiedAt: { type: 'string' },
            createdAt: { type: 'string' },
            lastModifiedBy: { type: 'string' },
            createdBy: { type: 'string' },
            comments: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    author: { type: 'string' },
                    content: { type: 'string' },
                    createdAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default InsertBlock;
