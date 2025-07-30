import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const BigMlDeepNetResponseType = {
  type: 'hash',
  fields: {
    category: { type: 'integer' },
    code: { type: 'integer' },
    columns: { type: 'integer' },
    configuration: { type: 'string' },
    configuration_status: { type: 'boolean' },
    created: { type: 'string' },
    creator: { type: 'string' },
    dataset: { type: 'string' },
    dataset_field_types: {
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
    dataset_status: { type: 'boolean' },
    deepnet: {
      type: {
        type: 'hash',
        fields: {
          batch_normalization: { type: 'boolean' },
          deepnet_seed: { type: 'string' },
          deepnet_version: { type: 'string' },
          dropout_rate: { type: 'number' },
          holdout_metrics: {
            type: {
              type: 'hash',
              fields: {
                mean_absolute_error: { type: 'number' },
                mean_squared_error: { type: 'number' },
                median_absolute_error: { type: 'number' },
                r_squared: { type: 'number' },
                spearman_r: { type: 'number' },
              },
            },
          },
          learn_residuals: { type: 'boolean' },
          learning_rate: { type: 'number' },
          max_training_time: { type: 'integer' },
          missing_numerics: { type: 'boolean' },
          number_of_hidden_layers: { type: 'integer' },
          number_of_iterations: { type: 'integer' },
          optimizer: {
            type: {
              type: 'hash',
              fields: {
                adam: {
                  type: {
                    type: 'hash',
                    fields: {
                      beta1: { type: 'number' },
                      beta2: { type: 'number' },
                      epsilon: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
          suggest_structure: { type: 'boolean' },
          tree_embedding: { type: 'boolean' },
        },
      },
    },
    description: { type: 'string' },
    locale: { type: 'string' },
    max_columns: { type: 'integer' },
    max_rows: { type: 'integer' },
    name: { type: 'string' },
    name_options: { type: 'string' },
    number_of_batchpredictions: { type: 'integer' },
    number_of_evaluations: { type: 'integer' },
    number_of_predictions: { type: 'integer' },
    number_of_public_predictions: { type: 'integer' },
    objective_field: { type: 'string' },
    objective_field_name: { type: 'string' },
    objective_field_type: { type: 'string' },
    objective_fields: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    optiml: { type: 'string' },
    optiml_status: { type: 'boolean' },
    ordering: { type: 'integer' },
    out_of_bag: { type: 'boolean' },
    price: { type: 'number' },
    private: { type: 'boolean' },
    project: { type: 'string' },
    range: { type: 'string' },
    regression_weight_ratio: { type: 'number' },
    replacement: { type: 'boolean' },
    resource: { type: 'string' },
    rows: { type: 'integer' },
    sample_rate: { type: 'number' },
    shared: { type: 'boolean' },
    size: { type: 'integer' },
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
    white_box: { type: 'boolean' },
  },
} satisfies TQoreResponseType;
