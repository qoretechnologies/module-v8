import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { BigMlFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';
import {
  BigMlSourceFilterableFieldAllowedValues,
  BigMlSourceSortableFieldAllowedValues,
} from '../helpers/get-source-field-allowed-values';

const action = 'list_sources';

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
          allowed_values: BigMlSourceFilterableFieldAllowedValues,
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
          allowed_values: BigMlSourceSortableFieldAllowedValues,
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

const listSources = QoreAppCreator.createLocalizedAction<typeof options>({
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
        path: `source`,
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
        api: { type: 'bool' },
        archive_id: { type: 'string' },
        category: { type: 'integer' },
        charset: { type: 'string' },
        cloned: { type: 'bool' },
        cloned_from: { type: 'integer' },
        clones: { type: 'integer' },
        closed: { type: 'bool' },
        code: { type: 'integer' },
        composite_id: { type: 'string' },
        configuration: { type: 'string' },
        configuration_id: { type: 'string' },
        configuration_status: { type: 'bool' },
        content_type: { type: 'string' },
        created: { type: 'string' },
        creator: { type: 'string' },
        description: { type: 'string' },
        disable_autolabel: { type: 'bool' },
        disable_datetime: { type: 'bool' },
        encoding: { type: 'string' },
        execution_id: { type: 'string' },
        execution_status: { type: 'string' },
        external_data: { type: 'string' },
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
              regions: { type: 'integer' },
              text: { type: 'integer' },
              total: { type: 'integer' },
            },
          },
        },
        fields_meta: {
          type: {
            type: 'hash',
            fields: {
              count: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
              parent_optypes: { type: 'hash' },
              provenances: { type: 'hash' },
              query_total: { type: 'integer' },
              total: { type: 'integer' },
            },
          },
        },
        file_name: { type: 'string' },
        format: { type: 'string' },
        height: { type: 'integer' },
        id: { type: 'string' },
        image: { type: 'string' },
        image_analysis: {
          type: {
            type: 'hash',
            fields: {
              extracted_features: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
        image_id: { type: 'string' },
        item_analysis: { type: 'hash' },
        job_type: { type: 'integer' },
        md5: { type: 'string' },
        name: { type: 'string' },
        name_options: { type: 'string' },
        number_of_anomalies: { type: 'integer' },
        number_of_anomalyscores: { type: 'integer' },
        number_of_associations: { type: 'integer' },
        number_of_associationsets: { type: 'integer' },
        number_of_centroids: { type: 'integer' },
        number_of_clusters: { type: 'integer' },
        number_of_correlations: { type: 'integer' },
        number_of_datasets: { type: 'integer' },
        number_of_deepnets: { type: 'integer' },
        number_of_ensembles: { type: 'integer' },
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
        origin: { type: 'string' },
        origin_status: { type: 'bool' },
        original_format: { type: 'string' },
        original_height: { type: 'integer' },
        original_size: { type: 'integer' },
        original_width: { type: 'integer' },
        parent_sources: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        pending_sources: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        persistent: { type: 'bool' },
        prediction_input: { type: 'bool' },
        private: { type: 'bool' },
        private_image: { type: 'string' },
        project: { type: 'string' },
        project_id: { type: 'string' },
        published: { type: 'string' },
        remote: { type: 'string' },
        resource: { type: 'string' },
        shared: { type: 'bool' },
        short_url: { type: 'string' },
        size: { type: 'integer' },
        source_parser: {
          type: {
            type: 'hash',
            fields: {
              locale: { type: 'string' },
              missing_tokens: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              separator: { type: 'string' },
            },
          },
        },
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
        synthetic: { type: 'string' },
        table_component: { type: 'string' },
        tags: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        term_analysis: { type: 'hash' },
        type: { type: 'integer' },
        updated: { type: 'string' },
        url: { type: 'string' },
        user_metadata: { type: 'hash' },
        user_name: { type: 'string' },
        webhook: { type: 'string' },
        width: { type: 'integer' },
      },
    },
  },
});

export default listSources;
