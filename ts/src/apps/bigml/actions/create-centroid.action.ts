import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { getBigMlClusterAllowedValues } from '../helpers/get-cluster-allowed-values';
import { mapBigMlDatasetFieldsToQoreOptions } from '../helpers/get-dataset-fields';
import { getBigMlProjectAllowedValues } from '../helpers/get-project-id-allowed-values';

const action = 'create_centroid';

const options = {
  cluster: {
    type: 'string',
    required: true,
    get_allowed_values: getBigMlClusterAllowedValues,
  },
  input_data: {
    type: 'hash',
    required: true,
    get_dynamic_type: async (context) => {
      try {
        const { token, username, cluster } = getQoreContextRequiredValues({
          context,
          connectionFields: ['token', 'username'],
          optionFields: ['cluster'],
          ErrorClass: BigMlError,
        });

        const response = await bigMlApiClient<{
          dataset: string;
        }>({
          token,
          username,
          method: 'GET',
          path: cluster,
        });

        if (!response.dataset) {
          throw new BigMlError(`Cluster ${cluster} does not have a dataset associated.`);
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

const createCentroid = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username, cluster, input_data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      optionFields: ['cluster', 'input_data'],
      ErrorClass: BigMlError,
    });

    const { description, project, name, tags } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'POST',
        path: `centroid`,
        body: {
          cluster,
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
      centroid: {
        type: {
          type: 'hash',
          fields: {
            center: { type: 'hash' },
            count: { type: 'integer' },
            distance: { type: 'number' },
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      centroid_id: { type: 'string' },
      centroid_name: { type: 'string' },
      cluster: { type: 'string' },
      cluster_status: { type: 'boolean' },
      cluster_type: { type: 'integer' },
      code: { type: 'integer' },
      configuration: { type: 'string' },
      configuration_status: { type: 'boolean' },
      created: { type: 'string' },
      creator: { type: 'string' },
      dataset: { type: 'string' },
      dataset_status: { type: 'boolean' },
      description: { type: 'string' },
      distance: { type: 'number' },
      expanded_input_data: { type: 'hash' },
      fields: {
        type: {
          type: 'hash',
          fields: {
            '000000': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000001': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000002': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000003': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000004': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000005': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000006': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
            '000007': {
              type: {
                type: 'hash',
                fields: {
                  column_number: { type: 'integer' },
                  datatype: { type: 'string' },
                  description: { type: 'string' },
                  label: { type: 'string' },
                  name: { type: 'string' },
                  optype: { type: 'string' },
                  order: { type: 'integer' },
                  preferred: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      input_data: { type: 'hash' },
      locale: { type: 'string' },
      name: { type: 'string' },
      name_options: { type: 'string' },
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
      type: { type: 'integer' },
      updated: { type: 'string' },
    },
  },
});

export default createCentroid;
