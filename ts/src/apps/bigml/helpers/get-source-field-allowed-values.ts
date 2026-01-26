/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlSourceCommonFieldAllowedValues: IQoreAllowedValue<string>[] = [
  {
    value: 'category',
    display_name: 'Category',
    desc: 'One of the categories in the table of categories that help classify this resource according to the domain of application (Integer)',
  },
  {
    value: 'content_type',
    display_name: 'Content Type',
    desc: 'The MIME content-type as provided by your HTTP client (String)',
  },
  {
    value: 'created',
    display_name: 'Created',
    desc: 'The date and time when the source was created with microsecond precision (ISO-8601 Datetime)',
  },
  {
    value: 'execution_id',
    display_name: 'Execution ID',
    desc: 'The execution id that built the source (String)',
  },
  {
    value: 'execution_status',
    display_name: 'Execution Status',
    desc: 'Whether the execution is still available or has been deleted (Boolean)',
  },
  {
    value: 'file_name',
    display_name: 'File Name',
    desc: 'The name of the file as you submitted it (String)',
  },
  {
    value: 'format',
    display_name: 'Format',
    desc: 'The format of the source (String)',
  },
  {
    value: 'name',
    display_name: 'Name',
    desc: 'The name of the source as provided or the name of the file by default (String)',
  },
  {
    value: 'name_options',
    display_name: 'Name Options',
    desc: 'Information about the source (String)',
  },
  {
    value: 'number_of_anomalies',
    display_name: 'Number of Anomalies',
    desc: 'The current number of anomalies that use this source (Integer)',
  },
  {
    value: 'number_of_anomalyscores',
    display_name: 'Number of Anomaly Scores',
    desc: 'The current number of anomaly scores that use this source (Integer)',
  },
  {
    value: 'number_of_associations',
    display_name: 'Number of Associations',
    desc: 'The current number of associations that use this source (Integer)',
  },
  {
    value: 'number_of_associationsets',
    display_name: 'Number of Association Sets',
    desc: 'The current number of association sets that use this source (Integer)',
  },
  {
    value: 'number_of_centroids',
    display_name: 'Number of Centroids',
    desc: 'The current number of centroids that use this source (Integer)',
  },
  {
    value: 'number_of_clusters',
    display_name: 'Number of Clusters',
    desc: 'The current number of clusters that use this source (Integer)',
  },
  {
    value: 'number_of_correlations',
    display_name: 'Number of Correlations',
    desc: 'The current number of correlations that use this source (Integer)',
  },
  {
    value: 'number_of_datasets',
    display_name: 'Number of Datasets',
    desc: 'The current number of datasets that use this source (Integer)',
  },
  {
    value: 'number_of_ensembles',
    display_name: 'Number of Ensembles',
    desc: 'The current number of ensembles that use this source (Integer)',
  },
  {
    value: 'number_of_forecasts',
    display_name: 'Number of Forecasts',
    desc: 'The current number of forecasts that use this source (Integer)',
  },
  {
    value: 'number_of_linearregressions',
    display_name: 'Number of Linear Regressions',
    desc: 'The current number of linear regressions that use this source (Integer)',
  },
  {
    value: 'number_of_logisticregressions',
    display_name: 'Number of Logistic Regressions',
    desc: 'The current number of logistic regressions that use this source (Integer)',
  },
  {
    value: 'number_of_models',
    display_name: 'Number of Models',
    desc: 'The current number of models that use this source (Integer)',
  },
  {
    value: 'number_of_optimls',
    display_name: 'Number of OptiMLs',
    desc: 'The current number of optimls that use this source (Integer)',
  },
  {
    value: 'number_of_pca',
    display_name: 'Number of PCA',
    desc: 'The current number of pcas that use this source (Integer)',
  },
  {
    value: 'number_of_predictions',
    display_name: 'Number of Predictions',
    desc: 'The current number of predictions that use this source (Integer)',
  },
  {
    value: 'number_of_statisticaltests',
    display_name: 'Number of Statistical Tests',
    desc: 'The current number of statistical tests that use this source (Integer)',
  },
  {
    value: 'number_of_timeseries',
    display_name: 'Number of Time Series',
    desc: 'The current number of timeseries that use this source (Integer)',
  },
  {
    value: 'number_of_topicdistributions',
    display_name: 'Number of Topic Distributions',
    desc: 'The current number of topic distributions that use this source (Integer)',
  },
  {
    value: 'number_of_topicmodels',
    display_name: 'Number of Topic Models',
    desc: 'The current number of topic models that use this source (Integer)',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'The source/id of the original source (String)',
  },
  {
    value: 'parent_sources',
    display_name: 'Parent Sources',
    desc: 'The list of ids of sources for which this source is a component (Array)',
  },
  {
    value: 'private',
    display_name: 'Private',
    desc: 'Whether the source is public or not (Boolean)',
  },
  {
    value: 'project',
    display_name: 'Project',
    desc: 'The project/id the resource belongs to (String)',
  },
  {
    value: 'shared',
    display_name: 'Shared',
    desc: 'Whether the source is shared using a private link or not (Boolean)',
  },
  {
    value: 'shared_clonable',
    display_name: 'Shared Clonable',
    desc: 'Whether the shared source can be cloned or not (Boolean)',
  },
  {
    value: 'size',
    display_name: 'Size',
    desc: 'The number of bytes of the source (Integer)',
  },
  {
    value: 'sources',
    display_name: 'Sources',
    desc: 'The list of ids of component sources (Array)',
  },
  {
    value: 'subscription',
    display_name: 'Subscription',
    desc: 'Whether the source was created using a subscription plan or not (Boolean)',
  },
  {
    value: 'type',
    display_name: 'Type',
    desc: 'The type of source (0: local file, 1: remote URL, 2: inline data, 3: synthetic, 4: external repository, 5: composite) (Integer)',
  },
  {
    value: 'updated',
    display_name: 'Updated',
    desc: 'The date and time when the source was updated with microsecond precision (ISO-8601 Datetime)',
  },
];

export const BigMlSourceSortableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlSourceCommonFieldAllowedValues,
];

export const BigMlSourceFilterableFieldAllowedValues: IQoreAllowedValue<string>[] = [
  ...BigMlSourceCommonFieldAllowedValues,
  {
    value: 'tags',
    display_name: 'Tags',
    desc: 'A list of user tags that can help classify and index this resource (Array of Strings)',
  },
];
