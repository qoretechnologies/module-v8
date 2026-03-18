import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'create_content_type';

const options = {
  ...contentfulBaseOptions,
  name: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
  },
  fields: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: { type: 'string', short_desc: 'Field ID (unique identifier)' },
          name: { type: 'string', short_desc: 'Field display name' },
          type: { type: 'string', short_desc: 'Field type (Symbol, Text, Integer, Number, Date, Boolean, RichText, Link, Array, Object, Location)' },
          required: { type: 'bool', short_desc: 'Whether the field is required' },
          localized: { type: 'bool', short_desc: 'Whether the field supports localization' },
        },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const CreateContentType = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulContentTypeResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, name, fields } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'name', 'fields'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const description = obj?.description as string | undefined;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const fieldList = fields as Array<{
        id: string;
        name: string;
        type: string;
        required?: boolean;
        localized?: boolean;
      }>;

      const ct = await client.contentType.create(
        {},
        {
          name,
          description: description || '',
          displayField: fieldList[0]?.id,
          fields: fieldList.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            required: f.required || false,
            localized: f.localized || false,
          })),
        }
      );

      return {
        id: ct.sys.id,
        name: ct.name,
        description: ct.description,
        display_field: ct.displayField,
        fields: ct.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          localized: f.localized,
        })),
      };
    } catch (error) {
      throw new ContentfulError(`Failed to create content type: ${error}`);
    }
  },
});

export default CreateContentType;
