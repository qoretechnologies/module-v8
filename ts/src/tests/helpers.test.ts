import {
  EQoreAppActionCode,
  IQorePartialAppActionWithSwaggerPath,
  TQoreTypeObject,
  TQoreOptions,
  TQorePartialEventAction,
} from 'global/models/qore';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema, fixOptions, mapTriggersToApp } from '../global/helpers';
import eSignature from '../schemas/esignature.swagger.json';

describe('Helpers tests', () => {
  it('Properly parses a swagger schema and creates actions', () => {
    const actions: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema({
      schema: eSignature as OpenAPIV2.Document,
      allowedPaths: { '/v2.1/accounts': {}, '/v2.1/accounts/{accountId}/connect/oauth': {} },
    });

    expect(actions).toHaveLength(5);
    expect(actions[0].action).toBe('Accounts_PostAccounts');
    expect(actions[0].swagger_path).toBe('/v2.1/accounts/POST');
    expect(actions[0].display_name).toBe('Creates new accounts.');
    expect(actions[0].short_desc).toBe('Creates new accounts.');
  });

  it('Properly parses a swagger schema and creates actions with filtered methods', () => {
    const actionsWithoutFilter: IQorePartialAppActionWithSwaggerPath[] =
      buildActionsFromSwaggerSchema({
        schema: eSignature as OpenAPIV2.Document,
        allowedPaths: {
          '/v2.1/accounts/{accountId}': {},
        },
      });

    expect(actionsWithoutFilter).toHaveLength(2);
    expect(actionsWithoutFilter[0].action).toBe('Accounts_GetAccount');
    expect(actionsWithoutFilter[1].action).toBe('Accounts_DeleteAccount');

    const actionsWithFilter: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema(
      {
        schema: eSignature as OpenAPIV2.Document,
        allowedPaths: { '/v2.1/accounts/{accountId}': { DELETE: {} } },
      }
    );

    expect(actionsWithFilter).toHaveLength(1);
    expect(actionsWithFilter[0].action).toBe('Accounts_DeleteAccount');
  });

  it('Properly parses a swagger schema and creates actions with changed action data', () => {
    const actionsWithFilter: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema(
      {
        schema: eSignature as OpenAPIV2.Document,
        allowedPaths: {
          '/v2.1/accounts/{accountId}': {
            DELETE: {
              display_name: 'Testing name',
            },
          },
        },
      }
    );

    expect(actionsWithFilter).toHaveLength(1);
    expect(actionsWithFilter[0].action).toBe('Accounts_DeleteAccount');
    expect(actionsWithFilter[0].display_name).toBe('Testing name');
    expect(actionsWithFilter[0].short_desc).toBeDefined();
  });

  it('Properly parses a swagger schema and creates actions with changed data using processor', () => {
    let newDisplayName;
    const actionsWithFilter: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema(
      {
        schema: eSignature as OpenAPIV2.Document,
        allowedPaths: {
          '/v2.1/accounts/{accountId}': {
            DELETE: {
              processor: (data) => {
                newDisplayName = data.summary;

                return { display_name: data.summary };
              },
            },
          },
        },
      }
    );

    expect(actionsWithFilter).toHaveLength(1);
    expect(actionsWithFilter[0].action).toBe('Accounts_DeleteAccount');
    expect(actionsWithFilter[0].display_name).toBe(newDisplayName);
    expect(actionsWithFilter[0].short_desc).toBeDefined();
  });

  it('Should receive partially incomplete deep action options and return fixed deep options', () => {
    const incompleteOptions = {
      option1: {
        type: {
          type: 'hash',
          fields: {
            subOption1: {
              type: 'string',
              required: true,
            },
            subOption2: {
              required: true,
              type: {
                type: 'hash',
                fields: {
                  subSubOption1: {
                    desc: 'Deep option',
                    type: 'string',
                    required: true,
                  },
                },
              },
            },
          },
        },
        example_value: {
          subOption1: 'example',
          subOption2: {
            subSubOption1: 'example',
          },
        },
        required: true,
      },
      option2: {
        type: 'string',
        example_value: 'example',
        required: true,
      },
    } satisfies TQoreOptions;

    const fixedOptions = fixOptions(
      { options: incompleteOptions, action: 'test', action_code: EQoreAppActionCode.ACTION },
      incompleteOptions,
      '_testing',
      'en'
    );

    expect(fixedOptions.option2.display_name).toBe('Second Option');
    expect(fixedOptions.option1.display_name).toBe('Option 1');
    const option1Fields = (fixedOptions.option1.type as TQoreTypeObject).fields;
    expect(option1Fields.subOption1.display_name).toBe('Sub Option 1 of option 1');
    expect(option1Fields.subOption2.display_name).toBe('Sub Option 2 of option 1');

    const subOption2Fields = (option1Fields.subOption2.type as TQoreTypeObject).fields;
    const subSubOption1 = subOption2Fields.subSubOption1;
    expect(subSubOption1.display_name).toBe('Sub Sub Option 1');
    expect(subSubOption1.desc).toBe('Deep option');
    expect(subSubOption1.short_desc).toBe('Sub Sub Option 1 Short Description');

    expect(subOption2Fields.subSubOption1.short_desc).toBe('Sub Sub Option 1 Short Description');
  });
});

it('Should map a trigger to app', () => {
  const trigger = {
    action: '_testing',
    action_code: EQoreAppActionCode.EVENT,
    event_info: {
      desc: 'Test event',
      type: {
        type: 'hash',
        fields: {
          testTriggerInfo: {
            type: {
              type: 'hash',
              fields: {
                testTriggerInfo1: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    webhook_register: async () => {
      return await Promise.resolve();
    },
    webhook_deregister: async () => {
      return await Promise.resolve();
    },
    webhook_method: 'POST',
    options: {
      option1: {
        type: 'string',
        example_value: 'example',
        required: true,
      },
      option2: {
        type: 'string',
        example_value: 'example',
        required: true,
      },
    },
  } satisfies TQorePartialEventAction;

  const mappedTriggers = mapTriggersToApp('_testing', [trigger], 'en');

  expect(mappedTriggers).toHaveLength(1);
  expect(mappedTriggers[0].options.option1.desc).toBe('Option 1 Long Description');
  expect(mappedTriggers[0].options.option1.short_desc).toBe('Option 1 Short Description');
  expect(mappedTriggers[0].event_info.desc).toBe('Test event');
  expect(mappedTriggers[0].event_info.type.fields.testTriggerInfo.short_desc).toBe(
    'Test Trigger Info Short Description'
  );

  const subInfo = (mappedTriggers[0].event_info.type.fields.testTriggerInfo.type as TQoreTypeObject)
    .fields;
  expect(subInfo.testTriggerInfo1.display_name).toBe('Test Trigger Info 1');
});
