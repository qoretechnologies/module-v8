import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { mapBigMlDatasetFieldsToQoreOptions } from '../helpers/get-dataset-fields';
import { getBigMlProjectAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getBigMlTopicModelAllowedValues } from '../helpers/get-topic-model-allowed-values';

const action = 'create_topic_distribution';

const options = {
  topicmodel: {
    type: 'string',
    required: true,
    get_allowed_values: getBigMlTopicModelAllowedValues,
  },
  input_data: {
    type: 'hash',
    required: true,
    get_dynamic_type: async (context) => {
      try {
        const { token, username, topicmodel } = getQoreContextRequiredValues({
          context,
          connectionFields: ['token', 'username'],
          optionFields: ['topicmodel'],
          ErrorClass: BigMlError,
        });

        const response = await bigMlApiClient<{
          dataset: string;
        }>({
          token,
          username,
          method: 'GET',
          path: topicmodel,
        });

        if (!response.dataset) {
          throw new BigMlError(`Topic model ${topicmodel} does not have a dataset associated.`);
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

const createTopicDistribution = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username, topicmodel, input_data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      optionFields: ['topicmodel', 'input_data'],
      ErrorClass: BigMlError,
    });

    const { description, project, name, tags } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'POST',
        path: `topicdistribution`,
        body: {
          topicmodel,
          input_data,
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
      category: { type: 'integer' },
      code: { type: 'integer' },
      configuration: { type: 'string' },
      configuration_status: { type: 'bool' },
      created: { type: 'string' },
      creator: { type: 'string' },
      dataset: { type: 'string' },
      dataset_status: { type: 'bool' },
      description: { type: 'string' },
      expanded_input_data: { type: 'hash' },
      input_data: { type: 'hash' },
      locale: { type: 'string' },
      name: { type: 'string' },
      name_options: { type: 'string' },
      private: { type: 'bool' },
      project: { type: 'string' },
      query_string: { type: 'string' },
      resource: { type: 'string' },
      shared: { type: 'bool' },
      source: { type: 'string' },
      source_status: { type: 'bool' },
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
      subscription: { type: 'bool' },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      topic_distribution: {
        type: {
          type: 'hash',
          fields: {
            expanded_input_data: { type: 'hash' },
            fields: {
              type: {
                type: 'hash',
              },
            },
            k: { type: 'integer' },
            result: {
              type: {
                type: 'list',
                element_type: 'number',
              },
            },
            topics: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      topicmodel: { type: 'string' },
      topicmodel_status: { type: 'bool' },
      topicmodel_type: { type: 'integer' },
      type: { type: 'integer' },
      updated: { type: 'string' },
    },
  },
});

export default createTopicDistribution;
