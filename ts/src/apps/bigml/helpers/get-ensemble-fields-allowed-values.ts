/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlEnsembleCommonFieldAllowedValues = [
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
    desc: 'The number of fields in the ensemble',
  },
  {
    value: 'composites',
    display_name: 'Composites',
    desc: 'The list of composite ids that reference this ensemble',
  },
  {
    value: 'created',
    display_name: 'Created',
    desc: 'The date and time when the ensemble was created with microsecond precision',
  },
  {
    value: 'dataset',
    display_name: 'Dataset',
    desc: 'The dataset/id that was used to build the ensemble',
  },
  {
    value: 'dataset_status',
    display_name: 'Dataset Status',
    desc: 'Whether the dataset is still available or has been deleted',
  },
  {
    value: 'error_models',
    display_name: 'Error Models',
    desc: 'The number of models in the ensemble that have failed',
  },
  {
    value: 'execution_id',
    display_name: 'Execution ID',
    desc: 'The execution/id that created the ensemble',
  },
  {
    value: 'execution_status',
    display_name: 'Execution Status',
    desc: 'Whether the execution is still available or has been deleted',
  },
  {
    value: 'finished_models',
    display_name: 'Finished Models',
    desc: 'The number of models in the ensemble that have finished correctly',
  },
  {
    value: 'fusions',
    display_name: 'Fusions',
    desc: 'The list of fusion ids that reference this ensemble',
  },
  {
    value: 'max_columns',
    display_name: 'Max Columns',
    desc: 'The total number of fields in the dataset used to build the ensemble',
  },
  {
    value: 'max_rows',
    display_name: 'Max Rows',
    desc: 'The maximum number of instances in the dataset that can be used to build the ensemble',
  },
  {
    value: 'missing_splits',
    display_name: 'Missing Splits',
    desc: 'Whether to explicitly include missing field values when choosing a split while growing the models of an ensemble',
  },
  {
    value: 'name',
    display_name: 'Name',
    desc: 'The name of the ensemble as provided or based on the name of the dataset by default',
  },
  {
    value: 'name_options',
    display_name: 'Name Options',
    desc: 'Information about the ensemble',
  },
  {
    value: 'node_threshold',
    display_name: 'Node Threshold',
    desc: 'The maximum number of nodes that the model will grow',
  },
  {
    value: 'number_of_batchpredictions',
    display_name: 'Number of Batch Predictions',
    desc: 'The current number of batch predictions that use this ensemble',
  },
  {
    value: 'number_of_evaluations',
    display_name: 'Number of Evaluations',
    desc: 'The current number of evaluations that use this ensemble',
  },
  {
    value: 'number_of_models',
    display_name: 'Number of Models',
    desc: 'The number of models in the ensemble',
  },
  {
    value: 'number_of_predictions',
    display_name: 'Number of Predictions',
    desc: 'The current number of predictions that use this ensemble',
  },
  {
    value: 'number_of_public_predictions',
    display_name: 'Number of Public Predictions',
    desc: 'The current number of public predictions that use this ensemble',
  },
  {
    value: 'optiml',
    display_name: 'OptiML',
    desc: 'The optiml/id that created this ensemble',
  },
  {
    value: 'optiml_status',
    display_name: 'OptiML Status',
    desc: 'Whether the OptiML is still available or has been deleted',
  },
  {
    value: 'ordering',
    display_name: 'Ordering',
    desc: 'The order used to choose instances from the dataset to build the models of the ensemble',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'The ensemble/id of the original ensemble',
  },
  {
    value: 'out_of_bag',
    display_name: 'Out of Bag',
    desc: 'Whether the out-of-bag instances were used to create the ensemble instead of the sampled instances',
  },
  {
    value: 'price',
    display_name: 'Price',
    desc: 'The price other users must pay to clone your ensemble',
  },
  {
    value: 'private',
    display_name: 'Private',
    desc: 'Whether the ensemble is public or not',
  },
  {
    value: 'project',
    display_name: 'Project',
    desc: 'The project/id the resource belongs to',
  },
  {
    value: 'random_candidate_ratio',
    display_name: 'Random Candidate Ratio',
    desc: 'The random candidate ratio considered when randomize is true',
  },
  {
    value: 'random_candidates',
    display_name: 'Random Candidates',
    desc: 'The number of random fields considered when randomize is true',
  },
  {
    value: 'randomize',
    display_name: 'Randomize',
    desc: 'Whether the splits of each model in the ensemble considered only a random subset of the fields or all the fields available',
  },
  {
    value: 'replacement',
    display_name: 'Replacement',
    desc: 'Whether the instances sampled to build the ensemble were selected using replacement or not',
  },
  {
    value: 'rows',
    display_name: 'Rows',
    desc: 'The total number of instances used to build the models of the ensemble',
  },
  {
    value: 'sample_rate',
    display_name: 'Sample Rate',
    desc: 'The sample rate used to select instances from the dataset to build the models of the ensemble',
  },
  {
    value: 'seed',
    display_name: 'Seed',
    desc: 'The string that was used to generate the sample',
  },
  {
    value: 'selective_pruning',
    display_name: 'Selective Pruning',
    desc: 'If true, selective pruning throttled the strength of the statistical pruning depending on the size of the dataset',
  },
  {
    value: 'shared',
    display_name: 'Shared',
    desc: 'Whether the ensemble is shared using a private link or not',
  },
  {
    value: 'shared_clonable',
    display_name: 'Shared Clonable',
    desc: 'Whether the shared ensemble can be cloned or not',
  },
  {
    value: 'size',
    display_name: 'Size',
    desc: 'The number of bytes of the dataset that were used to create this ensemble',
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
    value: 'split_candidates',
    display_name: 'Split Candidates',
    desc: 'The number of split points that are considered whenever the tree evaluates a numeric field',
  },
  {
    value: 'stat_pruning',
    display_name: 'Statistical Pruning',
    desc: 'Whether statistical pruning was used when building the ensemble',
  },
  {
    value: 'subscription',
    display_name: 'Subscription',
    desc: 'Whether the ensemble was created using a subscription plan or not',
  },
  {
    value: 'support_threshold',
    display_name: 'Support Threshold',
    desc: 'The parameter controls the minimum amount of support each child node must contain to be valid as a possible split',
  },
  {
    value: 'updated',
    display_name: 'Updated',
    desc: 'The date and time when the ensemble was updated with microsecond precision',
  },
  {
    value: 'white_box',
    display_name: 'White Box',
    desc: 'Whether the ensemble is publicly shared as a white-box',
  },
] satisfies IQoreAllowedValue<string>[];

export const BigMlEnsembleSortableFieldAllowedValues = [] satisfies IQoreAllowedValue<string>[];

export const BigMlEnsembleFilterableFieldAllowedValues = [
  {
    value: 'tags',
    display_name: 'Tags',
    desc: 'A list of user tags that can help classify and index this resource',
  },
] satisfies IQoreAllowedValue<string>[];
