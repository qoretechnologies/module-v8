/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlModelCommonFieldAllowedValues: IQoreAllowedValue<string>[] = [
  {
    value: 'balance_objective',
    display_name: 'Balance Objective',
    desc: 'Whether to balance classes proportionally to their category counts or not (Boolean)',
  },
  {
    value: 'boosted_ensemble',
    display_name: 'Boosted Ensemble',
    desc: 'Whether the model was built as part of an ensemble with boosted trees (Boolean)',
  },
  {
    value: 'category',
    display_name: 'Category',
    desc: 'One of the categories in the table of categories that help classify this resource according to the domain of application (Integer)',
  },
  {
    value: 'centroid',
    display_name: 'Centroid',
    desc: 'The centroid id this model was built for (String)',
  },
  {
    value: 'cluster',
    display_name: 'Cluster',
    desc: 'The cluster/id this model was built for (String)',
  },
  {
    value: 'cluster_status',
    display_name: 'Cluster Status',
    desc: 'Whether the cluster is still available or has been deleted (Boolean)',
  },
  {
    value: 'columns',
    display_name: 'Columns',
    desc: 'The number of fields in the model (Integer)',
  },
  {
    value: 'composites',
    display_name: 'Composites',
    desc: 'The list of composite ids that reference this model (Array of Strings)',
  },
  {
    value: 'created',
    display_name: 'Created',
    desc: 'The date and time when the model was created with microsecond precision (ISO-8601 Datetime)',
  },
  {
    value: 'dataset',
    display_name: 'Dataset',
    desc: 'The dataset/id that was used to build the model (String)',
  },
  {
    value: 'dataset_status',
    display_name: 'Dataset Status',
    desc: 'Whether the dataset is still available or has been deleted (Boolean)',
  },
  {
    value: 'ensemble',
    display_name: 'Ensemble',
    desc: 'Whether the model was built as part of an ensemble or not (Boolean)',
  },
  {
    value: 'ensemble_id',
    display_name: 'Ensemble ID',
    desc: 'The ensemble id (String)',
  },
  {
    value: 'ensemble_index',
    display_name: 'Ensemble Index',
    desc: 'The number of order in the ensemble (Integer)',
  },
  {
    value: 'execution_id',
    display_name: 'Execution ID',
    desc: 'The execution/id that created the model (String)',
  },
  {
    value: 'execution_status',
    display_name: 'Execution Status',
    desc: 'Whether the execution is still available or has been deleted (Boolean)',
  },
  {
    value: 'max_columns',
    display_name: 'Max Columns',
    desc: 'The total number of fields in the dataset used to build the model (Integer)',
  },
  {
    value: 'max_rows',
    display_name: 'Max Rows',
    desc: 'The maximum number of instances in the dataset that can be used to build the model (Integer)',
  },
  {
    value: 'missing_splits',
    display_name: 'Missing Splits',
    desc: 'Whether to explicitly include missing field values when choosing a split while growing a model (Boolean)',
  },
  {
    value: 'name',
    display_name: 'Name',
    desc: 'The name of the model as provided or based on the name of the dataset by default (String)',
  },
  {
    value: 'name_options',
    display_name: 'Name Options',
    desc: 'Information about the model (String)',
  },
  {
    value: 'node_threshold',
    display_name: 'Node Threshold',
    desc: 'The maximum number of nodes that the model will grow (String)',
  },
  {
    value: 'number_of_batchpredictions',
    display_name: 'Number of Batch Predictions',
    desc: 'The current number of batch predictions that use this model (Integer)',
  },
  {
    value: 'number_of_evaluations',
    display_name: 'Number of Evaluations',
    desc: 'The current number of evaluations that use this model (Integer)',
  },
  {
    value: 'number_of_predictions',
    display_name: 'Number of Predictions',
    desc: 'The current number of predictions that use this model (Integer)',
  },
  {
    value: 'number_of_public_predictions',
    display_name: 'Number of Public Predictions',
    desc: 'The current number of public predictions that use this model (Integer)',
  },
  {
    value: 'optiml',
    display_name: 'OptiML',
    desc: 'The optiml/id that created this model (String)',
  },
  {
    value: 'optiml_status',
    display_name: 'OptiML Status',
    desc: 'Whether the OptiML is still available or has been deleted (Boolean)',
  },
  {
    value: 'ordering',
    display_name: 'Ordering',
    desc: 'The order used to choose instances from the dataset to build the model (Integer)',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'The model/id of the original gallery model (String)',
  },
  {
    value: 'out_of_bag',
    display_name: 'Out of Bag',
    desc: 'Whether the out-of-bag instances were used to create the model instead of the sampled instances (Boolean)',
  },
  {
    value: 'price',
    display_name: 'Price',
    desc: 'The price other users must pay to clone your model (Float)',
  },
  {
    value: 'private',
    display_name: 'Private',
    desc: 'Whether the model is public or not (Boolean)',
  },
  {
    value: 'project',
    display_name: 'Project',
    desc: 'The project/id the resource belongs to (String)',
  },
  {
    value: 'random_candidate_ratio',
    display_name: 'Random Candidate Ratio',
    desc: 'The random candidate ratio considered when randomize is true (Float)',
  },
  {
    value: 'random_candidates',
    display_name: 'Random Candidates',
    desc: 'The number of random fields considered when randomize is true (Integer)',
  },
  {
    value: 'randomize',
    display_name: 'Randomize',
    desc: 'Whether the model splits considered only a random subset of the fields or all the fields available (Boolean)',
  },
  {
    value: 'replacement',
    display_name: 'Replacement',
    desc: 'Whether the instances sampled to build the model were selected using replacement or not (Boolean)',
  },
  {
    value: 'rows',
    display_name: 'Rows',
    desc: 'The total number of instances used to build the model (Integer)',
  },
  {
    value: 'sample_rate',
    display_name: 'Sample Rate',
    desc: 'The sample rate used to select instances from the dataset to build the model (Float)',
  },
  {
    value: 'seed',
    display_name: 'Seed',
    desc: 'The string that was used to generate the sample (String)',
  },
  {
    value: 'selective_pruning',
    display_name: 'Selective Pruning',
    desc: 'If true, selective pruning throttled the strength of the statistical pruning depending on the size of the dataset (Boolean)',
  },
  {
    value: 'shared',
    display_name: 'Shared',
    desc: 'Whether the model is shared using a private link or not (Boolean)',
  },
  {
    value: 'shared_clonable',
    display_name: 'Shared Clonable',
    desc: 'Whether the shared model can be cloned or not (Boolean)',
  },
  {
    value: 'size',
    display_name: 'Size',
    desc: 'The number of bytes of the dataset that were used to create this model (Integer)',
  },
  {
    value: 'source',
    display_name: 'Source',
    desc: 'The source/id that was used to build the dataset (String)',
  },
  {
    value: 'source_status',
    display_name: 'Source Status',
    desc: 'Whether the source is still available or has been deleted (Boolean)',
  },
  {
    value: 'split_candidates',
    display_name: 'Split Candidates',
    desc: 'The number of split points that are considered whenever the tree evaluates a numeric field (Integer)',
  },
  {
    value: 'stat_pruning',
    display_name: 'Statistical Pruning',
    desc: 'Whether statistical pruning was used when building the model (Boolean)',
  },
  {
    value: 'subscription',
    display_name: 'Subscription',
    desc: 'Whether the model was created using a subscription plan or not (Boolean)',
  },
  {
    value: 'support_threshold',
    display_name: 'Support Threshold',
    desc: 'The parameter controls the minimum amount of support each child node must contain to be valid as a possible split (Float)',
  },
  {
    value: 'updated',
    display_name: 'Updated',
    desc: 'The date and time when the model was updated with microsecond precision (ISO-8601 Datetime)',
  },
  {
    value: 'white_box',
    display_name: 'White Box',
    desc: 'Whether the model is publicly shared as a white-box (Boolean)',
  },
];

export const BigMlModelSortableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlModelCommonFieldAllowedValues,
];

export const BigMlModelFilterableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlModelCommonFieldAllowedValues,
  {
    value: 'tags',
    display_name: 'Tags',
    desc: 'A list of user tags that can help classify and index this resource (Array of Strings)',
  },
];
