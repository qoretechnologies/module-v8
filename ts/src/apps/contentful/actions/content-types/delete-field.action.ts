import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulFieldAllowedValues } from '../../helpers/get-field-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'delete_field_from_content_type';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  field_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulFieldAllowedValues,
    depends_on: ['content_type_id'],
  },
} satisfies TQoreOptions;

const DeleteField = QoreAppCreator.createLocalizedAction<typeof options>({
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

      // First, mark the field as omitted (Contentful requires this before removal)
      const fieldsWithOmitted = current.fields.map((f) => {
        if (f.id === field_id) {
          return { ...f, omitted: true };
        }
        return f;
      });

      const withOmitted = await client.contentType.update(
        { contentTypeId: content_type_id },
        {
          ...current,
          fields: fieldsWithOmitted,
          sys: current.sys as any,
        }
      );

      // Then, remove the field entirely
      const fieldsWithoutField = withOmitted.fields.filter((f) => f.id !== field_id);

      const updated = await client.contentType.update(
        { contentTypeId: content_type_id },
        {
          ...withOmitted,
          fields: fieldsWithoutField,
          sys: withOmitted.sys as any,
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
      throw new ContentfulError(`Failed to delete field from content type: ${error}`);
    }
  },
});

export default DeleteField;
