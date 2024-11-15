import { createAction, DynamicPropsValue, OAuth2PropertyValue, Property } from 'core/framework';
import { Client } from '@notionhq/client';
import { NotionFieldMapping } from '../common/models';
import { notionAuth } from '../..';
import { notionCommon } from '../common';
import { IActionResponse } from '../../../../global/models/actions';

const createDatabaseItemResponseType = {
  type: 'hash',
  fields: {
    object: {
      type: 'string',
      display_name: 'Object',
      short_desc: 'The type of object returned',
      desc: 'The type of object returned in this case it will always be page',
      example_value: 'page',
    },
    id: {
      type: 'string',
      display_name: 'ID',
      short_desc: 'The ID of the page',
      desc: 'The ID of the page',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    url: {
      type: 'string',
      display_name: 'URL',
      short_desc: 'The URL of the page',
      desc: 'The URL of the page',
      example_value: 'https://example.com/page',
    },
    properties: {
      type: 'hash',
      display_name: 'Properties',
      short_desc: 'The properties of the page',
      desc: 'The properties of the page',
      example_value: {
        Price: { id: 'gwzR', type: 'number', number: 1 },
        'Grocery item': { id: 'title', type: 'title' },
      },
    },
  },
} satisfies IActionResponse;

export const createDatabaseItem = createAction({
  auth: notionAuth,
  name: 'create_database_item',
  displayName: 'Create Database Item',
  description: 'Creates an item in a database.',
  responseType: createDatabaseItemResponseType,
  props: {
    database_id: notionCommon.database_id,
    databaseFields: notionCommon.databaseFields,
    content: Property.LongText({
      displayName: 'Content',
      description: 'The content you want to append to your item.',
      required: false,
    }),
  },
  async run(context) {
    const database_id = context.propsValue.database_id!;
    const databaseFields = context.propsValue.databaseFields!;
    const content = context.propsValue.content;
    const notionFields: DynamicPropsValue = {};

    const notion = new Client({
      auth: (context.auth as OAuth2PropertyValue).access_token,
      notionVersion: '2022-02-22',
    });
    const { properties } = await notion.databases.retrieve({
      database_id: database_id as unknown as string,
    });

    Object.keys(databaseFields).forEach((key) => {
      if (databaseFields[key] !== '') {
        const fieldType: string = properties[key].type;
        notionFields[key] = NotionFieldMapping[fieldType].buildNotionType(databaseFields[key]);
      }
    });

    const children: any[] = [];
    // Add content to page
    if (content)
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      });

    return await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: database_id,
      },
      properties: notionFields,
      children: children,
    });
  },
});
