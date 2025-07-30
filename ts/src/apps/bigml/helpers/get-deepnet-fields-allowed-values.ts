/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlDeepnetCommonFieldAllowedValues = [
  {
    value: 'balance_objective',
    display_name: 'Balance Objective',
    desc: 'Whether to balance classes proportionally to their category counts or not',
  },
  {
    value: 'category',
    display_name: 'Category',
    desc: 'One of the categories in the table of categories that help classify this resource according to the domain of application',
  },
  {
    value: 'columns',
    display_name: 'Columns',
    desc: 'The number of fields in the deepnet',
  },
  {
    value: 'composites',
    display_name: 'Composites',
    desc: 'The list of composite ids that reference this deepnet',
  },
  {
    value: 'created',
    display_name: 'Created',
    desc: 'The date and time when the deepnet was created with microsecond precision',
  },
  {
    value: 'dataset',
    display_name: 'Dataset',
    desc: 'The dataset/id that was used to build the deepnet',
  },
  {
    value: 'dataset_status',
    display_name: 'Dataset Status',
    desc: 'Whether the dataset is still available or has been deleted',
  },
  {
    value: 'execution_id',
    display_name: 'Execution ID',
    desc: 'The execution/id that created the deepnet',
  },
  {
    value: 'execution_status',
    display_name: 'Execution Status',
    desc: 'Whether the execution is still available or has been deleted',
  },
  {
    value: 'fusions',
    display_name: 'Fusions',
    desc: 'The list of fusion ids that reference this deepnet',
  },
  {
    value: 'max_columns',
    display_name: 'Max Columns',
    desc: 'The total number of fields in the dataset used to build the deepnet',
  },
  {
    value: 'max_rows',
    display_name: 'Max Rows',
    desc: 'The maximum number of instances in the dataset that can be used to build the deepnet',
  },
  {
    value: 'name',
    display_name: 'Name',
    desc: 'The name of the deepnet as provided or based on the name of the dataset by default',
  },
  {
    value: 'name_options',
    display_name: 'Name Options',
    desc: 'Information about the deepnet',
  },
  {
    value: 'number_of_batchpredictions',
    display_name: 'Number of Batch Predictions',
    desc: 'The current number of batch predictions that use this deepnet',
  },
  {
    value: 'number_of_evaluations',
    display_name: 'Number of Evaluations',
    desc: 'The current number of evaluations that use this deepnet',
  },
  {
    value: 'number_of_predictions',
    display_name: 'Number of Predictions',
    desc: 'The current number of predictions that use this deepnet',
  },
  {
    value: 'number_of_public_predictions',
    display_name: 'Number of Public Predictions',
    desc: 'The current number of public predictions that use this deepnet',
  },
  {
    value: 'optiml',
    display_name: 'OptiML',
    desc: 'The optiml/id that created this deepnet',
  },
  {
    value: 'optiml_status',
    display_name: 'OptiML Status',
    desc: 'Whether the OptiML is still available or has been deleted',
  },
  {
    value: 'ordering',
    display_name: 'Ordering',
    desc: 'The order used to choose instances from the dataset to build the models of the deepnet',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'The deepnet/id of the original deepnet',
  },
  {
    value: 'out_of_bag',
    display_name: 'Out of Bag',
    desc: 'Whether the out-of-bag instances were used to create the deepnet instead of the sampled instances',
  },
  {
    value: 'price',
    display_name: 'Price',
    desc: 'The price other users must pay to clone your deepnet',
  },
  {
    value: 'private',
    display_name: 'Private',
    desc: 'Whether the deepnet is public or not',
  },
  {
    value: 'project',
    display_name: 'Project',
    desc: 'The project/id the resource belongs to',
  },
  {
    value: 'replacement',
    display_name: 'Replacement',
    desc: 'Whether the instances sampled to build the deepnet were selected using replacement or not',
  },
  {
    value: 'rows',
    display_name: 'Rows',
    desc: 'The total number of instances used to build the models of the deepnet',
  },
  {
    value: 'sample_rate',
    display_name: 'Sample Rate',
    desc: 'The sample rate used to select instances from the dataset to build the models of the deepnet',
  },
  {
    value: 'seed',
    display_name: 'Seed',
    desc: 'The string that was used to generate the sample',
  },
  {
    value: 'shared',
    display_name: 'Shared',
    desc: 'Whether the deepnet is shared using a private link or not',
  },
  {
    value: 'shared_clonable',
    display_name: 'Shared Clonable',
    desc: 'Whether the shared deepnet can be cloned or not',
  },
  {
    value: 'size',
    display_name: 'Size',
    desc: 'The number of bytes of the dataset that were used to create this deepnet',
  },
  {
    value: 'source',
    display_name: 'Source',
    desc: 'The source/id that was used to build the dataset',
  },
  {
    value: 'source_status',
    display_name: 'Source Status',
    desc: 'Whether the source is still available or has been deleted',
  },
  {
    value: 'subscription',
    display_name: 'Subscription',
    desc: 'Whether the deepnet was created using a subscription plan or not',
  },
  {
    value: 'updated',
    display_name: 'Updated',
    desc: 'The date and time when the deepnet was updated with microsecond precision',
  },
  {
    value: 'white_box',
    display_name: 'White Box',
    desc: 'Whether the deepnet is publicly shared as a white-box',
  },
] satisfies IQoreAllowedValue<string>[];

export const BigMlDeepnetSortableFieldAllowedValues = [] satisfies IQoreAllowedValue<string>[];

export const BigMlDeepnetFilterableFieldAllowedValues = [
  {
    value: 'tags',
    display_name: 'Tags',
    desc: 'A list of user tags that can help classify and index this resource',
  },
] satisfies IQoreAllowedValue<string>[];
