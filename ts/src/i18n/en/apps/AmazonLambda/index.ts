/* eslint-disable max-len */
const AmazonLambdaAppEn = {
  displayName: 'AWS Lambda',
  groups: ['DevOps & Cloud Infrastructure'],
  shortDesc: 'Serverless compute service that runs code without provisioning or managing servers.',
  longDesc:
    'Amazon Lambda is a serverless compute service that lets you run code without provisioning or managing servers. This integration provides comprehensive actions and triggers to manage Lambda functions, layers, and invocations. You can list functions, invoke them, manage layers, and monitor new function and layer version creation.',
  actions: {
    list_functions: {
      displayName: 'List Functions',
      shortDesc: 'Retrieve a list of Lambda functions in your AWS account.',
      longDesc:
        'Returns a paginated list of Lambda functions in a specified region. You can optionally filter by function version, master region, and control pagination with max items and markers.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where Lambda functions are located',
          longDesc:
            'Specify the AWS region to list Lambda functions from. Defaults to us-east-1 if not specified.',
        },
        function_version: {
          displayName: 'Function Version',
          shortDesc: 'Version of functions to retrieve',
          longDesc:
            'Set to ALL to include all published versions of each function, or leave empty for latest versions only.',
        },
        master_region: {
          displayName: 'Master Region',
          shortDesc: 'Filter functions by master region for Lambda@Edge',
          longDesc: 'For Lambda@Edge functions, specify the master region to filter results.',
        },
        max_items: {
          displayName: 'Maximum Items',
          shortDesc: 'Maximum number of functions to return',
          longDesc: 'Limit the number of functions returned in a single request.',
        },
        next_marker: {
          displayName: 'Next Marker',
          shortDesc: 'Pagination marker for retrieving additional results',
          longDesc: 'Use the marker from a previous response to retrieve the next page of results.',
        },
      },
    },
    get_function: {
      displayName: 'Get Function',
      shortDesc: 'Retrieve detailed information about a specific Lambda function.',
      longDesc:
        'Returns comprehensive information about a Lambda function including configuration, code details, tags, and concurrency settings. Useful for inspecting function properties and current state.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the function is located',
          longDesc:
            'Specify the AWS region where the Lambda function resides. Defaults to us-east-1 if not specified.',
        },
        function_name: {
          displayName: 'Function Name',
          shortDesc: 'Name or ARN of the Lambda function',
          longDesc:
            'The name, ARN, or partial ARN of the Lambda function to retrieve information for.',
        },
        qualifier: {
          displayName: 'Qualifier',
          shortDesc: 'Function version or alias',
          longDesc:
            'Specify a version number, alias name, or $LATEST to get information for a specific version of the function.',
        },
      },
    },
    invoke_function: {
      displayName: 'Invoke Function',
      shortDesc: 'Execute a Lambda function with custom payload.',
      longDesc:
        'Invokes a Lambda function synchronously or asynchronously with a custom JSON payload. You can specify invocation type, logging preferences, and function version.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the function is located',
          longDesc:
            'Specify the AWS region where the Lambda function resides. Defaults to us-east-1 if not specified.',
        },
        function_name: {
          displayName: 'Function Name',
          shortDesc: 'Name or ARN of the Lambda function to invoke',
          longDesc: 'The name, ARN, or partial ARN of the Lambda function to invoke.',
        },
        invocation_type: {
          displayName: 'Invocation Type',
          shortDesc: 'How to invoke the function',
          longDesc:
            'RequestResponse for synchronous execution, Event for asynchronous execution, or DryRun to validate parameters without invoking.',
        },
        log_type: {
          displayName: 'Log Type',
          shortDesc: 'Include execution logs in response',
          longDesc:
            'Set to Tail to include the last 4KB of execution logs in the response, or None to exclude logs.',
        },
        payload: {
          displayName: 'Payload',
          shortDesc: 'JSON payload to send to the function',
          longDesc:
            'JSON string containing the data to pass to your Lambda function. Must be valid JSON format.',
        },
        qualifier: {
          displayName: 'Qualifier',
          shortDesc: 'Function version or alias to invoke',
          longDesc:
            'Specify a version number, alias name, or $LATEST to invoke a specific version of the function.',
        },
      },
    },
    list_layers: {
      displayName: 'List Layers',
      shortDesc: 'Retrieve a list of Lambda layers in your AWS account.',
      longDesc:
        'Returns a paginated list of Lambda layers in a specified region. You can filter by compatible runtime and control pagination with max items and markers.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where Lambda layers are located',
          longDesc:
            'Specify the AWS region to list Lambda layers from. Defaults to us-east-1 if not specified.',
        },
        compatible_runtime: {
          displayName: 'Compatible Runtime',
          shortDesc: 'Filter layers by compatible runtime',
          longDesc:
            'Return only layers that are compatible with the specified runtime environment.',
        },
        max_items: {
          displayName: 'Maximum Items',
          shortDesc: 'Maximum number of layers to return',
          longDesc: 'Limit the number of layers returned in a single request.',
        },
        next_marker: {
          displayName: 'Next Marker',
          shortDesc: 'Pagination marker for retrieving additional results',
          longDesc: 'Use the marker from a previous response to retrieve the next page of results.',
        },
      },
    },
    list_layer_versions: {
      displayName: 'List Layer Versions',
      shortDesc: 'Retrieve versions of a specific Lambda layer.',
      longDesc:
        'Returns a paginated list of versions for a specific Lambda layer. You can filter by compatible runtime and control pagination.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the layer is located',
          longDesc:
            'Specify the AWS region where the Lambda layer resides. Defaults to us-east-1 if not specified.',
        },
        layer_name: {
          displayName: 'Layer Name',
          shortDesc: 'Name or ARN of the Lambda layer',
          longDesc: 'The name or ARN of the Lambda layer to list versions for.',
        },
        compatible_runtime: {
          displayName: 'Compatible Runtime',
          shortDesc: 'Filter versions by compatible runtime',
          longDesc:
            'Return only layer versions that are compatible with the specified runtime environment.',
        },
        max_items: {
          displayName: 'Maximum Items',
          shortDesc: 'Maximum number of versions to return',
          longDesc: 'Limit the number of layer versions returned in a single request.',
        },
        next_marker: {
          displayName: 'Next Marker',
          shortDesc: 'Pagination marker for retrieving additional results',
          longDesc: 'Use the marker from a previous response to retrieve the next page of results.',
        },
      },
    },
    get_layer_version: {
      displayName: 'Get Layer Version',
      shortDesc: 'Retrieve detailed information about a specific layer version.',
      longDesc:
        'Returns comprehensive information about a specific version of a Lambda layer including content details, compatible runtimes, and metadata.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region where the layer is located',
          longDesc:
            'Specify the AWS region where the Lambda layer resides. Defaults to us-east-1 if not specified.',
        },
        layer_name: {
          displayName: 'Layer Name',
          shortDesc: 'Name or ARN of the Lambda layer',
          longDesc: 'The name or ARN of the Lambda layer to retrieve version information for.',
        },
        version_number: {
          displayName: 'Version Number',
          shortDesc: 'Specific version number of the layer',
          longDesc: 'The version number of the layer to retrieve detailed information for.',
        },
      },
    },
  },
  triggers: {
    new_function: {
      displayName: 'New Function',
      shortDesc: 'Triggers when a new Lambda function is created.',
      longDesc:
        'Monitors your AWS account for newly created Lambda functions in a specified region. This trigger fires when a new function is detected, providing comprehensive function details.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for new functions',
          longDesc:
            'Specify the AWS region to monitor for new Lambda function creation. Defaults to us-east-1 if not specified.',
        },
      },
    },
    new_layer_version: {
      displayName: 'New Layer Version',
      shortDesc: 'Triggers when a new Lambda layer version is published.',
      longDesc:
        'Monitors your AWS account for newly published Lambda layer versions in a specified region. This trigger fires when a new layer version is detected, providing layer version details.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for new layer versions',
          longDesc:
            'Specify the AWS region to monitor for new Lambda layer version creation. Defaults to us-east-1 if not specified.',
        },
      },
    },
  },
};

export default AmazonLambdaAppEn;
