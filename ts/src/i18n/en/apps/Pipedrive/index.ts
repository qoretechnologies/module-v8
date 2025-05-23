

const PipedriveAppEn = {
  displayName: 'Pipedrive',
  shortDesc: 'Manage your sales pipeline and customer relationships with Pipedrive.',
  longDesc:
    'Pipedrive is a sales management tool designed to help small sales teams manage intricate or lengthy sales processes.',
  triggers: {
    pipedrive_activity_trigger: {
      displayName: 'Activity Action',
      shortDesc: 'Triggers when an action is performed on an activity',
      longDesc:
        'This trigger activates when a selected action is performed on an activity in Pipedrive. Actions include creating, updating, deleting an activity or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_deal_trigger: {
      displayName: 'Deal Action',
      shortDesc: 'Triggers when an action is performed on a deal',
      longDesc:
        'This trigger activates when a selected action is performed on a deal in Pipedrive. Actions include creating, updating, deleting a deal or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_lead_trigger: {
      displayName: 'Lead Action',
      shortDesc: 'Triggers when an action is performed on a lead',
      longDesc:
        'This trigger activates when a selected action is performed on a lead in Pipedrive. Actions include creating, updating, deleting a lead or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_note_trigger: {
      displayName: 'Note Action',
      shortDesc: 'Triggers when an action is performed on a note',
      longDesc:
        'This trigger activates when a selected action is performed on a note in Pipedrive. Actions include creating, updating, deleting a note or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_organization_trigger: {
      displayName: 'Organization Action',
      shortDesc: 'Triggers when an action is performed on an organization',
      longDesc:
        'This trigger activates when a selected action is performed on an organization in Pipedrive. Actions include creating, updating, deleting an organization or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_person_trigger: {
      displayName: 'Person Action',
      shortDesc: 'Triggers when an action is performed on a person',
      longDesc:
        'This trigger activates when a selected action is performed on a person in Pipedrive. Actions include creating, updating, deleting a person or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
    pipedrive_user_trigger: {
      displayName: 'User Action',
      shortDesc: 'Triggers when an action is performed on a user',
      longDesc:
        'This trigger activates when a selected action is performed on a user in Pipedrive. Actions include creating, updating, deleting a user or any change.',
      options: {
        action: {
          displayName: 'Action',
          shortDesc: 'Select the action that triggers the flow',
          longDesc:
            'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
        },
      },
    },
  },
};

export default PipedriveAppEn;
