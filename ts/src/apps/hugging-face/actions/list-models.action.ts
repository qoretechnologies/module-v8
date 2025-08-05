import * as hub from '@huggingface/hub';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HUGGING_FACE_APP_NAME, HuggingFaceError } from '../constants';
import {
  HuggingFaceModelFieldsAllowedValues,
  HuggingFaceModelFieldsResponseType,
} from '../helpers/get-model-fields-allowed-values';
import { HuggingFaceTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'list_models';

const options = {
  tags: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  inferenceProviders: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  owner: {
    type: 'string',
    required: false,
  },
  query: {
    type: 'string',
    required: false,
  },
  task: {
    type: 'string',
    required: false,
    allowed_values: HuggingFaceTaskAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 10,
  },
  additionalFields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: HuggingFaceModelFieldsAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      private: { type: 'boolean' },
      task: { type: 'string' },
      downloads: { type: 'integer' },
      gated: { type: 'boolean' },
      likes: { type: 'integer' },
      updatedAt: { type: 'string' },
    },
  },
} satisfies TQoreResponseType;

const listModels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HUGGING_FACE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: HuggingFaceError,
    });

    const { inferenceProviders, owner, query, tags, limit = 20 } = obj || {};
    const task = obj?.task as hub.PipelineType;
    const additionalFields = obj?.additionalFields as Exclude<
      (typeof hub.MODEL_EXPANDABLE_KEYS)[number],
      (typeof hub.MODEL_EXPAND_KEYS)[number]
    >[];

    try {
      const models: hub.ModelEntry[] = [];

      for await (const model of hub.listModels({
        accessToken: token,
        limit,
        ...(additionalFields && { additionalFields }),
        search: {
          ...(inferenceProviders && { inferenceProviders }),
          ...(owner && { owner }),
          ...(query && { query }),
          ...(task && { task }),
          ...(tags && { tags }),
        },
      })) {
        models.push(model);
      }

      return models;
    } catch (error) {
      throw new HuggingFaceError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  get_dynamic_response_type: (context) => {
    const additionalFields = context?.opts
      ?.additionalFields as (keyof typeof HuggingFaceModelFieldsResponseType)[];

    if (!additionalFields?.length) return response_type;

    const fields: Record<string, TQoreAppActionOption> = {};

    for (const field of additionalFields) {
      if (field in HuggingFaceModelFieldsResponseType) {
        fields[field] = HuggingFaceModelFieldsResponseType[field];
      }
    }

    const responseType: TQoreResponseType = {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...fields,
          ...response_type.element_type.fields,
        },
      },
    };

    return responseType;
  },
  response_type,
});

export default listModels;
