export const AsanaEventInfo = {
  desc: 'Event data',
  type: {
    fields: {
      events: {
        displayName: 'Events',
        shortDesc: 'List of event objects',
        longDesc:
          'An array containing event objects that represent individual changes or actions within Asana.',
        type: {
          fields: {
            action: {
              displayName: 'Action',
              shortDesc: 'Type of action performed',
              longDesc:
                "Specifies the nature of the action that triggered the event; for task completion, this is typically 'changed'.",
              type: 'string',
            },
            parent: {
              displayName: 'Parent resource',
              shortDesc: 'Parent resource details',
              longDesc:
                'Information about the parent resource associated with the event, if applicable. For tasks, this could be the project or parent task.',
              type: {
                fields: {
                  gid: {
                    displayName: 'Parent GID',
                    shortDesc: 'Globally unique identifier of the parent resource',
                    longDesc: 'The unique identifier assigned to the parent resource within Asana.',
                    type: 'string',
                  },
                  resource_type: {
                    displayName: 'Parent resource type',
                    shortDesc: 'Type of the parent resource',
                    longDesc:
                      "The specific type of the parent resource, such as 'project' or 'task'.",
                    type: 'string',
                  },
                  resource_subtype: {
                    displayName: 'Parent resource subtype',
                    shortDesc: 'Subtype of the parent resource',
                    longDesc:
                      'The subtype classification of the parent resource, providing more specific categorization.',
                    type: 'string',
                  },
                },
              },
            },
            resource: {
              displayName: 'Resource',
              shortDesc: 'Affected resource details',
              longDesc:
                'Information about the resource that was directly affected by the event; in this case, the task that was completed.',
              type: {
                fields: {
                  gid: {
                    displayName: 'Resource GID',
                    shortDesc: 'Globally unique identifier of the resource',
                    longDesc: 'The unique identifier assigned to the resource within Asana.',
                    type: 'string',
                  },
                  resource_type: {
                    displayName: 'Resource type',
                    shortDesc: 'Type of the resource',
                    longDesc:
                      "The specific type of the resource, which would be 'task' for task completion events.",
                    type: 'string',
                  },
                  resource_subtype: {
                    displayName: 'Resource subtype',
                    shortDesc: 'Subtype of the resource',
                    longDesc:
                      'The subtype classification of the resource, providing more specific categorization.',
                    type: 'string',
                  },
                },
              },
            },
            change: {
              displayName: 'Change details',
              shortDesc: 'Details of the change',
              longDesc:
                'Specific information about the change that occurred, including the field affected and the nature of the change.',
              type: {
                fields: {
                  field: {
                    displayName: 'Changed field',
                    shortDesc: 'Field that was changed',
                    longDesc:
                      "The specific field within the resource that was modified; for task completion, this is 'completed'.",
                    type: 'string',
                  },
                  action: {
                    displayName: 'Change action',
                    shortDesc: 'Nature of the change',
                    longDesc:
                      "Describes how the field was changed; for task completion, this is 'changed'.",
                    type: 'string',
                  },
                },
              },
            },
            user: {
              displayName: 'User',
              shortDesc: 'User details',
              longDesc:
                'Information about the user who initiated the action that triggered the event.',
              type: {
                fields: {
                  gid: {
                    displayName: 'User GID',
                    shortDesc: 'Globally unique identifier of the user',
                    longDesc: 'The unique identifier assigned to the user within Asana.',
                    type: 'string',
                  },
                  resource_type: {
                    displayName: 'User resource type',
                    shortDesc: 'Type of the user resource',
                    longDesc:
                      "The resource type, typically 'user', indicating the entity is a user.",
                    type: 'string',
                  },
                },
              },
            },
            created_at: {
              displayName: 'Creation timestamp',
              shortDesc: 'Event creation time',
              longDesc: 'The timestamp indicating when the event was created.',
              type: 'string',
            },
          },
        },
      },
    },
  },
};
