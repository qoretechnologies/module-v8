import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulFieldAllowedValues } from '../../helpers/get-field-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'update_field_of_content_type';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  field_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulFieldAllowedValues,
    depends_on: ['content_type_id'],
  },
  field_name: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
  required: {
    type: 'bool',
    required: false,
    required_groups: ['update_field'],
  },
  localized: {
    type: 'bool',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const UpdateField = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulContentTypeResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id, field_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id', 'field_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const current = await client.contentType.get({ contentTypeId: content_type_id });

      const updatedFields = current.fields.map((f) => {
        if (f.id !== field_id) {
          return f;
        }

        return {
          ...f,
          name: (obj?.field_name as string) || f.name,
          required: obj?.required !== undefined ? obj.required === true : f.required,
          localized: obj?.localized !== undefined ? obj.localized === true : f.localized,
        };
      });

      const updated = await client.contentType.update(
        { contentTypeId: content_type_id },
        {
          ...current,
          fields: updatedFields,
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
      throw new ContentfulError(`Failed to update field: ${error}`);
    }
  },
});

export default UpdateField;
