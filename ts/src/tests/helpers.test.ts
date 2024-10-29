import {
  IQoreAppActionWithFunction,
  IQorePartialAppActionWithSwaggerPath,
  IQoreTypeObject,
} from 'global/models/qore';
import { OpenAPIV2 } from 'openapi-types';
import * as zendeskActions from '../apps/zendesk/actions';
import {
  buildActionsFromSwaggerSchema,
  fixActionOptions,
  mapActionsToApp,
} from '../global/helpers';
import { IActionOptions } from '../global/models/actions';
import eSignature from '../schemas/esignature.swagger.json';

describe('Helpers tests', () => {
  it.only('Properly parses a swagger schema and creates actions', () => {
    const actions: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema(
      eSignature as OpenAPIV2.Document,
      ['/v2.1/accounts', '/v2.1/accounts/{accountId}/connect/oauth']
    );

    expect(actions).toHaveLength(5);
    expect(actions[0].action).toBe('Accounts_PostAccounts');
    expect(actions[0].swagger_path).toBe('/v2.1/accounts/POST');
    expect(actions[0].display_name).toBe('Creates new accounts.');
    expect(actions[0].short_desc).toBe('Creates new accounts.');
  });

  it.only('Properly parses a swagger schema and creates actions with filtered methods', () => {
    const actionsWithoutFilter: IQorePartialAppActionWithSwaggerPath[] =
      buildActionsFromSwaggerSchema(eSignature as OpenAPIV2.Document, [
        '/v2.1/accounts/{accountId}',
      ]);

    expect(actionsWithoutFilter).toHaveLength(2);
    expect(actionsWithoutFilter[0].action).toBe('Accounts_GetAccount');
    expect(actionsWithoutFilter[1].action).toBe('Accounts_DeleteAccount');

    const actionsWithFilter: IQorePartialAppActionWithSwaggerPath[] = buildActionsFromSwaggerSchema(
      eSignature as OpenAPIV2.Document,
      ['/v2.1/accounts/{accountId}:DELETE']
    );

    expect(actionsWithFilter).toHaveLength(1);
    expect(actionsWithFilter[0].action).toBe('Accounts_DeleteAccount');
  });

  it('Properly maps actions to a given app', () => {
    const actions = mapActionsToApp('Zendesk', zendeskActions, 'en');
    const createTicket = actions.find(
      (action) => action.action === 'create_ticket'
    ) as IQoreAppActionWithFunction;

    expect(actions).toHaveLength(23);
    expect(createTicket).toBeDefined();
  });

  it('Should receive fully incomplete action options and return fixed options', () => {
    const incompleteOptions = {
      option1: {
        type: 'string',
        example_value: 'example',
        required: true,
      },
    } satisfies IActionOptions;

    const fixedOptions = fixActionOptions(incompleteOptions, '_testing', 'en', 'test');

    expect(fixedOptions.option1.display_name).toBe('Option 1');
    expect(fixedOptions.option1.short_desc).toBe('Option 1 Short Description');
    expect(fixedOptions.option1.desc).toBe('Option 1 Long Description');
  });

  it('Should receive partially incomplete action options and return fixed options', () => {
    const incompleteOptions = {
      option1: {
        type: 'string',
        example_value: 'example',
        required: true,
        short_desc: 'This is my short description and it should not change',
      },
    } satisfies IActionOptions;

    const fixedOptions = fixActionOptions(incompleteOptions, '_testing', 'en', 'test');

    expect(fixedOptions.option1.display_name).toBe('Option 1');
    expect(fixedOptions.option1.short_desc).toBe(
      'This is my short description and it should not change'
    );
    expect(fixedOptions.option1.desc).toBe('Option 1 Long Description');
  });

  it('Should receive partially incomplete deep action options and return fixed deep options', () => {
    const incompleteOptions = {
      option1: {
        type: 'string',
        example_value: 'example',
        required: true,
        short_desc: 'This is my short description and it should not change',
      },
      option2: {
        example_value: {
          sub_option1: 'example',
        },
        type: {
          sub_option1: {
            name: 'sub_option1',
            type: {
              sub_sub_option1: {
                name: 'sub_sub_option1',
                display_name: 'This option is so deep',
                type: 'string',
                example_value: 'example',
                required: true,
                short_desc: 'Very very deep',
              },
            },
            example_value: 'example',
            required: true,
            desc: 'A sub description, if you like',
          },
        },
      },
    } as const;

    const fixedOptions = fixActionOptions(incompleteOptions, '_testing', 'en', 'test');

    expect(fixedOptions.option2.display_name).toBe('Second Option');

    expect(
      (fixedOptions.option2.type as Record<string, IQoreTypeObject>).sub_option1.display_name
    ).toBe('Sub Option 1 of Option 2');
    expect((fixedOptions.option2.type as Record<string, IQoreTypeObject>).sub_option1.desc).toBe(
      'A sub description, if you like'
    );

    expect(
      (
        (fixedOptions.option2.type as Record<string, IQoreTypeObject>).sub_option1.type as Record<
          string,
          IQoreTypeObject
        >
      ).sub_sub_option1.display_name
    ).toBe('This option is so deep');
    expect(
      (
        (fixedOptions.option2.type as Record<string, IQoreTypeObject>).sub_option1.type as Record<
          string,
          IQoreTypeObject
        >
      ).sub_sub_option1.desc
    ).toBe('Generated description');
  });
});
