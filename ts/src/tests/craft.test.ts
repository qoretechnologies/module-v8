import { IQoreAllowedValue, IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CreateCraftCollectionItem,
  DeleteCraftBlocks,
  DeleteCraftCollectionItems,
  InsertCraftBlock,
  ListCraftBlocks,
  ListCraftCollectionItems,
  ListCraftCollections,
  ListCraftDocuments,
  UpdateCraftCollectionItem,
} from '../apps/craft/actions';
import { getCraftCollectionAllowedValues } from '../apps/craft/helpers/get-collection-allowed-values';
import { getCraftCollectionPropertiesDynamicType } from '../apps/craft/helpers/get-collection-fields';
import { getCraftCollectionItemAllowedValues } from '../apps/craft/helpers/get-collection-item-allowed-values';
import { getCraftDocumentAllowedValues } from '../apps/craft/helpers/get-document-allowed-values';
import { NewCraftCollectionItem } from '../apps/craft/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

const checkAllowedValues = (allowedValues: IQoreAllowedValue<any>[]) => {
  expect(allowedValues).toBeDefined();
  expect(allowedValues.length).toBeGreaterThan(0);
  expect(allowedValues[0]).toHaveProperty('display_name');
  expect(allowedValues[0]).toHaveProperty('value');
  expect(allowedValues[0].value).toBeDefined();
  expect(allowedValues[0].display_name).toBeDefined();
};

describe('Craft', () => {
  const baseContext = {
    conn_opts: {
      url: '',
    },
  } as any;

  beforeAll(() => {
    const url = process.env.CRAFT_URL;

    if (!url) {
      throw new Error('CRAFT_URL is not set in environment variables');
    }

    baseContext.conn_opts.url = url;
  });

  let collectionId: string;
  let collectionItemId: string;
  describe('Should test allowed values', () => {
    it('Should get collection allowed values', async () => {
      const allowedValues = await getCraftCollectionAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
      collectionId = allowedValues[0].value;
    });

    it('Should get collection item allowed values', async () => {
      const allowedValues = await getCraftCollectionItemAllowedValues({
        ...baseContext,
        opts: {
          collectionId,
        },
      });
      checkAllowedValues(allowedValues);

      collectionItemId = allowedValues[0].value;
    });

    it('Should get document allowed values', async () => {
      const allowedValues = await getCraftDocumentAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });
  });

  describe('Should test actions', () => {
    describe('Should test document actions', () => {
      it('Should get documents', async () => {
        const action = ListCraftDocuments;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Should test blocks actions', () => {
      let createdBlockId: string;
      it('Should create a block', async () => {
        const action = InsertCraftBlock;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            markdown: '# Test Block\nThis is a test block created by automated tests.',
            position: {
              position: 'end',
              pageId: collectionItemId,
            } as any,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();

        createdBlockId = result.id;
      });

      it('Should list blocks', async () => {
        const action = ListCraftBlocks;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            id: createdBlockId,
            getMarkdownString: true,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contentString).toBeDefined();
      });

      it('Should delete the created block', async () => {
        const action = DeleteCraftBlocks;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            blockIds: [createdBlockId],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toContain(createdBlockId);
      });
    });

    describe('Should test collection actions', () => {
      let createdItemId: string;

      it('Should get collection properties type', async () => {
        const type = (await getCraftCollectionPropertiesDynamicType({
          ...baseContext,
          opts: {
            collectionId,
          },
        })) as IQoreTypeObjectNonList;

        expect(type).toBeDefined();
        expect(type.fields).toBeDefined();
        expect(Object.keys(type.fields!).length).toBeGreaterThan(0);
      });

      it('Should list collections', async () => {
        const action = ListCraftCollections;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            documentIds: [
              'f7871886-0bcd-a468-fc01-e3e95694888d',
              '360706f4-d401-4187-ba54-9a579e0611d8',
            ],
          },
          undefined,
          baseContext
        );
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should create craft collection item', async () => {
        const action = CreateCraftCollectionItem;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            collectionId,
            title: 'Test Item from Automated Tests',
            properties: {
              items: 'option 1',
              checkbox_field: true,
              text_field: 'This is a test text field',
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('item_title');
        expect(result.id).toBeDefined();
        expect(result.item_title).toBe('Test Item from Automated Tests');
        createdItemId = result.id;
      });

      it('Should update craft collection item', async () => {
        const action = UpdateCraftCollectionItem;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            collectionId,
            itemId: createdItemId,
            title: 'Updated Test Item from Automated Tests',
            properties: {
              items: 'option 2',
              checkbox_field: false,
              text_field: 'This is an updated test text field',
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('item_title');
        expect(result.id).toBeDefined();
        expect(result.item_title).toBe('Updated Test Item from Automated Tests');
      });

      it('Should list collection items', async () => {
        const action = ListCraftCollectionItems;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            collectionId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created collection item', async () => {
        const action = DeleteCraftCollectionItems;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action does not have an api_function');

        const result = await action.api_function(
          {
            collectionId,
            itemIds: [createdItemId],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toContain(createdItemId);
      });
    });

    /**
     * Task and collections actions cannot be tested at the same time
     * because they require different api generated in Craft app
     */
    // describe('Should test task actions', () => {
    //   let createdTaskId: string;
    //   it('Should create a task', async () => {
    //     const action = CreateCraftTask;

    //     if (!('api_function' in action) || !action.api_function)
    //       throw new Error('Action does not have an api_function');

    //     const result = await action.api_function(
    //       {
    //         markdown: 'This is a test task created by automated tests.',
    //         location: { type: 'inbox' } as any,
    //       },
    //       undefined,
    //       baseContext
    //     );

    //     expect(result).toBeDefined();
    //     expect(result).toHaveProperty('id');
    //     expect(result.id).toBeDefined();

    //     createdTaskId = result.id;
    //   });

    //   it('Should update the created task', async () => {
    //     const action = UpdateCraftTask;

    //     if (!('api_function' in action) || !action.api_function)
    //       throw new Error('Action does not have an api_function');

    //     const result = await action.api_function(
    //       {
    //         id: createdTaskId,
    //         markdown: 'This is an updated test task from automated tests.',
    //         state: 'done',
    //       },
    //       undefined,
    //       baseContext
    //     );

    //     expect(result).toBeDefined();
    //     expect(result).toHaveProperty('id');
    //   });

    //   it('Should list tasks', async () => {
    //     const action = ListCraftTasks;

    //     if (!('api_function' in action) || !action.api_function)
    //       throw new Error('Action does not have an api_function');

    //     const result = await action.api_function(
    //       {
    //         scope: 'inbox',
    //       },
    //       undefined,
    //       baseContext
    //     );

    //     expect(result).toBeDefined();
    //     expect(Array.isArray(result)).toBe(true);
    //     expect(result.length).toBeGreaterThan(0);
    //   });

    //   it('Should delete the created task', async () => {
    //     const action = DeleteCraftTasks;

    //     if (!('api_function' in action) || !action.api_function)
    //       throw new Error('Action does not have an api_function');

    //     const result = await action.api_function(
    //       {
    //         ids: [createdTaskId],
    //       },
    //       undefined,
    //       baseContext
    //     );

    //     expect(result).toBeDefined();
    //     expect(Array.isArray(result)).toBe(true);
    //     expect(result).toContain(createdTaskId);
    //   });
    // });

    describe('Should test triggers', () => {
      it('Should get example event data for collection item trigger', async () => {
        const trigger = NewCraftCollectionItem;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...baseContext,
          opts: {
            collectionId,
          },
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });
});
