import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { getBigMlAnomalyDetectorAllowedValues } from '../helpers/get-anomaly-detector-allowed-values';
import { getBigMlProjectAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getBigMlDatasetAllowedValues } from '../helpers/get-dataset-allowed-values';

const action = 'create_batch_anomaly_score';

const options = {
  anomaly: {
    type: 'string',
    required: true,
    get_allowed_values: getBigMlAnomalyDetectorAllowedValues,
  },
  dataset: {
    type: 'string',
    required: true,
    get_allowed_values: getBigMlDatasetAllowedValues,
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

const createBatchAnomalyScore = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username, anomaly, dataset } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      optionFields: ['anomaly', 'dataset'],
      ErrorClass: BigMlError,
    });

    const { description, project, name, tags } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'POST',
        path: `batchanomalyscore`,
        body: {
          anomaly,
          dataset,
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
      all_fields: { type: 'boolean' },
      anomaly: { type: 'string' },
      anomaly_status: { type: 'boolean' },
      anomaly_type: { type: 'integer' },
      category: { type: 'integer' },
      code: { type: 'integer' },
      configuration: { type: 'string' },
      configuration_status: { type: 'boolean' },
      created: { type: 'string' },
      creator: { type: 'string' },
      dataset: { type: 'string' },
      dataset_status: { type: 'boolean' },
      description: { type: 'string' },
      excluded_fields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      fields_map: { type: 'hash' },
      header: { type: 'boolean' },
      importance: { type: 'boolean' },
      input_fields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      locale: { type: 'string' },
      name: { type: 'string' },
      name_options: { type: 'string' },
      newline: { type: 'string' },
      output_dataset: { type: 'boolean' },
      output_dataset_resource: { type: 'string' },
      output_dataset_status: { type: 'boolean' },
      output_fields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      private: { type: 'boolean' },
      project: { type: 'string' },
      resource: { type: 'string' },
      rows: { type: 'integer' },
      score_name: { type: 'string' },
      separator: { type: 'string' },
      shared: { type: 'boolean' },
      size: { type: 'integer' },
      source: { type: 'string' },
      source_status: { type: 'boolean' },
      status: {
        type: {
          type: 'hash',
          fields: {
            code: { type: 'integer' },
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

export default createBatchAnomalyScore;
