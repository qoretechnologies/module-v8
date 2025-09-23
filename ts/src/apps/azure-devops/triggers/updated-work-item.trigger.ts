import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { DeregisterAzureDevOpsWebhook } from './constants';
import { getAzureDevOpsWorkItemFieldAllowedValues } from '../helpers/get-work-item-fields';

const action = 'updated_work_item';

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
  changedFields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAzureDevOpsWorkItemFieldAllowedValues,
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

    const { itemType, changedFields } = context?.opts || {};

    try {
      const subscriptionId = await createSubscription({
        token,
        organization,
        project,
        itemType,
        changedFields,
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

    const { itemType, changedFields } = context?.opts || {};

    let subscriptionId: string | undefined;
    const url = 'https://webhook.site/deee24af-96cb-44ad-a37d-5e1817bcf905';

    try {
      subscriptionId = await createSubscription({
        token,
        organization,
        project,
        itemType,
        changedFields,
        url,
      });

      const response = await QorusRequest.post<{ data: any }>(
        {
          path: '/_apis/hooks/testnotifications',
          params: {
            'api-version': '7.2-preview.1',
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
              eventType: 'workitem.updated',
              resourceVersion: '1.0',
              consumerId: 'webHooks',
              consumerActionId: 'httpRequest',
              publisherInputs: {
                projectId: project,
                ...(itemType && { workItemType: itemType }),
                ...(changedFields && { changedFields: changedFields.join(',') }),
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
    desc: 'Azure DevOps Work Item Updated Event',
    type: {
      type: 'hash',
      fields: {
        eventType: { type: 'string' },
        event: {
          type: {
            type: 'hash',
            fields: {
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
                    workItemId: { type: 'integer' },
                    rev: { type: 'integer' },
                    revisedBy: {
                      type: {
                        type: 'hash',
                        fields: {
                          id: { type: 'string' },
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
                          uniqueName: { type: 'string' },
                          imageUrl: { type: 'string' },
                          descriptor: { type: 'string' },
                        },
                      },
                    },
                    revisedDate: { type: 'string' },
                    fields: {
                      type: {
                        type: 'hash',
                        fields: {
                          'System.Rev': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.AuthorizedDate': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.RevisedDate': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.State': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.Reason': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.AssignedTo': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.ChangedDate': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'System.Watermark': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                          'Microsoft.VSTS.Common.Severity': {
                            type: {
                              type: 'hash',
                              fields: {
                                oldValue: { type: 'string' },
                                newValue: { type: 'string' },
                              },
                            },
                          },
                        },
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
                          parent: {
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
                        },
                      },
                    },
                    url: { type: 'string' },
                    revision: {
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
                                'WEF_EB329F44FE5F4A94ACB1DA153FDF38BA_Kanban.Column': {
                                  type: 'string',
                                },
                              },
                            },
                          },
                          multilineFieldsFormat: {
                            type: {
                              type: 'hash',
                            },
                          },
                          url: { type: 'string' },
                        },
                      },
                    },
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
        publisherId: { type: 'string' },
        consumerId: { type: 'string' },
        consumerActionId: { type: 'string' },
        consumerInputs: {
          type: {
            type: 'hash',
            fields: {
              url: { type: 'string' },
            },
          },
        },
        publisherInputs: {
          type: {
            type: 'hash',
            fields: {
              projectId: { type: 'string' },
              workItemType: { type: 'string' },
              changedFields: { type: 'string' },
            },
          },
        },
        queuedDate: { type: 'string' },
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
  changedFields?: string[];
}) => {
  const { token, organization, project, itemType, url, changedFields } = options;

  const subscription = {
    publisherId: 'tfs',
    eventType: 'workitem.updated',
    resourceVersion: '1.0',
    consumerId: 'webHooks',
    consumerActionId: 'httpRequest',
    publisherInputs: {
      projectId: project,
      ...(itemType && { workItemType: itemType }),
      ...(changedFields && { changedFields: changedFields.join(',') }),
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
        'api-version': '7.1',
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
