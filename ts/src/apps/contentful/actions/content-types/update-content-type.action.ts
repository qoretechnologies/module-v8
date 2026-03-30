import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'update_content_type';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  name: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
  description: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const UpdateContentType = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulContentTypeResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const current = await client.contentType.get({ contentTypeId: content_type_id });

      const updated = await client.contentType.update(
        { contentTypeId: content_type_id },
        {
          ...current,
          name: (obj?.name as string) || current.name,
          description: obj?.description !== undefined ? (obj.description as string) : current.description,
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
      throw new ContentfulError(`Failed to update content type: ${error}`);
    }
  },
});

export default UpdateContentType;
