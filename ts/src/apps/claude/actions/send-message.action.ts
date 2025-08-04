import { MessageParam, Model } from '@anthropic-ai/sdk/resources/messages/messages';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CLAUDE_APP_NAME, ClaudeError } from '../constants';
import { createClaudeClient } from '../helpers/constants';
import { getClaudeModelAllowedValues } from '../helpers/get-model-allowed-values';

const action = 'send_message';

const options = {
  model: {
    type: 'string',
    required: true,
    get_allowed_values: getClaudeModelAllowedValues,
  },
  message: {
    type: 'string',
    required: true,
  },
  system: {
    type: 'string',
    required: false,
    preselected: true,
  },
  max_tokens: {
    type: 'number',
    required: false,
    preselected: true,
    default_value: 1000,
  },
  temperature: {
    type: 'number',
    required: false,
  },
  top_k: {
    type: 'number',
    required: false,
  },
  top_p: {
    type: 'number',
    required: false,
  },
  file: {
    type: 'file',
    required: false,
  },
} satisfies TQoreOptions;

const textMimeTypes = ['application/pdf'];
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const allowedMimeTypes = [...imageMimeTypes, ...textMimeTypes];

const sendMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLAUDE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, model, message } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'message'],
      ErrorClass: ClaudeError,
    });

    const client = createClaudeClient(token);

    const { max_tokens = 1000, system, temperature, top_k, top_p, file } = obj || {};

    if (file && !allowedMimeTypes.includes(file.mime_type)) {
      throw new ClaudeError(
        `Invalid file type: ${file.mime_type}, allowed types are ${allowedMimeTypes.join(', ')}`
      );
    }
    const content = [
      {
        type: 'text' as const,
        text: message,
      },
      ...(file
        ? [
            {
              type: textMimeTypes.includes(file.mime_type)
                ? ('document' as const)
                : ('image' as const),
              source: {
                data: file.content,
                media_type: file.mime_type as any,
                type: 'base64' as const,
              },
            },
          ]
        : []),
    ] satisfies MessageParam['content'];

    try {
      const response = await client.messages.create({
        model: model as Model,
        max_tokens,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        ...(system && { system }),
        ...(temperature !== undefined && { temperature }),
        ...(top_k !== undefined && { top_k }),
        ...(top_p !== undefined && { top_p }),
      });

      return response;
    } catch (error) {
      throw new ClaudeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      type: { type: 'string' },
      role: { type: 'string' },
      model: { type: 'string' },
      content: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              text: { type: 'string' },
            },
          },
        },
      },
      stop_reason: { type: 'string' },
      stop_sequence: { type: 'string' },
      usage: {
        type: {
          type: 'hash',
          fields: {
            input_tokens: { type: 'integer' },
            cache_creation_input_tokens: { type: 'integer' },
            cache_read_input_tokens: { type: 'integer' },
            output_tokens: { type: 'integer' },
            service_tier: { type: 'string' },
          },
        },
      },
    },
  },
});

export default sendMessage;
