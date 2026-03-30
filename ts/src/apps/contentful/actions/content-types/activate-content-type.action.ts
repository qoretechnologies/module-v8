import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeResponseType } from '../../response-types';

const action = 'activate_content_type';

const options = {
  ...contentfulBaseWithContentTypeOptions,
} satisfies TQoreOptions;

const ActivateContentType = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const ct = await client.contentType.get({ contentTypeId: content_type_id });

      const published = await client.contentType.publish(
        { contentTypeId: content_type_id },
        { sys: { version: ct.sys.version } } as any
      );

      return {
        id: published.sys.id,
        name: published.name,
        description: published.description,
        display_field: published.displayField,
        fields: published.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          localized: f.localized,
        })),
      };
    } catch (error) {
      throw new ContentfulError(`Failed to activate content type: ${error}`);
    }
  },
});

export default ActivateContentType;
