import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import {
  AZURE_DEVOPS_API_VERSION,
  AZURE_DEVOPS_APP_NAME,
  AZURE_DEVOPS_SERVICE_HOOKS_TEST_API_VERSION,
  AzureDevOpsError,
} from '../constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { DeregisterAzureDevOpsWebhook } from './constants';

const action = 'new_work_item';

const options = {
  project: {
    type: 'string',
    required: true,
    get_allowed_values: getAzureDevOpsProjectAllowedValues,
  },
  itemType: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'Task', display_name: 'Task' },
      { value: 'Epic', display_name: 'Epic' },
      { value: 'Issue', display_name: 'Issue' },
      { value: 'Bug', display_name: 'Bug' },
      { value: 'User Story', display_name: 'User Story' },
    ],
  },
} satisfies TQoreOptions;

const NewWorkItem = QoreAppCreator.createLocalizedTrigger({
  app: AZURE_DEVOPS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, organization, project } = getQoreContextRequiredValues({
      context,
      optionFields: ['project'],
      connectionFields: ['token', 'organization'],
      ErrorClass: AzureDevOpsError,
    });

    const { itemType } = context?.opts || {};

    try {
      const subscriptionId = await createSubscription({
        token,
        organization,
        project,
        itemType,
        url,
      });

      return {
        subscriptionId,
      };
    } catch (error) {
      throw new AzureDevOpsError(
        `Failed to register webhook for ${humanizeNameTitle(action)}: ${error.message || error}`
      );
    }
  },
  webhook_deregister: DeregisterAzureDevOpsWebhook,
  get_example_event_data: async (context) => {
    const { token, organization, project } = getQoreContextRequiredValues({
      context,
      optionFields: ['project'],
      connectionFields: ['token', 'organization'],
      ErrorClass: AzureDevOpsError,
    });

    const { itemType } = context?.opts || {};

    let subscriptionId: string | undefined;
    const url = 'https://webhook.site/deee24af-96cb-44ad-a37d-5e1817bcf905';

    try {
      subscriptionId = await createSubscription({
        token,
        organization,
        project,
        itemType,
        url,
      });

      const response = await QorusRequest.post<{ data: any }>(
        {
          path: '/_apis/hooks/testnotifications',
          params: {
            'api-version': AZURE_DEVOPS_SERVICE_HOOKS_TEST_API_VERSION,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            SubscriptionId: subscriptionId,
            Details: {
              publisherId: 'tfs',
              eventType: 'workitem.created',
              resourceVersion: '1.0',
              consumerId: 'webHooks',
              consumerActionId: 'httpRequest',
              publisherInputs: {
                ...(itemType && { workItemType: itemType }),
                projectId: project,
              },
              consumerInputs: {
                url,
              },
            },
          },
        },
        {
          url: `https://dev.azure.com/${organization}`,
          endpointId: AZURE_DEVOPS_APP_NAME,
        }
      );

      DeregisterAzureDevOpsWebhook(context, url, { subscriptionId });

      return response?.data?.details;
    } catch (error) {
      throw new AzureDevOpsError(
        `Failed to register webhook for ${humanizeNameTitle(action)}: ${error.message || error}`
      );
    }
  },

  event_info: {
    desc: 'Azure DevOps Work Item Created Event',
    type: {
      type: 'hash',
      fields: {
        subscriptionId: { type: 'string' },
        notificationId: { type: 'integer' },
        id: { type: 'string' },
        eventType: { type: 'string' },
        publisherId: { type: 'string' },
        message: {
          type: {
            type: 'hash',
            fields: {
              text: { type: 'string' },
              html: { type: 'string' },
              markdown: { type: 'string' },
            },
          },
        },
        detailedMessage: {
          type: {
            type: 'hash',
            fields: {
              text: { type: 'string' },
              html: { type: 'string' },
              markdown: { type: 'string' },
            },
          },
        },
        resource: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              rev: { type: 'integer' },
              fields: {
                type: {
                  type: 'hash',
                  fields: {
                    'System.AreaPath': { type: 'string' },
                    'System.TeamProject': { type: 'string' },
                    'System.IterationPath': { type: 'string' },
                    'System.WorkItemType': { type: 'string' },
                    'System.State': { type: 'string' },
                    'System.Reason': { type: 'string' },
                    'System.CreatedDate': { type: 'string' },
                    'System.CreatedBy': {
                      type: {
                        type: 'hash',
                        fields: {
                          displayName: { type: 'string' },
                          url: { type: 'string' },
                          _links: {
                            type: {
                              type: 'hash',
                              fields: {
                                avatar: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      href: { type: 'string' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          id: { type: 'string' },
                          uniqueName: { type: 'string' },
                          imageUrl: { type: 'string' },
                          descriptor: { type: 'string' },
                        },
                      },
                    },
                    'System.ChangedDate': { type: 'string' },
                    'System.ChangedBy': {
                      type: {
                        type: 'hash',
                        fields: {
                          displayName: { type: 'string' },
                          url: { type: 'string' },
                          _links: {
                            type: {
                              type: 'hash',
                              fields: {
                                avatar: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      href: { type: 'string' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          id: { type: 'string' },
                          uniqueName: { type: 'string' },
                          imageUrl: { type: 'string' },
                          descriptor: { type: 'string' },
                        },
                      },
                    },
                    'System.Title': { type: 'string' },
                    'Microsoft.VSTS.Common.Severity': { type: 'string' },
                    'WEF_EB329F44FE5F4A94ACB1DA153FDF38BA_Kanban.Column': { type: 'string' },
                  },
                },
              },
              multilineFieldsFormat: {
                type: {
                  type: 'hash',
                },
              },
              _links: {
                type: {
                  type: 'hash',
                  fields: {
                    self: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    workItemUpdates: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    workItemRevisions: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    workItemType: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    fields: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              url: { type: 'string' },
            },
          },
        },
        resourceVersion: { type: 'string' },
        resourceContainers: {
          type: {
            type: 'hash',
            fields: {
              collection: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                  },
                },
              },
              account: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                  },
                },
              },
              project: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        createdDate: { type: 'string' },
      },
    },
  },
});

export default NewWorkItem;

const createSubscription = async (options: {
  token: string;
  organization: string;
  project: string;
  itemType?: string;
  url: string;
}) => {
  const { token, organization, project, itemType, url } = options;

  const subscription = {
    publisherId: 'tfs',
    eventType: 'workitem.created',
    resourceVersion: '1.0',
    consumerId: 'webHooks',
    consumerActionId: 'httpRequest',
    publisherInputs: {
      projectId: project,
      ...(itemType && { workItemType: itemType }),
    },
    consumerInputs: {
      url,
      httpHeaders: 'Content-Type: application/json',
      resourceDetailsToSend: 'all',
      messagesToSend: 'all',
      detailedMessagesToSend: 'all',
    },
  };

  const response = await QorusRequest.post<{ data: any }>(
    {
      path: '/_apis/hooks/subscriptions',
      params: {
        'api-version': AZURE_DEVOPS_API_VERSION,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: subscription,
    },
    {
      url: `https://dev.azure.com/${organization}`,
      endpointId: AZURE_DEVOPS_APP_NAME,
    }
  );

  const createdSubscription = response?.data;

  if (!createdSubscription?.id) {
    throw new Error('Failed to create subscription - no ID returned');
  }

  return createdSubscription.id;
};
