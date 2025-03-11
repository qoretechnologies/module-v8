import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialUserObjectResponse,
  RelationPropertyItemObjectResponse,
  RichTextItemResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export interface NotionSimplifiedProperties {
  [key: string]:
    | string
    | string[]
    | null
    | boolean
    | number
    | Record<string, unknown>
    | PartialUserObjectResponse
    | UserObjectResponse
    | (PartialUserObjectResponse | UserObjectResponse)[]
    | null;
}

interface NotionSelectOption {
  id: string;
  name: string;
  color: string;
}

export const mapNotionProperties = (
  properties: PageObjectResponse['properties'] | DatabaseObjectResponse['properties']
): NotionSimplifiedProperties => {
  const result: NotionSimplifiedProperties = {};

  for (const [key, property] of Object.entries(properties)) {
    switch (property.type) {
      case 'title':
        result[key] = property.title
          .map((block: RichTextItemResponse) => block.plain_text)
          .join('');
        break;

      case 'status':
        result[key] = property.status ? property.status.name : null;
        break;

      case 'people':
        result[key] = property.people;
        break;

      case 'date':
        result[key] = property.date;
        break;

      case 'created_time':
        result[key] = property.created_time;
        break;

      case 'last_edited_time':
        result[key] = property.last_edited_time;
        break;

      case 'checkbox':
        result[key] = property.checkbox;
        break;

      case 'number':
        result[key] = property.number;
        break;

      case 'select':
        result[key] = property.select ? property.select.name : null;
        break;

      case 'multi_select':
        result[key] = property.multi_select.map((item: NotionSelectOption) => item.name);
        break;

      case 'email':
        result[key] = property.email;
        break;

      case 'url':
        result[key] = property.url;
        break;

      case 'phone_number':
        result[key] = property.phone_number;
        break;

      case 'formula':
        result[key] = property.formula;

        break;

      case 'relation':
        result[key] = property.relation.map((rel: RelationPropertyItemObjectResponse) => rel.id);
        break;

      case 'rich_text':
        result[key] = property.rich_text
          .map((text: RichTextItemResponse) => text.plain_text)
          .join('');
        break;

      case 'created_by':
        result[key] = property.created_by;
        break;

      case 'last_edited_by':
        result[key] = property.last_edited_by;
        break;

      default:
        result[key] = property;
    }
  }

  return result;
};
