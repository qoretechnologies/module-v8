import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { BigMlFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';
import { BigMlDatasetSortableFieldsAllowedValues } from '../helpers/get-datasets-sortable-fields-allowed-values';

const action = 'list_datasets';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  offset: {
    type: 'number',
    required: false,
  },
  filter: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: BigMlDatasetSortableFieldsAllowedValues,
          required: true,
        },
        value: {
          type: 'softstring',
          required: true,
        },
        operator: {
          type: 'string',
          allowed_values: BigMlFilterOperatorAllowedValues,
          required: true,
        },
      },
    },
  },
  sort: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: BigMlDatasetSortableFieldsAllowedValues,
          required: true,
        },
        order: {
          type: 'string',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const listDatasets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      ErrorClass: BigMlError,
    });

    const {
      limit = 20,
      offset = 0,
      sort = { order: 'desc', field: 'created' },
      filter,
    } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          order_by: `${sort.order === 'asc' ? '' : '-'}${sort.field}`,
          ...(filter?.field && {
            [`${filter.field}${filter.operator || '__icontains'}`]: filter.value,
          }),
        },
        path: `dataset`,
        object: `objects`,
      });

      return response;
    } catch (error) {
      throw new BigMlError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        all_fields: { type: 'boolean' },
        category: { type: 'integer' },
        cluster: { type: 'string' },
        cluster_status: { type: 'boolean' },
        code: { type: 'integer' },
        columns: { type: 'integer' },
        configuration: { type: 'string' },
        configuration_status: { type: 'boolean' },
        correlations: { type: 'hash' },
        created: { type: 'string' },
        creator: { type: 'string' },
        dataset_origin_status: { type: 'boolean' },
        description: { type: 'string' },
        evaluation: { type: 'string' },
        field_types: {
          type: {
            type: 'hash',
            fields: {
              categorical: { type: 'integer' },
              datetime: { type: 'integer' },
              image: { type: 'integer' },
              items: { type: 'integer' },
              numeric: { type: 'integer' },
              path: { type: 'integer' },
              preferred: { type: 'integer' },
              regions: { type: 'integer' },
              text: { type: 'integer' },
              total: { type: 'integer' },
            },
          },
        },
        juxtapose: { type: 'boolean' },
        locale: { type: 'string' },
        missing_numeric_rows: { type: 'integer' },
        name: { type: 'string' },
        name_options: { type: 'string' },
        new_fields: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        number_of_anomalies: { type: 'integer' },
        number_of_anomalyscores: { type: 'integer' },
        number_of_associations: { type: 'integer' },
        number_of_associationsets: { type: 'integer' },
        number_of_batchanomalyscores: { type: 'integer' },
        number_of_batchcentroids: { type: 'integer' },
        number_of_batchpredictions: { type: 'integer' },
        number_of_batchprojections: { type: 'integer' },
        number_of_batchtopicdistributions: { type: 'integer' },
        number_of_centroids: { type: 'integer' },
        number_of_clusters: { type: 'integer' },
        number_of_correlations: { type: 'integer' },
        number_of_deepnets: { type: 'integer' },
        number_of_ensembles: { type: 'integer' },
        number_of_evaluations: { type: 'integer' },
        number_of_forecasts: { type: 'integer' },
        number_of_linearregressions: { type: 'integer' },
        number_of_logisticregressions: { type: 'integer' },
        number_of_models: { type: 'integer' },
        number_of_optimls: { type: 'integer' },
        number_of_pca: { type: 'integer' },
        number_of_predictions: { type: 'integer' },
        number_of_projections: { type: 'integer' },
        number_of_statisticaltests: { type: 'integer' },
        number_of_timeseries: { type: 'integer' },
        number_of_topicdistributions: { type: 'integer' },
        number_of_topicmodels: { type: 'integer' },
        objective_field: {
          type: {
            type: 'hash',
            fields: {
              autolabel: { type: 'boolean' },
              column_number: { type: 'integer' },
              datatype: { type: 'string' },
              description: { type: 'string' },
              id: { type: 'string' },
              label: { type: 'string' },
              name: { type: 'string' },
              optype: { type: 'string' },
              order: { type: 'integer' },
              provenance: { type: 'string' },
            },
          },
        },
        optiml: { type: 'string' },
        optiml_status: { type: 'boolean' },
        origin_batch_dataset: { type: 'string' },
        origin_batch_dataset_status: { type: 'boolean' },
        origin_batch_model: { type: 'string' },
        origin_batch_model_status: { type: 'boolean' },
        origin_batch_resource: { type: 'string' },
        origin_batch_status: { type: 'boolean' },
        output_fields: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        price: { type: 'number' },
        private: { type: 'boolean' },
        project: { type: 'string' },
        refresh_field_types: { type: 'boolean' },
        refresh_objective: { type: 'boolean' },
        refresh_preferred: { type: 'boolean' },
        resource: { type: 'string' },
        row_offset: { type: 'integer' },
        row_step: { type: 'integer' },
        rows: { type: 'integer' },
        shared: { type: 'boolean' },
        size: { type: 'integer' },
        source: { type: 'string' },
        source_status: { type: 'boolean' },
        sql_output_fields: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        statisticaltest: { type: 'string' },
        status: {
          type: {
            type: 'hash',
            fields: {
              bytes: { type: 'integer' },
              code: { type: 'integer' },
              elapsed: { type: 'integer' },
              extracted_count: { type: 'integer' },
              field_errors: { type: 'hash' },
              message: { type: 'string' },
              progress: { type: 'number' },
              row_format_errors: {
                type: {
                  type: 'hash',
                  fields: {
                    total: { type: 'integer' },
                  },
                },
              },
              serialized_rows: { type: 'integer' },
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
        term_limit: { type: 'integer' },
        timeseries: { type: 'string' },
        timeseries_status: { type: 'boolean' },
        type: { type: 'integer' },
        updated: { type: 'string' },
      },
    },
  },
});

export default listDatasets;
