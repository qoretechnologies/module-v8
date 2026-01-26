import { IQoreAllowedValue, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

export const HuggingFaceModelFieldsAllowedValues = [
  { value: 'author', display_name: 'Author' },
  { value: 'baseModels', display_name: 'Base Models' },
  { value: 'cardData', display_name: 'Card Data' },
  { value: 'config', display_name: 'Config' },
  { value: 'createdAt', display_name: 'Created At' },
  { value: 'disabled', display_name: 'Disabled' },
  { value: 'downloadsAllTime', display_name: 'Downloads All Time' },
  { value: 'inference', display_name: 'Inference' },
  { value: 'inferenceProviderMapping', display_name: 'Inference Provider Mapping' },
  { value: 'library_name', display_name: 'Library Name' },
  { value: 'mask_token', display_name: 'Mask Token' },
  { value: 'model-index', display_name: 'Model Index' },
  { value: 'safetensors', display_name: 'SafeTensors' },
  { value: 'sha', display_name: 'SHA' },
  { value: 'siblings', display_name: 'Siblings' },
  { value: 'spaces', display_name: 'Spaces' },
  { value: 'tags', display_name: 'Tags' },
  { value: 'transformersInfo', display_name: 'Transformers Info' },
  { value: 'trendingScore', display_name: 'Trending Score' },
  { value: 'widgetData', display_name: 'Widget Data' },
  { value: 'gguf', display_name: 'GGUF' },
  { value: 'resourceGroup', display_name: 'Resource Group' },
  { value: 'xetEnabled', display_name: 'Xet Enabled' },
] satisfies IQoreAllowedValue<string>[];

export const HuggingFaceModelFieldsResponseType = {
  author: { type: 'string' },
  cardData: {
    type: {
      type: 'hash',
      fields: {
        license: { type: 'string' },
        language: { type: { type: 'list', element_type: 'string' } },
        pipeline_tag: { type: 'string' },
        library_name: { type: 'string' },
      },
    },
  },
  config: {
    type: {
      type: 'hash',
      fields: {
        architectures: { type: { type: 'list', element_type: 'string' } },
        model_type: { type: 'string' },
        tokenizer_config: { type: 'hash' },
        chat_template_jinja: { type: 'string' },
      },
    },
  },
  createdAt: { type: 'string' },
  disabled: { type: 'bool' },
  downloadsAllTime: { type: 'integer' },
  inferenceProviderMapping: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          _id: { type: 'string' },
          provider: { type: 'string' },
          providerId: { type: 'string' },
          status: { type: 'string' },
          task: { type: 'string' },
          features: {
            type: {
              type: 'hash',
              fields: {
                structuredOutput: { type: 'bool' },
                toolCalling: { type: 'bool' },
              },
            },
          },
          providerDetails: {
            type: {
              type: 'hash',
              fields: {
                context_length: { type: 'integer' },
                pricing: {
                  type: {
                    type: 'hash',
                    fields: {
                      input: { type: 'number' },
                      output: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
          type: { type: 'string' },
          hfModelId: { type: 'string' },
        },
      },
    },
  },
  library_name: { type: 'string' },
  'model-index': { type: 'string' },
  safetensors: {
    type: {
      type: 'hash',
      fields: {
        parameters: { type: 'hash' },
        total: { type: 'integer' },
      },
    },
  },
  sha: { type: 'string' },
  siblings: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          rfilename: { type: 'string' },
        },
      },
    },
  },
  tags: { type: { type: 'list', element_type: 'string' } },
  transformersInfo: {
    type: {
      type: 'hash',
      fields: {
        auto_model: { type: 'string' },
        pipeline_tag: { type: 'string' },
        processor: { type: 'string' },
      },
    },
  },
  trendingScore: { type: 'integer' },
  widgetData: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          text: { type: 'string' },
        },
      },
    },
  },
  xetEnabled: { type: 'bool' },
} satisfies Record<string, TQoreAppActionOption>;
