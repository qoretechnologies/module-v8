import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { BigMlFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';

const action = 'list_projects';

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
          allowed_values: [
            { value: 'category', display_name: 'Category' },
            { value: 'name', display_name: 'Name' },
            { value: 'created', display_name: 'Created' },
            { value: 'private', display_name: 'Private' },
            { value: 'tags', display_name: 'Tags' },
            { value: 'updated', display_name: 'Updated' },
          ],
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
          allowed_values: [
            { value: 'category', display_name: 'Category' },
            { value: 'name', display_name: 'Name' },
            { value: 'created', display_name: 'Created' },
            { value: 'private', display_name: 'Private' },
            { value: 'tags', display_name: 'Tags' },
            { value: 'updated', display_name: 'Updated' },
          ],
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

const listProjects = QoreAppCreator.createLocalizedAction<typeof options>({
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
        path: `project`,
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
        category: { type: 'integer' },
        code: { type: 'integer' },
        configuration: { type: 'string' },
        configuration_status: { type: 'boolean' },
        created: { type: 'string' },
        creator: { type: 'string' },
        description: { type: 'string' },
        execution_id: { type: 'string' },
        execution_status: { type: 'string' },
        manage_permission: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        name: { type: 'string' },
        name_options: { type: 'string' },
        private: { type: 'boolean' },
        resource: { type: 'string' },
        stats: {
          type: {
            type: 'hash',
            fields: {
              anomalies: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              anomalyscores: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              associations: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              associationsets: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              batchanomalyscores: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              batchcentroids: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              batchpredictions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              batchprojections: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              batchtopicdistributions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              centroids: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              clusters: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              composites: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              configurations: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              correlations: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              datasets: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              deepnets: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              ensembles: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              evaluations: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              executions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              externalconnectors: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              forecasts: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              fusions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              libraries: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              linearregressions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              logisticregressions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              models: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              optimls: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              pca: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              predictions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              projections: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              samples: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              scripts: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              sources: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              statisticaltests: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              timeseries: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              topicdistributions: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
              topicmodels: {
                type: {
                  type: 'hash',
                  fields: {
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
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
        tags: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        type: { type: 'integer' },
        updated: { type: 'string' },
        user_metadata: {
          type: {
            type: 'hash',
          },
        },
        webhook: { type: 'string' },
      },
    },
  },
});

export default listProjects;
