/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlClusterCommonFieldAllowedValues: IQoreAllowedValue<string>[] = [
  {
    value: 'balance_fields',
    display_name: 'Balance Fields',
    desc: 'Whether all the numeric fields have been scaled so that their standard deviations are 1 (Boolean)',
  },
  {
    value: 'category',
    display_name: 'Category',
    desc: 'One of the categories in the table of categories that help classify this resource according to the domain of application (Integer)',
  },
  {
    value: 'columns',
    display_name: 'Columns',
    desc: 'The number of fields in the cluster (Integer)',
  },
  {
    value: 'composites',
    display_name: 'Composites',
    desc: 'The list of composite ids that reference this cluster (Array of Strings)',
  },
  {
    value: 'created',
    display_name: 'Created',
    desc: 'The date and time when the cluster was created with microsecond precision (ISO-8601 Datetime)',
  },
  {
    value: 'dataset',
    display_name: 'Dataset',
    desc: 'The dataset/id that was used to build the cluster (String)',
  },
  {
    value: 'dataset_status',
    display_name: 'Dataset Status',
    desc: 'Whether the dataset is still available or has been deleted (Boolean)',
  },
  {
    value: 'execution_id',
    display_name: 'Execution ID',
    desc: 'The execution/id that created the cluster (String)',
  },
  {
    value: 'execution_status',
    display_name: 'Execution Status',
    desc: 'Whether the execution is still available or has been deleted (Boolean)',
  },
  {
    value: 'k',
    display_name: 'K',
    desc: 'The number of clusters (Integer)',
  },
  {
    value: 'max_columns',
    display_name: 'Max Columns',
    desc: 'The total number of fields in the dataset used to build the cluster (Integer)',
  },
  {
    value: 'max_rows',
    display_name: 'Max Rows',
    desc: 'The maximum number of instances in the dataset that can be used to build the cluster (Integer)',
  },
  {
    value: 'model_clusters',
    display_name: 'Model Clusters',
    desc: 'Whether a model for each cluster was created or not (Boolean)',
  },
  {
    value: 'name',
    display_name: 'Name',
    desc: 'The name of the cluster as provided or based on the name of the dataset by default (String)',
  },
  {
    value: 'name_options',
    display_name: 'Name Options',
    desc: 'Information about the cluster (String)',
  },
  {
    value: 'number_of_batchcentroids',
    display_name: 'Number of Batch Centroids',
    desc: 'The current number of batch centroids that use this cluster (Integer)',
  },
  {
    value: 'number_of_centroids',
    display_name: 'Number of Centroids',
    desc: 'The current number of centroids that use this cluster (Integer)',
  },
  {
    value: 'number_of_public_centroids',
    display_name: 'Number of Public Centroids',
    desc: 'The current number of public centroids that use this cluster (Integer)',
  },
  {
    value: 'ordering',
    display_name: 'Ordering',
    desc: 'The order used to choose instances from the dataset to build cluster (0: Deterministic, 1: Linear, 2: Random) (Integer)',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'The cluster/id of the original cluster (String)',
  },
  {
    value: 'out_of_bag',
    display_name: 'Out of Bag',
    desc: 'Whether the out-of-bag instances were used to create the cluster instead of the sampled instances (Boolean)',
  },
  {
    value: 'price',
    display_name: 'Price',
    desc: 'The price other users must pay to clone your cluster (Float)',
  },
  {
    value: 'private',
    display_name: 'Private',
    desc: 'Whether the cluster is public or not (Boolean)',
  },
  {
    value: 'project',
    display_name: 'Project',
    desc: 'The project/id the resource belongs to (String)',
  },
  {
    value: 'replacement',
    display_name: 'Replacement',
    desc: 'Whether the instances sampled to build the cluster were selected using replacement or not (Boolean)',
  },
  {
    value: 'rows',
    display_name: 'Rows',
    desc: 'The total number of instances used to build the cluster (Integer)',
  },
  {
    value: 'sample_rate',
    display_name: 'Sample Rate',
    desc: 'The sample rate used to select instances from the dataset to build the cluster (Float)',
  },
  {
    value: 'seed',
    display_name: 'Seed',
    desc: 'The string that was used to generate the sample (String)',
  },
  {
    value: 'shared',
    display_name: 'Shared',
    desc: 'Whether the cluster is shared using a private link or not (Boolean)',
  },
  {
    value: 'shared_clonable',
    display_name: 'Shared Clonable',
    desc: 'Whether the shared cluster can be cloned or not (Boolean)',
  },
  {
    value: 'size',
    display_name: 'Size',
    desc: 'The number of bytes of the dataset that were used to create this cluster (Integer)',
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
    value: 'subscription',
    display_name: 'Subscription',
    desc: 'Whether the cluster was created using a subscription plan or not (Boolean)',
  },
  {
    value: 'updated',
    display_name: 'Updated',
    desc: 'The date and time when the cluster was updated with microsecond precision (ISO-8601 Datetime)',
  },
  {
    value: 'white_box',
    display_name: 'White Box',
    desc: 'Whether the cluster is publicly shared as a white-box (Boolean)',
  },
];

export const BigMlClusterSortableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlClusterCommonFieldAllowedValues,
];

export const BigMlClusterFilterableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlClusterCommonFieldAllowedValues,
  {
    value: 'tags',
    display_name: 'Tags',
    desc: 'A list of user tags that can help classify and index this resource (Array of Strings)',
  },
];
