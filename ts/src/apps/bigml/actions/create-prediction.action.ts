import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { mapBigMlDatasetFieldsToQoreOptions } from '../helpers/get-dataset-fields';
import { getBigMlDeepnetAllowedValues } from '../helpers/get-deepnet-allowed-values';
import { getBigMlEnsembleAllowedValues } from '../helpers/get-ensemble-allowed-values';
import { getBigMlModelAllowedValues } from '../helpers/get-model-allowed-values';
import { getBigMlProjectAllowedValues } from '../helpers/get-project-id-allowed-values';

const action = 'create_prediction';

const options = {
  model: {
    type: 'string',
    required_groups: ['create_prediction'],
    get_allowed_values: getBigMlModelAllowedValues,
  },
  ensemble: {
    type: 'string',
    required_groups: ['create_prediction'],
    get_allowed_values: getBigMlEnsembleAllowedValues,
  },
  deepnet: {
    type: 'string',
    required_groups: ['create_prediction'],
    get_allowed_values: getBigMlDeepnetAllowedValues,
  },
  input_data: {
    type: 'hash',
    required: true,
    get_dynamic_type: async (context) => {
      try {
        const { token, username } = getQoreContextRequiredValues({
          context,
          connectionFields: ['token', 'username'],
          ErrorClass: BigMlError,
        });

        const resource = context?.opts?.model || context?.opts?.ensemble || context?.opts?.deepnet;

        const response = await bigMlApiClient<{
          dataset: string;
        }>({
          token,
          username,
          method: 'GET',
          path: resource,
        });

        if (!response.dataset) {
          throw new BigMlError(`Resource ${resource} does not have a dataset associated.`);
        }

        const fields = await mapBigMlDatasetFieldsToQoreOptions({
          token,
          username,
          dataset: response.dataset,
        });

        return {
          type: 'hash',
          fields,
        };
      } catch (error) {
        return 'hash';
      }
    },
  },
  name: {
    type: 'string',
    preselected: true,
  },
  description: {
    type: 'string',
    required: false,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  project: {
    type: 'string',
    required: false,
    get_allowed_values: getBigMlProjectAllowedValues,
  },
} satisfies TQoreOptions;

const createPrediction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username, input_data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      optionFields: ['input_data'],
      ErrorClass: BigMlError,
    });

    const { description, project, name, tags } = obj || {};
    const { model, ensemble, deepnet } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'POST',
        path: `prediction`,
        body: {
          input_data,
          ...(model && { model }),
          ...(ensemble && { ensemble }),
          ...(deepnet && { deepnet }),
          ...(name && { name }),
          ...(description && { description }),
          ...(project && { project }),
          ...(tags && { tags }),
        },
      });

      return response;
    } catch (error) {
      throw new BigMlError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      boosted_ensemble: { type: 'boolean' },
      category: { type: 'integer' },
      code: { type: 'integer' },
      combiner: { type: 'string' },
      confidence: { type: 'number' },
      confidence_bounds: { type: 'hash' },
      configuration: { type: 'string' },
      configuration_status: { type: 'boolean' },
      created: { type: 'string' },
      creator: { type: 'string' },
      dataset: { type: 'string' },
      dataset_status: { type: 'boolean' },
      description: { type: 'string' },
      ensemble: { type: 'string' },
      error_predictions: { type: 'integer' },
      expanded_input_data: { type: 'hash' },
      explanation: { type: 'string' },
      fields: { type: 'hash' },
      finished_predictions: { type: 'integer' },
      importance: { type: 'hash' },
      input_data: { type: 'hash' },
      locale: { type: 'string' },
      missing_strategy: { type: 'integer' },
      model: { type: 'string' },
      model_status: { type: 'boolean' },
      model_type: { type: 'integer' },
      models: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      name: { type: 'string' },
      name_options: { type: 'string' },
      number_of_models: { type: 'integer' },
      objective_field: { type: 'string' },
      objective_field_name: { type: 'string' },
      objective_field_type: { type: 'string' },
      objective_fields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      operating_kind: { type: 'string' },
      output: { type: 'number' },
      prediction: { type: 'hash' },
      predictions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              confidence: { type: 'number' },
              count: { type: 'integer' },
              distribution: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'list',
                    element_type: 'number',
                  },
                },
              },
              importance: { type: 'hash' },
              median: { type: 'number' },
              node_id: { type: 'integer' },
              order: { type: 'integer' },
              prediction: { type: 'number' },
              total_count: { type: 'integer' },
            },
          },
        },
      },
      private: { type: 'boolean' },
      project: { type: 'string' },
      query_string: { type: 'string' },
      resource: { type: 'string' },
      shared: { type: 'boolean' },
      source: { type: 'string' },
      source_status: { type: 'boolean' },
      status: {
        type: {
          type: 'hash',
          fields: {
            code: { type: 'integer' },
            elapsed: { type: 'integer' },
            message: { type: 'string' },
            progress: { type: 'number' },
          },
        },
      },
      subscription: { type: 'boolean' },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      task: { type: 'string' },
      type: { type: 'integer' },
      updated: { type: 'string' },
      vote_count: { type: 'integer' },
    },
  },
});

export default createPrediction;
