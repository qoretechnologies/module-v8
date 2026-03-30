import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'add_field_to_content_type';

const FIELD_TYPE_ALLOWED_VALUES = [
  { value: 'Symbol', display_name: 'Short Text' },
  { value: 'Text', display_name: 'Long Text' },
  { value: 'Integer', display_name: 'Integer' },
  { value: 'Number', display_name: 'Decimal Number' },
  { value: 'Date', display_name: 'Date and Time' },
  { value: 'Boolean', display_name: 'Boolean' },
  { value: 'RichText', display_name: 'Rich Text' },
  { value: 'Link', display_name: 'Link (Reference)' },
  { value: 'Array', display_name: 'Array (List)' },
  { value: 'Object', display_name: 'JSON Object' },
  { value: 'Location', display_name: 'Location' },
];

const options = {
  ...contentfulBaseWithContentTypeOptions,
  field_id: {
    type: 'string',
    required: true,
  },
  field_name: {
    type: 'string',
    required: true,
  },
  field_type: {
    type: 'string',
    required: true,
    allowed_values: FIELD_TYPE_ALLOWED_VALUES,
  },
  required: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  localized: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const AddField = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulContentTypeResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id, field_id, field_name, field_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id', 'field_id', 'field_name', 'field_type'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const current = await client.contentType.get({ contentTypeId: content_type_id });

      const newField = {
        id: field_id,
        name: field_name,
        type: field_type,
        required: obj?.required === true,
        localized: obj?.localized === true,
      };

      const updated = await client.contentType.update(
        { contentTypeId: content_type_id },
        {
          ...current,
          fields: [...current.fields, newField],
          sys: current.sys as any,
        }
      );

      return {
        id: updated.sys.id,
        name: updated.name,
        description: updated.description,
        display_field: updated.displayField,
        fields: updated.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          localized: f.localized,
        })),
      };
    } catch (error) {
      throw new ContentfulError(`Failed to add field to content type: ${error}`);
    }
  },
});

export default AddField;
