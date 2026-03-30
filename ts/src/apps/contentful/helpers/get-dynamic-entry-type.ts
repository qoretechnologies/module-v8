import { TQoreGetDynamicTypeFunction, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ContentfulError } from '../constants';
import { getContentfulScopedClient } from '../client';
import { mapContentfulFieldTypeToQoreType } from './contentful-type-mapping';

/**
 * Returns dynamic option types for entry fields based on the selected content type.
 * Used as `get_dynamic_type` on the `fields` option.
 */
export const getContentfulEntryFieldOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { space_id, content_type_id } = getQoreContextRequiredValues({
    context,
    optionFields: ['space_id', 'content_type_id'],
    ErrorClass: ContentfulError,
  });

  const environmentId = (context?.opts?.environment_id as string) || 'master';

  try {
    const client = getContentfulScopedClient(context, space_id, environmentId);
    const contentType = await client.contentType.get({ contentTypeId: content_type_id });

    const qoreOptions: TQoreOptions = {};

    for (const field of contentType.fields) {
      if (field.disabled || field.omitted) {
        continue;
      }

      const qoreType = mapContentfulFieldTypeToQoreType(field.type);

      qoreOptions[field.id] = {
        ...qoreType,
        display_name: field.name,
        required: field.required || false,
        ...(field.type === 'Array' && field.items?.type === 'Symbol'
          ? { type: { type: 'list', element_type: 'string' } }
          : {}),
        ...(field.type === 'Array' && field.items?.type === 'Link'
          ? { type: { type: 'list', element_type: 'string' } }
          : {}),
      } as TQoreOptions[string];
    }

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch {
    return { type: 'hash' };
  }
};

/**
 * Returns dynamic response type for entries based on the selected content type.
 * Includes system fields plus content type-specific fields.
 */
export const getContentfulEntryDynamicResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { space_id, content_type_id } = getQoreContextRequiredValues({
    context,
    optionFields: ['space_id', 'content_type_id'],
    ErrorClass: ContentfulError,
  });

  const environmentId = (context?.opts?.environment_id as string) || 'master';

  try {
    const client = getContentfulScopedClient(context, space_id, environmentId);
    const contentType = await client.contentType.get({ contentTypeId: content_type_id });

    const fields: TQoreOptions = {
      id: { type: 'string', short_desc: 'Entry ID' },
      content_type: { type: 'string', short_desc: 'Content type ID' },
      created_at: { type: 'date', short_desc: 'Creation timestamp' },
      updated_at: { type: 'date', short_desc: 'Last update timestamp' },
      version: { type: 'int', short_desc: 'Current version number' },
    };

    for (const field of contentType.fields) {
      const qoreType = mapContentfulFieldTypeToQoreType(field.type);

      fields[field.id] = {
        ...qoreType,
        display_name: field.name,
        ...(field.type === 'Array' && field.items?.type === 'Symbol'
          ? { type: { type: 'list', element_type: 'string' } }
          : {}),
        ...(field.type === 'Array' && field.items?.type === 'Link'
          ? { type: { type: 'list', element_type: 'string' } }
          : {}),
      } as TQoreOptions[string];
    }

    return {
      type: 'hash',
      fields,
    };
  } catch {
    return {
      type: 'hash',
      fields: {
        id: { type: 'string', short_desc: 'Entry ID' },
        content_type: { type: 'string', short_desc: 'Content type ID' },
        created_at: { type: 'date', short_desc: 'Creation timestamp' },
        updated_at: { type: 'date', short_desc: 'Last update timestamp' },
        version: { type: 'int', short_desc: 'Current version number' },
      },
    };
  }
};
