/* eslint-disable max-len */
const AmazonCloudFrontAppEn = {
  displayName: 'CloudFront',
  groups: ['DevOps & Cloud Infrastructure'],
  shortDesc:
    'Connect to Amazon CloudFront to manage CDN distributions, cache invalidations, and content delivery.',
  longDesc:
    'The Amazon CloudFront integration provides comprehensive actions and triggers to manage your content delivery network (CDN) distributions. Monitor new distributions and invalidations, enable or disable distributions, create cache invalidations, and retrieve detailed distribution configurations. Perfect for automating CDN management, cache clearing workflows, and distribution monitoring in your AWS infrastructure.',
  connectionMessage: {
    title: 'Connect to Amazon CloudFront',
    content: `To connect to Amazon CloudFront, you will need your **AWS Access Key ID**, **Secret Access Key**, and **Region**.

## Creating AWS Credentials

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/iam/)
2. Navigate to **IAM** → **Users** → **Create user**
3. Enter a username and click **Next**
4. Attach the **CloudFrontFullAccess** policy (or create a custom policy with minimum required permissions)
5. Click **Create user**
6. Select the user → **Security credentials** tab → **Create access key**
7. Choose **Third-party service** and create the key
8. Save your **Access Key ID** and **Secret Access Key** securely

## Connection Details

### Access Key ID
Your AWS access key ID (starts with \`AKIA\`)

### Secret Access Key
Your AWS secret access key (only shown once when created)

### Region
The AWS region for your CloudFront operations (e.g., \`us-east-1\`)

**Note:** For security, create a dedicated IAM user with only the permissions needed for your use case. Avoid using root account credentials.`,
  },
  triggers: {
    new_distribution: {
      displayName: 'New Distribution',
      shortDesc: 'Triggers when a new CloudFront distribution is created',
      longDesc:
        'This trigger monitors for newly created CloudFront distributions in your AWS account. It will fire whenever a new distribution is detected, providing details about the distribution configuration and status.',
    },
    new_invalidation: {
      displayName: 'New Invalidation',
      shortDesc: 'Triggers when a new invalidation is created for a distribution',
      longDesc:
        'This trigger monitors for new cache invalidations created for a specific CloudFront distribution. It will fire whenever a new invalidation request is submitted, providing details about the invalidation status and affected paths.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The CloudFront distribution to monitor for invalidations',
          longDesc:
            'Select the specific CloudFront distribution that you want to monitor for new invalidation requests. The trigger will only fire for invalidations created for this distribution.',
        },
      },
    },
  },
  actions: {
    list_distributions: {
      displayName: 'List Distributions',
      shortDesc: 'Retrieve a list of CloudFront distributions',
      longDesc:
        'Fetches a list of all CloudFront distributions in your AWS account, including their status, domain names, and configuration details. You can control the number of results and use pagination for large sets of distributions.',
      options: {
        max_items: {
          displayName: 'Max Items',
          shortDesc: 'Maximum number of distributions to return',
          longDesc:
            'Specify the maximum number of distributions to return in a single request. Default is 100. Use this to control pagination and response size.',
        },
        marker: {
          displayName: 'Marker',
          shortDesc: 'Pagination marker for continuing from previous request',
          longDesc:
            'Use this marker to continue pagination from a previous list request. This value is returned in the next_marker field of previous responses when results are truncated.',
        },
      },
    },
    get_distribution: {
      displayName: 'Get Distribution',
      shortDesc: 'Retrieve detailed information about a specific distribution',
      longDesc:
        'Fetches comprehensive details about a specific CloudFront distribution, including its configuration, origins, cache behaviors, and current status. This provides complete information about how the distribution is configured.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The ID of the distribution to retrieve',
          longDesc:
            'Select the specific CloudFront distribution you want to get detailed information about. This will return the complete configuration and status of the distribution.',
        },
      },
    },
    update_distribution_status: {
      displayName: 'Update Distribution Status',
      shortDesc: 'Enable or disable a CloudFront distribution',
      longDesc:
        'Updates the enabled/disabled status of a CloudFront distribution. When you disable a distribution, it stops serving content and you stop being charged for it. Enabling it again will resume content delivery.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The ID of the distribution to update',
          longDesc:
            'Select the CloudFront distribution whose status you want to change. The distribution must exist and be in a state that allows status changes.',
        },
        enabled: {
          displayName: 'Enable Distribution',
          shortDesc: 'Set to true to enable the distribution, false to disable it',
          longDesc:
            'Choose whether to enable or disable the distribution. Enabling allows the distribution to serve content, while disabling stops content delivery and billing. Status changes can take time to propagate.',
        },
      },
    },
    invalidate_item: {
      displayName: 'Invalidate Item',
      shortDesc: 'Create an invalidation request to clear cached content',
      longDesc:
        'Creates an invalidation request to remove specific files from CloudFront edge caches. This forces CloudFront to fetch fresh content from the origin for the specified paths on the next request.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The ID of the distribution to invalidate content for',
          longDesc:
            'Select the CloudFront distribution where you want to invalidate cached content. The invalidation will apply to all edge locations for this distribution.',
        },
        paths: {
          displayName: 'Paths to Invalidate',
          shortDesc: 'List of file paths to invalidate from the cache',
          longDesc:
            'Specify the paths of files you want to invalidate from the CloudFront cache. Use /* to invalidate all files, or specify individual file paths like /images/logo.png. Paths should start with /.',
        },
        caller_reference: {
          displayName: 'Caller Reference',
          shortDesc: 'Unique identifier for this invalidation request',
          longDesc:
            'Optional unique identifier for this invalidation request. If not provided, a unique value will be generated automatically. This helps track and identify specific invalidation requests.',
        },
      },
    },
    list_invalidations: {
      displayName: 'List Invalidations',
      shortDesc: 'Retrieve a list of invalidations for a distribution',
      longDesc:
        'Fetches a list of cache invalidation requests for a specific CloudFront distribution, showing their status and creation times. This helps you track the progress and history of invalidation requests.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The ID of the distribution to list invalidations for',
          longDesc:
            'Select the CloudFront distribution whose invalidation history you want to retrieve. This will show all invalidation requests made for this distribution.',
        },
        max_items: {
          displayName: 'Max Items',
          shortDesc: 'Maximum number of invalidations to return',
          longDesc:
            'Specify the maximum number of invalidation records to return in a single request. Default is 100. Use this to control pagination and response size.',
        },
        marker: {
          displayName: 'Marker',
          shortDesc: 'Pagination marker for continuing from previous request',
          longDesc:
            'Use this marker to continue pagination from a previous list request. This value is returned in the next_marker field of previous responses when results are truncated.',
        },
      },
    },
    get_invalidation: {
      displayName: 'Get Invalidation',
      shortDesc: 'Retrieve details about a specific invalidation request',
      longDesc:
        'Fetches detailed information about a specific cache invalidation request, including its status, the paths being invalidated, and timing information. Use this to check the progress of an invalidation.',
      options: {
        distribution_id: {
          displayName: 'Distribution ID',
          shortDesc: 'The ID of the distribution the invalidation belongs to',
          longDesc:
            'Select the CloudFront distribution that the invalidation request was created for. This is required to locate the specific invalidation.',
        },
        invalidation_id: {
          displayName: 'Invalidation ID',
          shortDesc: 'The ID of the invalidation request to retrieve',
          longDesc:
            'Select the specific invalidation request you want to get details about. This will show the complete information about the invalidation including its current status and affected paths.',
        },
      },
    },
  },
};

export default AmazonCloudFrontAppEn;
