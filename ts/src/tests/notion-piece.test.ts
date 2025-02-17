import {
  IQoreAllowedValue,
  IQoreAppActionWithFunction,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import { PiecesAppCatalogue } from '../pieces/piecesCatalogue';
import { retry, validateResponseProperties } from './utils';

const TEST_PAGE_NAME = 'Test Page';

const notionCustomConnOpts = {
  token: {
    type: 'string',
  },
} satisfies TCustomConnOptions;

describe('notionPieceTest', () => {
  let notionApp: TQoreAppWithActions;
  let user: any | null = null;
  let page: any | null = null;
  let comment: any | null = null;
  let database: any | null = null;

  const token = process.env.NOTION_ACCESS_TOKEN!;

  expect(token).toBeDefined();

  const actionContext = {
    conn_name: 'notion',
    conn_opts: {
      token,
    },
    opts: undefined,
  } satisfies TQoreAppActionFunctionContext<typeof notionCustomConnOpts>;

  beforeAll(() => {
    PiecesAppCatalogue.registerApps();
    notionApp = PiecesAppCatalogue.apps['Notion'];

    if (!notionApp) {
      throw new Error('Notion app not found');
    }
  });

  it('should register Notion app', () => {
    expect(notionApp).not.toBeNull();
    expect(notionApp.actions).toBeDefined();
    expect(notionApp.actions.length).toBeGreaterThan(0);
  });

  it('should find users', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'get_users'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const users = await actionFunction(undefined, undefined, actionContext);
        expect(users).toBeDefined();
        expect(users.results).toBeDefined();
        expect(users.results.length).toBeGreaterThan(0);
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, users);
        }
        user = users.results[0];
      } catch (error) {
        console.error('Error getting users', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should get user', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'get_user'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction && user) {
      try {
        const result = await actionFunction({ userId: user.id }, undefined, actionContext);
        expect(result).toBeDefined();
        expect(result.id).toEqual(user.id);
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error getting user', error);
        throw error;
      }
    } else {
      throw new Error('Action function not');
    }
  });

  it('should get token user', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'get_current_user'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const result = await actionFunction(undefined, undefined, actionContext);
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error getting token user', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should create a page', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'create_page'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const pages = await action.options.pageId.get_allowed_values(actionContext);
        const result = await actionFunction(
          {
            pageId: pages[0].value,
            title: TEST_PAGE_NAME,
            content: 'This is a test page content',
          },
          undefined,
          actionContext
        );
        page = result;
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error creating a page', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should add a comment to a page', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'add_comment_to_page'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction && page) {
      try {
        const result = await actionFunction(
          {
            pageId: page.id,
            text: 'This is a test comment',
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        comment = result;
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error adding a comment to a page', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should add comment to discussion', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'add_comment_to_discussion'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const result = await actionFunction(
          {
            discussionId: comment.discussion_id,
            text: 'This is a test comment',
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();

        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error adding a comment to a discussion', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should create a database', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'create_database'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const result = await actionFunction(
          {
            pageId: page.id,
            title: 'Test Database',
            properties: {
              'Grocery item': {
                type: 'title',
                title: {},
              },
              Price: {
                type: 'number',
                number: {
                  format: 'dollar',
                },
              },
              'Last ordered': {
                type: 'date',
                date: {},
              },
            },
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        database = result;
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error creating a database', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  // finish the test to add item to database
  it('should create an item in a database', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'create_database_item'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction && database) {
      try {
        const result = await actionFunction(
          {
            database_id: database.id,
            databaseFields: {
              'Grocery item': 'apple',
              Price: 1.0,
              'Last ordered': '2022-02-22',
            },
            content: 'This is a test item',
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error creating an item in a database', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should append to a page', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'append_to_page'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction && page) {
      try {
        const result = await actionFunction(
          {
            pageId: page.id,
            content: 'This is a test content',
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error appending to a page', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should get comments from a page', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'get_comments'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction && page) {
      try {
        const result = await actionFunction(
          {
            blockId: page.id,
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        expect(result.results).toBeDefined();
        expect(result.results.length).toBeGreaterThan(0);
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error getting comments from a page', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('should test dependent options', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'notion_find_database_item'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    expect(actionFunction).toBeDefined();
    expect(database).toBeDefined();

    const dependentOption = await action.options.database_id.get_dependent_options({
      ...actionContext,
      opts: {
        database_id: database.id,
      },
    });
    expect(dependentOption).toBeDefined();
  });

  it('should remove the page', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'remove_page'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    const pages = await action.options.pageId.get_allowed_values(actionContext);
    const pageId = pages.find(
      (foundPage: IQoreAllowedValue) =>
        foundPage.display_name === TEST_PAGE_NAME || foundPage.value === page.id
    );

    if (actionFunction && page) {
      try {
        const result = await retry(
          () =>
            actionFunction(
              {
                pageId: pageId?.value || page.id,
              },
              undefined,
              actionContext
            ),
          3,
          5000
        );
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result!);
        }
      } catch (error) {
        console.error('Error removing the page', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });

  it('Should make a custom API call', async () => {
    const action = notionApp.actions.find(
      (action) => action.action === 'custom_api_call'
    ) as IQoreAppActionWithFunction<any>;
    const actionFunction = action?.api_function as (
      obj?: TQoreMappedOptions<any>,
      options?: never,
      context?: TQoreAppActionFunctionContext<typeof notionCustomConnOpts, any>
    ) => any;

    if (actionFunction) {
      try {
        const result = await actionFunction(
          {
            url: 'https://api.notion.com/v1/search',
            method: 'POST',
            headers: {
              'Notion-Version': '2022-02-22',
            },
            body: {
              filter: {
                value: 'page',
                property: 'object',
              },
            },
          },
          undefined,
          actionContext
        );
        expect(result).toBeDefined();
        const expectedResponseType = action.response_type;
        if (expectedResponseType) {
          validateResponseProperties(expectedResponseType, result);
        }
      } catch (error) {
        console.error('Error making a custom API call', error);
        throw error;
      }
    } else {
      throw new Error('Action function not found');
    }
  });
});
