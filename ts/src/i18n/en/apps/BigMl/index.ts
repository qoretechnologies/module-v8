/* eslint-disable max-len */
const BigMlAppEn = {
  displayName: 'BigML',
  shortDesc: 'Machine learning platform for predictive analytics',
  longDesc: `Connect your BigML account to build, evaluate, and deploy machine learning models at scale. Create datasets, build predictive models, perform anomaly detection, cluster analysis, and time series forecasting. Automate your machine learning workflows and integrate predictive analytics into your applications with BigML's comprehensive machine learning platform.`,
  actions: {
    create_anomaly_score: {
      displayName: 'Create Anomaly Score',
      shortDesc: 'Create an anomaly score for detecting outliers in data',
      longDesc:
        'Generate an anomaly score by applying a trained anomaly detector to input data. This helps identify unusual patterns or outliers in your dataset.',
      options: {
        anomaly: {
          displayName: 'Anomaly Detector',
          shortDesc: 'The anomaly detector to use for scoring',
          longDesc:
            'Select the trained anomaly detector model that will be used to generate the anomaly score for the input data.',
        },
        input_data: {
          displayName: 'Input Data',
          shortDesc: 'The data to analyze for anomalies',
          longDesc:
            'Provide the input data that you want to analyze for anomalies. The data should match the format expected by the selected anomaly detector.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Name for the anomaly score',
          longDesc:
            'Optional name to identify this anomaly score in your BigML dashboard and for future reference.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the anomaly score',
          longDesc:
            'Optional description to provide additional context about this anomaly score and its purpose.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for organizing anomaly scores',
          longDesc:
            'Optional tags to help organize and categorize your anomaly scores for easier management and searching.',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'Project to organize the anomaly score',
          longDesc:
            'Optional project to organize this anomaly score with related resources for better workflow management.',
        },
      },
    },
    create_batch_anomaly_score: {
      displayName: 'Create Batch Anomaly Score',
      shortDesc: 'Create anomaly scores for multiple data points in batch',
      longDesc:
        'Generate anomaly scores for multiple data points at once by applying an anomaly detector to a dataset. This is efficient for processing large amounts of data.',
      options: {
        anomaly: {
          displayName: 'Anomaly Detector',
          shortDesc: 'The anomaly detector to use for batch scoring',
          longDesc:
            'Select the trained anomaly detector model that will be used to generate anomaly scores for all data points in the dataset.',
        },
        dataset: {
          displayName: 'Dataset',
          shortDesc: 'The dataset to analyze for anomalies',
          longDesc:
            'Select the dataset containing multiple data points that you want to analyze for anomalies using the selected anomaly detector.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Name for the batch anomaly score',
          longDesc:
            'Optional name to identify this batch anomaly score in your BigML dashboard and for future reference.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the batch anomaly score',
          longDesc:
            'Optional description to provide additional context about this batch anomaly score and its purpose.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for organizing batch anomaly scores',
          longDesc:
            'Optional tags to help organize and categorize your batch anomaly scores for easier management and searching.',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'Project to organize the batch anomaly score',
          longDesc:
            'Optional project to organize this batch anomaly score with related resources for better workflow management.',
        },
      },
    },
    create_centroid: {
      displayName: 'Create Centroid',
      shortDesc: 'Find the closest cluster centroid for input data',
      longDesc:
        'Determine which cluster centroid is closest to the provided input data using a trained cluster model. This helps classify new data points into existing clusters.',
      options: {
        cluster: {
          displayName: 'Cluster Model',
          shortDesc: 'The cluster model to use for centroid calculation',
          longDesc:
            'Select the trained cluster model that will be used to find the closest centroid for the input data.',
        },
        input_data: {
          displayName: 'Input Data',
          shortDesc: 'The data to find the closest centroid for',
          longDesc:
            'Provide the input data for which you want to find the closest cluster centroid. The data should match the format used to train the cluster model.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Name for the centroid result',
          longDesc:
            'Optional name to identify this centroid calculation in your BigML dashboard and for future reference.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the centroid calculation',
          longDesc:
            'Optional description to provide additional context about this centroid calculation and its purpose.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for organizing centroid results',
          longDesc:
            'Optional tags to help organize and categorize your centroid calculations for easier management and searching.',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'Project to organize the centroid result',
          longDesc:
            'Optional project to organize this centroid calculation with related resources for better workflow management.',
        },
      },
    },
    create_prediction: {
      displayName: 'Create Prediction',
      shortDesc: 'Generate predictions using trained models',
      longDesc:
        'Create predictions for new data using trained machine learning models, ensembles, or deep networks. This allows you to apply your trained models to make predictions on new data.',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'The model to use for prediction',
          longDesc:
            'Select the trained model that will be used to generate predictions for the input data.',
        },
        ensemble: {
          displayName: 'Ensemble',
          shortDesc: 'The ensemble to use for prediction',
          longDesc:
            'Select the trained ensemble that will be used to generate predictions for the input data.',
        },
        deepnet: {
          displayName: 'Deep Network',
          shortDesc: 'The deep network to use for prediction',
          longDesc:
            'Select the trained deep network that will be used to generate predictions for the input data.',
        },
        input_data: {
          displayName: 'Input Data',
          shortDesc: 'The data to make predictions for',
          longDesc:
            'Provide the input data for which you want to generate predictions. The data should match the format used to train the selected model.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Name for the prediction',
          longDesc:
            'Optional name to identify this prediction in your BigML dashboard and for future reference.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the prediction',
          longDesc:
            'Optional description to provide additional context about this prediction and its purpose.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for organizing predictions',
          longDesc:
            'Optional tags to help organize and categorize your predictions for easier management and searching.',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'Project to organize the prediction',
          longDesc:
            'Optional project to organize this prediction with related resources for better workflow management.',
        },
      },
    },
    create_topic_distribution: {
      displayName: 'Create Topic Distribution',
      shortDesc: 'Generate topic distributions for text data',
      longDesc:
        'Create topic distributions for text data using a trained topic model. This helps understand the main topics present in your text and their relative importance.',
      options: {
        topicmodel: {
          displayName: 'Topic Model',
          shortDesc: 'The topic model to use for distribution analysis',
          longDesc:
            'Select the trained topic model that will be used to generate topic distributions for the input text data.',
        },
        input_data: {
          displayName: 'Input Data',
          shortDesc: 'The text data to analyze for topics',
          longDesc:
            'Provide the text data for which you want to generate topic distributions. The data should match the format used to train the topic model.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Name for the topic distribution',
          longDesc:
            'Optional name to identify this topic distribution in your BigML dashboard and for future reference.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the topic distribution',
          longDesc:
            'Optional description to provide additional context about this topic distribution and its purpose.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for organizing topic distributions',
          longDesc:
            'Optional tags to help organize and categorize your topic distributions for easier management and searching.',
        },
        project: {
          displayName: 'Project',
          shortDesc: 'Project to organize the topic distribution',
          longDesc:
            'Optional project to organize this topic distribution with related resources for better workflow management.',
        },
      },
    },
    list_anomaly_detectors: {
      displayName: 'List Anomaly Detectors',
      shortDesc: 'Retrieve a list of anomaly detectors',
      longDesc:
        'Get a paginated list of all anomaly detectors in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of anomaly detectors to return',
          longDesc:
            'Set the maximum number of anomaly detectors to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of anomaly detectors to skip',
          longDesc: 'Specify the number of anomaly detectors to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for anomaly detectors',
          longDesc:
            'Apply filters to narrow down the list of anomaly detectors based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the anomaly detectors.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering anomaly detectors.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering anomaly detectors.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for anomaly detectors',
          longDesc: 'Specify how to sort the list of anomaly detectors.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the anomaly detectors.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_clusters: {
      displayName: 'List Clusters',
      shortDesc: 'Retrieve a list of cluster models',
      longDesc:
        'Get a paginated list of all cluster models in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of clusters to return',
          longDesc:
            'Set the maximum number of cluster models to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of clusters to skip',
          longDesc: 'Specify the number of cluster models to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for clusters',
          longDesc:
            'Apply filters to narrow down the list of cluster models based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the cluster models.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering cluster models.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering cluster models.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for clusters',
          longDesc: 'Specify how to sort the list of cluster models.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the cluster models.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_datasets: {
      displayName: 'List Datasets',
      shortDesc: 'Retrieve a list of datasets',
      longDesc:
        'Get a paginated list of all datasets in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of datasets to return',
          longDesc:
            'Set the maximum number of datasets to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of datasets to skip',
          longDesc: 'Specify the number of datasets to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for datasets',
          longDesc: 'Apply filters to narrow down the list of datasets based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the datasets.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering datasets.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering datasets.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for datasets',
          longDesc: 'Specify how to sort the list of datasets.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the datasets.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_deepnets: {
      displayName: 'List Deep Networks',
      shortDesc: 'Retrieve a list of deep networks',
      longDesc:
        'Get a paginated list of all deep networks in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of deep networks to return',
          longDesc:
            'Set the maximum number of deep networks to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of deep networks to skip',
          longDesc: 'Specify the number of deep networks to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for deep networks',
          longDesc:
            'Apply filters to narrow down the list of deep networks based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the deep networks.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering deep networks.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering deep networks.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for deep networks',
          longDesc: 'Specify how to sort the list of deep networks.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the deep networks.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_ensembles: {
      displayName: 'List Ensembles',
      shortDesc: 'Retrieve a list of ensemble models',
      longDesc:
        'Get a paginated list of all ensemble models in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of ensembles to return',
          longDesc:
            'Set the maximum number of ensemble models to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of ensembles to skip',
          longDesc: 'Specify the number of ensemble models to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for ensembles',
          longDesc:
            'Apply filters to narrow down the list of ensemble models based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the ensemble models.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering ensemble models.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering ensemble models.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for ensembles',
          longDesc: 'Specify how to sort the list of ensemble models.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the ensemble models.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_models: {
      displayName: 'List Models',
      shortDesc: 'Retrieve a list of machine learning models',
      longDesc:
        'Get a paginated list of all machine learning models in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of models to return',
          longDesc:
            'Set the maximum number of models to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of models to skip',
          longDesc: 'Specify the number of models to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for models',
          longDesc: 'Apply filters to narrow down the list of models based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the models.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering models.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering models.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for models',
          longDesc: 'Specify how to sort the list of models.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the models.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_projects: {
      displayName: 'List Projects',
      shortDesc: 'Retrieve a list of projects',
      longDesc:
        'Get a paginated list of all projects in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of projects to return',
          longDesc:
            'Set the maximum number of projects to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of projects to skip',
          longDesc: 'Specify the number of projects to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for projects',
          longDesc: 'Apply filters to narrow down the list of projects based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the projects.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering projects.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering projects.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for projects',
          longDesc: 'Specify how to sort the list of projects.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the projects.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_sources: {
      displayName: 'List Sources',
      shortDesc: 'Retrieve a list of data sources',
      longDesc:
        'Get a paginated list of all data sources in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of sources to return',
          longDesc:
            'Set the maximum number of data sources to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of sources to skip',
          longDesc: 'Specify the number of data sources to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for sources',
          longDesc:
            'Apply filters to narrow down the list of data sources based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the data sources.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering data sources.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering data sources.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for sources',
          longDesc: 'Specify how to sort the list of data sources.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the data sources.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
    list_topic_models: {
      displayName: 'List Topic Models',
      shortDesc: 'Retrieve a list of topic models',
      longDesc:
        'Get a paginated list of all topic models in your BigML account with filtering and sorting options.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of topic models to return',
          longDesc:
            'Set the maximum number of topic models to return in a single request. Default is 20.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of topic models to skip',
          longDesc: 'Specify the number of topic models to skip for pagination purposes.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for topic models',
          longDesc:
            'Apply filters to narrow down the list of topic models based on specific criteria.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to filter by',
                longDesc: 'Select the field you want to use for filtering the topic models.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to filter for',
                longDesc: 'Specify the value to match when filtering topic models.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Filter comparison operator',
                longDesc: 'Choose the comparison operator to use when filtering topic models.',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sorting criteria for topic models',
          longDesc: 'Specify how to sort the list of topic models.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field you want to use for sorting the topic models.',
              },
              order: {
                displayName: 'Order',
                shortDesc: 'Sort order (ascending or descending)',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },
  },
  triggers: {
    new_resource: {
      displayName: 'New Resource',
      shortDesc: 'Triggers when a new BigML resource is created',
      longDesc:
        'Monitor your BigML account for newly created resources such as models, datasets, clusters, and other machine learning resources. This trigger allows you to automate workflows when specific types of resources are created.',
      options: {
        type: {
          displayName: 'Resource Type',
          shortDesc: 'Type of BigML resource to monitor',
          longDesc:
            'Select the specific type of BigML resource you want to monitor for new creations. The trigger will only fire when resources of this type are created.',
        },
        name: {
          displayName: 'Name Filter',
          shortDesc: 'Filter resources by name pattern',
          longDesc:
            'Optional filter to only trigger for resources whose names contain this text. Leave empty to monitor all resources of the selected type.',
        },
        project: {
          displayName: 'Project Filter',
          shortDesc: 'Filter resources by project',
          longDesc:
            'Optional filter to only trigger for resources created within a specific project. Leave empty to monitor resources across all projects.',
        },
        tags: {
          displayName: 'Tags Filter',
          shortDesc: 'Filter resources by tags',
          longDesc:
            'Optional filter to only trigger for resources that have any of the specified tags. Leave empty to monitor all resources regardless of tags.',
        },
      },
    },
  },
};

export default BigMlAppEn;
