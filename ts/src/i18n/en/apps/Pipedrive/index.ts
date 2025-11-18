/* eslint-disable max-len */

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
  expressions: {
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all arguments are True',
      longDesc: 'Returns `True` if all arguments are `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any argument is True',
      longDesc: 'Returns `True` if any argument is `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '==': {
      displayName: 'equal (==)',
      shortDesc: 'Equality comparison',
      longDesc: 'Returns `True` if the field value equals the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '!=': {
      displayName: 'not equal (!=)',
      shortDesc: 'Inequality comparison',
      longDesc: 'Returns `True` if the field value does not equal the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>': {
      displayName: 'greater than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field value is greater than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>=': {
      displayName: 'greater than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc: 'Returns `True` if the field value is greater than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<': {
      displayName: 'less than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field value is less than the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '<=': {
      displayName: 'less than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field value is less than or equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    like: {
      displayName: 'like',
      shortDesc: 'Pattern matching',
      longDesc: 'Returns `True` if the field value matches the specified pattern',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to perform pattern matching on',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Pattern to match',
          longDesc: 'The pattern to match against the field value',
        },
      ],
    },
    'is-null': {
      displayName: 'is null',
      shortDesc: 'Field is null',
      longDesc: 'Returns `True` if the field is null or has no value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for null value',
        },
      ],
    },
    'is-not-null': {
      displayName: 'is not null',
      shortDesc: 'Field is not null',
      longDesc: 'Returns `True` if the field has a value and is not null',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for a non-null value',
        },
      ],
    },
  },
};

export default PipedriveAppEn;
