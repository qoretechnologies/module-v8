import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlDatasetSortableFieldsAllowedValues = [
  {
    value: 'number_of_anomalies',
    display_name: 'Number of Anomalies',
    desc: 'The current number of anomalies that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_anomalyscores',
    display_name: 'Number of Anomaly Scores',
    desc: 'The current number of anomaly scores that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_associations',
    display_name: 'Number of Associations',
    desc: 'The current number of associations that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_associationsets',
    display_name: 'Number of Association Sets',
    desc: 'The current number of association sets that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_batchanomalyscores',
    display_name: 'Number of Batch Anomaly Scores',
    desc: 'The current number of batch anomaly scores that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_batchcentroids',
    display_name: 'Number of Batch Centroids',
    desc: 'The current number of batch centroids that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_batchpredictions',
    display_name: 'Number of Batch Predictions',
    desc: 'The current number of batch predictions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_batchtopicdistributions',
    display_name: 'Number of Batch Topic Distributions',
    desc: 'The current number of batch topic distributions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_centroids',
    display_name: 'Number of Centroids',
    desc: 'The current number of centroids that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_clusters',
    display_name: 'Number of Clusters',
    desc: 'The current number of clusters that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_correlations',
    display_name: 'Number of Correlations',
    desc: 'The current number of correlations that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_ensembles',
    display_name: 'Number of Ensembles',
    desc: 'The current number of ensembles that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_evaluations',
    display_name: 'Number of Evaluations',
    desc: 'The current number of evaluations that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_forecasts',
    display_name: 'Number of Forecasts',
    desc: 'The current number of forecasts that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_linearregressions',
    display_name: 'Number of Linear Regressions',
    desc: 'The current number of linear regressions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_logisticregressions',
    display_name: 'Number of Logistic Regressions',
    desc: 'The current number of logistic regressions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_models',
    display_name: 'Number of Models',
    desc: 'The current number of models that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_optimls',
    display_name: 'Number of OptiMLs',
    desc: 'The current number of optimls that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_predictions',
    display_name: 'Number of Predictions',
    desc: 'The current number of predictions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_statisticaltests',
    display_name: 'Number of Statistical Tests',
    desc: 'The current number of statistical tests that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_timeseries',
    display_name: 'Number of Time Series',
    desc: 'The current number of timeseries that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_topicdistributions',
    display_name: 'Number of Topic Distributions',
    desc: 'The current number of topic distributions that use this dataset (filterable, sortable)',
  },
  {
    value: 'number_of_topicmodels',
    display_name: 'Number of Topic Models',
    desc: 'The current number of topic models that use this dataset (filterable, sortable)',
  },
  { value: 'category', display_name: 'Category' },
  { value: 'name', display_name: 'Name' },
  { value: 'created', display_name: 'Created' },
  { value: 'price', display_name: 'Price' },
  { value: 'tags', display_name: 'Tags' },
  { value: 'size', display_name: 'Size' },
  { value: 'updated', display_name: 'Updated' },
] satisfies IQoreAllowedValue<string>[];
